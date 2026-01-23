import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === 'capture_biometrics') {
      const { augmentation_id } = await req.json();

      // Simulate real-time biometric data capture
      const biometricStream = await base44.entities.BiometricDataStream.create({
        user_id: user.id,
        augmentation_id: augmentation_id,
        vital_signs: {
          heart_rate_bpm: 60 + Math.random() * 40,
          blood_pressure_systolic: 110 + Math.random() * 30,
          blood_pressure_diastolic: 70 + Math.random() * 20,
          oxygen_saturation: 95 + Math.random() * 5,
          body_temperature_celsius: 36.5 + Math.random() * 1,
          respiratory_rate: 12 + Math.random() * 8
        },
        stress_indicators: {
          cortisol_level: Math.random() * 20,
          adrenaline_level: Math.random() * 15,
          stress_score: Math.random() * 0.6,
          fatigue_level: Math.random() * 0.5
        },
        metabolic_data: {
          glucose_level: 80 + Math.random() * 40,
          hydration_status: 0.6 + Math.random() * 0.4,
          caloric_burn_rate: 1500 + Math.random() * 1000,
          metabolic_rate: 1.2 + Math.random() * 0.5
        },
        cellular_health: {
          inflammation_markers: Math.random() * 5,
          oxidative_stress: Math.random() * 0.4,
          cellular_regeneration_rate: 0.7 + Math.random() * 0.3,
          mitochondrial_efficiency: 0.8 + Math.random() * 0.2
        },
        neural_activity: {
          brain_wave_alpha: 8 + Math.random() * 4,
          brain_wave_beta: 12 + Math.random() * 18,
          brain_wave_theta: 4 + Math.random() * 4,
          neural_inflammation: Math.random() * 0.2
        },
        performance_metrics: {
          strength_index: 0.7 + Math.random() * 0.3,
          endurance_index: 0.65 + Math.random() * 0.35,
          reaction_time_ms: 150 + Math.random() * 100,
          recovery_rate: 0.75 + Math.random() * 0.25
        }
      });

      // AI Health Analysis
      const healthAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze these biometric readings and provide health insights: Heart Rate: ${biometricStream.vital_signs.heart_rate_bpm}, O2: ${biometricStream.vital_signs.oxygen_saturation}%, Stress: ${biometricStream.stress_indicators.stress_score}. Give overall health score (0-1), detect any anomalies, and provide 2 recommendations.`,
        response_json_schema: {
          type: 'object',
          properties: {
            overall_health_score: { type: 'number' },
            anomalies_detected: { type: 'array', items: { type: 'string' } },
            recommendations: { type: 'array', items: { type: 'string' } },
            intervention_needed: { type: 'boolean' }
          }
        }
      });

      await base44.entities.BiometricDataStream.update(biometricStream.id, {
        ai_health_analysis: healthAnalysis
      });

      return Response.json({
        success: true,
        biometric_data: biometricStream,
        health_analysis: healthAnalysis
      });
    }

    if (action === 'get_health_trends') {
      const streams = await base44.entities.BiometricDataStream.filter({
        user_id: user.id
      }).limit(50);

      const avgHealthScore = streams.length > 0
        ? streams.reduce((sum, s) => sum + (s.ai_health_analysis?.overall_health_score || 0), 0) / streams.length
        : 0;

      return Response.json({
        success: true,
        streams: streams,
        average_health: avgHealthScore,
        total_readings: streams.length
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});