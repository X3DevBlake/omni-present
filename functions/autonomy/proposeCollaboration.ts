import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { agent_id, task_description } = await req.json();
    
    // Get agent's current capabilities
    const profiles = await base44.asServiceRole.entities.AgentMarketplaceProfile.filter({ agent_id });
    const profile = profiles[0];
    
    if (!profile) {
      return Response.json({ error: 'Agent profile not found' }, { status: 404 });
    }
    
    const agentSkills = profile.skills_profile?.map(s => s.skill) || [];
    
    // AI analysis to determine if collaboration needed
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze if this agent needs collaboration:
      
      Agent Skills: ${agentSkills.join(', ')}
      Task: ${task_description}
      Success Rate: ${profile.performance_history?.success_rate}%
      
      Determine if agent can handle task alone or needs collaboration. If collaboration needed, identify required complementary skills.`,
      response_json_schema: {
        type: "object",
        properties: {
          collaboration_needed: { type: "boolean" },
          confidence_solo: { type: "number" },
          missing_skills: { type: "array", items: { type: "string" } },
          recommended_team_size: { type: "integer" },
          reasoning: { type: "string" }
        }
      }
    });
    
    if (!analysis.collaboration_needed) {
      return Response.json({
        collaboration_needed: false,
        message: 'Agent can handle task independently',
        confidence: analysis.confidence_solo
      });
    }
    
    // Discover complementary agents
    const discovery = await base44.functions.invoke('discoverComplementaryAgents', {
      agent_id,
      required_skills: analysis.missing_skills,
      task_complexity: 7
    });
    
    // Auto-propose team formation
    const proposal = {
      initiator_agent_id: agent_id,
      task_objective: task_description,
      required_skills: analysis.missing_skills,
      recommended_agents: discovery.data.recommendations.slice(0, analysis.recommended_team_size - 1),
      proposal_status: 'pending',
      created_at: new Date().toISOString()
    };
    
    // Create agent negotiation record
    const negotiation = await base44.asServiceRole.entities.AgentNegotiation.create({
      negotiation_type: 'collaboration',
      initiator_agent_id: agent_id,
      participant_agent_ids: proposal.recommended_agents.map(r => r.agent_id),
      negotiation_terms: {
        task: task_description,
        workload_split: 'equal',
        duration_estimate: 'auto'
      },
      status: 'open'
    });
    
    return Response.json({
      proposal,
      negotiation,
      analysis,
      recommended_partners: proposal.recommended_agents.length
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});