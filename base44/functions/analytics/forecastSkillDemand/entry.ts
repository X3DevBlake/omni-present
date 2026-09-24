import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, forecast_months = 6 } = await req.json();

    // Get agent's skill evolution
    const metrics = await base44.asServiceRole.entities.AgentPerformanceMetrics.filter({
      agent_id
    });

    // Get marketplace trends
    const profiles = await base44.asServiceRole.entities.AgentMarketplaceProfile.list('', 100);

    const skillData = metrics[0]?.skill_evolution || [];
    
    // AI-powered skill demand forecasting
    const forecast = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze skill trends and forecast future demand.
      
      Current Agent Skills:
      ${JSON.stringify(skillData, null, 2)}
      
      Market Context:
      - Total marketplace agents: ${profiles.length}
      - Forecast period: ${forecast_months} months
      
      For each skill:
      1. Analyze current proficiency and growth rate
      2. Predict future market demand
      3. Identify emerging complementary skills
      4. Recommend skill development priorities
      
      Return comprehensive forecast as JSON.`,
      response_json_schema: {
        type: "object",
        properties: {
          skill_forecasts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill_name: { type: "string" },
                current_level: { type: "number" },
                trend_direction: { type: "string" },
                future_demand_forecast: { type: "number" },
                demand_growth_rate: { type: "number" },
                recommended_priority: { type: "string" }
              }
            }
          },
          emerging_skills: {
            type: "array",
            items: { type: "string" }
          },
          market_insights: { type: "string" }
        }
      }
    });

    // Update analytics with skill trends
    const analytics = await base44.asServiceRole.entities.AgentPerformanceAnalytics.create({
      agent_id,
      time_period: new Date().toISOString().split('T')[0],
      skill_trends: forecast.skill_forecasts,
      task_completion_rate: metrics[0]?.task_completion_rate || 0,
      communication_efficiency: 80,
      collaboration_effectiveness: 75,
      burnout_risk_score: 30,
      suggested_interventions: []
    });

    return Response.json({ 
      success: true,
      forecast,
      analytics
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});