/**
 * Slack Integration
 * Send notifications for important financial events, alerts, and milestones
 */

import { createClient } from '@base44/sdk';

const base44 = createClient({ serviceRole: true });

export async function POST(request) {
  try {
    const { channel, message, attachments } = await request.json();

    // Get Slack access token
    const token = await base44.asServiceRole.connectors.getAccessToken('slack');

    if (!token) {
      return new Response(JSON.stringify({ 
        error: 'Slack not connected. Please authorize in app settings.' 
      }), { status: 401 });
    }

    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        channel: channel || '#general',
        text: message,
        attachments: attachments || []
      })
    });

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Slack notification error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Send automated alerts for financial events
 */
export async function sendFinancialAlert(type, data) {
  const token = await base44.asServiceRole.connectors.getAccessToken('slack');
  if (!token) return;

  let message;
  let color;

  switch (type) {
    case 'payment_due':
      message = `💳 Payment Due: $${data.amount} due on ${data.dueDate}`;
      color = 'warning';
      break;
    case 'high_churn_risk':
      message = `⚠️ High Churn Risk: ${data.atRiskCount} customers at risk`;
      color = 'danger';
      break;
    case 'revenue_milestone':
      message = `🎉 Revenue Milestone: Reached $${data.amount}!`;
      color = 'good';
      break;
    case 'subscription_cancelled':
      message = `📉 Subscription Cancelled: ${data.customerEmail}`;
      color = 'danger';
      break;
  }

  await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      channel: '#alerts',
      attachments: [{
        color,
        text: message,
        footer: 'Base44 Financial Hub',
        ts: Math.floor(Date.now() / 1000)
      }]
    })
  });
}