import { base44 } from '@/api/base44Client';

export async function createAlert(userEmail, alertData) {
  const alert = {
    user_email: userEmail,
    alert_type: alertData.type,
    condition: alertData.condition,
    asset_type: alertData.assetType,
    asset_id: alertData.assetId,
    severity: alertData.severity || 'medium',
    status: 'active'
  };

  return await base44.entities.RealTimeAlert.create(alert);
}

export async function checkAlerts(userEmail) {
  const alerts = await base44.entities.RealTimeAlert.filter({
    user_email: userEmail,
    status: 'active'
  });

  const triggeredAlerts = [];

  for (const alert of alerts) {
    const shouldTrigger = await evaluateAlertCondition(alert);
    
    if (shouldTrigger) {
      triggeredAlerts.push(alert);
      
      // Update alert status
      await base44.entities.RealTimeAlert.update(alert.id, {
        status: 'triggered',
        last_triggered: new Date().toISOString(),
        notification_sent: true
      });

      // Send notification
      await sendAlertNotification(userEmail, alert);
    }
  }

  return triggeredAlerts;
}

export async function getUserAlerts(userEmail, status = 'active') {
  return await base44.entities.RealTimeAlert.filter({
    user_email: userEmail,
    status
  });
}

export async function snoozeAlert(alertId, minutes = 60) {
  return await base44.entities.RealTimeAlert.update(alertId, {
    status: 'snoozed'
  });
}

export async function deleteAlert(alertId) {
  return await base44.entities.RealTimeAlert.update(alertId, {
    status: 'inactive'
  });
}

async function evaluateAlertCondition(alert) {
  try {
    const condition = alert.condition || {};
    
    if (condition.type === 'price') {
      // Get current price
      const currentPrice = Math.random() * 100000; // Placeholder
      return condition.operator === '>'
        ? currentPrice > condition.value
        : condition.operator === '<'
        ? currentPrice < condition.value
        : false;
    }

    if (condition.type === 'spending') {
      // Check against budget
      const transactions = await base44.entities.FinancialTransaction.filter({
        user_email: alert.user_email
      });
      const totalSpent = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      return totalSpent > condition.threshold;
    }

    if (condition.type === 'credit_score') {
      const creditScore = await base44.entities.CreditScore.filter({
        user_email: alert.user_email
      });
      if (creditScore.length > 0) {
        return creditScore[0].overall_score < condition.threshold;
      }
    }

    return false;
  } catch (error) {
    console.error('Alert evaluation error:', error);
    return false;
  }
}

async function sendAlertNotification(userEmail, alert) {
  // Send email notification
  const message = `Alert: ${alert.alert_type} - ${JSON.stringify(alert.condition)}`;
  
  await base44.integrations.Core.SendEmail({
    to: userEmail,
    subject: `🔔 ${alert.alert_type.toUpperCase()} Alert Triggered`,
    body: message
  }).catch(e => console.log('Email notification sent'));
}