import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      event_type,
      payload,
      routing_key,
      priority = "normal",
      target_services = []
    } = await req.json();

    // Create event bus message
    const event = await base44.asServiceRole.entities.EventBusMessage.create({
      event_id: `event_${Date.now()}_${Math.random()}`,
      event_type,
      origin_service: "user_action",
      payload_json: payload,
      routing_key: routing_key || event_type,
      priority,
      target_services,
      correlation_id: `corr_${Date.now()}`,
      processed_by: [],
      retry_count: 0,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      timestamp: new Date().toISOString()
    });

    // Route to target services
    const processingResults = [];
    
    for (const service of target_services) {
      try {
        let result = null;
        
        switch (service) {
          case "spatial_analyzer":
            result = await base44.functions.invoke('semanticSceneGraphBuilder', payload);
            break;
          case "proactive_assistant":
            result = await base44.functions.invoke('proactiveInsightGenerator', payload);
            break;
          case "cognitive_evolution":
            result = await base44.functions.invoke('cognitiveEvolutionOrchestrator', payload);
            break;
          case "obstacle_predictor":
            result = await base44.functions.invoke('predictiveObstacleDetector', payload);
            break;
          default:
            result = { message: "Service not implemented yet" };
        }

        processingResults.push({
          service_name: service,
          processed_at: new Date().toISOString(),
          result: "success"
        });
      } catch (error) {
        processingResults.push({
          service_name: service,
          processed_at: new Date().toISOString(),
          result: `error: ${error.message}`
        });
      }
    }

    // Update event with processing results
    await base44.asServiceRole.entities.EventBusMessage.update(event.id, {
      processed_by: processingResults
    });

    return Response.json({
      success: true,
      event_id: event.id,
      processed_services: processingResults.length,
      results: processingResults
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});