const { query } = require('../config/db');
const { recordAuditLog } = require('../middleware/audit');
const { calculateProjectRiskScore } = require('../services/riskService');
const { createNotification } = require('../services/notificationService');

async function getProjectCompensation(req, res) {
  try {
    const { projectId } = req.params;
    const isPublic = !req.user || req.user.roleCode === 'PUBLIC_USER';

    // Summary statistics
    const sumRes = await query(
      `SELECT
        COALESCE(SUM(ca.total_assessed_amount), 0) as total_assessed,
        COALESCE((SELECT SUM(cp.disbursed_amount) FROM compensation_payments cp WHERE cp.project_id = $1), 0) as total_paid,
        COUNT(DISTINCT ca.affected_family_id) as total_families,
        COUNT(DISTINCT CASE WHEN cp.payment_status = 'PAID' THEN cp.affected_family_id END) as families_paid,
        COUNT(DISTINCT CASE WHEN cp.payment_status = 'ASSESSED' OR cp.payment_status = 'PARTIALLY_PAID' THEN cp.affected_family_id END) as families_pending
       FROM compensation_assessments ca
       LEFT JOIN compensation_payments cp ON ca.id = cp.assessment_id
       WHERE ca.project_id = $1`,
      [projectId]
    );

    const summary = sumRes.rows[0];
    const totalAssessed = parseFloat(summary.total_assessed) || 0;
    const totalPaid = parseFloat(summary.total_paid) || 0;
    summary.total_pending = Math.max(0, totalAssessed - totalPaid);

    // List of assessments and payments
    let listSql = `
      SELECT ca.id as assessment_id, ca.parcel_id, ca.total_assessed_amount, ca.eligible_amount, ca.status as assessment_status,
             lp.parcel_code, lp.khasra_survey_no, lp.village,
             af.id as family_id, af.family_code, af.category,
             ${isPublic ? 'af.head_masked as family_head' : 'af.head_name as family_head'},
             cp.id as payment_id, cp.disbursed_amount, cp.pending_amount, cp.payment_date, cp.payment_status, cp.transaction_ref
      FROM compensation_assessments ca
      JOIN land_parcels lp ON ca.parcel_id = lp.id
      LEFT JOIN affected_families af ON ca.affected_family_id = af.id
      LEFT JOIN compensation_payments cp ON ca.id = cp.assessment_id
      WHERE ca.project_id = $1
      ORDER BY ca.id ASC
    `;

    const listRes = await query(listSql, [projectId]);

    return res.json({
      success: true,
      summary,
      records: listRes.rows
    });
  } catch (err) {
    console.error('getProjectCompensation error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve compensation records.' });
  }
}

async function disbursePayment(req, res) {
  try {
    const { assessmentId, amount, paymentMode, remarks } = req.body;
    const user = req.user;

    if (!assessmentId || !amount) {
      return res.status(400).json({ success: false, error: 'assessmentId and amount are required.' });
    }

    const assessRes = await query(
      `SELECT ca.*, p.id as project_id, p.name as project_name 
       FROM compensation_assessments ca
       JOIN projects p ON ca.project_id = p.id
       WHERE ca.id = $1`,
      [assessmentId]
    );

    if (assessRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Compensation assessment record not found.' });
    }

    const assess = assessRes.rows[0];
    const disburseAmt = parseFloat(amount);
    const txRef = `PFMS-DBT-${Date.now().toString().slice(-8)}`;

    // Check if existing payment record
    const payRes = await query('SELECT * FROM compensation_payments WHERE assessment_id = $1', [assessmentId]);

    let payment;
    if (payRes.rows.length > 0) {
      const existing = payRes.rows[0];
      const newDisbursed = parseFloat(existing.disbursed_amount) + disburseAmt;
      const totalAssessed = parseFloat(assess.total_assessed_amount);
      const newStatus = newDisbursed >= totalAssessed ? 'PAID' : 'PARTIALLY_PAID';
      const newPending = Math.max(0, totalAssessed - newDisbursed);

      const upd = await query(
        `UPDATE compensation_payments SET
          disbursed_amount = $1,
          pending_amount = $2,
          payment_date = CURRENT_DATE,
          transaction_ref = $3,
          payment_status = $4,
          disbursed_by = $5
         WHERE id = $6
         RETURNING *`,
        [newDisbursed, newPending, txRef, newStatus, user.userId, existing.id]
      );
      payment = upd.rows[0];
    } else {
      const totalAssessed = parseFloat(assess.total_assessed_amount);
      const newStatus = disburseAmt >= totalAssessed ? 'PAID' : 'PARTIALLY_PAID';
      const newPending = Math.max(0, totalAssessed - disburseAmt);

      const ins = await query(
        `INSERT INTO compensation_payments (
          assessment_id, project_id, affected_family_id, disbursed_amount, pending_amount,
          payment_date, payment_mode, transaction_ref, payment_status, disbursed_by
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6, $7, $8, $9)
        RETURNING *`,
        [assessmentId, assess.project_id, assess.affected_family_id, disburseAmt, newPending, paymentMode || 'RTGS_PFMS', txRef, newStatus, user.userId]
      );
      payment = ins.rows[0];
    }

    // Update parcel status if fully paid
    if (payment.payment_status === 'PAID') {
      await query(
        `UPDATE land_parcels SET status = 'COMPENSATION_PAID', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [assess.parcel_id]
      );
    }

    // Recalculate Risk Score
    await calculateProjectRiskScore(assess.project_id);

    // Audit log
    await recordAuditLog({
      userId: user.userId,
      userName: user.fullName,
      role: user.roleCode,
      action: 'DISBURSE_COMPENSATION',
      entity: 'CompensationPayment',
      entityId: String(payment.id),
      newValue: { assessmentId, amount: disburseAmt, txRef, status: payment.payment_status },
      req
    });

    // Notify
    await createNotification({
      roleTarget: 'DISTRICT_AUTHORITY',
      title: `Compensation Disbursed: ₹${(disburseAmt / 100000).toFixed(2)} Lakhs`,
      message: `Direct bank disbursement of ₹${disburseAmt.toLocaleString('en-IN')} credited via ${txRef}.`,
      category: 'COMPENSATION',
      link: `/admin/projects/${assess.project_id}?tab=compensation`
    });

    return res.json({
      success: true,
      message: `Successfully processed compensation disbursement of ₹${disburseAmt.toLocaleString('en-IN')}.`,
      data: payment
    });
  } catch (err) {
    console.error('disbursePayment error:', err);
    return res.status(500).json({ success: false, error: 'Failed to disburse compensation.' });
  }
}

module.exports = {
  getProjectCompensation,
  disbursePayment
};
