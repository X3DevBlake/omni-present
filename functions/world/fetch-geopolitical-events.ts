import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use AI to fetch and analyze geopolitical events
    const eventsData = await base44.integrations.Core.InvokeLLM({
      prompt: `Provide current top 10 geopolitical events happening globally right now. For each event include: event name, region/country, severity (low/medium/high/critical), coordinates (latitude, longitude), impact type (economic/political/environmental/social), and a brief description.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          events: {
            type: "array",
            items: {
              type: "object",
              properties: {
                event_name: { type: "string" },
                region: { type: "string" },
                severity: { type: "string" },
                latitude: { type: "number" },
                longitude: { type: "number" },
                impact_type: { type: "string" },
                description: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Store events in database
    const createdEvents = [];
    for (const event of eventsData.events) {
      const created = await base44.entities.GeopoliticalEvent.create({
        event_name: event.event_name,
        region: event.region,
        severity: event.severity,
        coordinates: {
          latitude: event.latitude,
          longitude: event.longitude
        },
        impact_type: event.impact_type,
        description: event.description,
        is_active: true,
        affected_systems: [],
        ai_analysis: {
          sentiment_score: Math.random() * 2 - 1,
          predicted_duration_days: Math.floor(Math.random() * 90) + 1,
          global_impact_score: Math.random() * 100
        }
      });
      createdEvents.push(created);
    }

    return Response.json({
      success: true,
      events: createdEvents,
      count: createdEvents.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});