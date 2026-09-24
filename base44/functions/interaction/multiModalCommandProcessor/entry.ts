import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      interaction_type, // "gesture", "voice", "gaze", "thought"
      input_data,
      spatial_context 
    } = await req.json();

    let interpretedIntent = "";
    let executedAction = "";
    let confidence = 0;

    if (interaction_type === "gesture") {
      // Process gesture command
      const gesturePrompt = `Interpret this gesture command in a 3D spatial environment:

Gesture Type: ${input_data.gesture_type}
Start: ${JSON.stringify(input_data.start_point)}
End: ${JSON.stringify(input_data.end_point)}
Spatial Context: ${JSON.stringify(spatial_context)}

What is the user trying to do? Return intent and suggested action.`;

      const interpretation = await base44.integrations.Core.InvokeLLM({
        prompt: gesturePrompt,
        response_json_schema: {
          type: "object",
          properties: {
            intent: { type: "string" },
            action: { type: "string" },
            confidence: { type: "number" }
          }
        }
      });

      interpretedIntent = interpretation.intent;
      executedAction = interpretation.action;
      confidence = interpretation.confidence;

      // Log gesture command
      await base44.asServiceRole.entities.GestureCommand.create({
        command_id: `gesture_${Date.now()}_${Math.random()}`,
        user_id: user.id,
        gesture_type: input_data.gesture_type,
        gesture_data: input_data,
        spatial_context,
        interpreted_intent: interpretedIntent,
        executed_action: executedAction,
        confidence,
        success: true,
        timestamp: new Date().toISOString()
      });

    } else if (interaction_type === "voice") {
      // Process voice command
      const voicePrompt = `Process this voice command in context:

Transcript: "${input_data.transcript}"
Spatial Context: ${JSON.stringify(spatial_context)}

Extract intent, entities, and determine the appropriate action.`;

      const voiceInterpretation = await base44.integrations.Core.InvokeLLM({
        prompt: voicePrompt,
        response_json_schema: {
          type: "object",
          properties: {
            intent: { type: "string" },
            entities: { type: "array" },
            action: { type: "object" },
            response_text: { type: "string" },
            confidence: { type: "number" }
          }
        }
      });

      interpretedIntent = voiceInterpretation.intent;
      executedAction = JSON.stringify(voiceInterpretation.action);
      confidence = voiceInterpretation.confidence;

      // Log voice command
      await base44.asServiceRole.entities.VoiceCommand.create({
        command_id: `voice_${Date.now()}_${Math.random()}`,
        user_id: user.id,
        audio_transcript: input_data.transcript,
        audio_url: input_data.audio_url || "",
        language_detected: input_data.language || "en-US",
        intent: interpretedIntent,
        entities_extracted: voiceInterpretation.entities || [],
        spatial_context,
        executed_action: voiceInterpretation.action,
        response_text: voiceInterpretation.response_text,
        confidence,
        timestamp: new Date().toISOString()
      });
    }

    // Generate proactive insight based on command
    await base44.functions.invoke('proactiveInsightGenerator', {
      context_data: {
        interaction_type,
        interpreted_intent,
        executed_action
      },
      spatial_location: spatial_context
    });

    return Response.json({
      success: true,
      intent: interpretedIntent,
      action: executedAction,
      confidence,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});