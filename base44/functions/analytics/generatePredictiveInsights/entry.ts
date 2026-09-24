import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { metric_names, forecast_days = 7 } = await req.json();
    
    // Get historical metrics
    const allMetrics = await base44.entities.AnalyticsMetric.list();
    
    const insights = [];
    
    for (const metric_name of metric_names || []) {
      const metricData = allMetrics.filter(m => m.metric_name === metric_name);
      
      if (metricData.length === 0) continue;
      
      const latestMetric = metricData[0];
      const timeSeries = latestMetric.time_series_data || [];
      
      // AI-powered prediction
      const prediction = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this time series data and predict the next ${forecast_days} days:
        
        Metric: ${metric_name}
        Current Value: ${latestMetric.current_value}
        Historical Data: ${JSON.stringify(timeSeries.slice(-30))}
        Trend: ${latestMetric.trend_direction}
        
        Provide forecasted values, confidence levels, and identify any anomalies or concerning trends.`,
        response_json_schema: {
          type: "object",
          properties: {
            forecasted_values: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  value: { type: "number" },
                  confidence: { type: "number" }
                }
              }
            },
            trend_analysis: { type: "string" },
            anomalies_detected: { type: "array", items: { type: "string" } },
            recommended_actions: { type: "array", items: { type: "string" } }
          }
        }
      });
      
      // Update metric with prediction
      await base44.entities.AnalyticsMetric.update(latestMetric.id, {
        prediction: {
          next_value: prediction.forecasted_values[0]?.value,
          confidence: prediction.forecasted_values[0]?.confidence,
          prediction_date: new Date(Date.now() + 86400000).toISOString()
        }
      });
      
      insights.push({
        metric_name,
        current_value: latestMetric.current_value,
        prediction: prediction.forecasted_values[0],
        trend_analysis: prediction.trend_analysis,
        anomalies: prediction.anomalies_detected,
        recommendations: prediction.recommended_actions
      });
    }
    
    return Response.json({
      insights,
      forecast_period_days: forecast_days,
      generated_at: new Date().toISOString()
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});