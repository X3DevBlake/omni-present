import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === 'generate_pathway') {
      const { target_state } = await req.json();

      // Get user's current cognitive profile
      const snapshots = await base44.entities.ConsciousnessMirrorSnapshot.filter({ 
        user_id: user.id 
      }).limit(5);

      const avgFocus = snapshots.length > 0
        ? snapshots.reduce((sum, s) => sum + (s.cognitive_state?.focus_level || 0), 0) / snapshots.length
        : 0.7;

      // AI-personalized pathway
      const pathwayPlan = await base44.integrations.Core.InvokeLLM({
        prompt: `User wants to achieve ${target_state} from current focus level ${avgFocus}. Create a personalized consciousness augmentation pathway with 7 neural activities (meditation, neurofeedback, cognitive exercises, etc.). Each activity should target specific brain regions, have duration, frequency, and expected impact (0-1).`,
        response_json_schema: {
          type: 'object',
          properties: {
            pathway_name: { type: 'string' },
            activities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  activity_name: { type: 'string' },
                  activity_type: { type: 'string' },
                  duration_minutes: { type: 'number' },
                  frequency: { type: 'string' },
                  neural_regions_targeted: { type: 'array', items: { type: 'string' } },
                  expected_impact: { type: 'number' }
                }
              }
            }
          }
        }
      });

      const pathway = await base44.entities.ConsciousnessAugmentationPathway.create({
        user_id: user.id,
        pathway_name: pathwayPlan.pathway_name,
        target_state: target_state,
        neural_activities: pathwayPlan.activities,
        biofeedback_integration: {
          real_time_monitoring: true,
          adaptive_difficulty: true,
          progress_visualization: true
        },
        ai_personalization: {
          optimized_for_user: true,
          learning_rate_adjusted: 1.0 + (avgFocus - 0.7) * 0.5,
          dynamic_progression: true
        },
        progress_milestones: [],
        effectiveness_score: 0,
        pathway_status: 'active'
      });

      return Response.json({
        success: true,
        pathway: pathway,
        activities_count: pathwayPlan.activities.length,
        estimated_days: Math.ceil(pathwayPlan.activities.reduce((sum, a) => sum + a.duration_minutes, 0) / 60)
      });
    }

    if (action === 'track_progress') {
      const { pathway_id, activity_completed } = await req.json();

      const pathways = await base44.entities.ConsciousnessAugmentationPathway.filter({ pathway_id });
      const pathway = pathways[0];

      if (!pathway) {
        return Response.json({ error: 'Pathway not found' }, { status: 404 });
      }

      // Get latest brain state
      const latestSnapshot = (await base44.entities.ConsciousnessMirrorSnapshot.filter({ 
        user_id: user.id 
      }).limit(1))[0];

      const milestone = {
        milestone: activity_completed,
        achieved_at: new Date().toISOString(),
        brain_wave_signature: latestSnapshot?.brain_wave_patterns || {}
      };

      await base44.entities.ConsciousnessAugmentationPathway.update(pathway.id, {
        progress_milestones: [...(pathway.progress_milestones || []), milestone],
        effectiveness_score: (pathway.progress_milestones?.length + 1) / pathway.neural_activities.length
      });

      return Response.json({
        success: true,
        milestone: milestone,
        progress_percent: ((pathway.progress_milestones?.length + 1) / pathway.neural_activities.length * 100).toFixed(0)
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});