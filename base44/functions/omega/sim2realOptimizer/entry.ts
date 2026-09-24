import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { session_id, real_world_feedback } = await req.json();

    // Fetch training session
    const sessions = await base44.entities.Sim2RealTrainingSession.filter({ session_id });
    const session = sessions[0];

    if (!session) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    // Self-optimizing loop based on real-world feedback
    const current_performance = session.reality_gap_metrics?.real_performance || 0.5;
    const feedback_score = real_world_feedback?.success_rate || 0;

    // Calculate performance gap
    const performance_gap = Math.abs(current_performance - feedback_score);

    // Adaptive hyperparameter tuning
    const current_policy = session.policy_training || {};
    let optimized_params = {
      learning_rate: current_policy.learning_rate || 0.0003,
      discount_factor: 0.99,
      entropy_coefficient: 0.01
    };

    if (performance_gap > 0.2) {
      // Large gap - aggressive optimization
      optimized_params.learning_rate *= 1.5;
      optimized_params.entropy_coefficient *= 1.3;
    } else if (performance_gap > 0.1) {
      // Medium gap - moderate adjustment
      optimized_params.learning_rate *= 1.2;
    } else {
      // Small gap - fine-tuning
      optimized_params.learning_rate *= 0.95;
      optimized_params.entropy_coefficient *= 0.9;
    }

    // Domain randomization adjustment
    const domain_config = session.domain_randomization_config || {};
    const optimized_randomization = {
      ...domain_config,
      randomization_strength: Math.min(1, (domain_config.randomization_strength || 0.5) + (performance_gap * 0.3))
    };

    // Update session with optimized parameters
    await base44.asServiceRole.entities.Sim2RealTrainingSession.update(session.id, {
      policy_training: {
        ...current_policy,
        ...optimized_params,
        training_iterations: (current_policy.training_iterations || 0) + 1000
      },
      domain_randomization_config: optimized_randomization,
      reality_gap_metrics: {
        ...session.reality_gap_metrics,
        real_performance: feedback_score,
        gap_size: performance_gap,
        optimization_iteration: (session.reality_gap_metrics?.optimization_iteration || 0) + 1
      }
    });

    // Log learning milestone
    if (performance_gap < 0.05) {
      await base44.asServiceRole.entities.UserNotification.create({
        notification_id: `notif_milestone_${Date.now()}`,
        user_email: user.email,
        notification_type: 'learning_milestone',
        priority: 'medium',
        title: 'Sim2Real Convergence Achieved',
        message: `Agent training session ${session_id} achieved <5% reality gap. Ready for deployment.`,
        source_module: 'sim2real_optimizer'
      });
    }

    return Response.json({
      success: true,
      performance_gap,
      optimized_params,
      optimization_iteration: session.reality_gap_metrics?.optimization_iteration + 1 || 1,
      deployment_ready: performance_gap < 0.05
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});