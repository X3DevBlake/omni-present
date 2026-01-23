import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { biometric_data, current_ui_state } = await req.json();

    // Analyze biometric data to determine cognitive state
    let cognitiveState = "focused";
    const heartRate = biometric_data.heart_rate || 70;
    const stressLevel = biometric_data.stress_level || 0.3;
    const focusScore = biometric_data.focus_score || 0.7;

    if (stressLevel > 0.7) cognitiveState = "stressed";
    else if (focusScore > 0.8) cognitiveState = "flow_state";
    else if (focusScore < 0.4) cognitiveState = "distracted";
    else if (heartRate < 60) cognitiveState = "fatigued";

    // AI-powered adaptation recommendations
    const adaptationPrompt = `You are an adaptive UI controller. Based on this user's biometric state, recommend UI and environmental adaptations:

Cognitive State: ${cognitiveState}
Heart Rate: ${heartRate}
Stress Level: ${stressLevel}
Focus Score: ${focusScore}
Current UI: ${JSON.stringify(current_ui_state)}

Suggest specific adaptations to optimize user experience.`;

    const adaptations = await base44.integrations.Core.InvokeLLM({
      prompt: adaptationPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          adaptations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                adaptation_type: { type: "string" },
                parameter_changes: { type: "object" },
                reasoning: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Create adaptation event record
    const event = await base44.asServiceRole.entities.BiometricAdaptationEvent.create({
      event_id: `adaptation_${Date.now()}_${Math.random()}`,
      user_id: user.id,
      biometric_snapshot: {
        heart_rate: heartRate,
        heart_rate_variability: biometric_data.hrv || 50,
        stress_level: stressLevel,
        focus_score: focusScore,
        emotional_valence: biometric_data.emotional_valence || 0.5,
        arousal_level: biometric_data.arousal || 0.5,
        brainwave_pattern: biometric_data.brainwave_pattern || "beta"
      },
      cognitive_state: cognitiveState,
      adaptations_applied: adaptations.adaptations || [],
      spatial_environment_id: current_ui_state?.environment_id || "default",
      timestamp: new Date().toISOString()
    });

    // Apply adaptations
    const uiChanges = {};
    for (const adaptation of adaptations.adaptations || []) {
      switch (adaptation.adaptation_type) {
        case "ui_simplification":
          uiChanges.complexity_level = "minimal";
          uiChanges.animation_speed = 0.5;
          break;
        case "color_adjustment":
          uiChanges.color_temperature = cognitiveState === "stressed" ? "cool" : "warm";
          uiChanges.saturation = cognitiveState === "fatigued" ? 0.7 : 1.0;
          break;
        case "pacing_slowdown":
          uiChanges.transition_duration = 800;
          uiChanges.auto_advance_disabled = true;
          break;
        case "break_suggestion":
          uiChanges.show_break_reminder = true;
          break;
      }
    }

    return Response.json({
      success: true,
      cognitive_state: cognitiveState,
      adaptations_applied: adaptations.adaptations || [],
      ui_changes: uiChanges,
      event_id: event.id
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});