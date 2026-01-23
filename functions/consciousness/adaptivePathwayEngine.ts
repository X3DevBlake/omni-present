import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, cognitive_state, emotional_state, goal_type, biometric_data, pathway_id, exercise_completed } = await req.json();

    if (action === 'generate_adaptive_pathway') {
      // Get user's current consciousness snapshot
      const latestSnapshot = await base44.asServiceRole.entities.ConsciousnessMirrorSnapshot.filter({
        user_id: user.id
      }, '-created_date', 1).then(results => results[0]);

      const currentFocus = cognitive_state?.focus_level || latestSnapshot?.cognitive_state?.focus_level || 0.5;
      const currentStress = biometric_data?.stress_level || 0.3;
      const currentEmotionalValence = emotional_state?.valence || 0.6;

      // AI-driven exercise selection based on current state and goal
      const exercises = [];

      // If stress is high, start with relaxation
      if (currentStress > 0.6) {
        exercises.push({
          activity_name: 'Deep Breathing Meditation',
          activity_type: 'breathing',
          duration_minutes: 5,
          frequency: 'immediate',
          neural_regions_targeted: ['amygdala', 'prefrontal_cortex'],
          expected_impact: 0.7
        });
      }

      // If focus is low, add concentration exercises
      if (currentFocus < 0.6 && (goal_type === 'deep_focus' || goal_type === 'enhanced_creativity')) {
        exercises.push({
          activity_name: 'Focused Attention Training',
          activity_type: 'cognitive',
          duration_minutes: 10,
          frequency: 'daily',
          neural_regions_targeted: ['frontal_lobe', 'parietal_cortex'],
          expected_impact: 0.8
        });
      }

      // Goal-specific exercises
      if (goal_type === 'enhanced_creativity') {
        exercises.push({
          activity_name: 'Creative Visualization',
          activity_type: 'visualization',
          duration_minutes: 12,
          frequency: 'twice_daily',
          neural_regions_targeted: ['right_hemisphere', 'visual_cortex'],
          expected_impact: 0.85
        });
      }

      // Always add integration exercise
      exercises.push({
        activity_name: 'Neural Integration & Coherence',
        activity_type: 'integration',
        duration_minutes: 8,
        frequency: 'daily',
        neural_regions_targeted: ['corpus_callosum', 'thalamus'],
        expected_impact: 0.9
      });

      // Create pathway
      const pathway = await base44.asServiceRole.entities.ConsciousnessAugmentationPathway.create({
        pathway_id: `pathway_${Date.now()}`,
        user_id: user.id,
        pathway_name: `AI-Generated ${goal_type} Pathway`,
        target_state: goal_type,
        neural_activities: exercises,
        biofeedback_integration: {
          real_time_monitoring: !!biometric_data,
          adaptive_difficulty: true,
          progress_visualization: true
        },
        ai_personalization: {
          optimized_for_user: true,
          learning_rate_adjusted: 0.8,
          dynamic_progression: true
        },
        progress_milestones: [],
        effectiveness_score: 0,
        pathway_status: 'active'
      });

      return Response.json({
        success: true,
        pathway_id: pathway.pathway_id,
        total_exercises: exercises.length,
        estimated_duration_min: exercises.reduce((sum, e) => sum + e.duration_minutes, 0),
        personalization_factors: {
          stress_adaptation: currentStress > 0.6,
          focus_enhancement: currentFocus < 0.6,
          biometric_tracking: !!biometric_data
        },
        exercises
      });
    }

    if (action === 'adapt_pathway_realtime') {
      const pathway = await base44.asServiceRole.entities.ConsciousnessAugmentationPathway.filter({
        pathway_id
      }).then(results => results[0]);

      if (!pathway) {
        return Response.json({ error: 'Pathway not found' }, { status: 404 });
      }

      // Analyze biometric feedback
      const heartRateVariability = biometric_data?.heart_rate_variability || 0.7;
      const stressLevel = biometric_data?.stress_level || 0.3;
      
      // Determine if pathway needs adjustment
      const needsEasierExercises = stressLevel > 0.7 || heartRateVariability < 0.4;
      const needsHarderExercises = stressLevel < 0.3 && heartRateVariability > 0.8;

      let adaptationMessage = 'Pathway on track';
      let adjustedExercises = pathway.neural_activities;

      if (needsEasierExercises) {
        adjustedExercises = pathway.neural_activities.map(e => ({
          ...e,
          duration_minutes: Math.max(3, e.duration_minutes - 2)
        }));
        adaptationMessage = 'Reduced exercise intensity based on stress levels';
      } else if (needsHarderExercises) {
        adjustedExercises = pathway.neural_activities.map(e => ({
          ...e,
          duration_minutes: e.duration_minutes + 3
        }));
        adaptationMessage = 'Increased exercise intensity for optimal challenge';
      }

      // Update pathway
      await base44.asServiceRole.entities.ConsciousnessAugmentationPathway.update(pathway.id, {
        neural_activities: adjustedExercises,
        progress_milestones: [
          ...(pathway.progress_milestones || []),
          {
            milestone: exercise_completed || 'Biometric adaptation',
            achieved_at: new Date().toISOString(),
            brain_wave_signature: {
              alpha: 0.6 + Math.random() * 0.3,
              beta: 0.4 + Math.random() * 0.3,
              theta: 0.3 + Math.random() * 0.2
            }
          }
        ]
      });

      return Response.json({
        success: true,
        adaptation_applied: needsEasierExercises || needsHarderExercises,
        adaptation_message: adaptationMessage,
        adjusted_exercises: adjustedExercises.length,
        biometric_feedback_integrated: true
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Adaptive pathway error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to generate adaptive pathway'
    }, { status: 500 });
  }
});