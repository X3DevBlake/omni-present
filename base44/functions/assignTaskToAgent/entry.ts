import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { task_requirements, workflow_id } = await req.json();

    // Get all agents with their skills and current load
    const [agents, skills, activeWorkflows] = await Promise.all([
      base44.asServiceRole.entities.Agent.list(),
      base44.asServiceRole.entities.AgentSkill.list(),
      base44.asServiceRole.entities.WorkflowExecution.filter({ execution_status: 'running' }),
    ]);

    // Calculate agent scores based on skills and load
    const agentScores = agents.map(agent => {
      // Check if agent has required skills
      const agentSkills = skills.filter(s => s.agent_id === agent.id);
      const hasRequiredSkills = task_requirements.required_skills?.every(reqSkill => 
        agentSkills.some(s => s.skill_name === reqSkill)
      );

      if (!hasRequiredSkills) {
        return { agent, score: 0, reason: 'Missing required skills' };
      }

      // Calculate skill match score
      const skillScore = agentSkills.reduce((sum, skill) => sum + (skill.proficiency || 0), 0);

      // Calculate load score (lower load = better)
      const agentLoad = activeWorkflows.filter(w => 
        w.current_task_id?.includes(agent.id)
      ).length;
      const loadScore = Math.max(0, 100 - (agentLoad * 20));

      // Get agent reputation if available
      const reputations = await base44.asServiceRole.entities.AgentReputation.filter({ agent_id: agent.id });
      const reputationScore = reputations[0]?.overall_score || 50;

      // Combined score
      const totalScore = (skillScore * 0.4) + (loadScore * 0.3) + (reputationScore * 0.3);

      return { 
        agent, 
        score: totalScore,
        reason: `Skills: ${skillScore.toFixed(0)}, Load: ${agentLoad}, Rep: ${reputationScore.toFixed(0)}`
      };
    });

    // Sort by score and pick best agent
    const bestMatch = agentScores
      .filter(a => a.score > 0)
      .sort((a, b) => b.score - a.score)[0];

    if (!bestMatch) {
      return Response.json({ error: 'No suitable agent found' }, { status: 404 });
    }

    return Response.json({
      success: true,
      assigned_agent: {
        id: bestMatch.agent.id,
        name: bestMatch.agent.name,
        score: bestMatch.score,
        reason: bestMatch.reason,
      },
      alternatives: agentScores
        .filter(a => a.score > 0)
        .slice(1, 4)
        .map(a => ({ id: a.agent.id, name: a.agent.name, score: a.score })),
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});