import { base44 } from '@base44/sdk';

/**
 * Notification Dispatcher
 * Sends notifications through various channels based on user preferences
 */
export default async function notificationDispatcher(event) {
  const { userEmail, notificationType, message, data } = event;

  try {
    // Get user notification preferences
    const preferences = await base44.asServiceRole.entities.NotificationPreference.filter({
      user_email: userEmail,
      notification_type: notificationType,
      enabled: true
    });

    if (!preferences || preferences.length === 0) {
      return { success: true, message: 'No active notification preferences' };
    }

    const results = [];

    for (const pref of preferences) {
      // Email notification
      if (pref.channels?.email) {
        try {
          await base44.integrations.Core.SendEmail({
            to: userEmail,
            subject: `Notification: ${notificationType}`,
            body: message
          });
          results.push({ channel: 'email', success: true });
        } catch (error) {
          results.push({ channel: 'email', success: false, error: error.message });
        }
      }

      // In-app notification (store in database for UI to fetch)
      if (pref.channels?.in_app) {
        try {
          await base44.asServiceRole.entities.ActivityLog.create({
            user_email: userEmail,
            action_type: 'system_event',
            entity_type: 'Notification',
            success: true,
            action_details: {
              notification_type: notificationType,
              message,
              data,
              timestamp: new Date().toISOString()
            }
          });
          results.push({ channel: 'in_app', success: true });
        } catch (error) {
          results.push({ channel: 'in_app', success: false, error: error.message });
        }
      }

      // Webhook notification
      if (pref.channels?.webhook && data?.webhook_url) {
        try {
          await fetch(data.webhook_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user: userEmail,
              type: notificationType,
              message,
              data,
              timestamp: new Date().toISOString()
            })
          });
          results.push({ channel: 'webhook', success: true });
        } catch (error) {
          results.push({ channel: 'webhook', success: false, error: error.message });
        }
      }
    }

    return {
      success: true,
      channels_notified: results.filter(r => r.success).length,
      results
    };

  } catch (error) {
    console.error('Notification dispatcher error:', error);
    return { success: false, error: error.message };
  }
}