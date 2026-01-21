import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companion_id, training_focus = 'complex_emotions' } = await req.json();

    const [companion, bond, healthInsights, sensorData, neuralChip] = await Promise.all([
      base44.asServiceRole.entities.SentientAICompanion.filter({ companion_id }),
      base44.asServiceRole.entities.CompanionEmotionalBond.filter({ companion_id }),
      base44.asServiceRole.entities.HealthMonitoringInsight.filter({ user_id: user.id }),
      base44.asServiceRole.entities.SensorData.list('-reading_timestamp', 20),
      base44.asServiceRole.entities.NeuralBrainChip.filter({ user_id: user.id })
    ]);

    const companionEntity = companion[0];
    const bondEntity = bond[0];
    const latestHealth = healthInsights[0];

    const trainingPrompt = `You are training ${companionEntity?.companion_name} in advanced emotional intelligence.

TRAINING FOCUS: ${training_focus}

CURRENT EMOTIONAL IQ: ${(companionEntity?.personality_matrix?.emotional_intelligence * 100).toFixed(0)}%

PHYSIOLOGICAL SIGNALS AVAILABLE:
${latestHealth?.consciousness_analysis ? `
- Stress Level: ${(latestHealth.consciousness_analysis.stress_level * 100).toFixed(0)}%
- Cognitive Load: ${(latestHealth.consciousness_analysis.cognitive_load * 100).toFixed(0)}%
- Mental Clarity: ${(latestHealth.consciousness_analysis.mental_clarity * 100).toFixed(0)}%
- Emotional State: ${latestHealth.consciousness_analysis.emotional_state}
` : 'No data'}

MOTOR CONTROL (fatigue indicator):
${latestHealth?.motor_control_metrics?.fatigue_level ? `${(latestHealth.motor_control_metrics.fatigue_level * 100).toFixed(0)}%` : 'No data'}

RECENT INTERACTIONS:
${bondEntity?.interaction_history?.slice(-10).map(i => `${i.interaction_type}: sentiment=${i.user_sentiment}, resonance=${i.emotional_resonance}`).join('\n')}

ENVIRONMENTAL SENSORS:
${sensorData.slice(0, 5).map(s => `${s.sensor_type}: ${s.reading_value}${s.unit}`).join(', ')}

Train companion to:
1. Interpret physiological signals accurately
2. Detect linguistic nuances and subtext
3. Recognize complex emotional clusters
4. Identify early crisis indicators
5. Time interventions perfectly
6. Correlate environment with emotions
7. Predict emotional needs
8. Respond with perfect empathy

Provide training improvements.`;

    const training = await base44.integrations.Core.InvokeLLM({
      prompt: trainingPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          physiological_signal_integration: {
            type: "object",
            properties: {
              heart_rate_interpretation: { type: "number" },
              stress_hormone_detection: { type: "number" },
              neural_activity_correlation: { type: "number" },
              fatigue_recognition: { type: "number" }
            }
          },
          linguistic_analysis_skills: {
            type: "object",
            properties: {
              sentiment_granularity: { type: "number" },
              subtext_detection: { type: "number" },
              tone_interpretation: { type: "number" },
              cultural_context_awareness: { type: "number" }
            }
          },
          complex_emotional_states: {
            type: "array",
            items: {
              type: "object",
              properties: {
                emotion_cluster: { type: "string" },
                recognition_accuracy: { type: "number" },
                response_strategies: { type: "array", items: { type: "string" } }
              }
            }
          },
          proactive_intervention_training: {
            type: "object",
            properties: {
              crisis_detection: { type: "number" },
              early_warning_sensitivity: { type: "number" },
              intervention_timing: { type: "number" }
            }
          },
          training_outcomes: {
            type: "object",
            properties: {
              empathy_improvement: { type: "number" },
              response_accuracy: { type: "number" }
            }
          }
        }
      }
    });

    await base44.asServiceRole.entities.CompanionEmotionalTraining.create({
      training_id: `training-${Date.now()}`,
      companion_id,
      training_focus,
      ...training
    });

    // Update companion emotional intelligence
    await base44.asServiceRole.entities.SentientAICompanion.update(companionEntity.id, {
      personality_matrix: {
        ...companionEntity.personality_matrix,
        emotional_intelligence: Math.min(1, (companionEntity.personality_matrix?.emotional_intelligence || 0.7) + training.training_outcomes.empathy_improvement)
      }
    });

    return Response.json({
      success: true,
      training,
      new_emotional_iq: Math.min(100, ((companionEntity.personality_matrix?.emotional_intelligence || 0.7) + training.training_outcomes.empathy_improvement) * 100)
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});