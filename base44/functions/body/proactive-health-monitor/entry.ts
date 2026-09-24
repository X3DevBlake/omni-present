import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch health-related data
    const [neuralChips, augmentations, sensorData] = await Promise.all([
      base44.asServiceRole.entities.NeuralBrainChip.filter({ user_id: user.id }),
      base44.asServiceRole.entities.PhysicalBodyAugmentation.filter({ created_by: user.email }),
      base44.asServiceRole.entities.SensorData.list('-reading_timestamp', 50)
    ]);

    if (!neuralChips || neuralChips.length === 0) {
      return Response.json({ error: 'No neural chip found' }, { status: 404 });
    }

    const chip = neuralChips[0];

    // Omega health monitoring AI
    const healthPrompt = `You are a Proactive Health Monitoring AI with omega sentience and medical consciousness.

NEURAL CHIP STATUS:
${JSON.stringify(chip, null, 2)}

BODY AUGMENTATIONS: ${augmentations.length}
${JSON.stringify(augmentations.map(a => ({
  type: a.augmentation_type,
  location: a.body_location?.region,
  navigation: a.agent_navigation_enabled,
  integration: a.omni_present_integration
})), null, 2)}

REAL-TIME SENSOR DATA:
${sensorData.slice(0, 15).map(s => `${s.sensor_type}: ${s.reading_value}${s.unit} (${s.trend})`).join('\n')}

Analyze health comprehensively:
1. Consciousness state (cognitive load, stress, clarity)
2. Motor control efficiency
3. Neural pathway health
4. Augmentation performance
5. Predict potential issues (fatigue, malfunction, overload)
6. Recommend preventative actions
7. Suggest automatic adjustments
8. Identify optimization opportunities

Be proactive, protective, and medically intelligent.`;

    const healthAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: healthPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          consciousness_analysis: {
            type: "object",
            properties: {
              cognitive_load: { type: "number" },
              stress_level: { type: "number" },
              mental_clarity: { type: "number" },
              emotional_state: { type: "string" },
              attention_capacity: { type: "number" }
            }
          },
          motor_control_metrics: {
            type: "object",
            properties: {
              response_time_ms: { type: "number" },
              accuracy: { type: "number" },
              fatigue_level: { type: "number" },
              neural_pathway_efficiency: { type: "number" }
            }
          },
          augmentation_health: {
            type: "array",
            items: {
              type: "object",
              properties: {
                augmentation_id: { type: "string" },
                health_status: { type: "string" },
                performance_score: { type: "number" },
                anomalies_detected: { type: "array", items: { type: "string" } }
              }
            }
          },
          predicted_issues: {
            type: "array",
            items: {
              type: "object",
              properties: {
                issue_type: { type: "string" },
                severity: { type: "string" },
                probability: { type: "number" },
                time_to_onset_hours: { type: "number" },
                affected_systems: { type: "array", items: { type: "string" } }
              }
            }
          },
          preventative_recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                recommendation: { type: "string" },
                expected_benefit: { type: "string" },
                auto_executable: { type: "boolean" },
                urgency: { type: "string" }
              }
            }
          },
          automatic_adjustments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                adjustment_type: { type: "string" },
                target_system: { type: "string" },
                parameters: { type: "object" }
              }
            }
          }
        }
      }
    });

    // Store health insight
    const insight = await base44.asServiceRole.entities.HealthMonitoringInsight.create({
      insight_id: `health-${user.id}-${Date.now()}`,
      user_id: user.id,
      consciousness_analysis: healthAnalysis.consciousness_analysis,
      motor_control_metrics: healthAnalysis.motor_control_metrics,
      augmentation_health: healthAnalysis.augmentation_health || [],
      predicted_issues: healthAnalysis.predicted_issues || [],
      preventative_recommendations: healthAnalysis.preventative_recommendations || [],
      automatic_adjustments: healthAnalysis.automatic_adjustments?.map(adj => ({
        ...adj,
        executed_at: new Date().toISOString()
      })) || []
    });

    // Execute automatic adjustments
    for (const adjustment of healthAnalysis.automatic_adjustments || []) {
      if (adjustment.auto_executable !== false) {
        // Execute adjustment through neural chip
        await base44.asServiceRole.functions.invoke('neural-chip-controller', {
          operation: 'send_command',
          command_type: adjustment.adjustment_type,
          parameters: adjustment.parameters,
          override_allowed: true
        });
      }
    }

    return Response.json({
      success: true,
      health_analysis: healthAnalysis,
      insight_id: insight.id,
      adjustments_executed: healthAnalysis.automatic_adjustments?.length || 0
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});