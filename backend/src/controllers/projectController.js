const { query } = require('../config/db');
const { recordAuditLog } = require('../middleware/audit');
const { calculateProjectRiskScore } = require('../services/riskService');
const { createNotification } = require('../services/notificationService');

async function getProjects(req, res) {
  try {
    const { stateId, districtId, status, type, ministry, search } = req.query;
    let sql = `
      SELECT p.*, s.name as state_name, s.code as state_code, d.name as district_name,
             (SELECT COUNT(*) FROM land_parcels lp WHERE lp.project_id = p.id) as parcels_count,
             (SELECT COUNT(*) FROM land_parcels lp WHERE lp.project_id = p.id AND lp.status = 'POSSESSION_COMPLETED') as possessed_parcels_count,
             (SELECT COUNT(*) FROM land_parcels lp WHERE lp.project_id = p.id AND lp.status = 'DISPUTED') as disputed_parcels_count,
             (SELECT COALESCE(SUM(ca.total_assessed_amount), 0) FROM compensation_assessments ca WHERE ca.project_id = p.id) as total_compensation_assessed,
             (SELECT COALESCE(SUM(cp.disbursed_amount), 0) FROM compensation_payments cp WHERE cp.project_id = p.id) as total_compensation_paid,
             (SELECT COUNT(*) FROM affected_families af WHERE af.project_id = p.id) as affected_families_count,
             (SELECT rr_completion_percentage FROM rr_cases rc WHERE rc.project_id = p.id LIMIT 1) as rr_progress
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
    if (status) {
      params.push(status);
      sql += ` AND p.current_status = $${params.length}`;
    }
    if (type) {
      params.push(type);
      sql += ` AND p.project_type = $${params.length}`;
    }
    if (ministry) {
      params.push(ministry);
      sql += ` AND p.ministry ILIKE '%' || $${params.length} || '%'`;
    }
    if (search) {
      params.push(search);
      sql += ` AND (p.name ILIKE '%' || $${params.length} || '%' OR p.project_code ILIKE '%' || $${params.length} || '%')`;
    }

    sql += ' ORDER BY p.id ASC';

    const result = await query(sql, params);
    return res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error('getProjects error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve projects list.' });
  }
}

async function getProjectById(req, res) {
  try {
    const { id } = req.params;
    const pRes = await query(
      `SELECT p.*, s.name as state_name, s.code as state_code, d.name as district_name,
              u.full_name as created_by_name
       FROM projects p
       LEFT JOIN states s ON p.state_id = s.id
       LEFT JOIN districts d ON p.district_id = d.id
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (pRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const project = pRes.rows[0];

    // Additional aggregated metrics
    const statsRes = await query(
      `SELECT
        (SELECT COUNT(*) FROM land_parcels WHERE project_id = $1) as total_parcels,
        (SELECT COUNT(*) FROM land_parcels WHERE project_id = $1 AND status = 'POSSESSION_COMPLETED') as possessed_parcels,
        (SELECT COUNT(*) FROM land_parcels WHERE project_id = $1 AND status = 'COMPENSATION_PAID') as paid_parcels,
        (SELECT COUNT(*) FROM land_parcels WHERE project_id = $1 AND status = 'AWARD_DECLARED') as awarded_parcels,
        (SELECT COUNT(*) FROM land_parcels WHERE project_id = $1 AND status = 'NOTIFICATION_ISSUED') as notified_parcels,
        (SELECT COUNT(*) FROM land_parcels WHERE project_id = $1 AND status = 'DISPUTED') as disputed_parcels,
        (SELECT COALESCE(SUM(total_assessed_amount), 0) FROM compensation_assessments WHERE project_id = $1) as total_compensation_assessed,
        (SELECT COALESCE(SUM(disbursed_amount), 0) FROM compensation_payments WHERE project_id = $1) as total_compensation_paid,
        (SELECT COUNT(*) FROM affected_families WHERE project_id = $1) as total_affected_families,
        (SELECT COUNT(*) FROM affected_families WHERE project_id = $1 AND is_displaced = true) as total_displaced_families,
        (SELECT COALESCE(rr_completion_percentage, 0) FROM rr_cases WHERE project_id = $1 LIMIT 1) as rr_completion_percentage
      `,
      [id]
    );

    const stats = statsRes.rows[0];

    // Risk score info
    const riskRes = await query('SELECT * FROM risk_scores WHERE project_id = $1', [id]);
    const riskInfo = riskRes.rows[0] || null;

    return res.json({
      success: true,
      data: {
        ...project,
        stats,
        riskDetails: riskInfo
      }
    });
  } catch (err) {
    console.error('getProjectById error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve project details.' });
  }
}

