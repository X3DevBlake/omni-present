import { base44 } from '@/api/base44Client';

export async function routeNotification(alert, userEmail, preferences) {
  try {
    // Analyze alert with Gemini to determine routing priority
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this alert and determine routing:
      
Alert Type: ${alert.type}
Content: ${alert.content}
Severity: ${alert.severity}

Based on user preferences, determine:
1. Which channels to use (slack, twilio_sms, twilio_voice, email)
2. Priority level
3. Message format for each channel
4. Whether voice-over is needed`,
      response_json_schema: {
        type: 'object',
        properties: {
          channels: { type: 'array', items: { type: 'string' } },
          priority: { type: 'string' },
          formats: { type: 'object' },
          needsVoice: { type: 'boolean' },
        },
      },
    });

    // Check user preferences for this alert type
    const prefs = preferences[alert.type] || {};
    const routes = analysis.channels.filter(ch => prefs[ch] !== false);

    if (routes.length === 0) return { delivered: false, reason: 'All channels disabled' };

    // Deliver to each route
    const deliveries = await Promise.all(
      routes.map(route => deliverViaChannel(route, alert, userEmail, analysis))
    );

    return {
      delivered: true,
      routes: deliveries,
      analysis,
    };
  } catch (error) {
    console.error('Routing error:', error);
    throw error;
  }
}

async function deliverViaChannel(channel, alert, userEmail, analysis) {
  try {
    if (channel === 'slack') {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `Send Slack message:
        
Alert: ${alert.content}
Format: ${analysis.formats.slack || 'standard'}
User: ${userEmail}`,
      });
    } else if (channel === 'twilio_sms') {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `Send SMS via Twilio:
        
Alert: ${alert.content}
Format: ${analysis.formats.twilio_sms || 'brief'}
Severity: ${alert.severity}
User: ${userEmail}`,
      });
    } else if (channel === 'twilio_voice') {
      const voiceScript = await base44.integrations.Core.InvokeLLM({
        prompt: `Create voice alert script:
        
Alert: ${alert.content}
Severity: ${alert.severity}`,
      });

      return await base44.integrations.Core.InvokeLLM({
        prompt: `Initiate voice call via Twilio:
        
Script: ${voiceScript}
User: ${userEmail}`,
      });
    } else if (channel === 'email') {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `Send email notification:
        
Alert: ${alert.content}
Subject: ${analysis.formats.email?.subject || 'Important Alert'}
User: ${userEmail}`,
      });
    }
  } catch (error) {
    console.error(`Error delivering via ${channel}:`, error);
    return { channel, status: 'error' };
  }
}

export async function smartGroupNotifications(alerts, userEmail, preferences) {
  try {
    // Group similar alerts
    const grouped = await base44.integrations.Core.InvokeLLM({
      prompt: `Group these alerts intelligently:
      
Alerts: ${JSON.stringify(alerts.map(a => ({ type: a.type, severity: a.severity })))}

Create digest with:
1. Critical items separate
2. Similar items grouped
3. Summary for each group`,
      response_json_schema: {
        type: 'object',
        properties: {
          critical: { type: 'array', items: { type: 'object' } },
          groups: { type: 'array', items: { type: 'object' } },
        },
      },
    });

    // Route grouped notifications
    const routes = [];

    // Send critical items immediately via voice/SMS
    for (const critical of grouped.critical) {
      routes.push(
        routeNotification(critical, userEmail, { ...preferences, twilio_voice: true })
      );
    }

    // Send grouped digest via email/Slack
    for (const group of grouped.groups) {
      routes.push(
        routeNotification(group, userEmail, { ...preferences, email: true, slack: true })
      );
    }

    return await Promise.all(routes);
  } catch (error) {
    console.error('Grouping error:', error);
    throw error;
  }
}