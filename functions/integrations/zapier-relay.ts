export default async function zapierRelay(request, context) {
  const HOOK = (context.secrets.ZAPIER_WEBHOOK_URL || '').trim();
  const ORIGINS = (context.secrets.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  if (request.method === 'OPTIONS') {
    return { statusCode: 204, body: {} };
  }
  
  if (request.method !== 'POST') {
    return { statusCode: 405, body: { ok: false, error: 'POST only' } };
  }

  if (!HOOK.startsWith('https://hooks.zapier.com/')) {
    return { statusCode: 500, body: { ok: false, error: 'Missing ZAPIER_WEBHOOK_URL' } };
  }

  try {
    const payload = request.body || {};

    // Validate required fields
    const event = String(payload.event || 'agent_action');
    const agent_id = String(payload.agent_id || '');
    const user_email = String(payload.user_email || context.user?.email || '');

    if (!user_email) {
      return { statusCode: 400, body: { ok: false, error: 'user_email required' } };
    }

    // Generate idempotency key
    const action_id = String(payload.action_id || `${user_email}|${event}|${Date.now()}`);

    // Clean, consistent payload for Zapier
    const zapierPayload = {
      event,
      action_id,
      agent_id,
      agent_name: String(payload.agent_name || 'Unknown Agent'),
      user_email,
      timestamp: new Date().toISOString(),
      data: payload.data || {},
      metadata: {
        app_env: 'production',
        source: 'base44_ai_lab'
      }
    };

    // Server-side POST to Zapier
    const response = await fetch(HOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Base44-AI-Agent-Zapier/1.0'
      },
      body: JSON.stringify(zapierPayload)
    });

    const responseText = await response.text();

    return {
      statusCode: response.ok ? 200 : 502,
      body: {
        ok: response.ok,
        upstream_status: response.status,
        upstream_body: responseText.slice(0, 200)
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: { ok: false, error: error.message }
    };
  }
}