import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { task_description, required_agents, context, priority = 'medium' } = await req.json();

    // Get agent data
    const agents = await Promise.all(
      required_agents.map(id => base44.entities.Agent.filter({ id }))
    );
    const validAgents = agents.filter(a => a.length > 0).map(a => a[0]);

    // Use AI to analyze task and assign optimal delegation strategy
    const delegation = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze task delegation strategy for autonomous agents:

Task: ${task_description}
Priority: ${priority}
Available agents: ${validAgents.length}
Agent skills: ${validAgents.map(a => a.agent_name).join(', ')}
Context: ${JSON.stringify(context)}

Create delegation plan:
1. optimal_agent_assignments (array of {agent_index, role, estimated_time_minutes})
2. task_decomposition (break into subtasks)
3. knowledge_sharing_needs (what info should be shared)
4. emergent_behavior_triggers (conditions that enable new collaborative patterns)
5. fallback_strategies (if agents fail)
6. success_criteria (how to measure task completion)`,
      response_json_schema: {
        type: "object",
        properties: {
          optimal_agent_assignments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                agent_index: { "type": "number" },
                role: { "type": "string" },
                estimated_time_minutes: { "type": "number" }
              }
            }
          },
          task_decomposition: {
            type: "array",
            items: {
              type: "object",
              properties: {
                subtask: { "type": "string" },
                assigned_agent_index: { "type": "number" },
                dependencies: { "type": "array", "items": { "type": "string" } }
              }
            }
          },
          knowledge_sharing_needs: {
            type: "array",
            items: { "type": "string" }
          },
          emergent_behavior_triggers: {
            type: "array",
            items: { "type": "string" }
          },
          fallback_strategies: {
            type: "array",
            items: { "type": "string" }
          },
          success_criteria: {
            type: "array",
            items: { "type": "string" }
          }
        }
      }
    });

    // Create task delegations
    const delegatedTasks = [];
    for (const assignment of delegation.optimal_agent_assignments) {
      const task = await base44.entities.TaskDelegation.create({
        task_id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        delegated_from_agent: validAgents[0].id,
        delegated_to_agents: [
          {
            agent_id: validAgents[assignment.agent_index].id,
            role: assignment.role,
            acceptance_status: 'pending',
            completion_percentage: 0
          }
        ],
        task_description: task_description,
        task_priority: priority,
        estimated_duration_minutes: assignment.estimated_time_minutes,
        required_skills: validAgents[assignment.agent_index].skills || [],
        knowledge_required: delegation.knowledge_sharing_needs,
        execution_context: context,
        status: 'delegated',
        emergent_behaviors: []
      });
      delegatedTasks.push(task);
    }

    return Response.json({
      success: true,
      delegation_plan: delegation,
      created_tasks: delegatedTasks,
      total_agents_involved: validAgents.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});