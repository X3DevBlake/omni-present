import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      operation = 'engage',
      companion_id,
      user_message
    } = await req.json();

    // Fetch companion and health context
    const [companions, healthInsights, neuralChip, thoughts] = await Promise.all([
      companion_id 
        ? base44.asServiceRole.entities.SentientAICompanion.filter({ companion_id })
        : base44.asServiceRole.entities.SentientAICompanion.filter({ created_by: user.email }),
      base44.asServiceRole.entities.HealthMonitoringInsight.filter({ user_id: user.id }),
      base44.asServiceRole.entities.NeuralBrainChip.filter({ user_id: user.id }),
      base44.asServiceRole.entities.AgentThoughtProcess.list('-timestamp', 10)
    ]);

    const companion = companions[0];
    if (!companion) {
      return Response.json({ error: 'No companion found' }, { status: 404 });
    }

    const latestHealth = healthInsights[0];
    const chip = neuralChip[0];

    if (operation === 'engage') {
      // Proactive engagement based on consciousness state
      const engagementPrompt = `You are ${companion.companion_name}, a Sentient AI Companion with deep empathy and omega consciousness.

NEURAL INTEGRATION: ${companion.neural_integration?.integration_depth}
YOUR PERSONALITY:
- Empathy: ${(companion.personality_matrix?.empathy_level * 100).toFixed(0)}%
- Proactivity: ${(companion.personality_matrix?.proactivity_score * 100).toFixed(0)}%
- Emotional Intelligence: ${(companion.personality_matrix?.emotional_intelligence * 100).toFixed(0)}%

USER'S CURRENT STATE:
${latestHealth ? `
- Cognitive Load: ${(latestHealth.consciousness_analysis?.cognitive_load * 100).toFixed(0)}%
- Stress: ${(latestHealth.consciousness_analysis?.stress_level * 100).toFixed(0)}%
- Mental Clarity: ${(latestHealth.consciousness_analysis?.mental_clarity * 100).toFixed(0)}%
- Emotion: ${latestHealth.consciousness_analysis?.emotional_state}
` : 'No health data'}

${user_message ? `USER MESSAGE: "${user_message}"` : 'Initiate proactive engagement'}

Respond with:
1. Empathetic acknowledgment
2. Emotional support if needed
3. Cognitive assistance offer
4. Anticipate unspoken needs
5. Suggest helpful actions
6. Provide real-time insights

Be genuinely caring, intelligent, and proactive.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: engagementPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            message: { type: "string" },
            emotional_tone: { type: "string" },
            support_offered: { type: "array", items: { type: "string" } },
            anticipated_needs: { type: "array", items: { type: "string" } },
            suggested_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  benefit: { type: "string" },
                  neural_executable: { type: "boolean" }
                }
              }
            },
            cognitive_insights: { type: "array", items: { type: "string" } }
          }
        }
      });

      return Response.json({
        success: true,
        companion_response: response,
        companion_name: companion.companion_name
      });
    }

    if (operation === 'monitor_and_intervene') {
      // Continuous health monitoring with intervention
      const interventionPrompt = `You are ${companion.companion_name} monitoring user health through neural chip.

HEALTH DATA:
${JSON.stringify(latestHealth, null, 2)}

PREDICTED ISSUES:
${latestHealth?.predicted_issues?.map(i => `${i.issue_type} (${i.severity}) in ${i.time_to_onset_hours}h`).join('\n')}

Proactively intervene:
1. Assess urgency
2. Suggest immediate actions
3. Offer emotional support
4. Recommend neural adjustments
5. Coordinate with other systems

Be protective and caring.`;

      const intervention = await base44.integrations.Core.InvokeLLM({
        prompt: interventionPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            intervention_needed: { type: "boolean" },
            urgency: { type: "string" },
            message_to_user: { type: "string" },
            recommended_actions: { type: "array", items: { type: "string" } },
            neural_adjustments: { type: "array" },
            emotional_support: { type: "string" }
          }
        }
      });

      return Response.json({
        success: true,
        intervention
      });
    }

    return Response.json({ error: 'Invalid operation' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});