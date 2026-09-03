const { query } = require('../config/db');

async function getMisReports(req, res) {
  try {
    const { reportType, stateId, districtId, ministry, projectType, status } = req.query;

    let sql = `
      SELECT p.id, p.project_code, p.name as project_name, p.project_type, p.ministry, p.implementing_agency,
             s.name as state_name, d.name as district_name, p.current_status, p.estimated_cost_cr,
             p.required_land_ha, p.notified_land_ha, p.acquired_land_ha, p.risk_score,
             (SELECT COUNT(*) FROM land_parcels lp WHERE lp.project_id = p.id) as parcels_count,
             (SELECT COUNT(*) FROM land_parcels lp WHERE lp.project_id = p.id AND lp.status = 'DISPUTED') as disputed_parcels,
             (SELECT COALESCE(SUM(ca.total_assessed_amount), 0) FROM compensation_assessments ca WHERE ca.project_id = p.id) as assessed_inr,
             (SELECT COALESCE(SUM(cp.disbursed_amount), 0) FROM compensation_payments cp WHERE cp.project_id = p.id) as disbursed_inr,
             (SELECT COUNT(*) FROM affected_families af WHERE af.project_id = p.id) as affected_families,
             (SELECT COALESCE(rr_completion_percentage, 0) FROM rr_cases rc WHERE rc.project_id = p.id LIMIT 1) as rr_pct
      FROM projects p
      LEFT JOIN states s ON p.state_id = s.id
      LEFT JOIN districts d ON p.district_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (stateId) {
      params.push(stateId);
      sql += ` AND p.state_id = $${params.length}`;
    }
    if (districtId) {
      params.push(districtId);
      sql += ` AND p.district_id = $${params.length}`;
    }
    if (ministry) {
      params.push(ministry);
      sql += ` AND p.ministry ILIKE '%' || $${params.length} || '%'`;
    }
    if (projectType) {
      params.push(projectType);
      sql += ` AND p.project_type = $${params.length}`;
    }
    if (status) {
      params.push(status);
      sql += ` AND p.current_status = $${params.length}`;
    }

    sql += ' ORDER BY p.id ASC';

    const result = await query(sql, params);

    // Summary calculations
    let totalProposedHa = 0;
    let totalAcquiredHa = 0;
    let totalAssessedInr = 0;
    let totalDisbursedInr = 0;
    let totalFamilies = 0;

    result.rows.forEach(r => {
      totalProposedHa += parseFloat(r.required_land_ha) || 0;
      totalAcquiredHa += parseFloat(r.acquired_land_ha) || 0;
      totalAssessedInr += parseFloat(r.assessed_inr) || 0;
      totalDisbursedInr += parseFloat(r.disbursed_inr) || 0;
      totalFamilies += parseInt(r.affected_families, 10) || 0;
    });

    return res.json({
      success: true,
      reportMeta: {
        generatedAt: new Date().toISOString(),
        totalRecords: result.rows.length,
        summary: {
          totalProposedHa: totalProposedHa.toFixed(2),
          totalAcquiredHa: totalAcquiredHa.toFixed(2),
          acquisitionPct: totalProposedHa > 0 ? ((totalAcquiredHa / totalProposedHa) * 100).toFixed(1) : 0,
          totalAssessedInr,
          totalDisbursedInr,
          totalFamilies
        }
      },
      data: result.rows
    });
  } catch (err) {
    console.error('getMisReports error:', err);
    return res.status(500).json({ success: false, error: 'Failed to generate MIS reports.' });
  }
}

module.exports = {
  getMisReports
};
