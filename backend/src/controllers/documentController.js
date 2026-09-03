const { query } = require('../config/db');
const { recordAuditLog } = require('../middleware/audit');
const { createNotification } = require('../services/notificationService');

async function getProjectDocuments(req, res) {
  try {
    const { projectId } = req.params;
    const { category } = req.query;

    let sql = `
      SELECT d.*, u.full_name as uploaded_by_name,
             (SELECT json_agg(json_build_object(
               'version', dv.version_number,
               'filePath', dv.file_path,
               'summary', dv.change_summary,
               'createdAt', dv.created_at
             ) ORDER BY dv.version_number DESC)
              FROM document_versions dv WHERE dv.document_id = d.id) as versions
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by_id = u.id
      WHERE d.project_id = $1
    `;
    const params = [projectId];

    if (category) {
      params.push(category);
      sql += ` AND d.category = $${params.length}`;
    }

    sql += ' ORDER BY d.id DESC';

    const result = await query(sql, params);
    return res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error('getProjectDocuments error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve documents.' });
  }
}

async function uploadDocument(req, res) {
  try {
    const { projectId, parcelId, category, title, changeSummary } = req.body;
    const user = req.user;

    if (!projectId || !category || !title) {
      return res.status(400).json({ success: false, error: 'projectId, category, and title are required.' });
    }

    const fileName = req.file ? req.file.originalname : `Doc_${Date.now()}.pdf`;
    const filePath = req.file ? `/uploads/${req.file.filename}` : `/uploads/${fileName}`;
    const fileSize = req.file ? req.file.size : 1024000;
    const fileType = req.file ? req.file.mimetype : 'application/pdf';

    // Check if document with same title & category already exists for version increment
    const existingRes = await query(
      `SELECT * FROM documents WHERE project_id = $1 AND title = $2 LIMIT 1`,
      [projectId, title]
    );

    let doc;
    if (existingRes.rows.length > 0) {
      const existing = existingRes.rows[0];
      const newVersion = existing.version + 1;

      const upd = await query(
        `UPDATE documents SET
          file_name = $1,
          file_path = $2,
          file_size = $3,
          version = $4,
          uploaded_by_id = $5,
          status = 'UPLOADED'
         WHERE id = $6
         RETURNING *`,
        [fileName, filePath, fileSize, newVersion, user.userId, existing.id]
      );
      doc = upd.rows[0];

      await query(
        `INSERT INTO document_versions (document_id, version_number, file_path, change_summary, uploaded_by_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [existing.id, newVersion, filePath, changeSummary || `Version ${newVersion} uploaded`, user.userId]
      );
    } else {
      const ins = await query(
        `INSERT INTO documents (
          project_id, parcel_id, category, title, file_name, file_path,
          file_size, file_type, version, uploaded_by_id, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1, $9, 'UPLOADED')
        RETURNING *`,
        [projectId, parcelId || null, category, title, fileName, filePath, fileSize, fileType, user.userId]
      );
      doc = ins.rows[0];

      await query(
        `INSERT INTO document_versions (document_id, version_number, file_path, change_summary, uploaded_by_id)
         VALUES ($1, 1, $2, 'Initial document upload', $3)`,
        [doc.id, filePath, user.userId]
      );
    }

    // Audit log
    await recordAuditLog({
      userId: user.userId,
      userName: user.fullName,
      role: user.roleCode,
      action: 'UPLOAD_DOCUMENT',
      entity: 'Document',
      entityId: String(doc.id),
      newValue: { title, category, version: doc.version, fileName },
      req
    });

    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error('uploadDocument error:', err);
    return res.status(500).json({ success: false, error: 'Failed to upload document.' });
  }
}

async function verifyDocument(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'VERIFIED' or 'REJECTED'

    const upd = await query(
      `UPDATE documents SET status = $1 WHERE id = $2 RETURNING *`,
      [status || 'VERIFIED', id]
    );

    if (upd.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Document not found.' });
    }

    const doc = upd.rows[0];

    await recordAuditLog({
      userId: req.user.userId,
      userName: req.user.fullName,
      role: req.user.roleCode,
      action: 'VERIFY_DOCUMENT',
      entity: 'Document',
      entityId: String(id),
      newValue: { status: doc.status },
      req
    });

    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error('verifyDocument error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update document status.' });
  }
}

module.exports = {
  getProjectDocuments,
  uploadDocument,
  verifyDocument
};
