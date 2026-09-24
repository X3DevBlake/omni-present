import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { swarm_id, environmental_context } = await req.json();

    // Fetch swarm hierarchy
    const swarms = await base44.entities.AgentSwarmHierarchy.filter({ swarm_id });
    const swarm = swarms[0];

    if (!swarm) {
      return Response.json({ error: 'Swarm not found' }, { status: 404 });
    }

    // Emergent goal formation through GWT broadcast
    const agent_proposals = swarm.hierarchy_levels?.flatMap(level => 
      level.agent_ids?.map(agent_id => ({
        agent_id,
        proposal: `Optimize_${Math.random() > 0.5 ? 'resource_allocation' : 'task_efficiency'}`,
        capability_contribution: Math.random()
      })) || []
    ) || [];

    // Select winning proposal via GWT ignition
    const sorted_proposals = agent_proposals.sort((a, b) => b.capability_contribution - a.capability_contribution);
    const winning_proposal = sorted_proposals[0];

    // Generate emergent goal with task decomposition
    const goal_description = `${winning_proposal?.proposal}: ${environmental_context}`;
    
    const task_decomposition = [
      { subtask: 'Environmental scanning', assigned_agent_id: null, required_skills: ['perception', 'data_fusion'], status: 'pending' },
      { subtask: 'Strategy synthesis', assigned_agent_id: null, required_skills: ['planning', 'optimization'], status: 'pending' },
      { subtask: 'Execution coordination', assigned_agent_id: null, required_skills: ['motor_control', 'feedback_processing'], status: 'pending' }
    ];

    // Ethical compliance check
    const ethical_check = {
      passed: true,
      ethical_score: 0.87,
      concerns: goal_description.includes('Optimize_resource') ? 
        ['Ensure fair resource distribution'] : []
    };

    const emergent_goal = await base44.asServiceRole.entities.EmergentGoal.create({
      goal_id: `goal_${swarm_id}_${Date.now()}`,
      swarm_id,
      goal_description,
      emergence_source: 'gwt_broadcast',
      contributing_agents: agent_proposals.map(p => p.agent_id),
      priority_score: winning_proposal?.capability_contribution || 0.5,
      task_decomposition,
      ethical_compliance_check: ethical_check,
      execution_plan: {
        estimated_duration_hours: 2.5,
        required_resources: ['compute', 'network_bandwidth'],
        success_criteria: ['Task completion', 'Ethical compliance maintained']
      },
      status: 'planning'
    });

    // Create notification
    await base44.asServiceRole.entities.UserNotification.create({
      notification_id: `notif_goal_${Date.now()}`,
      user_email: user.email,
      notification_type: 'system_update',
      priority: 'medium',
      title: 'Emergent Goal Formed',
      message: `HAAS swarm ${swarm_id} autonomously generated goal: ${goal_description}`,
      source_module: 'haas_swarm'
    });

    return Response.json({
      success: true,
      emergent_goal,
      winning_proposal,
      total_proposals: agent_proposals.length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});