import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { task_description, agent_ids, available_devices, context } = await req.json();

    // Use AI to decompose complex task into steps
    const orchestrationPrompt = `You are an AI task orchestrator for a smart home with holographic agents and IoT devices.

Task Request: "${task_description}"

Available Agents:
${JSON.stringify(agent_ids || [])}

Available Devices:
${JSON.stringify(available_devices?.map(d => ({
  id: d.id,
  name: d.device_name,
  type: d.device_category || d.device_type,
  protocol: d.protocol || d.api_provider,
  capabilities: d.capabilities
})) || [])}

Context:
${JSON.stringify(context || {})}

Decompose this task into:
1. Individual steps with specific device commands
2. Agent assignments for each step
3. Parallel vs sequential execution order
4. Timing and delays between steps
5. Success criteria for each step
6. Rollback actions if steps fail
7. Human intervention points if needed

Create an optimal execution plan.`;

    const taskPlan = await base44.integrations.Core.InvokeLLM({
      prompt: orchestrationPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          task_name: { type: "string" },
          total_estimated_time_ms: { type: "number" },
          execution_phases: {
            type: "array",
            items: {
              type: "object",
              properties: {
                phase_id: { type: "string" },
                phase_name: { type: "string" },
                execution_type: { type: "string" },
                steps: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      step_id: { type: "string" },
                      step_name: { type: "string" },
                      assigned_agent: { type: "string" },
                      target_device_id: { type: "string" },
                      device_command: { type: "string" },
                      command_parameters: { type: "object" },
                      delay_before_ms: { type: "number" },
                      timeout_ms: { type: "number" },
                      success_criteria: { type: "string" },
                      rollback_action: { type: "string" },
                      requires_human_approval: { type: "boolean" }
                    }
                  }
                }
              }
            }
          },
          agent_coordination: {
            type: "object",
            properties: {
              lead_agent: { type: "string" },
              role_assignments: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    agent_id: { type: "string" },
                    role: { type: "string" },
                    responsibilities: { type: "array", items: { type: "string" } }
                  }
                }
              },
              communication_protocol: { type: "string" }
            }
          },
          expected_outcome: { type: "string" },
          verbal_announcement: { type: "string" }
        }
      }
    });

    // Create orchestration job
    const orchestrationJob = await base44.asServiceRole.entities.OrchestrationJob.create({
      job_name: taskPlan.task_name || task_description,
      job_type: 'ai_triggered',
      status: 'queued',
      total_steps: taskPlan.execution_phases?.reduce((acc, phase) => acc + (phase.steps?.length || 0), 0) || 0,
      execution_timeline: taskPlan.execution_phases?.flatMap(phase => 
        (phase.steps || []).map(step => ({
          step_id: step.step_id,
          step_name: step.step_name,
          status: 'pending',
          assigned_agent: step.assigned_agent,
          target_device: step.target_device_id
        }))
      ) || []
    });

    // Create collaborative task if multiple agents
    if (agent_ids?.length > 1) {
      await base44.asServiceRole.entities.AgentCollaborativeTask.create({
        task_name: taskPlan.task_name || task_description,
        participating_agents: taskPlan.agent_coordination?.role_assignments || agent_ids.map(id => ({ agent_id: id, role: 'executor' })),
        coordination_strategy: 'hierarchical',
        task_decomposition: taskPlan.execution_phases?.flatMap(phase =>
          (phase.steps || []).map(step => ({
            subtask: step.step_name,
            assigned_to: step.assigned_agent,
            dependencies: [],
            status: 'pending'
          }))
        ) || [],
        task_status: 'planning',
        progress: 0
      });
    }

    return Response.json({
      success: true,
      orchestration_job_id: orchestrationJob.id,
      execution_plan: taskPlan,
      verbal_response: taskPlan.verbal_announcement,
      estimated_completion_ms: taskPlan.total_estimated_time_ms,
      steps_requiring_approval: taskPlan.execution_phases?.flatMap(phase =>
        (phase.steps || []).filter(s => s.requires_human_approval)
      ) || []
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});