import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { audio_url, transcription } = await req.json();
    
    // AI-powered intent detection and entity extraction
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this voice command and extract intent and entities:
      
      "${transcription}"
      
      Determine what the user wants to do and extract relevant parameters.`,
      response_json_schema: {
        type: "object",
        properties: {
          intent: { type: "string" },
          entities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                entity_type: { type: "string" },
                value: { type: "string" },
                confidence: { type: "number" }
              }
            }
          },
          action: { type: "string" },
          parameters: { type: "object" },
          sentiment: { type: "number" },
          response_text: { type: "string" }
        }
      }
    });
    
    // Execute action based on intent
    let actionResult = null;
    
    if (analysis.intent === 'search_agents') {
      const searchResponse = await base44.functions.invoke('enhancedAgentMatching', {
        taskRequirements: analysis.parameters
      });
      actionResult = searchResponse.data;
    }
    
    // Create voice interaction record
    const interaction = await base44.entities.VoiceInteraction.create({
      user_id: user.id,
      audio_url,
      transcription,
      intent: analysis.intent,
      entities_extracted: analysis.entities,
      action_taken: analysis.action,
      response_text: analysis.response_text,
      sentiment: analysis.sentiment,
      language: 'en'
    });
    
    return Response.json({
      interaction,
      analysis,
      action_result: actionResult
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});