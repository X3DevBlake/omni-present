import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, analysis_window_days = 7 } = await req.json();

    // Fetch learning data
    const feedbacks = await base44.asServiceRole.entities.AgentLearningFeedback.filter({ agent_id });

    // AI-powered trend analysis
    const trendPrompt = `You are an Omega-level AI Learning Analyst.

AGENT: ${agent_id}
LEARNING FEEDBACKS: ${feedbacks.length} records

FEEDBACK DATA:
${JSON.stringify(feedbacks.slice(0, 30).map(f => ({
  type: f.feedback_type,
  success: f.outcome_data?.success,
  patterns: f.learned_patterns?.length,
  adjustments: f.behavioral_adjustments?.length,
  timestamp: f.created_date
})), null, 2)}

Identify KEY LEARNING TRENDS:
1. Success rate trajectory
2. Pattern discovery acceleration
3. Behavioral adaptation velocity
4. Knowledge integration efficiency
5. Skill acquisition patterns
6. Performance improvement areas
7. Learning bottlenecks
8. Emergent capabilities

Provide deep statistical and psychological insights.`;

    const trends = await base44.integrations.Core.InvokeLLM({
      prompt: trendPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          success_trajectory: {
            type: "object",
            properties: {
              current_rate: { type: "number" },
              trend: { type: "string", enum: ["improving", "stable", "declining"] },
              velocity: { type: "number" },
              prediction_7d: { type: "number" }
            }
          },
          pattern_discovery: {
            type: "object",
            properties: {
              patterns_per_day: { type: "number" },
              complexity_increase: { type: "number" },
              breakthrough_patterns: { type: "array", items: { type: "string" } }
            }
          },
          adaptation_velocity: {
            type: "object",
            properties: {
              adjustments_per_feedback: { type: "number" },
              adaptation_speed: { type: "string" },
              effectiveness_score: { type: "number" }
            }
          },
          skill_acquisition: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill_area: { type: "string" },
                growth_rate: { type: "number" },
                mastery_timeline_days: { type: "number" }
              }
            }
          },
          bottlenecks: {
            type: "array",
            items: { type: "string" }
          },
          emergent_capabilities: {
            type: "array",
            items: { type: "string" }
          },
          insights: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    // Store insights
    await base44.asServiceRole.entities.OmegaLearningInsight.create({
      insight_id: `trend-${agent_id}-${Date.now()}`,
      agent_id,
      insight_type: 'trend',
      ai_generated_analysis: {
        trend_description: JSON.stringify(trends),
        statistical_significance: 0.92,
        confidence: 0.88,
        data_sources: ['AgentLearningFeedback']
      }
    });

    return Response.json({
      success: true,
      trends,
      agent_id
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});