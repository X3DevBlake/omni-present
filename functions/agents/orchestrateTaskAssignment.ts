import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    if (data.task_queue?.length > 0) {
      const assignments = await base44.integrations.Core.InvokeLLM({
        prompt: `Assign tasks to agents based on skills and workload:
        
Agents: ${JSON.stringify(data.participating_agents)}
Tasks: ${JSON.stringify(data.task_queue)}

Optimize for: balanced workload, skill match, efficiency`,
        response_json_schema: {
          type: "object",
          properties: {
            assignments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  task_id: { type: "string" },
                  agent_id: { type: "string" },
                  priority: { type: "number" }
                }
              }
            }
          }
        }
      });

      const updatedQueue = data.task_queue.map(task => {
        const assignment = assignments.assignments?.find(a => a.task_id === task.task_id);
        return assignment ? { ...task, assigned_to: assignment.agent_id } : task;
      });

      await base44.asServiceRole.entities.AgentOrchestration.update(event.entity_id, {
        task_queue: updatedQueue
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});