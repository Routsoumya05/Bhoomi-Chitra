const { query } = require('../config/db');

/**
 * Calculates a transparent Acquisition Risk Score (0-100) for a project
 * based on live database metrics:
 * 1. Disputed parcels ratio (up to 25 pts)
 * 2. Compensation pending ratio (up to 25 pts)
 * 3. Overdue milestones & workflow delays (up to 25 pts)
 * 4. R&R / Possession lag (up to 25 pts)
 */
async function calculateProjectRiskScore(projectId) {
  const pRes = await query('SELECT * FROM projects WHERE id = $1', [projectId]);
  if (pRes.rows.length === 0) return null;
  const project = pRes.rows[0];

  // 1. Parcels stats
  const parcelsRes = await query(
    `SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'DISPUTED') as disputed,
      COUNT(*) FILTER (WHERE status = 'POSSESSION_COMPLETED') as possessed,
      COUNT(*) FILTER (WHERE status = 'COMPENSATION_PENDING') as comp_pending
     FROM land_parcels WHERE project_id = $1`,
    [projectId]
  );
  const pStats = parcelsRes.rows[0];
  const totalParcels = parseInt(pStats.total, 10) || 0;
  const disputedParcels = parseInt(pStats.disputed, 10) || 0;
  const possessedParcels = parseInt(pStats.possessed, 10) || 0;

  let disputeScore = 0;
  const disputePct = totalParcels > 0 ? (disputedParcels / totalParcels) * 100 : 0;
  if (disputePct > 15) disputeScore = 25;
  else if (disputePct > 7) disputeScore = 18;
  else if (disputePct > 0) disputeScore = 10;

  // 2. Compensation stats
  const compRes = await query(
    `SELECT 
      COALESCE(SUM(ca.total_assessed_amount), 0) as assessed,
      COALESCE((SELECT SUM(disbursed_amount) FROM compensation_payments WHERE project_id = $1), 0) as paid,
      COUNT(DISTINCT ca.affected_family_id) as total_families,
      COUNT(DISTINCT CASE WHEN ca.status != 'PAID' THEN ca.affected_family_id END) as pending_families
     FROM compensation_assessments ca WHERE ca.project_id = $1`,
    [projectId]
  );
  const cStats = compRes.rows[0];
  const assessedAmt = parseFloat(cStats.assessed) || 0;
  const paidAmt = parseFloat(cStats.paid) || 0;
  const pendingFamilies = parseInt(cStats.pending_families, 10) || 0;

  let compScore = 0;
  const unpaidPct = assessedAmt > 0 ? ((assessedAmt - paidAmt) / assessedAmt) * 100 : 0;
  if (unpaidPct > 60) compScore = 25;
  else if (unpaidPct > 35) compScore = 18;
  else if (unpaidPct > 10) compScore = 10;

  // 3. Milestones delay
  const msRes = await query(
    `SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'DELAYED') as delayed,
      COUNT(*) FILTER (WHERE status = 'AT_RISK') as at_risk,
      COALESCE(MAX(delay_days), 0) as max_delay
     FROM milestones WHERE project_id = $1`,
    [projectId]
  );
  const msStats = msRes.rows[0];
  const delayedMs = parseInt(msStats.delayed, 10) || 0;
  const maxDelayDays = parseInt(msStats.max_delay, 10) || 0;

  let milestoneScore = 0;
  if (delayedMs >= 2 || maxDelayDays > 45) milestoneScore = 25;
  else if (delayedMs >= 1 || maxDelayDays > 15) milestoneScore = 16;
  else if (parseInt(msStats.at_risk, 10) > 0) milestoneScore = 8;

  // 4. R&R / Possession stats
  const rrRes = await query('SELECT * FROM rr_cases WHERE project_id = $1', [projectId]);
  let rrScore = 0;
  let rrPct = 100;
  if (rrRes.rows.length > 0) {
    rrPct = parseFloat(rrRes.rows[0].rr_completion_percentage) || 0;
    if (rrPct < 40) rrScore += 15;
    else if (rrPct < 80) rrScore += 8;
  }
  const possessionPct = totalParcels > 0 ? (possessedParcels / totalParcels) * 100 : 0;
  if (possessionPct < 30) rrScore += 10;
  else if (possessionPct < 70) rrScore += 4;
  if (rrScore > 25) rrScore = 25;

  const totalScore = Math.min(100, Math.max(0, Math.round(disputeScore + compScore + milestoneScore + rrScore)));

  let riskLevel = 'LOW';
  if (totalScore >= 61) riskLevel = 'HIGH';
  else if (totalScore >= 31) riskLevel = 'MEDIUM';

  // Contributing factors
  const contributingFactors = [];
  if (disputedParcels > 0) {
    contributingFactors.push({
      factor: 'Disputed Land Parcels',
      detail: `${disputedParcels} parcel(s) (${disputePct.toFixed(1)}%) under dispute or legal challenge`,
      weight: '25%',
      impact: `+${disputeScore} pts`
    });
  }
  if (pendingFamilies > 0 || unpaidPct > 15) {
    contributingFactors.push({
      factor: 'Pending Compensation Disbursement',
      detail: `Compensation pending for ${pendingFamilies} families (${unpaidPct.toFixed(1)}% undisbursed)`,
      weight: '25%',
      impact: `+${compScore} pts`
    });
  }
  if (delayedMs > 0 || maxDelayDays > 0) {
    contributingFactors.push({
      factor: 'Milestone Schedule Delays',
      detail: `${delayedMs} milestone(s) delayed (max delay: ${maxDelayDays} days)`,
      weight: '25%',
      impact: `+${milestoneScore} pts`
    });
  }
  if (rrScore > 0) {
    contributingFactors.push({
      factor: 'R&R & Possession Handover Lag',
      detail: `R&R progress at ${rrPct.toFixed(1)}%, land possession completed for ${possessionPct.toFixed(1)}% parcels`,
      weight: '25%',
      impact: `+${rrScore} pts`
    });
  }

  // Recommended actions
  const recommendedActions = [];
  if (disputedParcels > 0) {
    recommendedActions.push({
      action: 'Convene Special Lok Adalat / CALA hearing for priority dispute adjudication',
      urgency: 'CRITICAL',
      dept: 'District Authority / CALA'
    });
  }
  if (pendingFamilies > 0) {
    recommendedActions.push({
      action: `Prioritize PFMS/DBT bank disbursement batch for ${pendingFamilies} landholder families`,
      urgency: 'HIGH',
      dept: 'Special Land Acquisition Office'
    });
  }
  if (delayedMs > 0) {
    recommendedActions.push({
      action: 'Conduct inter-departmental review to expedite critical path milestones',
      urgency: 'HIGH',
      dept: 'Project Implementing Agency & State Revenue'
    });
  }
  if (rrPct < 85) {
    recommendedActions.push({
      action: 'Accelerate physical infrastructure completion at rehabilitation relocation colony',
      urgency: 'MEDIUM',
      dept: 'R&R Commissioner'
    });
  }

  // Update project record and risk_scores table
  await query('UPDATE projects SET risk_score = $1 WHERE id = $2', [totalScore, projectId]);

  // Insert or update risk_scores
  const existingRisk = await query('SELECT id FROM risk_scores WHERE project_id = $1', [projectId]);
  if (existingRisk.rows.length > 0) {
    await query(
      `UPDATE risk_scores 
       SET score = $1, risk_level = $2, contributing_factors_json = $3, recommended_actions_json = $4, calculated_at = CURRENT_TIMESTAMP
       WHERE project_id = $5`,
      [totalScore, riskLevel, JSON.stringify(contributingFactors), JSON.stringify(recommendedActions), projectId]
    );
  } else {
    await query(
      `INSERT INTO risk_scores (project_id, score, risk_level, contributing_factors_json, recommended_actions_json)
       VALUES ($1, $2, $3, $4, $5)`,
      [projectId, totalScore, riskLevel, JSON.stringify(contributingFactors), JSON.stringify(recommendedActions)]
    );
  }

  return {
    score: totalScore,
    riskLevel,
    contributingFactors,
    recommendedActions
  };
}

module.exports = {
  calculateProjectRiskScore
};
