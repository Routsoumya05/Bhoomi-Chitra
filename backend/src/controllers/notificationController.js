const { query } = require('../config/db');

async function getNotifications(req, res) {
  try {
    const user = req.user;
    const isPublic = !user || user.roleCode === 'PUBLIC_USER';

    let sql = `
      SELECT * FROM notifications
      WHERE (user_id = $1 OR role_target = $2 OR role_target = 'ALL' ${isPublic ? "OR role_target = 'PUBLIC'" : ''})
      ORDER BY id DESC LIMIT 50
    `;
    const params = [user ? user.userId : null, user ? user.roleCode : 'PUBLIC'];

    const result = await query(sql, params);
    const unreadCount = result.rows.filter(n => !n.is_read).length;

    return res.json({
      success: true,
      unreadCount,
      data: result.rows
    });
  } catch (err) {
    console.error('getNotifications error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve notifications.' });
  }
}

async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    await query('UPDATE notifications SET is_read = true WHERE id = $1', [id]);
    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    console.error('markAsRead error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update notification.' });
  }
}

async function markAllAsRead(req, res) {
  try {
    const user = req.user;
    await query(
      `UPDATE notifications SET is_read = true 
       WHERE (user_id = $1 OR role_target = $2 OR role_target = 'ALL')`,
      [user ? user.userId : null, user ? user.roleCode : 'PUBLIC']
    );
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('markAllAsRead error:', err);
    return res.status(500).json({ success: false, error: 'Failed to clear notifications.' });
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
