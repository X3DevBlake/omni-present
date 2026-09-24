import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === 'adapt_ui') {
      // Get user consciousness and biometric data
      const consciousness = await base44.entities.ConsciousnessMirrorSnapshot.filter({ 
        user_id: user.id 
      }).limit(1);
      
      const biometrics = await base44.entities.BiometricDataStream.filter({ 
        user_id: user.id 
      }).limit(1);

      const cogState = consciousness[0]?.cognitive_state || {};
      const emotState = consciousness[0]?.emotional_state || {};
      const stressLevel = biometrics[0]?.stress_indicators?.stress_score || 0.3;

      // AI UI adaptation strategy
      const adaptation = await base44.integrations.Core.InvokeLLM({
        prompt: `User has: focus=${cogState.focus_level}, stress=${stressLevel}, emotion=${emotState.primary_emotion}. Recommend UI adaptations: color scheme, animation intensity, information density, and cognitive assistance features.`,
        response_json_schema: {
          type: 'object',
          properties: {
            color_scheme: { type: 'string' },
            contrast_adjustment: { type: 'number' },
            animation_intensity: { type: 'string' },
            information_density: { type: 'string' },
            reduce_distractions: { type: 'boolean' }
          }
        }
      });

      const uiAdaptation = await base44.entities.DynamicUIAdaptation.create({
        user_id: user.id,
        detected_user_state: {
          cognitive_state: cogState.focus_level > 0.7 ? 'focused' : 'scattered',
          emotional_state: emotState.primary_emotion || 'calm',
          stress_level: stressLevel,
          focus_level: cogState.focus_level || 0.7,
          fatigue_level: biometrics[0]?.stress_indicators?.fatigue_level || 0.3
        },
        ui_modifications: {
          color_scheme: adaptation.color_scheme,
          contrast_level: adaptation.contrast_adjustment,
          animation_intensity: adaptation.animation_intensity,
          information_density: adaptation.information_density,
          layout_simplification: stressLevel > 0.6
        },
        cognitive_assistance: {
          reduce_distractions: adaptation.reduce_distractions,
          highlight_priorities: true,
          auto_organize_content: stressLevel > 0.5,
          predictive_shortcuts: true
        },
        accessibility_enhancements: {
          font_size_adjustment: stressLevel > 0.7 ? 1.2 : 1.0,
          reduce_motion: stressLevel > 0.8,
          high_contrast_mode: false,
          voice_navigation: false
        },
        context_optimizations: [],
        adaptation_effectiveness: 0
      });

      return Response.json({
        success: true,
        adaptation: uiAdaptation,
        recommendations: {
          color_scheme: adaptation.color_scheme,
          reduce_animations: adaptation.animation_intensity === 'low',
          simplify_layout: stressLevel > 0.6
        }
      });
    }

    if (action === 'apply_custom_behavior') {
      const { agent_id, behavioral_parameters, ethical_framework } = await req.json();

      const customBehavior = await base44.entities.CustomAgentBehavior.create({
        agent_id: agent_id,
        user_id: user.id,
        behavioral_parameters: behavioral_parameters || {
          proactiveness_level: 0.7,
          risk_tolerance: 0.5,
          creativity_factor: 0.8,
          social_engagement: 0.6,
          autonomy_level: 0.7
        },
        communication_style: {
          formality: 0.5,
          verbosity: 'moderate',
          tone: 'friendly',
          humor_frequency: 0.3,
          empathy_expression: 0.8
        },
        decision_making_rules: [
          { rule_name: 'high_risk_approval', condition: 'risk > 0.7', action: 'request_approval', priority: 1 },
          { rule_name: 'auto_optimize', condition: 'efficiency < 0.8', action: 'self_optimize', priority: 2 }
        ],
        ethical_framework_custom: ethical_framework || {
          core_values: ['transparency', 'user_benefit', 'safety'],
          ethical_priorities: ['user_wellbeing', 'data_privacy', 'fairness'],
          conflict_resolution_approach: 'balanced',
          transparency_level: 0.9
        },
        learning_preferences: {
          learning_rate: 0.8,
          exploration_vs_exploitation: 0.6,
          knowledge_sharing_willingness: 0.9,
          autonomous_skill_acquisition: true
        },
        interaction_boundaries: {
          max_autonomy_scope: 'supervised',
          requires_approval_for: ['high_risk_trades', 'system_changes'],
          forbidden_actions: ['unauthorized_data_access'],
          intervention_thresholds: { performance_drop: 0.2 }
        },
        training_history: []
      });

      // Apply to agent
      await base44.entities.Agent.update(agent_id, {
        custom_behavior_id: customBehavior.behavior_id
      });

      return Response.json({
        success: true,
        custom_behavior: customBehavior,
        message: 'Agent behavior customized successfully'
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});