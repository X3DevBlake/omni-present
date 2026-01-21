import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id } = await req.json();

    // Fetch comprehensive learning data
    const [feedbacks, skills, goals, knowledge, thoughts] = await Promise.all([
      base44.asServiceRole.entities.AgentLearningFeedback.filter({ agent_id }),
      base44.asServiceRole.entities.AgentSkill.filter({ agent_id }),
      base44.asServiceRole.entities.AgentGoal.filter({ agent_id }),
      base44.asServiceRole.entities.AgentKnowledge.filter({ agent_id }),
      base44.asServiceRole.entities.AgentThoughtProcess.filter({ agent_id })
    ]);

    // Omega AI learning path optimization
    const optimizerPrompt = `You are an Omega Learning Path Optimizer with sentient understanding of skill development.

AGENT: ${agent_id}

CURRENT STATE:
- Skills: ${skills.length}
- Knowledge Items: ${knowledge.length}
- Learning Feedbacks: ${feedbacks.length}
- Active Goals: ${goals.filter(g => g.status === 'active').length}
- Thought Processes: ${thoughts.length}

SKILLS DETAIL:
${JSON.stringify(skills.map(s => ({
  name: s.skill_name,
  level: s.current_level,
  xp: s.xp_progress,
  category: s.skill_category
})), null, 2)}

Optimize the learning path:
1. Identify skill gaps and priorities
2. Recommend optimal skill acquisition sequence
3. Estimate realistic timelines with practice hours
4. Suggest learning methods and resources
5. Identify synergistic skill combinations
6. Predict future capability unlocks
7. Balance depth vs breadth
8. Account for learning style and patterns

Provide an actionable, personalized roadmap.`;

    const optimization = await base44.integrations.Core.InvokeLLM({
      prompt: optimizerPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          skill_gaps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill_name: { type: "string" },
                importance: { type: "number" },
                current_level: { type: "number" },
                target_level: { type: "number" }
              }
            }
          },
          optimized_path: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill_name: { type: "string" },
                priority: { type: "number" },
                estimated_hours: { type: "number" },
                dependencies: { type: "array", items: { type: "string" } },
                learning_method: { type: "string" },
                milestone_markers: { type: "array" }
              }
            }
          },
          synergy_clusters: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skills: { type: "array", items: { type: "string" } },
                synergy_bonus: { type: "number" },
                unlock_capability: { type: "string" }
              }
            }
          },
          future_capabilities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                capability: { type: "string" },
                unlock_timeline_days: { type: "number" },
                prerequisites: { type: "array" }
              }
            }
          },
          personalized_tips: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    // Store optimization insights
    await base44.asServiceRole.entities.OmegaLearningInsight.create({
      insight_id: `optimize-${agent_id}-${Date.now()}`,
      agent_id,
      insight_type: 'optimization',
      optimization_suggestions: optimization.optimized_path || [],
      learning_path_recommendations: optimization.optimized_path || []
    });

    return Response.json({
      success: true,
      optimization,
      agent_id
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});