import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { complexity_level = 5, terrain_type = 'mixed', size_km = 10 } = await req.json();

    // Generate random seed
    const seed = Math.random().toString(36).substring(7);

    // AI-powered procedural generation
    const environmentSpec = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a procedural simulation environment specification.
      
      Parameters:
      - Complexity Level: ${complexity_level}/10
      - Terrain Type: ${terrain_type}
      - Size: ${size_km}km²
      - Seed: ${seed}
      
      Create detailed specification including:
      1. Environment name (creative)
      2. Terrain configuration (type, elevation_variance, density)
      3. Dynamic elements (5-10 elements with types, behavior rules, spawn rates)
      4. Resource distribution map
      5. AI-generated rules (3-5 unique environmental rules)
      6. Agent capacity
      
      Make it unique and interesting. Return as JSON.`,
      response_json_schema: {
        type: "object",
        properties: {
          environment_name: { type: "string" },
          terrain_config: {
            type: "object",
            properties: {
              type: { type: "string" },
              size_km: { type: "number" },
              elevation_variance: { type: "number" },
              density: { type: "number" }
            }
          },
          dynamic_elements: {
            type: "array",
            items: {
              type: "object",
              properties: {
                element_type: { type: "string" },
                behavior_rules: { type: "object" },
                spawn_rate: { type: "number" }
              }
            }
          },
          resource_distribution: { type: "object" },
          ai_generated_rules: { type: "array", items: { type: "object" } },
          agent_capacity: { type: "integer" }
        }
      }
    });

    // Save procedural environment
    const environment = await base44.asServiceRole.entities.ProceduralEnvironment.create({
      environment_name: environmentSpec.environment_name,
      generation_seed: seed,
      complexity_level,
      terrain_config: environmentSpec.terrain_config,
      dynamic_elements: environmentSpec.dynamic_elements,
      resource_distribution: environmentSpec.resource_distribution,
      ai_generated_rules: environmentSpec.ai_generated_rules,
      visualization_ready: true,
      agent_capacity: environmentSpec.agent_capacity
    });

    return Response.json({ 
      success: true,
      environment,
      generation_details: environmentSpec
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});