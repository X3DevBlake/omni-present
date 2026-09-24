import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      agent_id, 
      high_level_goal, 
      goal_category = 'household',
      optimization_priority = 'balanced',
      time_constraint_minutes = null
    } = await req.json();

    // Get agent data
    const agents = await base44.asServiceRole.entities.AgentPhysicalPresence.filter({ agent_id });
    const agent = agents[0];

    if (!agent) {
      return Response.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Get available resources
    const [allAgents, devices, semanticGraphs, contextStates] = await Promise.all([
      base44.asServiceRole.entities.AgentPhysicalPresence.filter({ projection_status: 'active' }),
      base44.asServiceRole.entities.CrossPlatformDevice.filter({ connection_status: 'online' }),
      base44.asServiceRole.entities.EnvironmentSemanticGraph.list('-created_date', 1),
      base44.asServiceRole.entities.AgentContextualState.filter({ agent_id })
    ]);

    const availableAgents = allAgents.filter(a => a.agent_id !== agent_id);
    const currentContext = contextStates[0]?.current_context || {};
    const environmentObjects = semanticGraphs[0]?.nodes || [];

    // Build resource catalog
    const resourceCatalog = {
      agents: availableAgents.map(a => ({
        id: a.agent_id,
        capabilities: a.capabilities || ['general'],
        current_activity: a.current_activity,
        available: !a.current_activity || a.current_activity === 'Idle'
      })),
      devices: devices.map(d => ({
        id: d.id,
        name: d.device_name,
        category: d.device_category,
        capabilities: d.capabilities?.map(c => c.capability_name) || [],
        current_state: d.current_state
      })),
      environment: {
        room_type: currentContext.room_type,
        objects: environmentObjects.filter(o => o.properties?.interactable).map(o => ({
          id: o.node_id,
          label: o.label,
          type: o.object_type
        }))
      }
    };

    // Use AI to decompose the goal into sub-tasks
    const planningPrompt = `You are an intelligent AI agent tasked with planning complex multi-step tasks in a smart home environment.

HIGH-LEVEL GOAL: "${high_level_goal}"
GOAL CATEGORY: ${goal_category}
OPTIMIZATION PRIORITY: ${optimization_priority}
${time_constraint_minutes ? `TIME CONSTRAINT: Complete within ${time_constraint_minutes} minutes` : ''}

AVAILABLE RESOURCES:
- Other Agents: ${JSON.stringify(resourceCatalog.agents)}
- Smart Devices: ${JSON.stringify(resourceCatalog.devices)}
- Environment: ${JSON.stringify(resourceCatalog.environment)}
- Current Room: ${currentContext.room_type || 'unknown'}

Break down the goal into specific, actionable sub-tasks. For each sub-task:
1. Define clear success criteria
2. Identify dependencies on other tasks
3. Assign to the most suitable agent/device
4. Estimate duration
5. List required capabilities

Consider:
- Parallel execution opportunities
- Critical path for time-sensitive goals
- Fallback strategies if primary approach fails
- Environmental constraints and opportunities`;

    const planResult = await base44.integrations.Core.InvokeLLM({
      prompt: planningPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          plan_summary: { type: "string" },
          sub_tasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                task_id: { type: "string" },
                task_name: { type: "string" },
                description: { type: "string" },
                execution_order: { type: "integer" },
                estimated_duration_minutes: { type: "number" },
                dependencies: { type: "array", items: { type: "string" } },
                assigned_to: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    id: { type: "string" },
                    name: { type: "string" }
                  }
                },
                required_capabilities: { type: "array", items: { type: "string" } },
                success_criteria: { type: "string" },
                fallback_action: { type: "string" }
              }
            }
          },
          execution_strategy: {
            type: "object",
            properties: {
              parallel_execution: { type: "boolean" },
              critical_path: { type: "array", items: { type: "string" } },
              estimated_total_time_minutes: { type: "number" },
              risk_factors: { type: "array", items: { type: "string" } }
            }
          },
          delegation_summary: {
            type: "object",
            properties: {
              agents_involved: { type: "integer" },
              devices_involved: { type: "integer" },
              coordination_complexity: { type: "string" }
            }
          }
        }
      }
    });

    // Add status to each sub-task
    const subTasksWithStatus = (planResult.sub_tasks || []).map(task => ({
      ...task,
      status: 'pending',
      progress_percentage: 0
    }));

    // Create the task plan
    const taskPlan = await base44.asServiceRole.entities.AutonomousTaskPlan.create({
      plan_id: `plan_${Date.now()}`,
      agent_id,
      high_level_goal,
      goal_category,
      sub_tasks: subTasksWithStatus,
      execution_strategy: {
        ...planResult.execution_strategy,
        optimization_priority
      },
      context_requirements: {
        required_devices: devices.slice(0, 5).map(d => d.id),
        required_agents: availableAgents.slice(0, 3).map(a => a.agent_id),
        environmental_conditions: currentContext.environmental_conditions,
        time_constraints: time_constraint_minutes ? {
          complete_by: new Date(Date.now() + time_constraint_minutes * 60000).toISOString()
        } : null
      },
      plan_status: 'ready',
      overall_progress: 0,
      created_at: new Date().toISOString()
    });

    // Create a thought process record
    await base44.asServiceRole.entities.AgentThoughtProcess.create({
      thought_id: `thought_${Date.now()}`,
      agent_id,
      thought_type: 'planning',
      thought_content: {
        main_thought: `Planning: ${high_level_goal}`,
        sub_thoughts: subTasksWithStatus.slice(0, 3).map(t => t.task_name),
        considerations: [
          { factor: 'Available agents', weight: 0.8, evaluation: `${availableAgents.length} agents available` },
          { factor: 'Device capabilities', weight: 0.7, evaluation: `${devices.length} devices online` }
        ],
        conclusion: planResult.plan_summary
      },
      visualization_data: {
        display_duration_seconds: 5,
        position_offset: { x: 0.3, y: 0.5, z: 0 },
        bubble_style: 'plan',
        color_scheme: 'blue',
        animation_type: 'expand'
      },
      confidence_level: 0.85,
      timestamp: new Date().toISOString()
    });

    return Response.json({
      success: true,
      task_plan: taskPlan,
      summary: {
        total_sub_tasks: subTasksWithStatus.length,
        estimated_duration_minutes: planResult.execution_strategy?.estimated_total_time_minutes,
        agents_delegated: planResult.delegation_summary?.agents_involved || 0,
        devices_involved: planResult.delegation_summary?.devices_involved || 0,
        parallel_tasks: subTasksWithStatus.filter(t => !t.dependencies?.length).length
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});