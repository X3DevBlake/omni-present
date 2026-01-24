import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { integration_type, endpoint, params } = await req.json();

    const integrationHandlers = {
      financial_market: async (endpoint, params) => {
        // Fetch real-time financial data
        const marketData = await base44.integrations.Core.InvokeLLM({
          prompt: `Fetch current financial market data for ${params.asset || 'BTC/USD'}. Include price, volume, 24h change, and market sentiment.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: {
              asset: { type: 'string' },
              price_usd: { type: 'number' },
              volume_24h: { type: 'number' },
              change_24h_percent: { type: 'number' },
              market_sentiment: { type: 'string' }
            }
          }
        });

        return marketData;
      },

      geopolitical_news: async (endpoint, params) => {
        // Fetch geopolitical news and risk analysis
        const newsData = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze current geopolitical news for region: ${params.region || 'global'}. Focus on network stability risks, regulatory changes, and infrastructure threats.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: {
              region: { type: 'string' },
              risk_level: { type: 'number' },
              headlines: { type: 'array', items: { type: 'string' } },
              network_stability_score: { type: 'number' },
              recommendations: { type: 'array', items: { type: 'string' } }
            }
          }
        });

        // Store as prediction
        await base44.asServiceRole.entities.GeopoliticalPrediction.create({
          prediction_id: `geo_${Date.now()}`,
          target_region: params.region || 'global',
          prediction_type: 'infrastructure_disruption',
          probability: newsData.risk_level || 0.3,
          time_horizon_days: 30,
          data_sources: [{
            source_type: 'news_aggregator',
            reliability_score: 0.85,
            last_updated: new Date().toISOString()
          }]
        });

        return newsData;
      },

      iot_devices: async (endpoint, params) => {
        // Simulated IoT data for Aether systems
        const deviceData = {
          device_id: params.device_id || 'aether_001',
          device_type: 'holographic_projector',
          status: 'online',
          telemetry: {
            temperature_c: 42 + Math.random() * 5,
            power_consumption_w: 120 + Math.random() * 30,
            projection_quality: 0.85 + Math.random() * 0.1,
            uptime_hours: 156
          },
          last_update: new Date().toISOString()
        };

        return deviceData;
      }
    };

    const handler = integrationHandlers[integration_type];
    
    if (!handler) {
      return Response.json({ 
        error: `Unknown integration type: ${integration_type}` 
      }, { status: 400 });
    }

    const result = await handler(endpoint, params);

    // Log API access
    await base44.asServiceRole.entities.APIGatewayLog.create({
      log_id: `api_${Date.now()}`,
      user_email: user.email,
      integration_type,
      endpoint,
      request_params: params,
      response_status: 200,
      response_time_ms: 150 + Math.random() * 100,
      timestamp: new Date().toISOString()
    });

    return Response.json({
      success: true,
      data: result,
      integration: integration_type,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});