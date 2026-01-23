import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === 'generate_key') {
      const { permissions, rate_limits } = await req.json();

      // Generate secure API key
      const apiKey = `omega_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const apiKeyHash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(apiKey)
      );
      const hashHex = Array.from(new Uint8Array(apiKeyHash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const apiKeyRecord = await base44.entities.DeveloperAPIKey.create({
        developer_id: user.id,
        api_key_hash: hashHex,
        permissions: permissions || ['read_agents', 'marketplace_access'],
        rate_limits: rate_limits || {
          requests_per_minute: 60,
          requests_per_day: 10000,
          concurrent_requests: 10
        },
        usage_statistics: {
          total_requests: 0,
          successful_requests: 0,
          failed_requests: 0,
          last_used_at: null
        },
        allowed_endpoints: [
          '/api/agents/list',
          '/api/agents/create',
          '/api/marketplace/listings',
          '/api/augmentations/list'
        ],
        webhook_url: null,
        is_active: true,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      });

      return Response.json({
        success: true,
        api_key: apiKey, // Only shown once
        api_key_id: apiKeyRecord.api_key_id,
        permissions: apiKeyRecord.permissions,
        message: 'API key generated. Save it securely - it will not be shown again.'
      });
    }

    if (action === 'validate_key') {
      const { api_key } = await req.json();

      const apiKeyHash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(api_key)
      );
      const hashHex = Array.from(new Uint8Array(apiKeyHash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const keys = await base44.asServiceRole.entities.DeveloperAPIKey.filter({ 
        api_key_hash: hashHex,
        is_active: true
      });

      if (keys.length === 0) {
        return Response.json({ valid: false, error: 'Invalid API key' }, { status: 401 });
      }

      const keyRecord = keys[0];

      // Update usage stats
      await base44.asServiceRole.entities.DeveloperAPIKey.update(keyRecord.id, {
        usage_statistics: {
          ...keyRecord.usage_statistics,
          total_requests: (keyRecord.usage_statistics?.total_requests || 0) + 1,
          last_used_at: new Date().toISOString()
        }
      });

      return Response.json({
        valid: true,
        permissions: keyRecord.permissions,
        rate_limits: keyRecord.rate_limits
      });
    }

    if (action === 'get_my_keys') {
      const keys = await base44.entities.DeveloperAPIKey.filter({ 
        developer_id: user.id 
      });

      return Response.json({
        success: true,
        api_keys: keys.map(k => ({
          ...k,
          api_key_hash: undefined // Don't expose hash
        }))
      });
    }

    if (action === 'revoke_key') {
      const { api_key_id } = await req.json();

      const keys = await base44.entities.DeveloperAPIKey.filter({ 
        api_key_id,
        developer_id: user.id 
      });

      if (keys.length === 0) {
        return Response.json({ error: 'API key not found' }, { status: 404 });
      }

      await base44.entities.DeveloperAPIKey.update(keys[0].id, {
        is_active: false
      });

      return Response.json({
        success: true,
        message: 'API key revoked'
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});