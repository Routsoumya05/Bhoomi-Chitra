const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Multer setup for document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Import Controllers
const authController = require('../controllers/authController');
const projectController = require('../controllers/projectController');
const workflowController = require('../controllers/workflowController');
const parcelController = require('../controllers/parcelController');
const compensationController = require('../controllers/compensationController');
const rrController = require('../controllers/rrController');
const possessionController = require('../controllers/possessionController');
const documentController = require('../controllers/documentController');
const notificationController = require('../controllers/notificationController');
const analyticsController = require('../controllers/analyticsController');
const reportController = require('../controllers/reportController');
const auditController = require('../controllers/auditController');
const integrationController = require('../controllers/integrationController');

// Middleware
const { authenticateJWT, requireAuth } = require('../middleware/auth');
const { requireRole, blockPublicMutations } = require('../middleware/rbac');
const { query } = require('../config/db');

// Apply JWT parsing across all routes
router.use(authenticateJWT);
// Block mutations from public users universally
router.use(blockPublicMutations);

// ================= AUTH ROUTES =================
router.post('/auth/login', authController.login);
router.post('/auth/public-login', authController.publicLogin);
router.get('/auth/me', requireAuth, authController.getMe);

// ================= METADATA ROUTES =================
router.get('/metadata/states', async (req, res) => {
  const r = await query('SELECT * FROM states ORDER BY name ASC');
  res.json({ success: true, data: r.rows });
});

router.get('/metadata/districts', async (req, res) => {
  const { stateId } = req.query;
  let sql = `
    SELECT d.*, s.name as state_name, s.code as state_code 
    FROM districts d 
    LEFT JOIN states s ON d.state_id = s.id
  `;
  const params = [];
  if (stateId) {
    sql += ' WHERE d.state_id = $1';
    params.push(stateId);
  }
  sql += ' ORDER BY d.name ASC';
  const r = await query(sql, params);
  res.json({ success: true, data: r.rows });
});

router.get('/metadata/roles', async (req, res) => {
  const r = await query('SELECT * FROM roles ORDER BY id ASC');
  res.json({ success: true, data: r.rows });
});

// ================= PROJECT ROUTES =================
// Public can VIEW projects; administrative roles can CREATE/EDIT
router.get('/projects', projectController.getProjects);
router.get('/projects/:id', projectController.getProjectById);
router.post('/projects', requireAuth, requireRole(['SYS_ADMIN', 'PIA', 'CENTRAL_MINISTRY']), projectController.createProject);
router.put('/projects/:id', requireAuth, requireRole(['SYS_ADMIN', 'PIA', 'DISTRICT_AUTHORITY', 'STATE_GOVT', 'CENTRAL_MINISTRY']), projectController.updateProject);

// ================= WORKFLOW ROUTES =================
router.get('/workflows/project/:projectId', workflowController.getProjectWorkflow);
router.post('/workflows/action', requireAuth, requireRole(['SYS_ADMIN', 'PIA', 'DISTRICT_AUTHORITY', 'STATE_GOVT', 'CENTRAL_MINISTRY', 'FIELD_OFFICER']), workflowController.performWorkflowAction);

// ================= PARCEL & GIS ROUTES =================
router.get('/parcels', parcelController.getParcels);
router.get('/parcels/:id', parcelController.getParcelById);
router.put('/parcels/:id/status', requireAuth, requireRole(['SYS_ADMIN', 'DISTRICT_AUTHORITY', 'FIELD_OFFICER']), parcelController.updateParcelStatus);
router.post('/parcels/:id/verify', requireAuth, requireRole(['SYS_ADMIN', 'FIELD_OFFICER', 'DISTRICT_AUTHORITY']), parcelController.verifyParcelGps);
router.get('/gis/geojson', parcelController.getGeoJson);

// ================= COMPENSATION ROUTES =================
router.get('/compensation/project/:projectId', compensationController.getProjectCompensation);
router.post('/compensation/disburse', requireAuth, requireRole(['SYS_ADMIN', 'DISTRICT_AUTHORITY']), compensationController.disbursePayment);

// ================= R&R & FAMILIES ROUTES =================
router.get('/rr/project/:projectId', rrController.getProjectRr);
router.put('/rr/project/:projectId', requireAuth, requireRole(['SYS_ADMIN', 'DISTRICT_AUTHORITY', 'STATE_GOVT']), rrController.updateRrProgress);
router.get('/families/project/:projectId', rrController.getFamilies);

// ================= POSSESSION ROUTES =================
router.get('/possession/project/:projectId', possessionController.getProjectPossession);
router.post('/possession/record', requireAuth, requireRole(['SYS_ADMIN', 'DISTRICT_AUTHORITY', 'FIELD_OFFICER']), possessionController.recordPossession);

// ================= DOCUMENT ROUTES =================
router.get('/documents/project/:projectId', documentController.getProjectDocuments);
router.post('/documents/upload', requireAuth, requireRole(['SYS_ADMIN', 'PIA', 'DISTRICT_AUTHORITY', 'STATE_GOVT', 'FIELD_OFFICER']), upload.single('file'), documentController.uploadDocument);
router.put('/documents/:id/verify', requireAuth, requireRole(['SYS_ADMIN', 'DISTRICT_AUTHORITY', 'STATE_GOVT']), documentController.verifyDocument);

// ================= NOTIFICATION ROUTES =================
router.get('/notifications', notificationController.getNotifications);
router.put('/notifications/:id/read', requireAuth, notificationController.markAsRead);
router.put('/notifications/read-all', requireAuth, notificationController.markAllAsRead);

// ================= ANALYTICS & RISK ROUTES =================
router.get('/analytics/national', analyticsController.getNationalKpis);
router.get('/analytics/project/:projectId/risk', analyticsController.getProjectRisk);

// ================= MIS REPORTS =================
router.get('/reports/mis', reportController.getMisReports);

// ================= AUDIT TRAIL ROUTES (STRICT NON-PUBLIC) =================
router.get('/audit', requireAuth, requireRole(['SYS_ADMIN', 'CENTRAL_MINISTRY', 'STATE_GOVT', 'DISTRICT_AUTHORITY']), auditController.getAuditLogs);

// ================= INTEGRATION ADAPTER ROUTES =================
router.get('/integrations/land-records', integrationController.getLandRecordsAdapter);
router.get('/integrations/cadastral', integrationController.getCadastralAdapter);
router.get('/integrations/project-data', integrationController.getProjectDataAdapter);

// ================= USER MANAGEMENT ROUTES (ADMIN ONLY) =================
router.get('/users', requireAuth, requireRole(['SYS_ADMIN']), async (req, res) => {
  const users = await query(`
    SELECT u.id, u.email, u.full_name, u.role_code, u.phone, u.department_agency,
           u.is_active, s.name as state_name, d.name as district_name, u.created_at
    FROM users u
    LEFT JOIN states s ON u.state_id = s.id
    LEFT JOIN districts d ON u.district_id = d.id
    ORDER BY u.id ASC
  `);
  res.json({ success: true, count: users.rows.length, data: users.rows });
});

module.exports = router;
