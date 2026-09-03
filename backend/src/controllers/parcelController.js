const { query } = require('../config/db');
const { recordAuditLog } = require('../middleware/audit');
const { calculateProjectRiskScore } = require('../services/riskService');
const { createNotification } = require('../services/notificationService');

async function getParcels(req, res) {
  try {
    const { projectId, stateId, districtId, status, search } = req.query;
    const isPublic = !req.user || req.user.roleCode === 'PUBLIC_USER';

    let sql = `
      SELECT lp.*, p.name as project_name, p.project_code,
             s.name as state_name, d.name as district_name,
             (SELECT COUNT(*) FROM land_owners lo WHERE lo.parcel_id = lp.id) as owner_count,
             (SELECT lo.masked_reference FROM land_owners lo WHERE lo.parcel_id = lp.id LIMIT 1) as masked_owner,
             ${isPublic ? 'NULL as full_owners' : "(SELECT json_agg(json_build_object('id', lo.id, 'name', lo.full_name, 'masked', lo.masked_reference, 'share', lo.share_percentage)) FROM land_owners lo WHERE lo.parcel_id = lp.id) as full_owners"}
      FROM land_parcels lp
      LEFT JOIN projects p ON lp.project_id = p.id
      LEFT JOIN states s ON lp.state_id = s.id
      LEFT JOIN districts d ON lp.district_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (projectId) {
      params.push(projectId);
      sql += ` AND lp.project_id = $${params.length}`;
    }
    if (stateId) {
      params.push(stateId);
      sql += ` AND lp.state_id = $${params.length}`;
    }
    if (districtId) {
      params.push(districtId);
      sql += ` AND lp.district_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      sql += ` AND lp.status = $${params.length}`;
    }
    if (search) {
      params.push(search);
      sql += ` AND (lp.parcel_code ILIKE '%' || $${params.length} || '%' OR lp.khasra_survey_no ILIKE '%' || $${params.length} || '%' OR lp.village ILIKE '%' || $${params.length} || '%')`;
    }

    sql += ' ORDER BY lp.id ASC';

    const result = await query(sql, params);
    return res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error('getParcels error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve land parcels.' });
  }
}

async function getParcelById(req, res) {
  try {
    const { id } = req.params;
    const isPublic = !req.user || req.user.roleCode === 'PUBLIC_USER';

    const pRes = await query(
      `SELECT lp.*, p.name as project_name, p.project_code,
              s.name as state_name, d.name as district_name,
              u.full_name as field_officer_name
       FROM land_parcels lp
       LEFT JOIN projects p ON lp.project_id = p.id
       LEFT JOIN states s ON lp.state_id = s.id
       LEFT JOIN districts d ON lp.district_id = d.id
       LEFT JOIN users u ON lp.field_officer_id = u.id
       WHERE lp.id = $1`,
      [id]
    );

    if (pRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Land parcel not found.' });
    }

    const parcel = pRes.rows[0];

    // Get Owners (Anonymize for public)
    const ownerRes = await query(
      `SELECT id, masked_reference, share_percentage
              ${isPublic ? '' : ', full_name, contact_masked, aadhaar_masked'}
       FROM land_owners WHERE parcel_id = $1`,
      [id]
    );

    // Get Compensation info
    const compRes = await query(
      `SELECT ca.*, cp.disbursed_amount, cp.pending_amount, cp.payment_status, cp.transaction_ref
       FROM compensation_assessments ca
       LEFT JOIN compensation_payments cp ON ca.id = cp.assessment_id
       WHERE ca.parcel_id = $1 LIMIT 1`,
      [id]
    );

    // Get Possession info
    const possRes = await query('SELECT * FROM possession_records WHERE parcel_id = $1 LIMIT 1', [id]);

    return res.json({
      success: true,
      data: {
        ...parcel,
        owners: ownerRes.rows,
        compensation: compRes.rows[0] || null,
        possession: possRes.rows[0] || null
      }
    });
  } catch (err) {
    console.error('getParcelById error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve parcel details.' });
  }
}

