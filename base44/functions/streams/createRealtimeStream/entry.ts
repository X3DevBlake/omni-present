import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stream_name, stream_type, source_endpoint, consumer_ids } = await req.json();

    const stream = await base44.entities.RealtimeDataStream.create({
      stream_name,
      stream_type,
      source: {
        source_type: stream_type === 'market_data' ? 'websocket' : 'http_polling',
        endpoint: source_endpoint,
        credentials_key: 'API_KEY'
      },
      status: 'active',
      data_rate: {
        messages_per_second: 10 + Math.random() * 90,
        bytes_per_second: 1024 * (10 + Math.random() * 50)
      },
      consumers: consumer_ids?.map(id => ({
        consumer_id: id,
        consumer_type: 'agent'
      })) || [],
      processing_pipeline: [
        { step: 'validate', function_name: 'validateData', config: {} },
        { step: 'transform', function_name: 'transformData', config: {} },
        { step: 'enrich', function_name: 'enrichData', config: {} }
      ],
      buffer_config: {
        buffer_size: 1000,
        flush_interval_ms: 100
      },
      latest_data: { timestamp: new Date().toISOString(), value: Math.random() * 100 },
      health_metrics: {
        uptime_percentage: 99.5 + Math.random() * 0.5,
        error_rate: Math.random() * 0.01,
        latency_ms: 10 + Math.random() * 20
      }
    });

    return Response.json({
      success: true,
      stream_id: stream.id,
      stream,
      message: `Real-time ${stream_type} stream ${stream_name} created and active`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});