const { query } = require('../config/db');
const { recordAuditLog } = require('../middleware/audit');
const { calculateProjectRiskScore } = require('../services/riskService');
const { createNotification } = require('../services/notificationService');

async function getProjectPossession(req, res) {
  try {
    const { projectId } = req.params;

    const summaryRes = await query(
      `SELECT
        (SELECT COUNT(*) FROM land_parcels WHERE project_id = $1) as total_parcels,
        (SELECT COUNT(*) FROM land_parcels WHERE project_id = $1 AND status = 'POSSESSION_COMPLETED') as completed_parcels,
        (SELECT COUNT(*) FROM land_parcels WHERE project_id = $1 AND status = 'COMPENSATION_PAID') as eligible_parcels,
        (SELECT COUNT(*) FROM land_parcels WHERE project_id = $1 AND status = 'DISPUTED') as disputed_parcels,
        (SELECT COALESCE(SUM(area_ha), 0) FROM land_parcels WHERE project_id = $1 AND status = 'POSSESSION_COMPLETED') as completed_area_ha,
        (SELECT required_land_ha FROM projects WHERE id = $1) as total_required_ha
      `,
      [projectId]
    );

    const recordsRes = await query(
      `SELECT pr.*, lp.parcel_code, lp.khasra_survey_no, lp.village, lp.area_ha, lp.area_acres,
              u.full_name as verified_by_name
       FROM possession_records pr
       JOIN land_parcels lp ON pr.parcel_id = lp.id
       LEFT JOIN users u ON pr.verified_by_id = u.id
       WHERE pr.project_id = $1
       ORDER BY pr.id DESC`,
      [projectId]
    );

    return res.json({
      success: true,
      summary: summaryRes.rows[0],
      records: recordsRes.rows
    });
  } catch (err) {
    console.error('getProjectPossession error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve possession records.' });
  }
}

async function recordPossession(req, res) {
  try {
    const { parcelId, status, possessionDate, gpsLat, gpsLng, gpsAccuracy, photoUrl, remarks } = req.body;
    const user = req.user;

    if (!parcelId || !status) {
      return res.status(400).json({ success: false, error: 'parcelId and status are required.' });
    }

    const parcelRes = await query('SELECT * FROM land_parcels WHERE id = $1', [parcelId]);
    if (parcelRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Land parcel not found.' });
    }
    const parcel = parcelRes.rows[0];

    const ins = await query(
      `INSERT INTO possession_records (
        parcel_id, project_id, status, possession_date, verified_by_id,
        gps_lat, gps_lng, gps_accuracy_m, photo_url, remarks
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        parcelId, parcel.project_id, status, possessionDate || 'CURRENT_DATE',
        user.userId, gpsLat || parcel.centroid_lat, gpsLng || parcel.centroid_lng,
        gpsAccuracy || 2.5, photoUrl || null, remarks || 'Physical possession taken'
      ]
    );

    const poss = ins.rows[0];

    // Update parcel status if possession completed
    if (status === 'COMPLETED') {
      await query(
        `UPDATE land_parcels SET status = 'POSSESSION_COMPLETED', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [parcelId]
      );

      // Update project acquired_land_ha
      await query(
        `UPDATE projects SET acquired_land_ha = (
          SELECT COALESCE(SUM(area_ha), 0) FROM land_parcels 
          WHERE project_id = $1 AND status = 'POSSESSION_COMPLETED'
        ) WHERE id = $1`,
        [parcel.project_id]
      );
    }

    // Recalculate Risk Score
    await calculateProjectRiskScore(parcel.project_id);

    // Audit log
    await recordAuditLog({
      userId: user.userId,
      userName: user.fullName,
      role: user.roleCode,
      action: 'RECORD_POSSESSION',
      entity: 'PossessionRecord',
      entityId: String(poss.id),
      newValue: { parcelId, status, possessionDate, gpsLat, gpsLng },
      req
    });

    // Notify
    await createNotification({
      roleTarget: 'DISTRICT_AUTHORITY',
      title: `Possession Verified: Parcel ${parcel.parcel_code}`,
      message: `${user.fullName} verified possession certificate for ${parcel.parcel_code} (${parcel.village}).`,
      category: 'POSSESSION',
      link: `/admin/projects/${parcel.project_id}?tab=possession`
    });

    return res.status(201).json({ success: true, data: poss });
  } catch (err) {
    console.error('recordPossession error:', err);
    return res.status(500).json({ success: false, error: 'Failed to record possession certificate.' });
  }
}

module.exports = {
  getProjectPossession,
  recordPossession
};
