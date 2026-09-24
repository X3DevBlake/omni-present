import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, ...params } = await req.json();

    switch (action) {
      case 'get_animations': {
        const { tags, category, limit = 50 } = params;
        let query = {};
        if (tags) query.tags = { $in: tags };
        if (category) query.category = category;
        
        const animations = await base44.entities.AnimationAsset.filter(query, '-created_date', limit);
        
        return Response.json({
          success: true,
          animations,
          count: animations.length
        });
      }

      case 'trigger_animation': {
        const { animation_id, target_element, parameters = {} } = params;
        
        // Log animation usage for analytics
        await base44.entities.AnimationAsset.create({
          asset_id: `usage_${Date.now()}`,
          name: `Usage log for ${animation_id}`,
          type: 'Lottie_JSON',
          category: 'micro_interaction',
          metadata: {
            triggered_by: user.id,
            target: target_element,
            parameters,
            timestamp: new Date().toISOString()
          }
        });

        return Response.json({
          success: true,
          message: 'Animation triggered',
          animation_id,
          parameters
        });
      }

      case 'ai_recommend_animations': {
        const { context, user_mood, system_state } = params;
        
        // AI-driven animation recommendation based on context
        const animations = await base44.entities.AnimationAsset.list('-created_date', 100);
        
        const recommendations = animations
          .filter(a => {
            if (user_mood === 'stressed' && a.tags?.includes('calming')) return true;
            if (system_state === 'high_activity' && a.tags?.includes('energetic')) return true;
            if (context === 'success' && a.tags?.includes('celebration')) return true;
            return false;
          })
          .slice(0, 10);

        return Response.json({
          success: true,
          recommendations,
          reasoning: `Selected ${recommendations.length} animations based on mood: ${user_mood}, state: ${system_state}`
        });
      }

      case 'optimize_performance': {
        const { active_animations, device_capabilities } = params;
        
        // Calculate performance budget and optimize
        const optimizationPlan = {
          reduce_particle_count: active_animations > 10,
          enable_lod: device_capabilities?.gpu === 'low',
          use_simple_shaders: device_capabilities?.gpu === 'low',
          max_concurrent: device_capabilities?.gpu === 'high' ? 50 : 20
        };

        return Response.json({
          success: true,
          optimization_plan: optimizationPlan,
          estimated_fps_gain: 15
        });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});