async function updateParcelStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, disputeReason } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required.' });
    }

    const prevRes = await query('SELECT * FROM land_parcels WHERE id = $1', [id]);
    if (prevRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Parcel not found.' });
    }
    const prev = prevRes.rows[0];

    const upd = await query(
      `UPDATE land_parcels SET
        status = $1,
        dispute_reason = $2,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, status === 'DISPUTED' ? disputeReason : null, id]
    );

    const updated = upd.rows[0];

    // If status became POSSESSION_COMPLETED, ensure acquired_land_ha is updated
    if (status === 'POSSESSION_COMPLETED') {
      await query(
        `UPDATE projects SET 
          acquired_land_ha = (
            SELECT COALESCE(SUM(area_ha), 0) FROM land_parcels 
            WHERE project_id = $1 AND status = 'POSSESSION_COMPLETED'
          )
         WHERE id = $1`,
        [prev.project_id]
      );
    }

    // Recalculate Risk Score
    await calculateProjectRiskScore(prev.project_id);

    // Record Audit Log
    await recordAuditLog({
      userId: req.user.userId,
      userName: req.user.fullName,
      role: req.user.roleCode,
      action: 'UPDATE_PARCEL_STATUS',
      entity: 'LandParcel',
      entityId: String(id),
      previousValue: { status: prev.status, disputeReason: prev.dispute_reason },
      newValue: { status: updated.status, disputeReason: updated.dispute_reason },
      req
    });

    // Notify
    await createNotification({
      roleTarget: 'ALL',
      title: `Parcel Status Updated: ${updated.parcel_code}`,
      message: `${req.user.fullName} changed parcel status to '${status}'.`,
      category: 'PARCEL',
      link: `/admin/projects/${prev.project_id}?tab=parcels`
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('updateParcelStatus error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update parcel status.' });
  }
}

async function verifyParcelGps(req, res) {
  try {
    const { id } = req.params;
    const { lat, lng, accuracy, remarks, photoUrl } = req.body;

    const parcelRes = await query('SELECT * FROM land_parcels WHERE id = $1', [id]);
    if (parcelRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Parcel not found.' });
    }
    const parcel = parcelRes.rows[0];

    // Update parcel verified state
    await query(
      `UPDATE land_parcels SET
        verified_by_field_officer = true,
        field_officer_id = $1,
        centroid_lat = COALESCE($2, centroid_lat),
        centroid_lng = COALESCE($3, centroid_lng),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [req.user.userId, lat, lng, id]
    );

    // Insert or update possession record
    await query(
      `INSERT INTO possession_records (
        parcel_id, project_id, status, possession_date, verified_by_id,
        gps_lat, gps_lng, gps_accuracy_m, photo_url, remarks
      ) VALUES ($1, $2, 'PARTIALLY_COMPLETED', CURRENT_DATE, $3, $4, $5, $6, $7, $8)`,
      [id, parcel.project_id, req.user.userId, lat, lng, accuracy || 3.0, photoUrl || null, remarks || 'GPS verified on field']
    );

    // Audit log
    await recordAuditLog({
      userId: req.user.userId,
      userName: req.user.fullName,
      role: req.user.roleCode,
      action: 'FIELD_VERIFY_PARCEL',
      entity: 'LandParcel',
      entityId: String(id),
      newValue: { verified: true, lat, lng, accuracy, remarks },
      req
    });

    return res.json({
      success: true,
      message: 'Parcel GPS field verification successfully recorded.'
    });
  } catch (err) {
    console.error('verifyParcelGps error:', err);
    return res.status(500).json({ success: false, error: 'Failed to record field verification.' });
  }
}

async function getGeoJson(req, res) {
  try {
    const { projectId, stateId, districtId, status } = req.query;

    let sql = `
      SELECT lp.id, lp.parcel_code, lp.khasra_survey_no, lp.village, lp.area_ha, lp.area_acres,
             lp.status, lp.land_type, lp.market_value_inr, lp.centroid_lat, lp.centroid_lng,
             lp.boundary_geojson, lp.dispute_reason,
             p.name as project_name, p.project_code,
             s.name as state_name, d.name as district_name,
             (SELECT lo.masked_reference FROM land_owners lo WHERE lo.parcel_id = lp.id LIMIT 1) as masked_owner
      FROM land_parcels lp
      JOIN projects p ON lp.project_id = p.id
      LEFT JOIN states s ON lp.state_id = s.id
      LEFT JOIN districts d ON lp.district_id = d.id
      WHERE lp.boundary_geojson IS NOT NULL
    `;
    const params = [];

    if (projectId) {
      params.push(projectId);
      sql += ` AND lp.project_id = $${params.length}`;
    }
    if (stateId) {
      params.push(stateId);
      sql += ` AND lp.state_id = $${params.length}`;
    }
    if (districtId) {
      params.push(districtId);
      sql += ` AND lp.district_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      sql += ` AND lp.status = $${params.length}`;
    }

    const result = await query(sql, params);

    // Build GeoJSON FeatureCollection
    const features = result.rows.map(row => {
      const geometry = typeof row.boundary_geojson === 'string' ? JSON.parse(row.boundary_geojson) : row.boundary_geojson;
      return {
        type: 'Feature',
        id: row.id,
        geometry,
        properties: {
          id: row.id,
          parcelCode: row.parcel_code,
          khasra: row.khasra_survey_no,
          village: row.village,
          areaHa: parseFloat(row.area_ha),
          areaAcres: parseFloat(row.area_acres),
          status: row.status,
          landType: row.land_type,
          marketValue: parseFloat(row.market_value_inr),
          centroidLat: parseFloat(row.centroid_lat),
          centroidLng: parseFloat(row.centroid_lng),
          disputeReason: row.dispute_reason,
          projectName: row.project_name,
          projectCode: row.project_code,
          stateName: row.state_name,
          districtName: row.district_name,
          maskedOwner: row.masked_owner
        }
      };
    });

    return res.json({
      type: 'FeatureCollection',
      features
    });
  } catch (err) {
    console.error('getGeoJson error:', err);
    return res.status(500).json({ success: false, error: 'Failed to generate GeoJSON feature collection.' });
  }
}

module.exports = {
  getParcels,
  getParcelById,
  updateParcelStatus,
  verifyParcelGps,
  getGeoJson
};
