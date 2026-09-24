import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === 'create_goal') {
      const { goal_type, target_level, timeline_days } = await req.json();

      // Get user's baseline
      const snapshots = await base44.entities.ConsciousnessMirrorSnapshot.filter({ 
        user_id: user.id 
      }).limit(10);

      const avgFocus = snapshots.length > 0
        ? snapshots.reduce((sum, s) => sum + (s.cognitive_state?.focus_level || 0), 0) / snapshots.length
        : 0.7;

      const avgStress = snapshots.length > 0
        ? snapshots.reduce((sum, s) => sum + (s.physiological_correlates?.cortisol_level || 0.3), 0) / snapshots.length
        : 0.3;

      // AI personalized recommendations
      const recommendations = await base44.integrations.Core.InvokeLLM({
        prompt: `User wants to ${goal_type} from current level ${goal_type === 'increase_focus' ? avgFocus : avgStress} to target ${target_level} in ${timeline_days} days. Generate 5 specific, actionable recommendations with priority, expected impact (0-1), and implementation difficulty (easy/medium/hard).`,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  recommendation: { type: 'string' },
                  priority: { type: 'number' },
                  expected_impact: { type: 'number' },
                  implementation_difficulty: { type: 'string' }
                }
              }
            }
          }
        }
      });

      const goal = await base44.entities.CognitiveGoal.create({
        user_id: user.id,
        goal_type: goal_type,
        target_metrics: {
          target_focus_level: goal_type === 'increase_focus' ? target_level : avgFocus,
          target_stress_level: goal_type === 'reduce_stress' ? target_level : avgStress,
          target_mental_clarity: 0.85,
          target_emotional_stability: 0.8
        },
        baseline_measurements: {
          initial_focus: avgFocus,
          initial_stress: avgStress,
          initial_clarity: 0.7,
          measurement_date: new Date().toISOString()
        },
        ai_recommendations: recommendations.recommendations,
        progress_tracking: [],
        interventions_applied: [],
        timeline_days: timeline_days,
        goal_status: 'active'
      });

      return Response.json({
        success: true,
        goal: goal,
        recommendations: recommendations.recommendations,
        message: `Goal created with ${recommendations.recommendations.length} AI recommendations`
      });
    }

    if (action === 'update_progress') {
      const { goal_id } = await req.json();

      const goals = await base44.entities.CognitiveGoal.filter({ goal_id });
      const goal = goals[0];

      if (!goal) {
        return Response.json({ error: 'Goal not found' }, { status: 404 });
      }

      // Get latest consciousness data
      const latestSnapshot = (await base44.entities.ConsciousnessMirrorSnapshot.filter({ 
        user_id: user.id 
      }).limit(1))[0];

      if (!latestSnapshot) {
        return Response.json({ error: 'No consciousness data available' }, { status: 404 });
      }

      const currentFocus = latestSnapshot.cognitive_state?.focus_level || 0;
      const baselineFocus = goal.baseline_measurements.initial_focus;
      const targetFocus = goal.target_metrics.target_focus_level;

      const improvement = ((currentFocus - baselineFocus) / (targetFocus - baselineFocus)) * 100;

      const progressEntry = {
        date: new Date().toISOString(),
        current_metrics: {
          focus: currentFocus,
          stress: latestSnapshot.physiological_correlates?.cortisol_level || 0,
          clarity: latestSnapshot.cognitive_state?.mental_clarity || 0
        },
        improvement_percent: improvement,
        notes: `Progress update at day ${Math.floor((Date.now() - new Date(goal.created_date).getTime()) / (1000 * 60 * 60 * 24))}`
      };

      await base44.entities.CognitiveGoal.update(goal.id, {
        progress_tracking: [...(goal.progress_tracking || []), progressEntry],
        goal_status: improvement >= 100 ? 'achieved' : 'in_progress'
      });

      return Response.json({
        success: true,
        progress: progressEntry,
        goal_status: improvement >= 100 ? 'achieved' : 'in_progress'
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});