const { query } = require('../config/db');

async function recordAuditLog({
  userId = null,
  userName = 'System',
  role = 'SYSTEM',
  action,
  entity,
  entityId = null,
  previousValue = null,
  newValue = null,
  req = null
}) {
  try {
    const ip = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1') : '127.0.0.1';
    const sessionRef = req && req.headers['x-session-id'] ? req.headers['x-session-id'] : 'API-SESSION';

    await query(
      `INSERT INTO audit_logs (
        user_id, user_name, role, action, entity, entity_id,
        previous_value_json, new_value_json, ip_address, session_ref
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        userId,
        userName,
        role,
        action,
        entity,
        String(entityId || ''),
        previousValue ? JSON.stringify(previousValue) : null,
        newValue ? JSON.stringify(newValue) : null,
        ip,
        sessionRef
      ]
    );
  } catch (err) {
    console.error('Failed to write audit log entry:', err.message);
  }
}

module.exports = {
  recordAuditLog
};
