const { query } = require('../config/db');
const { recordAuditLog } = require('../middleware/audit');
const { calculateProjectRiskScore } = require('../services/riskService');
const { createNotification } = require('../services/notificationService');

async function getProjectRr(req, res) {
  try {
    const { projectId } = req.params;

    const rrRes = await query('SELECT * FROM rr_cases WHERE project_id = $1 LIMIT 1', [projectId]);
    const rrCase = rrRes.rows[0] || null;

    // Displaced families summary
    const famStats = await query(
      `SELECT
        COUNT(*) as total_affected,
        COUNT(*) FILTER (WHERE is_displaced = true) as total_displaced,
        COUNT(*) FILTER (WHERE rehabilitation_status = 'RELOCATED') as relocated,
        COUNT(*) FILTER (WHERE livelihood_assistance_status = 'COMPLETED') as livelihood_completed,
        COUNT(*) FILTER (WHERE category = 'SC') as sc_count,
        COUNT(*) FILTER (WHERE category = 'ST') as st_count,
        COUNT(*) FILTER (WHERE category = 'BPL') as bpl_count
       FROM affected_families WHERE project_id = $1`,
      [projectId]
    );

    return res.json({
      success: true,
      data: {
        case: rrCase,
        stats: famStats.rows[0]
      }
    });
  } catch (err) {
    console.error('getProjectRr error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve R&R data.' });
  }
}

async function updateRrProgress(req, res) {
  try {
    const { projectId } = req.params;
    const {
      housingAssistanceCompleted,
      livelihoodAssistanceCompleted,
      relocationCompleted
    } = req.body;
    const user = req.user;

    const prevRes = await query('SELECT * FROM rr_cases WHERE project_id = $1', [projectId]);
    if (prevRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'R&R case not found for project.' });
    }
    const prev = prevRes.rows[0];

    const housing = housingAssistanceCompleted !== undefined ? parseInt(housingAssistanceCompleted, 10) : prev.housing_assistance_completed;
    const livelihood = livelihoodAssistanceCompleted !== undefined ? parseInt(livelihoodAssistanceCompleted, 10) : prev.livelihood_assistance_completed;
    const relocation = relocationCompleted !== undefined ? parseInt(relocationCompleted, 10) : prev.relocation_completed;

    const totalDisplaced = Math.max(1, prev.total_displaced);
    const calculatedPct = Math.min(100, Math.max(0, parseFloat(((relocation / totalDisplaced) * 100).toFixed(1))));

    const upd = await query(
      `UPDATE rr_cases SET
        housing_assistance_completed = $1,
        livelihood_assistance_completed = $2,
        relocation_completed = $3,
        rr_completion_percentage = $4,
        nodal_officer_id = $5,
        updated_at = CURRENT_TIMESTAMP
       WHERE project_id = $6
       RETURNING *`,
      [housing, livelihood, relocation, calculatedPct, user.userId, projectId]
    );

    const updated = upd.rows[0];

    // Recalculate Risk Score
    await calculateProjectRiskScore(projectId);

    // Audit log
    await recordAuditLog({
      userId: user.userId,
      userName: user.fullName,
      role: user.roleCode,
      action: 'UPDATE_RR_PROGRESS',
      entity: 'RrCase',
      entityId: String(updated.id),
      previousValue: { progress: prev.rr_completion_percentage },
      newValue: { progress: calculatedPct, housing, livelihood, relocation },
      req
    });

    // Notify
    await createNotification({
      roleTarget: 'ALL',
      title: `R&R Progress Updated to ${calculatedPct}%`,
      message: `${user.fullName} updated R&R relocation status (${relocation}/${totalDisplaced} completed).`,
      category: 'RR',
      link: `/admin/projects/${projectId}?tab=rr`
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('updateRrProgress error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update R&R progress.' });
  }
}

async function getFamilies(req, res) {
  try {
    const { projectId } = req.params;
    const isPublic = !req.user || req.user.roleCode === 'PUBLIC_USER';

    let sql = `
      SELECT af.id, af.family_code, af.category, af.members_count, af.is_displaced,
             af.eligibility_status, af.rehabilitation_status, af.livelihood_assistance_status,
             ${isPublic ? 'af.head_masked as head_name' : 'af.head_name'},
             df.relocation_site, df.housing_allotment_status, df.relocation_date
      FROM affected_families af
      LEFT JOIN displaced_families df ON af.id = df.affected_family_id
      WHERE af.project_id = $1
      ORDER BY af.id ASC
    `;

    const result = await query(sql, [projectId]);
    return res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error('getFamilies error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve families list.' });
  }
}

module.exports = {
  getProjectRr,
  updateRrProgress,
  getFamilies
};
