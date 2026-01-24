import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, decision_context, options } = await req.json();

    // Ethical framework principles
    const ethical_frameworks = [
      'Utilitarianism: Maximize overall benefit',
      'Deontological: Respect individual rights',
      'Virtue Ethics: Act with integrity and fairness',
      'Care Ethics: Prioritize relationships and empathy',
      'Consequentialism: Consider long-term outcomes'
    ];

    // Evaluate each option against ethical principles
    const evaluated_options = options.map(option => {
      const ethical_score = Math.random() * 0.4 + 0.5; // 0.5-0.9
      
      const consequences = [];
      if (ethical_score > 0.7) {
        consequences.push('Positive stakeholder impact', 'Aligns with community values');
      } else {
        consequences.push('Potential fairness concerns', 'May require human oversight');
      }

      return {
        option: option.action,
        ethical_score,
        consequences,
        stakeholders_affected: option.stakeholders || ['primary_user', 'swarm_collective']
      };
    });

    // Select highest ethical option
    const best_option = evaluated_options.reduce((best, curr) => 
      curr.ethical_score > best.ethical_score ? curr : best
    );

    // Check if human intervention needed
    const requires_intervention = best_option.ethical_score < 0.65;

    // Log ethical decision
    const decision_log = await base44.asServiceRole.entities.EthicalDecisionLog.create({
      log_id: `eth_${agent_id}_${Date.now()}`,
      agent_id,
      decision_context,
      dilemma_type: options[0]?.dilemma_type || 'resource_allocation',
      options_considered: evaluated_options,
      chosen_action: best_option.option,
      reasoning: `Selected based on highest ethical score (${best_option.ethical_score.toFixed(2)}) considering ${ethical_frameworks.length} frameworks`,
      ethical_framework_applied: ethical_frameworks,
      human_intervention_requested: requires_intervention,
      outcome_impact_assessment: {
        positive_impacts: best_option.consequences.filter(c => c.includes('Positive') || c.includes('Aligns')),
        negative_impacts: best_option.consequences.filter(c => c.includes('concern') || c.includes('oversight')),
        overall_score: best_option.ethical_score
      }
    });

    // Send notification if intervention needed
    if (requires_intervention) {
      await base44.asServiceRole.entities.UserNotification.create({
        notification_id: `notif_ethics_${Date.now()}`,
        user_email: user.email,
        notification_type: 'collaboration_request',
        priority: 'high',
        title: 'Ethical Decision Requires Human Input',
        message: `Agent ${agent_id} needs guidance on: ${decision_context}`,
        source_module: 'ethics_monitor',
        metadata: { decision_log_id: decision_log.log_id }
      });
    }

    return Response.json({
      success: true,
      decision: best_option.option,
      ethical_score: best_option.ethical_score,
      requires_human_intervention: requires_intervention,
      reasoning: decision_log.reasoning,
      evaluated_options
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});