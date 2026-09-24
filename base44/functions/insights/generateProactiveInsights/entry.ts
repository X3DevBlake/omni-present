import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const insights = [];

    const criticalThreats = await base44.entities.ThreatIntelligence.filter({
      severity_level: 'critical',
      threat_status: { $ne: 'resolved' }
    }, '-created_date', 5);

    if (criticalThreats.length > 0) {
      insights.push({
        user_id: user.id,
        insight_type: 'warning',
        title: '🚨 Critical Security Threats Detected',
        message: `${criticalThreats.length} critical security threat(s) require immediate attention`,
        data_sources: ['ThreatIntelligence'],
        confidence: 0.98,
        urgency: 'critical',
        suggested_actions: [{
          action: 'Review and mitigate threats',
          target_page: 'SecurityComplianceHub'
        }]
      });
    }

    const predictions = await base44.entities.PredictiveAnalytics.list('-created_date', 5);
    if (predictions.length > 0) {
      const latestPrediction = predictions[0];
      insights.push({
        user_id: user.id,
        insight_type: 'trend',
        title: '📈 New Predictions Available',
        message: `${latestPrediction.analytics_name} has generated new forecasts with ${(latestPrediction.accuracy_metrics?.prediction_accuracy * 100).toFixed(0)}% accuracy`,
        data_sources: ['PredictiveAnalytics'],
        confidence: latestPrediction.accuracy_metrics?.prediction_accuracy || 0.8,
        urgency: 'medium',
        suggested_actions: [{
          action: 'View predictions',
          target_page: 'AnalyticsIntelligenceHub'
        }]
      });
    }

    const recentAchievements = await base44.entities.UserAchievement.filter(
      { created_by: user.email },
      '-created_date',
      3
    );

    if (recentAchievements.length > 0) {
      insights.push({
        user_id: user.id,
        insight_type: 'celebration',
        title: '🎉 New Achievement Unlocked!',
        message: `Congratulations! You've earned: ${recentAchievements[0].achievement_name || 'Achievement'}`,
        data_sources: ['UserAchievement'],
        confidence: 1.0,
        urgency: 'low',
        suggested_actions: [{
          action: 'View achievements',
          target_page: 'Profile'
        }]
      });
    }

    const workspaces = await base44.entities.CollaborativeWorkspace.list('-updated_date', 10);
    const activeWorkspaces = workspaces.filter(w => w.participants?.some(p => p.participant_id === user.id && p.active));

    if (activeWorkspaces.length > 3) {
      insights.push({
        user_id: user.id,
        insight_type: 'opportunity',
        title: '🤝 High Collaboration Activity',
        message: `You're active in ${activeWorkspaces.length} collaborative workspaces. Consider creating a dynamic team.`,
        data_sources: ['CollaborativeWorkspace'],
        confidence: 0.87,
        urgency: 'medium',
        suggested_actions: [{
          action: 'Form dynamic team',
          target_page: 'CollaborationOrchestrationHub'
        }]
      });
    }

    const anomalies = await base44.entities.AnomalyDetector.list('-created_date', 5);
    const activeAnomalies = anomalies.flatMap(a => a.anomalies_detected?.filter(an => !an.resolved) || []);

    if (activeAnomalies.length > 5) {
      insights.push({
        user_id: user.id,
        insight_type: 'anomaly',
        title: '⚠️ Multiple Anomalies Detected',
        message: `${activeAnomalies.length} anomalies detected across your systems`,
        data_sources: ['AnomalyDetector'],
        confidence: 0.91,
        urgency: 'high',
        suggested_actions: [{
          action: 'Investigate anomalies',
          target_page: 'AnalyticsIntelligenceHub'
        }]
      });
    }

    const createdInsights = [];
    for (const insight of insights) {
      const created = await base44.entities.ProactiveInsight.create({
        ...insight,
        expires_at: new Date(Date.now() + 24 * 3600000).toISOString()
      });
      createdInsights.push(created);
    }

    return Response.json({
      success: true,
      insights: createdInsights,
      count: createdInsights.length,
      message: `Generated ${createdInsights.length} proactive insights`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});