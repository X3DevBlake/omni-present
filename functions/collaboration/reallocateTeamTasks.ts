import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { team_id, trigger_reason } = await req.json();

    // Get team data
    const team = await base44.asServiceRole.entities.WorkingGroup.filter({ id: team_id }, '', 1);
    const teamData = team[0];

    // Get current dynamics snapshot
    const latestSnapshot = await base44.asServiceRole.entities.TeamDynamicsSnapshot.filter(
      { team_id },
      '-snapshot_timestamp',
      1
    );
    const currentSnapshot = latestSnapshot[0];

    // Get all task assignments for team
    const taskAssignments = await base44.asServiceRole.entities.AgentTaskAssignment.filter(
      { team_id },
      '',
      100
    );

    // Get performance data for each team member
    const memberPerformance = await Promise.all(
      (teamData.member_agents || []).map(async (agent_id) => {
        const perf = await base44.asServiceRole.entities.AgentPerformanceMetrics.filter(
          { agent_id },
          '-time_period',
          1
        );
        return { agent_id, performance: perf[0] };
      })
    );

    // AI-driven reallocation analysis
    const reallocation = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Analyze team dynamics and suggest optimal task reallocation:

Team Members: ${JSON.stringify(teamData.member_agents, null, 2)}
Current Tasks: ${JSON.stringify(taskAssignments, null, 2)}
Member Performance: ${JSON.stringify(memberPerformance, null, 2)}
Bottlenecks: ${JSON.stringify(currentSnapshot?.bottlenecks_detected, null, 2)}
Trigger Reason: ${trigger_reason}

Suggest:
1. Which tasks should be reallocated
2. From which agent to which agent
3. Reasoning for each reallocation
4. Expected impact on team velocity
5. Risk mitigation strategies`,
      response_json_schema: {
        type: 'object',
        properties: {
          reallocations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                task_id: { type: 'string' },
                from_agent: { type: 'string' },
                to_agent: { type: 'string' },
                reason: { type: 'string' },
                expected_improvement: { type: 'number' },
                priority: { type: 'string' }
              }
            }
          },
          expected_velocity_change: { type: 'number' },
          risk_assessment: { type: 'string' },
          recommendations: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    // Execute reallocations
    const reallocationEvents = [];
    for (const realloc of reallocation.reallocations) {
      // Update task assignment
      const task = taskAssignments.find(t => t.id === realloc.task_id);
      if (task) {
        await base44.asServiceRole.entities.AgentTaskAssignment.update(task.id, {
          assigned_agent_id: realloc.to_agent,
          previous_agent_id: realloc.from_agent,
          reallocation_reason: realloc.reason
        });

        reallocationEvents.push({
          timestamp: new Date().toISOString(),
          task_id: realloc.task_id,
          from_agent: realloc.from_agent,
          to_agent: realloc.to_agent,
          reason: realloc.reason,
          trigger_type: trigger_reason
        });
      }
    }

    // Create new dynamics snapshot
    const newSnapshot = await base44.asServiceRole.entities.TeamDynamicsSnapshot.create({
      team_id,
      snapshot_timestamp: new Date().toISOString(),
      team_members: memberPerformance.map(mp => ({
        agent_id: mp.agent_id,
        role: teamData.member_agents?.includes(mp.agent_id) ? 'member' : 'unknown',
        current_tasks: taskAssignments.filter(t => t.assigned_agent_id === mp.agent_id).map(t => t.id),
        performance_score: mp.performance?.efficiency_score || 0,
        compatibility_rating: 85,
        workload_percentage: 50
      })),
      task_allocation: {},
      dynamic_reallocation_events: [
        ...(currentSnapshot?.dynamic_reallocation_events || []),
        ...reallocationEvents
      ],
      bottlenecks_detected: currentSnapshot?.bottlenecks_detected || [],
      team_velocity: (currentSnapshot?.team_velocity || 0) + (reallocation.expected_velocity_change || 0),
      collaboration_efficiency: currentSnapshot?.collaboration_efficiency || 75,
      communication_patterns: {}
    });

    return Response.json({
      success: true,
      reallocations: reallocation.reallocations,
      reallocation_events: reallocationEvents,
      expected_improvement: reallocation.expected_velocity_change,
      new_snapshot: newSnapshot
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});