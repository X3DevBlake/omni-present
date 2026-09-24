import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, required_skills, task_complexity } = await req.json();
    
    // Get all agent profiles and marketplace listings
    const allAgents = await base44.entities.AgentMarketplaceProfile.list();
    const agentProfiles = await base44.entities.AgentProfile.list();
    
    // Get current agent's skills
    const currentAgent = allAgents.find(a => a.agent_id === agent_id);
    const currentSkills = currentAgent?.skills_profile?.map(s => s.skill) || [];
    
    // AI-powered complementary agent discovery
    const discovery = await base44.integrations.Core.InvokeLLM({
      prompt: `Find complementary agents for a team task:
      
      Current Agent Skills: ${currentSkills.join(', ')}
      Required Skills: ${required_skills.join(', ')}
      Task Complexity: ${task_complexity}/10
      
      Available Agents:
      ${allAgents.map(a => `- Agent ${a.agent_id}: Skills [${a.skills_profile?.map(s => s.skill).join(', ')}], Performance ${a.performance_history?.success_rate}%, Availability ${a.availability_score}%`).join('\n')}
      
      Recommend the best team composition with complementary skills, high collaboration potential, and balanced workload capacity.`,
      response_json_schema: {
        type: "object",
        properties: {
          recommended_agents: {
            type: "array",
            items: {
              type: "object",
              properties: {
                agent_id: { type: "string" },
                role: { type: "string" },
                skills_contribution: { type: "array", items: { type: "string" } },
                synergy_score: { type: "number" },
                reasoning: { type: "string" }
              }
            }
          },
          team_synergy_prediction: { type: "number" },
          risk_factors: { type: "array", items: { type: "string" } }
        }
      }
    });
    
    // Enrich with actual agent data
    const enrichedRecommendations = discovery.recommended_agents.map(rec => {
      const agent = allAgents.find(a => a.agent_id === rec.agent_id);
      return {
        ...rec,
        agent_data: agent,
        current_workload: agent?.availability_score || 100
      };
    });
    
    return Response.json({
      recommendations: enrichedRecommendations,
      team_synergy: discovery.team_synergy_prediction,
      risk_factors: discovery.risk_factors,
      total_candidates: enrichedRecommendations.length
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});