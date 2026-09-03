const { query } = require('../config/db');
const { recordAuditLog } = require('../middleware/audit');
const { createNotification } = require('../services/notificationService');
const { calculateProjectRiskScore } = require('../services/riskService');

// Define who can perform what action at each stage
const STAGE_PERMISSIONS = {
  'PROJECT PROPOSAL': ['PIA', 'SYS_ADMIN'],
  'DOCUMENT SUBMISSION': ['PIA', 'SYS_ADMIN'],
  'DISTRICT SCRUTINY': ['DISTRICT_AUTHORITY', 'SYS_ADMIN'],
  'STATE VERIFICATION': ['STATE_GOVT', 'SYS_ADMIN'],
  'CENTRAL APPROVAL': ['CENTRAL_MINISTRY', 'SYS_ADMIN'],
  'NOTIFICATION': ['DISTRICT_AUTHORITY', 'SYS_ADMIN'],
  'LAND SURVEY': ['FIELD_OFFICER', 'DISTRICT_AUTHORITY', 'SYS_ADMIN'],
  'AWARD DECLARATION': ['DISTRICT_AUTHORITY', 'SYS_ADMIN'],
  'COMPENSATION ASSESSMENT': ['DISTRICT_AUTHORITY', 'SYS_ADMIN'],
  'COMPENSATION DISBURSEMENT': ['DISTRICT_AUTHORITY', 'SYS_ADMIN'],
  'POSSESSION': ['DISTRICT_AUTHORITY', 'FIELD_OFFICER', 'SYS_ADMIN'],
  'REHABILITATION & RESETTLEMENT': ['DISTRICT_AUTHORITY', 'STATE_GOVT', 'SYS_ADMIN'],
  'PROJECT COMPLETION': ['CENTRAL_MINISTRY', 'SYS_ADMIN']
};

const NEXT_STAGE_MAP = {
  'PROJECT PROPOSAL': 'DOCUMENT SUBMISSION',
  'DOCUMENT SUBMISSION': 'DISTRICT SCRUTINY',
  'DISTRICT SCRUTINY': 'STATE VERIFICATION',
  'STATE VERIFICATION': 'CENTRAL APPROVAL',
  'CENTRAL APPROVAL': 'NOTIFICATION',
  'NOTIFICATION': 'LAND SURVEY',
  'LAND SURVEY': 'AWARD DECLARATION',
  'AWARD DECLARATION': 'COMPENSATION ASSESSMENT',
  'COMPENSATION ASSESSMENT': 'COMPENSATION DISBURSEMENT',
  'COMPENSATION DISBURSEMENT': 'POSSESSION',
  'POSSESSION': 'REHABILITATION & RESETTLEMENT',
  'REHABILITATION & RESETTLEMENT': 'PROJECT COMPLETION'
};

async function getProjectWorkflow(req, res) {
  try {
    const { projectId } = req.params;

    const wfRes = await query(
      `SELECT * FROM workflow_instances WHERE project_id = $1 ORDER BY id DESC LIMIT 1`,
      [projectId]
    );

    if (wfRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Workflow not found for this project.' });
    }

    const workflow = wfRes.rows[0];

    const stepsRes = await query(
      `SELECT ws.*, u.full_name as assigned_officer_name 
       FROM workflow_steps ws
       LEFT JOIN users u ON ws.assigned_officer_id = u.id
       WHERE ws.workflow_id = $1
       ORDER BY ws.id ASC`,
      [workflow.id]
    );

    return res.json({
      success: true,
      data: {
        instance: workflow,
        steps: stepsRes.rows
      }
    });
  } catch (err) {
    console.error('getProjectWorkflow error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve workflow data.' });
  }
}

