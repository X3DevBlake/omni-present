import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orchestration_name, num_agents, task_complexity } = await req.json();

    const orchestrationPlan = await base44.integrations.Core.InvokeLLM({
      prompt: `Design agent orchestration with ${num_agents} agents:

Orchestration: ${orchestration_name}
Task Complexity: ${task_complexity}

Generate:
1. Agent roles with specializations and current workload
2. Task queue with complexity and required skills
3. Collaboration graph (agent pairs, scores)
4. Orchestration metrics (completed tasks, time, efficiency)
5. Task assignment strategy

Enable: optimal task distribution, collaborative problem-solving`,
      response_json_schema: {
        type: "object",
        properties: {
          participating_agents: {
            type: "array",
            items: {
              type: "object",
              properties: {
                agent_id: {type: "string"},
                role: {type: "string"},
                specialization: {type: "string"},
                current_task: {type: "string"},
                workload: {type: "number"}
              }
            }
          },
          task_queue: {
            type: "array",
            items: {
              type: "object",
              properties: {
                task_id: {type: "string"},
                complexity: {type: "number"},
                required_skills: {type: "array", items: {type: "string"}},
                assigned_to: {type: "string"}
              }
            }
          },
          collaboration_graph: {
            type: "array",
            items: {
              type: "object",
              properties: {
                agent_a: {type: "string"},
                agent_b: {type: "string"},
                collaboration_score: {type: "number"}
              }
            }
          },
          orchestration_metrics: {
            type: "object",
            properties: {
              tasks_completed: {type: "number"},
              avg_completion_time: {type: "number"},
              collaboration_efficiency: {type: "number"}
            }
          }
        }
      }
    });

    const orchestrationData = {
      orchestration_name,
      participating_agents: orchestrationPlan.participating_agents?.slice(0, num_agents) || [],
      task_queue: orchestrationPlan.task_queue?.slice(0, 10) || [],
      collaboration_graph: orchestrationPlan.collaboration_graph || [],
      orchestration_metrics: orchestrationPlan.orchestration_metrics || {
        tasks_completed: 0,
        avg_completion_time: 0,
        collaboration_efficiency: 0.85
      }
    };

    const orchestration = await base44.entities.AgentOrchestration.create(orchestrationData);

    return Response.json({
      success: true,
      orchestration,
      agents_deployed: orchestrationData.participating_agents.length,
      tasks_queued: orchestrationData.task_queue.length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});