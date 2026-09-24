import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Extract API key from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: 'Missing or invalid API key' }, { status: 401 });
    }

    const apiKey = authHeader.replace('Bearer ', '');

    // Validate API key
    const apiKeyHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(apiKey)
    );
    const hashHex = Array.from(new Uint8Array(apiKeyHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const keys = await base44.asServiceRole.entities.DeveloperAPIKey.filter({ 
      api_key_hash: hashHex,
      is_active: true
    });

    if (keys.length === 0) {
      return Response.json({ error: 'Invalid or inactive API key' }, { status: 401 });
    }

    const keyRecord = keys[0];

    // Check rate limits
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    const recentLogs = await base44.asServiceRole.entities.APIGatewayLog.filter({
      api_key_id: keyRecord.api_key_id
    }).limit(100);

    const requestsLastMinute = recentLogs.filter(log => 
      new Date(log.timestamp).getTime() > oneMinuteAgo
    ).length;

    if (requestsLastMinute >= keyRecord.rate_limits.requests_per_minute) {
      return Response.json({ 
        error: 'Rate limit exceeded',
        retry_after: 60 
      }, { status: 429 });
    }

    // Parse request
    const { endpoint, method, payload } = await req.json();

    // Check permissions
    const requiredPermission = endpoint.includes('agents') ? 'read_agents' :
                               endpoint.includes('augmentations') ? 'read_augmentations' :
                               endpoint.includes('marketplace') ? 'marketplace_access' : null;

    if (requiredPermission && !keyRecord.permissions.includes(requiredPermission)) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Route to appropriate handler
    let response;
    const startTime = Date.now();

    try {
      if (endpoint === '/api/agents/list') {
        const agents = await base44.asServiceRole.entities.Agent.list('-created_date', payload?.limit || 50);
        response = { success: true, data: agents };
      } else if (endpoint === '/api/agents/create') {
        const agent = await base44.asServiceRole.entities.Agent.create(payload);
        response = { success: true, data: agent };
      } else if (endpoint === '/api/marketplace/listings') {
        const listings = await base44.asServiceRole.entities.OmegaMarketplaceListing.filter({ 
          listing_status: 'active' 
        });
        response = { success: true, data: listings };
      } else if (endpoint === '/api/augmentations/list') {
        const augmentations = await base44.asServiceRole.entities.PhysicalBodyAugmentation.list('-created_date', 50);
        response = { success: true, data: augmentations };
      } else {
        return Response.json({ error: 'Endpoint not found' }, { status: 404 });
      }

      const responseTime = Date.now() - startTime;

      // Log request
      await base44.asServiceRole.entities.APIGatewayLog.create({
        api_key_id: keyRecord.api_key_id,
        developer_id: keyRecord.developer_id,
        endpoint: endpoint,
        method: method || 'POST',
        request_payload: payload,
        response_status: 200,
        response_time_ms: responseTime,
        rate_limit_remaining: keyRecord.rate_limits.requests_per_minute - requestsLastMinute - 1,
        authentication_method: 'api_key',
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
        error_details: null,
        timestamp: new Date().toISOString()
      });

      // Update key usage
      await base44.asServiceRole.entities.DeveloperAPIKey.update(keyRecord.id, {
        usage_statistics: {
          total_requests: (keyRecord.usage_statistics?.total_requests || 0) + 1,
          successful_requests: (keyRecord.usage_statistics?.successful_requests || 0) + 1,
          failed_requests: keyRecord.usage_statistics?.failed_requests || 0,
          last_used_at: new Date().toISOString()
        }
      });

      return Response.json(response, {
        headers: {
          'X-RateLimit-Remaining': String(keyRecord.rate_limits.requests_per_minute - requestsLastMinute - 1),
          'X-RateLimit-Limit': String(keyRecord.rate_limits.requests_per_minute)
        }
      });

    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Log failed request
      await base44.asServiceRole.entities.APIGatewayLog.create({
        api_key_id: keyRecord.api_key_id,
        developer_id: keyRecord.developer_id,
        endpoint: endpoint,
        method: method || 'POST',
        response_status: 500,
        response_time_ms: responseTime,
        error_details: error.message,
        timestamp: new Date().toISOString()
      });

      return Response.json({ error: error.message }, { status: 500 });
    }

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});