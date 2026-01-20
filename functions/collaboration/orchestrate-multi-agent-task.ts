import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { task_description, required_skills, complexity } = await req.json();

    // Get available agents
    const agents = await base44.entities.Agent.filter({}).limit(100);

    // Use AI to assign optimal agents and create coordination plan
    const coordinationPlan = await base44.integrations.Core.InvokeLLM({
      prompt: `Create an optimal multi-agent task coordination plan for: "${task_description}". 
      
Required skills: ${required_skills.join(', ')}
Complexity: ${complexity}
Available agents: ${agents.length}

Provide: coordination strategy (parallel/sequential/hierarchical/swarm/democratic), 5 assigned agents (each with agent role, subtasks array, and estimated completion %), task dependencies (array of objects with task_id and depends_on array), and overall efficiency prediction (0-100).`,
      response_json_schema: {
        type: "object",
        properties: {
          strategy: { type: "string" },
          assignments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                role: { type: "string" },
                subtasks: { type: "array", items: { type: "string" } },
                completion: { type: "number" }
              }
            }
          },
          dependencies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                task_id: { type: "string" },
                depends_on: { type: "array", items: { type: "string" } }
              }
            }
          },
          efficiency: { type: "number" }
        }
      }
    });

    // Create coordination record
    const coordination = await base44.entities.TaskCoordination.create({
      coordination_id: `COORD_${Date.now()}`,
      task_description,
      assigned_agents: coordinationPlan.assignments.map((assignment, idx) => ({
        agent_id: agents[idx % agents.length]?.id || 'agent_pending',
        role: assignment.role,
        subtasks: assignment.subtasks,
        completion_percentage: 0
      })),
      coordination_strategy: coordinationPlan.strategy,
      dependencies: coordinationPlan.dependencies,
      progress_metrics: {
        overall_progress: 0,
        time_elapsed_minutes: 0,
        estimated_completion_minutes: complexity === 'high' ? 120 : complexity === 'medium' ? 60 : 30,
        efficiency_rating: coordinationPlan.efficiency
      },
      ai_coordinator_active: true,
      status: 'planning'
    });

    return Response.json({
      success: true,
      coordination,
      plan: coordinationPlan
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});