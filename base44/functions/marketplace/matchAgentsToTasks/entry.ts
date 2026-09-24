import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { task_description, required_skills = [], priority = 'medium', budget = 1000 } = await req.json();

    // Get available agents
    const profiles = await base44.entities.AgentMarketplaceProfile.list('', 100);
    const availableProfiles = profiles.filter(p => (p.availability_score || 0) > 30);

    // AI-powered matching
    const matches = await base44.integrations.Core.InvokeLLM({
      prompt: `Match agents to this task using AI-powered analysis.
      
      Task:
      - Description: ${task_description}
      - Required Skills: ${required_skills.join(', ')}
      - Priority: ${priority}
      - Budget: $${budget}
      
      Available Agents (${availableProfiles.length}):
      ${JSON.stringify(availableProfiles.map(p => ({
        agent_id: p.agent_id,
        skills: p.skills_profile?.map(s => s.skill),
        success_rate: p.performance_history?.success_rate,
        price: p.pricing_model?.current_price,
        availability: p.availability_score,
        specializations: p.specializations
      })).slice(0, 20), null, 2)}
      
      Return top 5 matches with:
      - agent_id
      - match_score (0-100)
      - reasons (array of strings why matched)
      - estimated_cost
      - estimated_completion_time
      - confidence (0-100)
      
      Return as JSON array sorted by match_score.`,
      response_json_schema: {
        type: "object",
        properties: {
          matches: {
            type: "array",
            items: {
              type: "object",
              properties: {
                agent_id: { type: "string" },
                match_score: { type: "number" },
                reasons: { type: "array", items: { type: "string" } },
                estimated_cost: { type: "number" },
                estimated_completion_time: { type: "string" },
                confidence: { type: "number" }
              }
            }
          }
        }
      }
    });

    return Response.json({ 
      success: true,
      matches: matches.matches || [],
      task_summary: {
        description: task_description,
        required_skills,
        budget
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});