const { query } = require('../config/db');

// Abstraction layers for multi-channel dispatch
const channelAdapters = {
  email: async (to, subject, body) => {
    // In production, would use nodemailer / AWS SES / NIC Gov Mail
    console.log(`[EMAIL DISPATCH] To: ${to} | Subject: ${subject}`);
    return { success: true, channel: 'EMAIL', messageId: `mail-${Date.now()}` };
  },
  sms: async (phone, message) => {
    // In production, would use C-DAC / CDAC SMS Gateway for Indian Gov
    console.log(`[SMS DISPATCH] To: ${phone} | Msg: ${message}`);
    return { success: true, channel: 'SMS', messageId: `sms-${Date.now()}` };
  },
  push: async (topic, payload) => {
    // In production, would use Firebase Cloud Messaging (FCM)
    console.log(`[PUSH DISPATCH] Topic: ${topic} | Title: ${payload.title}`);
    return { success: true, channel: 'PUSH', messageId: `push-${Date.now()}` };
  }
};

async function createNotification({
  userId = null,
  roleTarget = null,
  title,
  message,
  category = 'WORKFLOW',
  link = null,
  channels = ['in_app']
}) {
  try {
    // 1. In-App Notification (Stored in DB)
    const res = await query(
      `INSERT INTO notifications (user_id, role_target, title, message, category, link, is_read)
       VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING *`,
      [userId, roleTarget, title, message, category, link]
    );

    // 2. Multi-channel abstractions
    if (channels.includes('email')) {
      await channelAdapters.email(userId ? `user_${userId}@gov.in` : 'admin@bhoomichitra.demo', title, message);
    }
    if (channels.includes('sms')) {
      await channelAdapters.sms('+919876543210', `${title}: ${message.substring(0, 120)}...`);
    }
    if (channels.includes('push')) {
      await channelAdapters.push(roleTarget || 'ALL_ADMINS', { title, message, link });
    }

    return res.rows[0];
  } catch (err) {
    console.error('Failed to create notification:', err.message);
    return null;
  }
}

module.exports = {
  createNotification,
  channelAdapters
};