async function createProject(req, res) {
  try {
    const {
      name,
      projectType,
      ministry,
      implementingAgency,
      stateId,
      districtId,
      description,
      estimatedCostCr,
      requiredLandHa,
      targetCompletionDate
    } = req.body;

    if (!name || !projectType || !ministry || !implementingAgency || !stateId || !districtId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required project fields.'
      });
    }

    const stateRow = await query('SELECT code FROM states WHERE id = $1', [stateId]);
    const sCode = stateRow.rows[0]?.code || 'IND';
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const projectCode = `${implementingAgency.substring(0, 4).toUpperCase()}-${sCode}-${randSuffix}`;

    const ins = await query(
      `INSERT INTO projects (
        project_code, name, project_type, ministry, implementing_agency,
        state_id, district_id, description, estimated_cost_cr, required_land_ha,
        target_completion_date, current_status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'DRAFT', $12)
      RETURNING *`,
      [
        projectCode, name, projectType, ministry, implementingAgency,
        stateId, districtId, description, estimatedCostCr || 0, requiredLandHa || 0,
        targetCompletionDate || null, req.user?.userId || null
      ]
    );

    const newProject = ins.rows[0];

    // Initialize workflow instance
    const wfIns = await query(
      `INSERT INTO workflow_instances (project_id, current_stage, is_completed)
       VALUES ($1, 'PROJECT PROPOSAL', false) RETURNING id`,
      [newProject.id]
    );
    const wfId = wfIns.rows[0]?.id;

    // Initialize standard workflow steps
    const defaultSteps = [
      { name: 'PROJECT PROPOSAL', auth: 'PIA', status: 'IN_PROGRESS' },
      { name: 'DOCUMENT SUBMISSION', auth: 'PIA', status: 'PENDING' },
      { name: 'DISTRICT SCRUTINY', auth: 'District Authority', status: 'PENDING' },
      { name: 'STATE VERIFICATION', auth: 'State Government', status: 'PENDING' },
      { name: 'CENTRAL APPROVAL', auth: 'Central Ministry', status: 'PENDING' },
      { name: 'NOTIFICATION', auth: 'District Authority', status: 'PENDING' },
      { name: 'LAND SURVEY', auth: 'Field Officer', status: 'PENDING' },
      { name: 'AWARD DECLARATION', auth: 'District Authority', status: 'PENDING' },
      { name: 'COMPENSATION ASSESSMENT', auth: 'District Authority', status: 'PENDING' },
      { name: 'COMPENSATION DISBURSEMENT', auth: 'District Authority', status: 'PENDING' },
      { name: 'POSSESSION', auth: 'District Authority', status: 'PENDING' },
      { name: 'REHABILITATION & RESETTLEMENT', auth: 'District Authority', status: 'PENDING' },
      { name: 'PROJECT COMPLETION', auth: 'Central Ministry', status: 'PENDING' }
    ];

    for (const ds of defaultSteps) {
      await query(
        `INSERT INTO workflow_steps (workflow_id, stage_name, status, assigned_authority, due_date)
         VALUES ($1, $2, $3, $4, CURRENT_DATE + INTERVAL '30 days')`,
        [wfId, ds.name, ds.status, ds.auth]
      );
    }

    // Initialize initial risk score
    await query(
      `INSERT INTO risk_scores (project_id, score, risk_level, contributing_factors_json, recommended_actions_json)
       VALUES ($1, 20, 'LOW', '[]', '[]')`,
      [newProject.id]
    );

    // Record audit log
    await recordAuditLog({
      userId: req.user.userId,
      userName: req.user.fullName,
      role: req.user.roleCode,
      action: 'CREATE_PROJECT',
      entity: 'Project',
      entityId: String(newProject.id),
      newValue: { id: newProject.id, code: projectCode, name },
      req
    });

    // Notify District and State
    await createNotification({
      roleTarget: 'DISTRICT_AUTHORITY',
      title: `New Project Proposal Created: ${name}`,
      message: `Project ${projectCode} has been initiated by ${implementingAgency}.`,
      category: 'PROJECT',
      link: `/admin/projects/${newProject.id}`
    });

    return res.status(201).json({ success: true, data: newProject });
  } catch (err) {
    console.error('createProject error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create project.' });
  }
}

async function updateProject(req, res) {
  try {
    const { id } = req.params;
    const {
      name,
      projectType,
      ministry,
      implementingAgency,
      description,
      estimatedCostCr,
      requiredLandHa,
      notifiedLandHa,
      acquiredLandHa,
      targetCompletionDate,
      currentStatus
    } = req.body;

    const prevRes = await query('SELECT * FROM projects WHERE id = $1', [id]);
    if (prevRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }
    const prev = prevRes.rows[0];

    const upd = await query(
      `UPDATE projects SET
        name = COALESCE($1, name),
        project_type = COALESCE($2, project_type),
        ministry = COALESCE($3, ministry),
        implementing_agency = COALESCE($4, implementing_agency),
        description = COALESCE($5, description),
        estimated_cost_cr = COALESCE($6, estimated_cost_cr),
        required_land_ha = COALESCE($7, required_land_ha),
        notified_land_ha = COALESCE($8, notified_land_ha),
        acquired_land_ha = COALESCE($9, acquired_land_ha),
        target_completion_date = COALESCE($10, target_completion_date),
        current_status = COALESCE($11, current_status),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $12
       RETURNING *`,
      [
        name, projectType, ministry, implementingAgency, description,
        estimatedCostCr, requiredLandHa, notifiedLandHa, acquiredLandHa,
        targetCompletionDate, currentStatus, id
      ]
    );

    const updated = upd.rows[0];

    // Recompute risk score dynamically
    await calculateProjectRiskScore(id);

    // Audit log
    await recordAuditLog({
      userId: req.user.userId,
      userName: req.user.fullName,
      role: req.user.roleCode,
      action: 'UPDATE_PROJECT',
      entity: 'Project',
      entityId: String(id),
      previousValue: prev,
      newValue: updated,
      req
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('updateProject error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update project.' });
  }
}

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject
};
