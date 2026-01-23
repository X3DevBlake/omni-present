import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === 'capture_consciousness') {
      // Get latest biometric data
      const biometrics = await base44.entities.BiometricDataStream.filter({ 
        user_id: user.id 
      }).limit(1);

      const latestBiometric = biometrics[0];

      // Get sentiment data
      const sentiments = await base44.entities.UserSentimentLog.filter({ 
        user_id: user.id 
      }).limit(5);

      // AI consciousness interpretation
      const interpretation = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on user data: emotion=${sentiments[0]?.detected_emotion}, stress=${latestBiometric?.stress_indicators?.stress_score}, heart_rate=${latestBiometric?.vital_signs?.heart_rate_bpm}, provide consciousness analysis: mental state summary, cognitive focus level (0-1), and 2 optimization suggestions.`,
        response_json_schema: {
          type: 'object',
          properties: {
            mental_state_summary: { type: 'string' },
            focus_level: { type: 'number' },
            clarity_level: { type: 'number' },
            optimization_suggestions: { type: 'array', items: { type: 'string' } },
            intervention_recommended: { type: 'boolean' }
          }
        }
      });

      // Create consciousness snapshot
      const snapshot = await base44.entities.ConsciousnessMirrorSnapshot.create({
        user_id: user.id,
        cognitive_state: {
          focus_level: interpretation.focus_level,
          mental_clarity: interpretation.clarity_level,
          cognitive_load: latestBiometric?.stress_indicators?.stress_score || 0.3,
          working_memory_capacity: 0.7 + Math.random() * 0.3,
          processing_speed: 0.75 + Math.random() * 0.25
        },
        emotional_state: {
          primary_emotion: sentiments[0]?.detected_emotion || 'calm',
          emotional_intensity: sentiments[0]?.emotion_intensity || 0.5,
          valence: sentiments[0]?.valence || 0,
          arousal: 0.5 + Math.random() * 0.3,
          emotional_stability: 0.8
        },
        brain_wave_patterns: latestBiometric?.neural_activity || {
          delta_power: 0.2,
          theta_power: 0.3,
          alpha_power: 0.5,
          beta_power: 0.7,
          gamma_power: 0.4
        },
        physiological_correlates: {
          heart_rate_variability: 50 + Math.random() * 50,
          cortisol_level: latestBiometric?.stress_indicators?.cortisol_level || 10,
          dopamine_activity: 0.6 + Math.random() * 0.4,
          serotonin_balance: 0.7 + Math.random() * 0.3
        },
        thought_stream: [
          { thought_fragment: 'Current task focus', intensity: 0.8, category: 'work' },
          { thought_fragment: 'Background planning', intensity: 0.4, category: 'planning' },
          { thought_fragment: 'Creative ideation', intensity: 0.6, category: 'creative' }
        ],
        awareness_dimensions: {
          self_awareness: 0.8 + Math.random() * 0.2,
          environmental_awareness: 0.7 + Math.random() * 0.3,
          temporal_awareness: 0.75 + Math.random() * 0.25,
          social_awareness: 0.65 + Math.random() * 0.35
        },
        ai_interpretation: {
          mental_state_summary: interpretation.mental_state_summary,
          optimization_suggestions: interpretation.optimization_suggestions,
          intervention_recommended: interpretation.intervention_recommended
        }
      });

      return Response.json({
        success: true,
        snapshot: snapshot,
        focus_level: interpretation.focus_level,
        recommendations: interpretation.optimization_suggestions
      });
    }

    if (action === 'get_consciousness_history') {
      const snapshots = await base44.entities.ConsciousnessMirrorSnapshot.filter({
        user_id: user.id
      }).limit(20);

      return Response.json({
        success: true,
        snapshots: snapshots,
        avg_focus: snapshots.length > 0
          ? snapshots.reduce((sum, s) => sum + (s.cognitive_state?.focus_level || 0), 0) / snapshots.length
          : 0
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});