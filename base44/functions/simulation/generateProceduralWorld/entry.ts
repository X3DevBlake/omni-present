import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { config } = await req.json();
    
    // Generate unique seed if not provided
    const seed = config.seed || Math.random().toString(36).substring(7);
    
    // AI-powered environment generation
    const environmentDetails = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a detailed ${config.environment_type} simulation environment with the following parameters:
      - Terrain: ${config.terrain_config?.type || 'procedural'}
      - Size: ${config.terrain_config?.size || 100} units
      - Max agents: ${config.max_agents || 100}
      
      Create realistic resource distribution, event rules, and environmental challenges that make sense for this type of simulation.`,
      response_json_schema: {
        type: "object",
        properties: {
          terrain_details: {
            type: "object",
            properties: {
              elevation_map: { type: "array", items: { type: "number" } },
              biomes: { type: "array", items: { type: "string" } },
              spawn_points: { type: "array", items: { type: "object" } }
            }
          },
          resource_nodes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                position: { type: "array", items: { type: "number" } },
                quantity: { type: "number" },
                regeneration_rate: { type: "number" }
              }
            }
          },
          event_schedule: {
            type: "array",
            items: {
              type: "object",
              properties: {
                event_type: { type: "string" },
                trigger_time: { type: "number" },
                parameters: { type: "object" }
              }
            }
          },
          challenges: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });
    
    // Create simulation environment config
    const environment = await base44.entities.SimulationEnvironmentConfig.create({
      environment_name: config.environment_name || `Sim_${seed}`,
      environment_type: config.environment_type,
      physics_enabled: config.physics_enabled !== false,
      gravity: config.gravity || -9.8,
      terrain_config: {
        type: config.terrain_config?.type || 'procedural',
        size: config.terrain_config?.size || 100,
        seed: seed,
        ...environmentDetails.terrain_details
      },
      weather_system: {
        enabled: true,
        current_weather: 'clear'
      },
      resource_distribution: {
        nodes: environmentDetails.resource_nodes,
        total_resources: environmentDetails.resource_nodes.length
      },
      max_agents: config.max_agents || 100,
      time_scale: 1.0,
      event_rules: environmentDetails.event_schedule.map(e => ({
        event_type: e.event_type,
        trigger_condition: `time >= ${e.trigger_time}`,
        frequency: 1
      })),
      is_active: false
    });
    
    // Create procedural environment record
    await base44.entities.ProceduralEnvironment.create({
      environment_name: environment.environment_name,
      generation_seed: seed,
      complexity_level: Math.min(environmentDetails.challenges.length, 10),
      terrain_config: environment.terrain_config,
      dynamic_elements: environmentDetails.resource_nodes,
      resource_distribution: environment.resource_distribution,
      ai_generated_rules: environmentDetails.event_schedule,
      visualization_ready: true,
      agent_capacity: environment.max_agents
    });
    
    return Response.json({
      environment,
      seed,
      procedural_details: environmentDetails,
      ready_for_simulation: true
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});