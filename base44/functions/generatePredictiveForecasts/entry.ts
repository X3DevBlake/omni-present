import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { metric_type, forecast_days } = await req.json();

    // Fetch historical data
    const kpis = await base44.asServiceRole.entities.AgentKPI.list('-created_date', 50);

    if (kpis.length < 10) {
      return Response.json({ 
        error: 'Insufficient data for forecasting',
        required: 10,
        available: kpis.length 
      }, { status: 400 });
    }

    // Simple linear regression forecast
    const values = kpis.map(k => k[metric_type] || 0).reverse();
    const n = values.length;
    
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((sum, v) => sum + v, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (values[i] - yMean);
      denominator += Math.pow(i - xMean, 2);
    }
    
    const slope = numerator / denominator;
    const intercept = yMean - slope * xMean;

    // Generate forecast
    const forecast = [];
    for (let i = 0; i < forecast_days; i++) {
      const predictedValue = slope * (n + i) + intercept;
      forecast.push({
        day: i + 1,
        predicted_value: Math.max(0, predictedValue),
        confidence: Math.max(0.5, 1 - (i / forecast_days) * 0.5), // Confidence decreases over time
      });
    }

    // Calculate trend
    const trend = slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable';
    const trendStrength = Math.abs(slope) > 1 ? 'strong' : Math.abs(slope) > 0.3 ? 'moderate' : 'weak';

    return Response.json({
      success: true,
      metric: metric_type,
      current_value: values[values.length - 1],
      forecast,
      trend: {
        direction: trend,
        strength: trendStrength,
        slope: slope.toFixed(3),
      },
      recommendations: generateRecommendations(trend, trendStrength, metric_type),
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateRecommendations(trend, strength, metric) {
  const recommendations = [];

  if (trend === 'decreasing' && strength !== 'weak') {
    recommendations.push({
      priority: 'high',
      action: `${metric} is declining - consider retraining agents or adjusting parameters`,
      expected_impact: '+15-25% improvement',
    });
  }

  if (trend === 'increasing' && strength === 'strong') {
    recommendations.push({
      priority: 'medium',
      action: 'Positive trend detected - consider scaling operations',
      expected_impact: 'Maximize growth potential',
    });
  }

  return recommendations;
}