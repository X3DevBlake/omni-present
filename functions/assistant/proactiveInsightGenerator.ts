import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { context_data, spatial_location } = await req.json();

    // Gather user context
    const userActivities = await base44.entities.UserActivity.filter({ 
      user_id: user.id 
    });

    // AI-powered insight generation
    const insightPrompt = `You are a proactive omni-present AI assistant. Analyze the user's context and generate actionable insights:

User: ${user.full_name}
Recent activities: ${JSON.stringify(userActivities.slice(0, 5))}
Current context: ${JSON.stringify(context_data)}
Spatial location: ${JSON.stringify(spatial_location)}

Generate 3 proactive insights with:
1. insight_type (predictive_alert, optimization_suggestion, learning_opportunity, risk_warning, efficiency_tip, contextual_recommendation)
2. insight_text (actionable message)
3. confidence (0-1)
4. suggested_actions (array of actions user can take)
5. urgency_level (low, medium, high, critical)`;

    const insights = await base44.integrations.Core.InvokeLLM({
      prompt: insightPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          insights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                insight_type: { type: "string" },
                insight_text: { type: "string" },
                confidence: { type: "number" },
                suggested_actions: { type: "array" },
                urgency_level: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Create insight records
    const createdInsights = [];
    for (const insight of insights.insights || []) {
      const record = await base44.asServiceRole.entities.ProactiveInsightGeneration.create({
        insight_id: `insight_${Date.now()}_${Math.random()}`,
        user_id: user.id,
        insight_type: insight.insight_type,
        insight_text: insight.insight_text,
        confidence: insight.confidence,
        context_json: context_data || {},
        suggested_actions: insight.suggested_actions || [],
        urgency_level: insight.urgency_level,
        spatial_context: spatial_location ? {
          environment_id: spatial_location.environment_id,
          location: spatial_location.coordinates
        } : null,
        user_response: "pending"
      });
      createdInsights.push(record);
    }

    return Response.json({
      success: true,
      insights: createdInsights,
      count: createdInsights.length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});