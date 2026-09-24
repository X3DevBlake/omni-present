import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { goal, autoExecute = false } = await req.json();

    if (!goal) {
        return Response.json({ error: 'Goal required' }, { status: 400 });
    }

    // Use AI to break down high-level goal into sub-tasks
    const taskBreakdown = await base44.integrations.Core.InvokeLLM({
        prompt: `Break down this high-level goal into 5-8 concrete, executable sub-tasks: "${goal}". For each sub-task, estimate duration and identify required capabilities.`,
        response_json_schema: {
            type: "object",
            properties: {
                sub_tasks: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            task_name: { type: "string" },
                            description: { type: "string" },
                            estimated_duration_minutes: { type: "number" },
                            required_capabilities: { type: "array", items: { type: "string" } },
                            dependencies: { type: "array", items: { type: "string" } }
                        }
                    }
                },
                optimization_priority: { type: "string" },
                estimated_total_hours: { type: "number" }
            }
        }
    });

    // Get available agents
    const agents = await base44.entities.Agent.filter({ created_by: user.email });

    // Assign tasks to agents based on capabilities
    const subTasksWithAssignments = taskBreakdown.sub_tasks.map((task, index) => ({
        task_id: `task_${Date.now()}_${index}`,
        task_name: task.task_name,
        description: task.description,
        execution_order: index + 1,
        estimated_duration_minutes: task.estimated_duration_minutes,
        dependencies: task.dependencies,
        assigned_to: agents.length > 0 ? {
            type: 'agent',
            id: agents[index % agents.length].id,
            name: agents[index % agents.length].agent_name
        } : {
            type: 'user',
            id: user.id,
            name: user.full_name
        },
        required_capabilities: task.required_capabilities,
        status: autoExecute ? 'in_progress' : 'pending',
        progress_percentage: 0
    }));

    // Create autonomous task plan
    const taskPlan = {
        plan_id: `plan_${Date.now()}`,
        agent_id: agents[0]?.id || 'system',
        high_level_goal: goal,
        goal_category: 'work',
        sub_tasks: subTasksWithAssignments,
        execution_strategy: {
            parallel_execution: false,
            critical_path: subTasksWithAssignments.map(t => t.task_id),
            optimization_priority: taskBreakdown.optimization_priority || 'quality'
        },
        plan_status: autoExecute ? 'executing' : 'ready',
        overall_progress: 0,
        created_at: new Date().toISOString()
    };

    const createdPlan = await base44.entities.AutonomousTaskPlan.create(taskPlan);

    return Response.json({
        success: true,
        plan: createdPlan,
        assignedAgents: agents.length,
        estimatedCompletion: taskBreakdown.estimated_total_hours,
        message: autoExecute ? 'Plan created and execution started' : 'Plan ready for execution'
    });
});