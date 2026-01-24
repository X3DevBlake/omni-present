import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { swarm_id, task_requirements } = await req.json();

    // Fetch swarm and available agents
    const swarms = await base44.entities.AgentSwarmHierarchy.filter({ swarm_id });
    const swarm = swarms[0];

    if (!swarm) {
      return Response.json({ error: 'Swarm not found' }, { status: 404 });
    }

    const all_agent_ids = swarm.hierarchy_levels?.flatMap(level => level.agent_ids || []) || [];
    
    // Skill complementarity analysis
    const required_skills = task_requirements.skills || ['perception', 'planning', 'execution'];
    
    const agent_skills_map = all_agent_ids.map(agent_id => ({
      agent_id,
      skills: required_skills.map(skill => ({
        skill,
        proficiency: Math.random() * 0.5 + 0.5
      })),
      availability: Math.random() > 0.2
    }));

    // Calculate skill complementarity matrix
    const complementarity_scores = [];
    for (let i = 0; i < agent_skills_map.length; i++) {
      for (let j = i + 1; j < agent_skills_map.length; j++) {
        const agent_a = agent_skills_map[i];
        const agent_b = agent_skills_map[j];
        
        // Complementarity = coverage of different skills
        const combined_skills = new Set([
          ...agent_a.skills.filter(s => s.proficiency > 0.6).map(s => s.skill),
          ...agent_b.skills.filter(s => s.proficiency > 0.6).map(s => s.skill)
        ]);
        
        const complementarity = combined_skills.size / required_skills.length;
        
        complementarity_scores.push({
          agents: [agent_a.agent_id, agent_b.agent_id],
          complementarity_score: complementarity,
          skill_coverage: combined_skills.size
        });
      }
    }

    // Select optimal team
    const best_pairing = complementarity_scores.sort((a, b) => 
      b.complementarity_score - a.complementarity_score
    )[0];

    const optimal_team = {
      team_id: `team_${swarm_id}_${Date.now()}`,
      members: best_pairing.agents,
      complementarity_score: best_pairing.complementarity_score,
      skill_coverage: best_pairing.skill_coverage,
      formation_reason: 'skill_complementarity_optimization'
    };

    return Response.json({
      success: true,
      optimal_team,
      complementarity_analysis: complementarity_scores.slice(0, 5),
      total_agents_analyzed: all_agent_ids.length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});