async function performWorkflowAction(req, res) {
  try {
    const { projectId, stepId, action, remarks } = req.body;
    const user = req.user;

    if (!projectId || !stepId || !action) {
      return res.status(400).json({ success: false, error: 'projectId, stepId and action are required.' });
    }

    // 1. Fetch step details
    const stepRes = await query(
      `SELECT ws.*, wi.project_id, wi.current_stage 
       FROM workflow_steps ws
       JOIN workflow_instances wi ON ws.workflow_id = wi.id
       WHERE ws.id = $1`,
      [stepId]
    );

    if (stepRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Workflow step not found.' });
    }

    const currentStep = stepRes.rows[0];

    // 2. Validate Role Permission
    const allowedRoles = STAGE_PERMISSIONS[currentStep.stage_name] || ['SYS_ADMIN'];
    if (user.roleCode !== 'SYS_ADMIN' && !allowedRoles.includes(user.roleCode)) {
      return res.status(403).json({
        success: false,
        error: `403 Forbidden: Your role '${user.roleCode}' is not authorized to act on stage '${currentStep.stage_name}'. Required: ${allowedRoles.join(', ')}.`
      });
    }

    // 3. Process Action
    let newStatus = 'COMPLETED';
    let nextStage = null;

    if (action === 'Approve' || action === 'Verify' || action === 'Forward' || action === 'Submit' || action === 'Complete') {
      newStatus = 'COMPLETED';
      nextStage = NEXT_STAGE_MAP[currentStep.stage_name] || null;
    } else if (action === 'Reject') {
      newStatus = 'REJECTED';
    } else if (action === 'Return for Correction') {
      newStatus = 'RETURNED';
    }

    // Prepare history item
    const historyItem = {
      action,
      performedBy: user.fullName,
      role: user.roleCode,
      timestamp: new Date().toISOString(),
      remarks: remarks || ''
    };

    const existingHistory = Array.isArray(currentStep.action_history) ? currentStep.action_history : [];
    const updatedHistory = [...existingHistory, historyItem];

    // Update current step
    const completedDate = newStatus === 'COMPLETED' ? new Date().toISOString().slice(0, 10) : currentStep.completed_date;
    await query(
      `UPDATE workflow_steps SET
        status = $1,
        completed_date = $2,
        action_taken = $3,
        remarks = $4,
        action_history = $5
       WHERE id = $6`,
      [newStatus, completedDate, action, remarks || currentStep.remarks, JSON.stringify(updatedHistory), stepId]
    );

    // If step was completed and next stage exists, activate next step
    if (newStatus === 'COMPLETED' && nextStage) {
      await query(
        `UPDATE workflow_steps SET status = 'IN_PROGRESS' 
         WHERE workflow_id = $1 AND stage_name = $2`,
        [currentStep.workflow_id, nextStage]
      );

      await query(
        `UPDATE workflow_instances SET current_stage = $1 WHERE id = $2`,
        [nextStage, currentStep.workflow_id]
      );

      // Map workflow stage to project current_status
      let projectStatus = 'ACQUISITION_IN_PROGRESS';
      if (nextStage === 'STATE_VERIFICATION') projectStatus = 'STATE_VERIFICATION';
      else if (nextStage === 'CENTRAL_APPROVAL') projectStatus = 'CENTRAL_APPROVAL';
      else if (nextStage === 'NOTIFICATION') projectStatus = 'NOTIFICATION';
      else if (nextStage === 'AWARD_DECLARATION') projectStatus = 'AWARD_STAGE';
      else if (nextStage === 'COMPENSATION_DISBURSEMENT') projectStatus = 'COMPENSATION_STAGE';
      else if (nextStage === 'POSSESSION') projectStatus = 'POSSESSION_STAGE';
      else if (nextStage === 'REHABILITATION & RESETTLEMENT') projectStatus = 'RR_STAGE';
      else if (nextStage === 'PROJECT COMPLETION') projectStatus = 'COMPLETED';

      await query('UPDATE projects SET current_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [projectStatus, projectId]);
    }

    // Recalculate Risk Score
    await calculateProjectRiskScore(projectId);

    // Record Audit Log
    await recordAuditLog({
      userId: user.userId,
      userName: user.fullName,
      role: user.roleCode,
      action: `WORKFLOW_${action.toUpperCase().replace(/\s+/g, '_')}`,
      entity: 'WorkflowStep',
      entityId: String(stepId),
      previousValue: { stage: currentStep.stage_name, status: currentStep.status },
      newValue: { stage: currentStep.stage_name, status: newStatus, action, remarks },
      req
    });

    // Create notification
    await createNotification({
      roleTarget: 'ALL',
      title: `Workflow Action: ${currentStep.stage_name} - ${action}`,
      message: `${user.fullName} (${user.roleCode}) executed '${action}' on ${currentStep.stage_name}. Next stage: ${nextStage || 'Final'}`,
      category: 'WORKFLOW',
      link: `/admin/projects/${projectId}?tab=workflow`
    });

    return res.json({
      success: true,
      message: `Workflow action '${action}' successfully executed.`,
      currentStep: { ...currentStep, status: newStatus },
      nextStage
    });
  } catch (err) {
    console.error('performWorkflowAction error:', err);
    return res.status(500).json({ success: false, error: 'Failed to process workflow action.' });
  }
}

module.exports = {
  getProjectWorkflow,
  performWorkflowAction
};
