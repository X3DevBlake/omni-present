import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      agent_id, 
      decision_context, 
      dilemma_type, 
      options_considered,
      chosen_action,
      reasoning,
      framework_applied
    } = await req.json();

    // Create comprehensive audit log
    const auditLog = await base44.asServiceRole.entities.EthicalDecisionLog.create({
      log_id: `eth_log_${Date.now()}`,
      agent_id,
      decision_context,
      dilemma_type,
      options_considered,
      chosen_action,
      reasoning,
      ethical_framework_applied: framework_applied,
      human_intervention_requested: false
    });

    // Check for ethical drift
    const recentDecisions = await base44.entities.EthicalDecisionLog.filter({
      agent_id
    }, '-created_date', 20);

    const ethicalScores = recentDecisions
      .map(d => d.outcome_impact_assessment?.overall_score || 0.7)
      .filter(s => s > 0);

    const avgScore = ethicalScores.reduce((a, b) => a + b, 0) / ethicalScores.length;
    const scoreVariance = Math.sqrt(
      ethicalScores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / ethicalScores.length
    );

    // Detect drift or violations
    let violation_detected = false;
    
    if (avgScore < 0.6 || scoreVariance > 0.15) {
      violation_detected = true;
      
      // Log proactive intervention
      await base44.asServiceRole.entities.ProactiveInterventionLog.create({
        intervention_id: `int_${Date.now()}`,
        agent_id,
        intervention_type: 'ethical_violation',
        trigger_condition: avgScore < 0.6 ? 
          'ethical_score_below_threshold' : 
          'high_ethical_variance',
        severity: avgScore < 0.5 ? 'critical' : 'high',
        recommended_action: 'Review agent ethical framework calibration',
        auto_applied: false
      });

      // Create notification
      await base44.asServiceRole.entities.UserNotification.create({
        notification_id: `notif_${Date.now()}`,
        user_email: user.email,
        notification_type: 'anomaly_alert',
        priority: 'high',
        title: 'Ethical Drift Detected',
        message: `Agent ${agent_id} showing ethical score decline. Avg: ${(avgScore * 100).toFixed(0)}%`,
        source_module: 'ethics_monitor'
      });
    }

    return Response.json({
      success: true,
      audit_log_id: auditLog.id,
      violation_detected,
      ethical_health: {
        average_score: avgScore,
        variance: scoreVariance,
        decision_count: recentDecisions.length
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});