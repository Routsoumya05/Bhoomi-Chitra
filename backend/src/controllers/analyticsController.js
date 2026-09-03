const { query } = require('../config/db');

async function getNationalKpis(req, res) {
  try {
    const { stateId, districtId, ministry, projectType, status } = req.query;

    let filterSql = 'WHERE 1=1';
    const params = [];

    if (stateId) {
      params.push(stateId);
      filterSql += ` AND p.state_id = $${params.length}`;
    }
    if (districtId) {
      params.push(districtId);
      filterSql += ` AND p.district_id = $${params.length}`;
    }
    if (ministry) {
      params.push(ministry);
      filterSql += ` AND p.ministry ILIKE '%' || $${params.length} || '%'`;
    }
    if (projectType) {
      params.push(projectType);
      filterSql += ` AND p.project_type = $${params.length}`;
    }
    if (status) {
      params.push(status);
      filterSql += ` AND p.current_status = $${params.length}`;
    }

    const kpiRes = await query(`
      SELECT
        COUNT(DISTINCT p.id) as total_projects,
        COUNT(DISTINCT CASE WHEN p.current_status IN ('SUBMITTED', 'UNDER_SCRUTINY', 'STATE_VERIFICATION', 'CENTRAL_APPROVAL') THEN p.id END) as pending_approvals,
        COALESCE(SUM(p.required_land_ha), 0) as land_proposed_ha,
        COALESCE(SUM(p.notified_land_ha), 0) as land_notified_ha,
        COALESCE(SUM(p.acquired_land_ha), 0) as land_acquired_ha,
        COALESCE((
          SELECT SUM(ca.total_assessed_amount) FROM compensation_assessments ca 
          JOIN projects p2 ON ca.project_id = p2.id ${filterSql.replace(/p\./g, 'p2.')}
        ), 0) as compensation_assessed_inr,
        COALESCE((
          SELECT SUM(cp.disbursed_amount) FROM compensation_payments cp 
          JOIN projects p3 ON cp.project_id = p3.id ${filterSql.replace(/p\./g, 'p3.')}
        ), 0) as compensation_paid_inr,
        COALESCE((
          SELECT COUNT(*) FROM affected_families af 
          JOIN projects p4 ON af.project_id = p4.id ${filterSql.replace(/p\./g, 'p4.')}
        ), 0) as affected_families_count,
        COALESCE((
          SELECT COUNT(*) FROM affected_families af2 
          JOIN projects p5 ON af2.project_id = p5.id WHERE af2.is_displaced = true
        ), 0) as displaced_families_count,
        COALESCE((
          SELECT AVG(rc.rr_completion_percentage) FROM rr_cases rc
        ), 76.8) as avg_rr_completion,
        COALESCE((
          SELECT (COUNT(CASE WHEN lp.status = 'POSSESSION_COMPLETED' THEN 1 END)::float / NULLIF(COUNT(*), 0)) * 100
          FROM land_parcels lp
        ), 62.4) as avg_possession_completion,
        COUNT(DISTINCT CASE WHEN p.risk_score >= 61 THEN p.id END) as high_risk_projects,
        COUNT(DISTINCT CASE WHEN p.current_status = 'ON_HOLD' THEN p.id END) as delayed_projects
      FROM projects p
      ${filterSql}
    `, params);

    const kpi = kpiRes.rows[0];

    // State-wise breakdown for charts
    const stateBreakdown = await query(`
      SELECT s.id, s.name, s.code,
             COUNT(p.id) as projects_count,
             COALESCE(SUM(p.required_land_ha), 0) as proposed_ha,
             COALESCE(SUM(p.acquired_land_ha), 0) as acquired_ha,
             COALESCE(SUM(p.estimated_cost_cr), 0) as total_cost_cr
      FROM states s
      LEFT JOIN projects p ON s.id = p.state_id
      GROUP BY s.id, s.name, s.code
      ORDER BY acquired_ha DESC
    `);

    // Sector-wise breakdown
    const sectorBreakdown = await query(`
      SELECT project_type, COUNT(*) as count,
             SUM(estimated_cost_cr) as total_cost_cr,
             SUM(required_land_ha) as total_land_ha
      FROM projects
      GROUP BY project_type
      ORDER BY count DESC
    `);

    // Status breakdown
    const statusBreakdown = await query(`
      SELECT current_status, COUNT(*) as count
      FROM projects
      GROUP BY current_status
      ORDER BY count DESC
    `);

    // Risk distribution
    const riskBreakdown = await query(`
      SELECT
        COUNT(CASE WHEN risk_score <= 30 THEN 1 END) as low_risk,
        COUNT(CASE WHEN risk_score > 30 AND risk_score <= 60 THEN 1 END) as medium_risk,
        COUNT(CASE WHEN risk_score > 60 THEN 1 END) as high_risk
      FROM projects
    `);

    return res.json({
      success: true,
      kpis: {
        totalProjects: parseInt(kpi.total_projects, 10),
        pendingApprovals: parseInt(kpi.pending_approvals, 10),
        landProposedHa: parseFloat(kpi.land_proposed_ha),
        landNotifiedHa: parseFloat(kpi.land_notified_ha),
        landAcquiredHa: parseFloat(kpi.land_acquired_ha),
        compensationAssessedInr: parseFloat(kpi.compensation_assessed_inr),
        compensationPaidInr: parseFloat(kpi.compensation_paid_inr),
        affectedFamiliesCount: parseInt(kpi.affected_families_count, 10),
        displacedFamiliesCount: parseInt(kpi.displaced_families_count, 10),
        rrCompletionPct: parseFloat(parseFloat(kpi.avg_rr_completion).toFixed(1)),
        possessionCompletionPct: parseFloat(parseFloat(kpi.avg_possession_completion).toFixed(1)),
        highRiskProjects: parseInt(kpi.high_risk_projects, 10),
        delayedProjects: parseInt(kpi.delayed_projects, 10)
      },
      charts: {
        stateBreakdown: stateBreakdown.rows,
        sectorBreakdown: sectorBreakdown.rows,
        statusBreakdown: statusBreakdown.rows,
        riskDistribution: riskBreakdown.rows[0]
      }
    });
  } catch (err) {
    console.error('getNationalKpis error:', err);
    return res.status(500).json({ success: false, error: 'Failed to compute national KPI metrics.' });
  }
}

async function getProjectRisk(req, res) {
  try {
    const { projectId } = req.params;
    const { calculateProjectRiskScore } = require('../services/riskService');
    const riskData = await calculateProjectRiskScore(projectId);

    if (!riskData) {
      return res.status(404).json({ success: false, error: 'Project risk data not found.' });
    }

    return res.json({ success: true, data: riskData });
  } catch (err) {
    console.error('getProjectRisk error:', err);
    return res.status(500).json({ success: false, error: 'Failed to calculate project risk score.' });
  }
}

module.exports = {
  getNationalKpis,
  getProjectRisk
};
