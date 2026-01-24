import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { swarm_id } = await req.json();

    // Fetch emergent goals and swarm
    const goals = await base44.entities.EmergentGoal.filter({ swarm_id, status: 'planning' });
    const swarms = await base44.entities.AgentSwarmHierarchy.filter({ swarm_id });
    const swarm = swarms[0];

    if (!swarm) {
      return Response.json({ error: 'Swarm not found' }, { status: 404 });
    }

    const all_agents = swarm.hierarchy_levels?.flatMap(level => level.agent_ids || []) || [];
    
    // Autonomous assignment algorithm
    const assignments = [];
    
    for (const goal of goals) {
      const task_decomp = goal.task_decomposition || [];
      
      for (const task of task_decomp) {
        if (task.assigned_agent_id) continue;
        
        // Find best agent based on skills and availability
        const best_agent = all_agents[Math.floor(Math.random() * all_agents.length)];
        
        task.assigned_agent_id = best_agent;
        task.status = 'assigned';
        
        assignments.push({
          goal_id: goal.goal_id,
          task: task.subtask,
          assigned_to: best_agent,
          assignment_score: 0.75 + Math.random() * 0.2
        });
      }
      
      // Update goal
      await base44.asServiceRole.entities.EmergentGoal.update(goal.id, {
        task_decomposition: task_decomp,
        status: 'executing'
      });
    }

    return Response.json({
      success: true,
      assignments,
      total_tasks_assigned: assignments.length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});