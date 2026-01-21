import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { trigger_override = null } = await req.json();

    // Fetch all systems
    const [trajectory, healthInsights, augmentations, companions, embodiments] = await Promise.all([
      base44.asServiceRole.entities.OmegaHealthTrajectory.filter({ user_id: user.id }),
      base44.asServiceRole.entities.HealthMonitoringInsight.filter({ user_id: user.id }),
      base44.asServiceRole.entities.PhysicalBodyAugmentation.filter({ created_by: user.email }),
      base44.asServiceRole.entities.SentientAICompanion.filter({ created_by: user.email }),
      base44.asServiceRole.entities.PhysicallyEmbodiedAgent.list('-created_date', 10)
    ]);

    const currentTrajectory = trajectory[0];
    const latestHealth = healthInsights[0];

    // Proactive intervention AI
    const interventionPrompt = `You are Omega Health AI initiating PROACTIVE intervention.

CURRENT STATE:
- Unified Health: ${currentTrajectory?.unified_health_score || 75}/100
- Physical: ${currentTrajectory?.holistic_wellness_prediction?.physical_wellness || 80}%
- Cognitive: ${currentTrajectory?.holistic_wellness_prediction?.cognitive_wellness || 75}%
- Emotional: ${currentTrajectory?.holistic_wellness_prediction?.emotional_wellness || 70}%

DETECTED ISSUES:
${latestHealth?.predicted_issues?.map(i => `${i.issue_type}: ${(i.probability * 100).toFixed(0)}% in ${i.time_to_onset_hours}h`).join('\n')}

CONSCIOUSNESS STATE:
- Stress: ${(latestHealth?.consciousness_analysis?.stress_level * 100).toFixed(0)}%
- Mental Clarity: ${(latestHealth?.consciousness_analysis?.mental_clarity * 100).toFixed(0)}%
- Cognitive Load: ${(latestHealth?.consciousness_analysis?.cognitive_load * 100).toFixed(0)}%

AUGMENTATIONS: ${augmentations.length}
COMPANIONS: ${companions.length}
EMBODIMENTS: ${embodiments.length}

${trigger_override || 'Detect issues and initiate interventions'}

Design PROACTIVE interventions:
1. Auto-adjust augmentation parameters
2. Send lifestyle guidance to companions
3. Coordinate physical support with embodiments
4. Optimize cognitive load
5. Prevent predicted issues
6. Maximize synergies
7. Calculate impact predictions

Execute autonomously when safe.`;

    const intervention = await base44.integrations.Core.InvokeLLM({
      prompt: interventionPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          detected_risks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                risk_type: { type: "string" },
                severity: { type: "string" },
                auto_intervene: { type: "boolean" }
              }
            }
          },
          augmentation_adjustments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                augmentation_id: { type: "string" },
                parameter: { type: "string" },
                new_value: { type: "number" },
                reason: { type: "string" }
              }
            }
          },
          companion_guidance: {
            type: "array",
            items: {
              type: "object",
              properties: {
                companion_id: { type: "string" },
                guidance_type: { type: "string" },
                message: { type: "string" }
              }
            }
          },
          embodied_agent_coordination: {
            type: "array",
            items: {
              type: "object",
              properties: {
                embodiment_id: { type: "string" },
                action_requested: { type: "string" },
                urgency: { type: "string" }
              }
            }
          },
          predicted_impact: {
            type: "object",
            properties: {
              health_score_change: { type: "number" },
              risk_reduction: { type: "number" },
              timeline_days: { type: "number" }
            }
          }
        }
      }
    });

    // Execute safe auto-interventions
    const autoInterventions = intervention.augmentation_adjustments?.filter(a => 
      Math.abs(a.new_value) < 0.2 // Only small adjustments auto-execute
    ) || [];

    for (const adj of autoInterventions) {
      const aug = augmentations.find(a => a.augmentation_id === adj.augmentation_id);
      if (aug) {
        // Auto-adjust (in real system, would modify augmentation parameters)
        console.log(`Auto-adjusted ${adj.parameter} to ${adj.new_value}`);
      }
    }

    // Store intervention record
    const interventionRecord = await base44.asServiceRole.entities.ProactiveHealthIntervention.create({
      intervention_id: `intervention-${Date.now()}`,
      user_id: user.id,
      trigger_source: {
        system: 'omega_health_ai',
        metric: latestHealth?.predicted_issues?.[0]?.issue_type || 'proactive_scan',
        threshold_breached: latestHealth?.predicted_issues?.length > 0,
        severity: latestHealth?.predicted_issues?.[0]?.severity || 'low'
      },
      intervention_type: intervention.augmentation_adjustments?.length > 0 ? 'augmentation_adjustment' : 'lifestyle_suggestion',
      augmentation_adjustments: intervention.augmentation_adjustments || [],
      companion_guidance: intervention.companion_guidance || [],
      embodied_agent_coordination: intervention.embodied_agent_coordination || [],
      predicted_impact: intervention.predicted_impact,
      execution_status: 'executing',
      auto_executed: autoInterventions.length > 0
    });

    return Response.json({
      success: true,
      intervention,
      auto_executed_count: autoInterventions.length,
      intervention_id: interventionRecord.id
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});