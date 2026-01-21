import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch ALL health data sources
    const [
      neuralChips,
      augmentations,
      healthInsights,
      companions,
      bonds,
      embodiments,
      sensorData
    ] = await Promise.all([
      base44.asServiceRole.entities.NeuralBrainChip.filter({ user_id: user.id }),
      base44.asServiceRole.entities.PhysicalBodyAugmentation.filter({ created_by: user.email }),
      base44.asServiceRole.entities.HealthMonitoringInsight.filter({ user_id: user.id }),
      base44.asServiceRole.entities.SentientAICompanion.filter({ created_by: user.email }),
      base44.asServiceRole.entities.CompanionEmotionalBond.filter({ user_id: user.id }),
      base44.asServiceRole.entities.PhysicallyEmbodiedAgent.list('-created_date', 10),
      base44.asServiceRole.entities.SensorData.list('-reading_timestamp', 30)
    ]);

    // Unified omega health analysis
    const unifiedPrompt = `You are the Omega Health AI with HOLISTIC consciousness across all health domains.

DATA INTEGRATION:
- Neural Chips: ${neuralChips.length}
- Body Augmentations: ${augmentations.length}
- AI Companions: ${companions.length}
- Emotional Bonds: ${bonds.length}
- Physical Embodiments: ${embodiments.length}

NEURAL STATE:
${neuralChips[0] ? `Consciousness Bridge: ${neuralChips[0].consciousness_bridge?.consciousness_integration_level}` : 'No chip'}

AUGMENTATION HEALTH:
${augmentations.map(a => `${a.augmentation_type} at ${a.body_location?.region}`).join('\n')}

CONSCIOUSNESS STATE:
${healthInsights[0]?.consciousness_analysis ? JSON.stringify(healthInsights[0].consciousness_analysis) : 'No data'}

COMPANION INSIGHTS:
${bonds[0] ? `Bond strength: ${bondEntity[0].bond_strength}, Trust: ${bondEntity[0].trust_level}` : 'No bond'}

PHYSICAL PERFORMANCE:
${embodiments[0]?.consciousness_embodiment_metrics ? JSON.stringify(embodiments[0].consciousness_embodiment_metrics) : 'No embodiment'}

Provide UNIFIED omega health analysis:
1. Calculate holistic health score (0-100)
2. Predict 3 health trajectories (pessimistic, realistic, optimistic)
3. Identify cross-domain synergies
4. Recommend integrated interventions (physical + cognitive)
5. Detect subtle correlations across systems
6. Predict future health outcomes
7. Suggest preventative measures
8. Optimize overall wellness

Think holistically across ALL systems.`;

    const unified = await base44.integrations.Core.InvokeLLM({
      prompt: unifiedPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          unified_health_score: { type: "number" },
          predicted_trajectories: {
            type: "array",
            items: {
              type: "object",
              properties: {
                timeline_days: { type: "number" },
                predicted_health_score: { type: "number" },
                confidence: { type: "number" },
                scenario: { type: "string" }
              }
            }
          },
          cross_domain_interventions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                intervention_name: { type: "string" },
                domains_affected: { type: "array", items: { type: "string" } },
                expected_improvement: { type: "number" },
                physical_component: { type: "string" },
                cognitive_component: { type: "string" },
                auto_executable: { type: "boolean" }
              }
            }
          },
          holistic_wellness_prediction: {
            type: "object",
            properties: {
              physical_wellness: { type: "number" },
              cognitive_wellness: { type: "number" },
              emotional_wellness: { type: "number" },
              augmentation_wellness: { type: "number" },
              overall_trend: { type: "string" }
            }
          },
          synergy_effects: {
            type: "array",
            items: {
              type: "object",
              properties: {
                synergy_type: { type: "string" },
                components: { type: "array", items: { type: "string" } },
                amplification_factor: { type: "number" }
              }
            }
          }
        }
      }
    });

    // Store trajectory
    const trajectory = await base44.asServiceRole.entities.OmegaHealthTrajectory.create({
      trajectory_id: `trajectory-${Date.now()}`,
      user_id: user.id,
      unified_health_score: unified.unified_health_score,
      integrated_data_sources: {
        neural_chip_data: neuralChips[0] || {},
        augmentation_metrics: augmentations,
        companion_observations: bonds,
        embodiment_performance: embodiments
      },
      predicted_trajectories: unified.predicted_trajectories || [],
      cross_domain_interventions: unified.cross_domain_interventions || [],
      holistic_wellness_prediction: unified.holistic_wellness_prediction,
      synergy_effects: unified.synergy_effects || []
    });

    return Response.json({
      success: true,
      unified_analysis: unified,
      trajectory_id: trajectory.id
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});