export default async function agentPerformancePrediction(data, context) {
  const { agent_id, prediction_horizon_days = 7 } = data;
  
  const historicalKPIs = await context.entities.AgentKPI.filter({ agent_id }).sort('-created_date').limit(30);
  const interactions = await context.entities.AgentInteractionLog.filter({ agent_id }).sort('-created_date').limit(100);
  const trainingHistory = await context.entities.AgentTrainingSession.filter({ agent_id });
  
  if (historicalKPIs.length < 5) {
    return { error: 'Insufficient historical data for prediction' };
  }
  
  const performanceTrend = historicalKPIs.map((kpi, i) => ({
    day: i,
    success_rate: kpi.success_rate,
    efficiency: kpi.efficiency,
    tasks_completed: kpi.tasks_completed
  }));
  
  const recentTraining = trainingHistory.filter(t => {
    const trainDate = new Date(t.created_date);
    const daysAgo = (Date.now() - trainDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 30;
  });
  
  const prediction = await context.integrations.Core.InvokeLLM({
    prompt: `Predict agent performance for next ${prediction_horizon_days} days:

Historical Performance (last 30 periods):
${performanceTrend.slice(0, 10).map(p => `Day ${p.day}: Success ${p.success_rate}%, Efficiency ${p.efficiency}, Tasks ${p.tasks_completed}`).join('\n')}

Recent Training: ${recentTraining.length} sessions completed
Total Interactions: ${interactions.length}
Success Rate Trend: ${performanceTrend[0]?.success_rate > performanceTrend[9]?.success_rate ? 'Improving' : 'Declining'}

Predict:
1. Daily success rate for next ${prediction_horizon_days} days
2. Expected task completion rate
3. Efficiency trends
4. Potential performance bottlenecks
5. Recommended interventions`,
    response_json_schema: {
      type: "object",
      properties: {
        daily_predictions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              day: { type: "number" },
              predicted_success_rate: { type: "number" },
              predicted_efficiency: { type: "number" },
              predicted_tasks: { type: "number" },
              confidence: { type: "number" }
            }
          }
        },
        overall_trend: { type: "string", enum: ["improving", "stable", "declining"] },
        bottlenecks: { type: "array", items: { type: "string" } },
        interventions: { type: "array", items: { type: "string" } },
        risk_factors: { type: "array", items: { type: "string" } }
      }
    }
  });
  
  await context.entities.PredictiveAnalytic.create({
    entity_type: 'agent',
    entity_id: agent_id,
    prediction_type: 'performance',
    predictions: prediction.daily_predictions,
    confidence_level: prediction.daily_predictions.reduce((sum, p) => sum + p.confidence, 0) / prediction.daily_predictions.length,
    generated_at: new Date().toISOString()
  });
  
  return {
    predictions: prediction,
    horizon_days: prediction_horizon_days,
    data_points_used: historicalKPIs.length
  };
}