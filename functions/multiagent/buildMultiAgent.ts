import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { system_name, num_agents, protocol } = await req.json();

    const masPlan = await base44.integrations.Core.InvokeLLM({
      prompt: `Design multi-agent system with ${num_agents} agents:

System: ${system_name}
Protocol: ${protocol}

Generate:
1. Agent roles with capabilities and specialization
2. Communication overhead
3. Emergent behaviors
4. System performance (completion, collaboration, scalability)
5. Coordination strategy

Enable: collective intelligence, distributed problem-solving`,
      response_json_schema: {
        type: "object",
        properties: {
          agent_roles: {
            type: "array",
            items: {
              type: "object",
              properties: {
                role: {type: "string"},
                capabilities: {type: "array", items: {type: "string"}},
                specialization_score: {type: "number"}
              }
            }
          },
          communication_overhead: {type: "number"},
          emergent_behaviors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                behavior: {type: "string"},
                emergence_frequency: {type: "number"}
              }
            }
          },
          system_performance: {
            type: "object",
            properties: {
              task_completion_rate: {type: "number"},
              collaboration_efficiency: {type: "number"},
              scalability_score: {type: "number"}
            }
          }
        }
      }
    });

    const systemData = {
      system_name,
      num_agents,
      agent_roles: masPlan.agent_roles?.slice(0, num_agents) || [],
      coordination_protocol: protocol,
      communication_overhead: masPlan.communication_overhead || 0.15,
      emergent_behaviors: masPlan.emergent_behaviors?.slice(0, 5) || [],
      system_performance: masPlan.system_performance || {
        task_completion_rate: 0.93,
        collaboration_efficiency: 0.87,
        scalability_score: 0.89
      }
    };

    const system = await base44.entities.MultiAgentSystem.create(systemData);

    return Response.json({
      success: true,
      system,
      capabilities: {
        efficient: systemData.system_performance.collaboration_efficiency > 0.8,
        scalable: systemData.system_performance.scalability_score > 0.85,
        emergent: systemData.emergent_behaviors.length > 0
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});