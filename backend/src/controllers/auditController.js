const { query } = require('../config/db');

async function getAuditLogs(req, res) {
  try {
    // Check if public user (strict 403)
    if (!req.user || req.user.roleCode === 'PUBLIC_USER') {
      return res.status(403).json({
        success: false,
        error: '403 Forbidden: Public users are strictly prohibited from viewing system audit trails.'
      });
    }

    const { entity, action, userId, limit = 100 } = req.query;

    let sql = `
      SELECT id, user_id, user_name, role, action, entity, entity_id,
             previous_value_json, new_value_json, ip_address, session_ref, created_at
      FROM audit_logs
      WHERE 1=1
    `;
    const params = [];

    if (entity) {
      params.push(entity);
      sql += ` AND entity = $${params.length}`;
    }
    if (action) {
      params.push(action);
      sql += ` AND action = $${params.length}`;
    }
    if (userId) {
      params.push(userId);
      sql += ` AND user_id = $${params.length}`;
    }

    sql += ` ORDER BY id DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit, 10) || 100);

    const result = await query(sql, params);
    return res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error('getAuditLogs error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve audit log trail.' });
  }
}

module.exports = {
  getAuditLogs
};
