import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskRequirements } = await req.json();
    
    // Get all agent profiles
    const profiles = await base44.entities.AgentProfile.list();
    
    // Get agent skills
    const skills = await base44.entities.AgentSkill.list();
    
    // Get marketplace profiles for performance data
    const marketplaceProfiles = await base44.entities.AgentMarketplaceProfile.list();
    
    // AI-powered matching algorithm
    const scoredAgents = profiles.map(profile => {
      const agentSkills = skills.filter(s => s.agent_id === profile.agent_id);
      const marketData = marketplaceProfiles.find(m => m.agent_id === profile.agent_id);
      
      let matchScore = 0;
      
      // Skill matching (40% weight)
      if (taskRequirements.required_skills) {
        const matchedSkills = agentSkills.filter(skill => 
          taskRequirements.required_skills.includes(skill.skill_name)
        );
        const skillMatch = matchedSkills.length / taskRequirements.required_skills.length;
        const avgProficiency = matchedSkills.reduce((sum, s) => sum + s.proficiency_level, 0) / matchedSkills.length || 0;
        matchScore += (skillMatch * 0.7 + avgProficiency / 100 * 0.3) * 40;
      }
      
      // Performance history (30% weight)
      if (profile.performance_summary) {
        const perfScore = (
          (profile.performance_summary.success_rate || 0) * 0.5 +
          (profile.performance_summary.avg_rating || 0) * 20 * 0.5
        );
        matchScore += perfScore * 0.3;
      }
      
      // Availability (20% weight)
      const availabilityScore = profile.is_available && 
        profile.current_workload < profile.max_concurrent_tasks ? 100 : 0;
      matchScore += availabilityScore * 0.2;
      
      // Reputation and collaboration (10% weight)
      if (marketData) {
        matchScore += (marketData.collaboration_score || 0) * 0.1;
      }
      
      return {
        ...profile,
        matchScore,
        matchedSkills: agentSkills.filter(skill => 
          taskRequirements.required_skills?.includes(skill.skill_name)
        ),
        marketData
      };
    });
    
    // Sort by match score
    const rankedAgents = scoredAgents
      .filter(a => a.matchScore > 20) // Minimum threshold
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10); // Top 10 matches
    
    return Response.json({
      matches: rankedAgents,
      total_analyzed: profiles.length,
      recommendations: rankedAgents.slice(0, 3).map(agent => ({
        agent_id: agent.agent_id,
        display_name: agent.display_name,
        match_score: agent.matchScore,
        reason: `Strong match with ${agent.matchedSkills?.length || 0} required skills and ${agent.performance_summary?.success_rate || 0}% success rate`
      }))
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});