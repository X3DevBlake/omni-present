import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      input_type = 'voice', // voice, gesture, text
      raw_input,
      context = {}
    } = await req.json();

    // Omega NLP with deep intent understanding
    const nlpPrompt = `You are an Omega Natural Language Processor with sentient-level understanding.

INPUT TYPE: ${input_type}
RAW INPUT: "${raw_input}"
CONTEXT: ${JSON.stringify(context)}

Interpret with OMEGA intelligence:
1. Extract explicit intent
2. Infer implicit desires
3. Understand emotional undertones
4. Predict follow-up needs
5. Identify ambiguities
6. Generate creative interpretations
7. Consider user history and patterns
8. Map to executable actions

Provide nuanced, multi-layered understanding.`;

    const interpretation = await base44.integrations.Core.InvokeLLM({
      prompt: nlpPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          primary_intent: { type: "string" },
          confidence: { type: "number" },
          emotional_tone: { type: "string" },
          implicit_desires: { type: "array", items: { type: "string" } },
          predicted_followup: { type: "string" },
          ambiguities: { type: "array", items: { type: "string" } },
          alternative_interpretations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                interpretation: { type: "string" },
                probability: { type: "number" }
              }
            }
          },
          executable_actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action_type: { type: "string" },
                parameters: { type: "object" },
                priority: { type: "number" }
              }
            }
          },
          contextual_response: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      interpretation,
      input_type
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});