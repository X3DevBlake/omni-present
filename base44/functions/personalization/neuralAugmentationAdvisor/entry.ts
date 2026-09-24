import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === 'generate_strategy') {
      // Get user's biometric and cognitive data
      const biometrics = await base44.entities.BiometricDataStream.filter({ 
        user_id: user.id 
      }).limit(10);

      const consciousnessMirror = await base44.entities.ConsciousnessMirrorSnapshot.filter({ 
        user_id: user.id 
      }).limit(10);

      // Calculate baseline
      const avgFocus = consciousnessMirror.length > 0
        ? consciousnessMirror.reduce((sum, c) => sum + (c.cognitive_state?.focus_level || 0), 0) / consciousnessMirror.length
        : 0.7;

      const avgStress = biometrics.length > 0
        ? biometrics.reduce((sum, b) => sum + (b.stress_indicators?.stress_score || 0), 0) / biometrics.length
        : 0.3;

      // AI personalized strategy
      const strategyRecommendation = await base44.integrations.Core.InvokeLLM({
        prompt: `User has avg focus=${avgFocus}, avg stress=${avgStress}. Create personalized neural augmentation strategy with 3 specific goals, 3 augmentation recommendations, and training protocol. Be specific and actionable.`,
        response_json_schema: {
          type: 'object',
          properties: {
            goals: { type: 'array', items: { type: 'object' } },
            augmentations: { type: 'array', items: { type: 'object' } },
            training_exercises: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      const strategy = await base44.entities.NeuralAugmentationStrategy.create({
        user_id: user.id,
        biometric_baseline: {
          cognitive_performance: avgFocus,
          stress_resilience: 1 - avgStress,
          focus_capacity: avgFocus,
          emotional_stability: 0.7 + Math.random() * 0.3
        },
        personalized_goals: strategyRecommendation.goals.map(g => ({
          goal_area: g.goal_area || g.area || 'cognitive_enhancement',
          target_improvement_percent: g.improvement || 15,
          timeline_days: g.timeline || 30
        })),
        augmentation_recommendations: strategyRecommendation.augmentations,
        neural_training_protocol: {
          training_exercises: strategyRecommendation.training_exercises,
          frequency: 'daily',
          difficulty_progression: 'adaptive',
          neurofeedback_enabled: true
        },
        continuous_monitoring_plan: {
          metrics_tracked: ['focus_level', 'stress_score', 'cognitive_load'],
          alert_thresholds: { focus_drop: 0.3, stress_spike: 0.7 },
          reporting_frequency: 'hourly'
        },
        ai_personalization: {
          learning_rate_adjustment: 1.0,
          adaptive_difficulty: true,
          personalized_feedback: true
        },
        progress_tracking: [],
        strategy_status: 'active'
      });

      return Response.json({
        success: true,
        strategy: strategy,
        goals: strategyRecommendation.goals.length,
        message: 'Personalized neural augmentation strategy created'
      });
    }

    if (action === 'track_progress') {
      const { strategy_id, current_metrics } = await req.json();

      const strategies = await base44.entities.NeuralAugmentationStrategy.filter({ strategy_id });
      const strategy = strategies[0];

      if (!strategy) {
        return Response.json({ error: 'Strategy not found' }, { status: 404 });
      }

      const progressEntry = {
        date: new Date().toISOString().split('T')[0],
        metrics: current_metrics,
        improvements: {
          focus_improvement: ((current_metrics.focus - strategy.biometric_baseline.cognitive_performance) / strategy.biometric_baseline.cognitive_performance) * 100,
          stress_reduction: ((strategy.biometric_baseline.stress_resilience - (1 - current_metrics.stress)) / strategy.biometric_baseline.stress_resilience) * 100
        }
      };

      await base44.entities.NeuralAugmentationStrategy.update(strategy.id, {
        progress_tracking: [...(strategy.progress_tracking || []), progressEntry]
      });

      return Response.json({
        success: true,
        progress: progressEntry,
        on_track: progressEntry.improvements.focus_improvement > 0
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});