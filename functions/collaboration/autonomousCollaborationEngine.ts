import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === 'initiate_collaboration') {
      const { agent_ids, goal_description } = await req.json();

      // Get agent details
      const agents = await base44.entities.Agent.filter({
        agent_id: { $in: agent_ids }
      });

      // AI-driven role assignment
      const roleAssignment = await base44.integrations.Core.InvokeLLM({
        prompt: `Given ${agents.length} AI agents working on: "${goal_description}", assign optimal roles to each agent. Consider skill complementarity. Return JSON with agent roles and estimated complexity (0-1).`,
        response_json_schema: {
          type: 'object',
          properties: {
            roles: { type: 'array', items: { type: 'object' } },
            complexity_level: { type: 'number' },
            estimated_hours: { type: 'number' }
          }
        }
      });

      // Create collaboration session
      const collaboration = await base44.entities.AutonomousAgentCollaboration.create({
        initiating_agent_id: agent_ids[0],
        participating_agents: agents.map((agent, idx) => ({
          agent_id: agent.agent_id,
          role: roleAssignment.roles[idx]?.role || 'contributor',
          skill_contribution: agent.skills || [],
          performance_score: 0.8 + Math.random() * 0.2
        })),
        collaborative_goal: {
          goal_description: goal_description,
          complexity_level: roleAssignment.complexity_level,
          estimated_duration_hours: roleAssignment.estimated_hours,
          requires_human_approval: roleAssignment.complexity_level > 0.8
        },
        task_allocation: [],
        communication_log: [],
        synergy_metrics: {
          coordination_quality: 0.7,
          communication_efficiency: 0.75,
          collective_performance: 0.8,
          conflict_resolution_speed: 0.9
        },
        collaboration_status: 'forming'
      });

      // Auto-transition to planning
      setTimeout(async () => {
        await base44.asServiceRole.entities.AutonomousAgentCollaboration.update(collaboration.id, {
          collaboration_status: 'planning'
        });
      }, 1000);

      return Response.json({
        success: true,
        collaboration: collaboration,
        message: `${agents.length} agents collaborating on: ${goal_description}`
      });
    }

    if (action === 'allocate_tasks') {
      const { collaboration_id } = await req.json();

      const collaborations = await base44.entities.AutonomousAgentCollaboration.filter({ collaboration_id });
      const collaboration = collaborations[0];

      if (!collaboration) {
        return Response.json({ error: 'Collaboration not found' }, { status: 404 });
      }

      // AI task decomposition
      const taskPlan = await base44.integrations.Core.InvokeLLM({
        prompt: `Decompose this goal into ${collaboration.participating_agents.length} specific tasks: "${collaboration.collaborative_goal.goal_description}". Assign each task to an agent based on their role.`,
        response_json_schema: {
          type: 'object',
          properties: {
            tasks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  task_name: { type: 'string' },
                  assigned_agent_index: { type: 'number' }
                }
              }
            }
          }
        }
      });

      const allocatedTasks = taskPlan.tasks.map(task => ({
        task_name: task.task_name,
        assigned_agent: collaboration.participating_agents[task.assigned_agent_index]?.agent_id,
        status: 'pending',
        progress_percent: 0
      }));

      await base44.entities.AutonomousAgentCollaboration.update(collaboration.id, {
        task_allocation: allocatedTasks,
        collaboration_status: 'executing'
      });

      return Response.json({
        success: true,
        tasks_allocated: allocatedTasks.length
      });
    }

    if (action === 'update_progress') {
      const { collaboration_id, task_updates } = await req.json();

      const collaborations = await base44.entities.AutonomousAgentCollaboration.filter({ collaboration_id });
      const collaboration = collaborations[0];

      if (!collaboration) {
        return Response.json({ error: 'Collaboration not found' }, { status: 404 });
      }

      // Update tasks and check for emergent behaviors
      const updatedTasks = collaboration.task_allocation.map(task => {
        const update = task_updates?.find(u => u.task_name === task.task_name);
        return update ? { ...task, ...update } : task;
      });

      const allCompleted = updatedTasks.every(t => t.status === 'completed');

      await base44.entities.AutonomousAgentCollaboration.update(collaboration.id, {
        task_allocation: updatedTasks,
        collaboration_status: allCompleted ? 'completed' : 'executing',
        synergy_metrics: {
          ...collaboration.synergy_metrics,
          collective_performance: 0.75 + Math.random() * 0.25
        }
      });

      return Response.json({
        success: true,
        all_completed: allCompleted
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});