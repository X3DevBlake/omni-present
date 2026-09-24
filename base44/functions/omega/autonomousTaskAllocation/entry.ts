import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { swarm_id, tasks } = await req.json();

    // Fetch agent profiles
    const profiles = await base44.entities.AgentPersonalizationProfile.filter({ swarm_id });

    if (profiles.length === 0) {
      return Response.json({ error: 'No agents available in swarm' }, { status: 400 });
    }

    // AI-driven task allocation
    const allocations = [];

    for (const task of tasks || []) {
      // Score each agent for the task
      const agentScores = profiles.map(profile => {
        let score = 0.5; // Base score

        // Preference matching
        const preferredTasks = profile.learned_preferences?.preferred_tasks || [];
        if (preferredTasks.includes(task.type)) {
          score += 0.3;
        }

        // Historical performance on similar tasks
        const relevantPerformance = profile.historical_performance?.filter(
          hp => hp.task_type === task.type
        ) || [];
        if (relevantPerformance.length > 0) {
          const avgSuccess = relevantPerformance.reduce((sum, p) => sum + p.success_rate, 0) / relevantPerformance.length;
          score += avgSuccess * 0.4;
        }

        // Behavioral parameter alignment
        if (task.requires_high_risk && profile.behavioral_parameters?.risk_tolerance > 0.6) {
          score += 0.15;
        }
        if (task.requires_cooperation && profile.behavioral_parameters?.cooperation_level > 0.7) {
          score += 0.15;
        }

        // Specialization bonus
        score *= (1 + profile.specialization_score * 0.2);

        return { agent_id: profile.agent_id, score, profile };
      });

      // Select best agent
      agentScores.sort((a, b) => b.score - a.score);
      const bestAgent = agentScores[0];

      allocations.push({
        task_id: task.id,
        task_type: task.type,
        assigned_agent_id: bestAgent.agent_id,
        assignment_score: bestAgent.score,
        backup_agent_id: agentScores[1]?.agent_id,
        estimated_completion_time: task.complexity * (1 - bestAgent.score) * 100,
        priority: task.priority || 1
      });

      // Update agent's task history
      await base44.entities.AgentPersonalizationProfile.update(bestAgent.profile.id, {
        historical_performance: [
          ...(bestAgent.profile.historical_performance || []),
          {
            task_type: task.type,
            success_rate: 0, // Will be updated after task completion
            avg_completion_time: 0,
            quality_score: 0
          }
        ]
      });
    }

    return Response.json({
      success: true,
      allocations,
      swarm_utilization: allocations.length / profiles.length,
      avg_assignment_score: allocations.reduce((sum, a) => sum + a.assignment_score, 0) / allocations.length
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      details: 'Failed to allocate tasks'
    }, { status: 500 });
  }
});