import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { source_body, destination_body, priority } = await req.json();

    // Fetch all active interplanetary links
    const allLinks = await base44.entities.InterplanetaryLink.filter({ active: true });

    // Fetch planetary environmental data
    const planetProfiles = await base44.entities.PlanetaryEnvironmentalProfile.list();

    // AI calculates optimal route
    const routingPrompt = `Calculate optimal communication route in solar system:

Source: ${source_body}
Destination: ${destination_body}
Priority: ${priority || 'normal'}

Available Links:
${allLinks.slice(0, 15).map(link => `${link.source_body} -> ${link.destination_body}: ${link.link_type}, Latency: ${link.current_latency_ms}ms, Health: ${link.link_health}`).join('\n')}

Determine:
1. Best routing path (can use relay planets)
2. Expected total latency
3. Reliability score
4. Backup route`;

    const route = await base44.integrations.Core.InvokeLLM({
      prompt: routingPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          primary_path: {
            type: 'array',
            items: { type: 'string' }
          },
          backup_path: {
            type: 'array',
            items: { type: 'string' }
          },
          total_latency_ms: { type: 'number' },
          reliability_score: { type: 'number' },
          reasoning: { type: 'string' }
        }
      }
    });

    // Update link priorities based on routing decision
    for (const link of allLinks) {
      if (route.primary_path.includes(`${link.source_body}->${link.destination_body}`)) {
        await base44.entities.InterplanetaryLink.update(link.id, {
          ai_routing_priority: 1.0
        });
      }
    }

    return Response.json({
      success: true,
      route,
      source: source_body,
      destination: destination_body
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      details: 'Failed to calculate dynamic routing'
    }, { status: 500 });
  }
});