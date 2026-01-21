import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      initiating_agent_id,
      detected_need,
      target_agents = [],
      target_devices = [],
      priority = 'medium'
    } = await req.json();

    // Get initiating agent
    const agents = await base44.asServiceRole.entities.AgentPhysicalPresence.filter({ agent_id: initiating_agent_id });
    const initiator = agents[0];

    if (!initiator) {
      return Response.json({ error: 'Initiating agent not found' }, { status: 404 });
    }

    // Get available agents and devices
    const [availableAgents, availableDevices, contextStates] = await Promise.all([
      base44.asServiceRole.entities.AgentPhysicalPresence.filter({ projection_status: 'active' }),
      base44.asServiceRole.entities.CrossPlatformDevice.filter({ connection_status: 'online' }),
      base44.asServiceRole.entities.AgentContextualState.filter({ agent_id: initiating_agent_id })
    ]);

    const context = contextStates[0]?.current_context || {};

    // Use AI to decompose the task
    const decompositionPrompt = `You are an AI agent decomposing a detected need into collaborative sub-tasks.

DETECTED NEED: "${detected_need}"
PRIORITY: ${priority}
INITIATING AGENT: ${initiating_agent_id}
ENVIRONMENTAL CONTEXT: ${JSON.stringify(context)}

AVAILABLE AGENTS:
${availableAgents.map(a => `- ${a.agent_id}: ${a.current_activity || 'idle'}, capabilities: ${JSON.stringify(a.capabilities || ['general'])}`).join('\n')}

AVAILABLE DEVICES:
${availableDevices.slice(0, 10).map(d => `- ${d.device_name} (${d.device_category}): ${d.connection_status}`).join('\n')}

Decompose this need into specific sub-tasks that can be delegated to agents or devices. Consider:
1. Task dependencies and execution order
2. Which agent or device is best suited for each task
3. Estimated duration for each task
4. Success criteria for the overall task`;

    const decomposition = await base44.integrations.Core.InvokeLLM({
      prompt: decompositionPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          task_name: { type: "string" },
          task_description: { type: "string" },
          sub_tasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                subtask_name: { type: "string" },
                description: { type: "string" },
                assigned_type: { type: "string", enum: ["agent", "device"] },
                assigned_to: { type: "string" },
                assigned_name: { type: "string" },
                estimated_duration_minutes: { type: "number" },
                dependencies: { type: "array", items: { type: "string" } },
                required_capabilities: { type: "array", items: { type: "string" } }
              }
            }
          },
          coordination_notes: { type: "string" },
          estimated_total_duration_minutes: { type: "number" },
          success_criteria: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Create the collaborative task
    const collaborativeTask = await base44.asServiceRole.entities.AgentCollaborativeTask.create({
      task_name: decomposition.task_name,
      task_description: decomposition.task_description,
      initiating_agent_id: initiating_agent_id,
      participating_agents: decomposition.sub_tasks
        .filter(st => st.assigned_type === 'agent')
        .map(st => ({
          agent_id: st.assigned_to,
          role: 'executor',
          assigned_subtasks: [st.subtask_name]
        })),
      task_decomposition: decomposition.sub_tasks.map((st, idx) => ({
        ...st,
        subtask_id: `subtask_${Date.now()}_${idx}`,
        status: 'pending',
        progress: 0
      })),
      task_status: 'pending',
      priority,
      progress: 0,
      coordination_strategy: {
        parallel_execution: true,
        notes: decomposition.coordination_notes
      },
      success_criteria: decomposition.success_criteria
    });

    // Create thought process for the initiating agent
    await base44.asServiceRole.entities.AgentThoughtProcess.create({
      thought_id: `thought_collab_${Date.now()}`,
      agent_id: initiating_agent_id,
      thought_type: 'collaboration',
      thought_content: {
        main_thought: `Initiating collaborative task: ${decomposition.task_name}`,
        sub_thoughts: decomposition.sub_tasks.slice(0, 3).map(st => `→ ${st.assigned_name}: ${st.subtask_name}`),
        conclusion: `Coordinating ${decomposition.sub_tasks.length} sub-tasks with ${new Set(decomposition.sub_tasks.map(st => st.assigned_to)).size} participants`
      },
      visualization_data: {
        display_duration_seconds: 6,
        position_offset: { x: 0.3, y: 0.7, z: 0 },
        bubble_style: 'plan',
        color_scheme: 'purple',
        animation_type: 'expand'
      },
      confidence_level: 0.9,
      timestamp: new Date().toISOString()
    });

    // Create proactive assistance for task proposal
    await base44.asServiceRole.entities.ProactiveAssistance.create({
      assistance_id: `assist_task_${Date.now()}`,
      agent_id: initiating_agent_id,
      assistance_type: 'delegation',
      trigger_source: {
        entity_type: 'AgentCollaborativeTask',
        entity_id: collaborativeTask.id,
        trigger_condition: 'new_task_proposed'
      },
      assistance_content: {
        title: 'New Collaborative Task',
        message: `Agent proposes: ${decomposition.task_name}. ${decomposition.sub_tasks.length} sub-tasks to be delegated.`,
        severity: priority === 'high' ? 'warning' : 'suggestion',
        recommended_actions: [
          {
            action_id: 'approve_task',
            action_name: 'Approve & Start',
            description: 'Start executing the collaborative task',
            auto_executable: true,
            estimated_benefit: 'Begin task execution immediately'
          },
          {
            action_id: 'modify_task',
            action_name: 'Modify Task',
            description: 'Review and modify the task plan',
            auto_executable: false
          }
        ]
      },
      status: 'pending',
      expires_at: new Date(Date.now() + 300000).toISOString()
    });

    return Response.json({
      success: true,
      collaborative_task: collaborativeTask,
      decomposition: decomposition,
      summary: {
        total_subtasks: decomposition.sub_tasks.length,
        agents_involved: new Set(decomposition.sub_tasks.filter(st => st.assigned_type === 'agent').map(st => st.assigned_to)).size,
        devices_involved: new Set(decomposition.sub_tasks.filter(st => st.assigned_type === 'device').map(st => st.assigned_to)).size,
        estimated_duration_minutes: decomposition.estimated_total_duration_minutes
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});