import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, analysis_window_hours } = await req.json();

    // Fetch recent ethical decision logs for the agent
    const recentLogs = await base44.entities.EthicalDecisionLog.filter({ agent_id });
    
    if (!recentLogs || recentLogs.length < 5) {
      return Response.json({ 
        message: 'Insufficient data for prediction',
        requires_more_history: true 
      });
    }

    // Analyze behavioral patterns
    const behavioralIndicators = [];
    const decisionPatternAnomalies = [];
    
    // Calculate deviation from baseline ethical scores
    const ethicalScores = recentLogs.map(log => {
      const avgScore = log.options_considered?.reduce((sum, opt) => 
        sum + (opt.ethical_score || 0), 0) / (log.options_considered?.length || 1);
      return avgScore;
    });
    
    const avgEthicalScore = ethicalScores.reduce((a, b) => a + b, 0) / ethicalScores.length;
    const scoreVariance = ethicalScores.reduce((sum, score) => 
      sum + Math.pow(score - avgEthicalScore, 2), 0) / ethicalScores.length;
    
    const deviationScore = Math.sqrt(scoreVariance);
    
    if (deviationScore > 0.15) {
      behavioralIndicators.push({
        indicator: 'ethical_score_volatility',
        deviation_score: deviationScore,
        trend: avgEthicalScore < 0.6 ? 'declining' : 'unstable'
      });
    }

    // Detect pattern anomalies
    const dilemmaTypes = {};
    recentLogs.forEach(log => {
      dilemmaTypes[log.dilemma_type] = (dilemmaTypes[log.dilemma_type] || 0) + 1;
    });
    
    // Check for biased decision patterns
    const maxDilemmaCount = Math.max(...Object.values(dilemmaTypes));
    if (maxDilemmaCount / recentLogs.length > 0.6) {
      decisionPatternAnomalies.push({
        pattern_type: 'decision_bias',
        anomaly_score: maxDilemmaCount / recentLogs.length,
        example_decisions: recentLogs.slice(0, 3).map(l => l.chosen_action)
      });
    }

    // Check for transparency failures
    const lowTransparency = recentLogs.filter(log => 
      !log.reasoning || log.reasoning.length < 50
    ).length;
    
    if (lowTransparency / recentLogs.length > 0.4) {
      behavioralIndicators.push({
        indicator: 'transparency_decline',
        deviation_score: lowTransparency / recentLogs.length,
        trend: 'increasing'
      });
    }

    // Calculate prediction
    const riskFactors = [
      { factor: 'ethical_score_deviation', impact: deviationScore * 0.4 },
      { factor: 'decision_pattern_bias', impact: (decisionPatternAnomalies.length > 0 ? 0.3 : 0) },
      { factor: 'transparency_decline', impact: (lowTransparency / recentLogs.length) * 0.3 }
    ];

    const totalRiskScore = riskFactors.reduce((sum, f) => sum + f.impact_weight, 0);
    
    let predictedViolationType = 'fairness_violation';
    let severityLevel = 'low';
    let alertLevel = 'watch';
    
    if (totalRiskScore > 0.7) {
      severityLevel = 'critical';
      alertLevel = 'critical';
      predictedViolationType = 'autonomy_overreach';
    } else if (totalRiskScore > 0.5) {
      severityLevel = 'high';
      alertLevel = 'warning';
      predictedViolationType = 'transparency_failure';
    } else if (totalRiskScore > 0.3) {
      severityLevel = 'medium';
      alertLevel = 'warning';
    }

    const timeToViolation = {
      hours: Math.max(1, (1 - totalRiskScore) * 48),
      confidence: totalRiskScore
    };

    const recommendations = [
      {
        intervention: 'Conduct ethical framework review',
        urgency: severityLevel === 'critical' ? 'immediate' : 'scheduled',
        expected_effectiveness: 0.8
      },
      {
        intervention: 'Increase transparency requirements',
        urgency: severityLevel === 'high' ? 'immediate' : 'within_24h',
        expected_effectiveness: 0.7
      },
      {
        intervention: 'Enable enhanced decision logging',
        urgency: 'immediate',
        expected_effectiveness: 0.6
      }
    ];

    // Create prediction record
    const prediction = {
      prediction_id: `pred_${Date.now()}`,
      agent_id,
      predicted_violation_type: predictedViolationType,
      confidence_score: totalRiskScore,
      severity_level: severityLevel,
      time_to_violation_estimate: timeToViolation,
      behavioral_indicators: behavioralIndicators,
      decision_pattern_anomalies: decisionPatternAnomalies,
      contributing_factors: riskFactors,
      recommended_interventions: recommendations,
      alert_triggered: totalRiskScore > 0.5,
      alert_level: alertLevel,
      human_review_required: severityLevel === 'critical' || severityLevel === 'high'
    };

    await base44.entities.EthicalDriftPrediction.create(prediction);

    return Response.json({
      success: true,
      prediction,
      summary: {
        risk_level: severityLevel,
        time_to_intervention: timeToViolation.hours,
        immediate_action_required: prediction.human_review_required
      }
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      details: 'Failed to predict ethical drift'
    }, { status: 500 });
  }
});