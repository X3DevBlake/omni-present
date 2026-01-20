import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, voice_data, text_input, behavioral_context } = await req.json();

    // Use AI for sentiment analysis and emotion detection
    const emotionAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze user emotion and determine appropriate agent response:

Voice sentiment indicators: ${voice_data || 'none'}
Text input: "${text_input || 'none'}"
Behavioral context: ${JSON.stringify(behavioral_context || {})}

Perform analysis:
1. primary_emotion (detected main emotion)
2. emotion_intensity (0-1 scale)
3. secondary_emotions (array of {emotion, intensity})
4. tone_analysis (describe tone)
5. agent_response_tone (how agent should respond)
6. suggested_actions (physical or verbal actions)
7. device_commands (smart device commands to issue)
8. comfort_level (how much comfort/engagement needed)`,
      response_json_schema: {
        type: "object",
        properties: {
          primary_emotion: { "type": "string" },
          emotion_intensity: { "type": "number" },
          secondary_emotions: {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                emotion: { "type": "string" },
                intensity: { "type": "number" }
              }
            }
          },
          tone_analysis: { "type": "string" },
          agent_response_tone: { "type": "string" },
          suggested_actions: { "type": "array", "items": { "type": "string" } },
          device_commands: {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                device_type: { "type": "string" },
                command: { "type": "string" },
                reason: { "type": "string" }
              }
            }
          },
          comfort_level: { "type": "string" }
        }
      }
    });

    // Record emotion detection
    const emotionRecord = await base44.entities.AgentEmotion.create({
      emotion_id: `emotion_${Date.now()}`,
      agent_id,
      detected_from_user: true,
      emotion_source: voice_data ? 'voice' : text_input ? 'text' : 'behavioral',
      primary_emotion: emotionAnalysis.primary_emotion,
      emotion_intensity: emotionAnalysis.emotion_intensity,
      secondary_emotions: emotionAnalysis.secondary_emotions,
      raw_analysis: {
        voice_sentiment: voice_data ? 0.7 : null,
        text_sentiment: text_input ? 0.6 : null,
        tone_analysis: emotionAnalysis.tone_analysis,
        context_clues: behavioral_context?.clues || []
      },
      agent_response_triggered: {
        response_type: emotionAnalysis.agent_response_tone,
        tone_adjustment: emotionAnalysis.agent_response_tone,
        actions_taken: emotionAnalysis.suggested_actions,
        device_commands_issued: emotionAnalysis.device_commands.map(c => c.device_type)
      },
      confidence_score: emotionAnalysis.emotion_intensity
    });

    // Issue device commands if needed
    const deviceCommands = [];
    for (const cmd of emotionAnalysis.device_commands) {
      const command = await base44.entities.DeviceCommand.create({
        command_id: `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        agent_id,
        target_device_id: `device_${cmd.device_type}`,
        device_type: cmd.device_type,
        device_api: 'generic_mqtt',
        command_type: cmd.command,
        intent_from_agent: cmd.reason,
        intent_context: {
          user_emotion: emotionAnalysis.primary_emotion,
          environmental_conditions: behavioral_context?.conditions || [],
          time_of_day: new Date().getHours() > 18 ? 'evening' : 'day'
        },
        execution_status: 'pending'
      });
      deviceCommands.push(command);
    }

    return Response.json({
      success: true,
      emotion_detected: emotionRecord,
      device_commands_created: deviceCommands,
      agent_response: {
        tone: emotionAnalysis.agent_response_tone,
        actions: emotionAnalysis.suggested_actions,
        comfort_level: emotionAnalysis.comfort_level
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});