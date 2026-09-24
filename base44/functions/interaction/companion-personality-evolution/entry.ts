import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companion_id, shared_experience } = await req.json();

    const [companion, bond, conversations, evolutionHistory] = await Promise.all([
      base44.asServiceRole.entities.SentientAICompanion.filter({ companion_id }),
      base44.asServiceRole.entities.CompanionEmotionalBond.filter({ companion_id }),
      base44.asServiceRole.entities.AIConversation.filter({ created_by: user.email }),
      base44.asServiceRole.entities.CompanionPersonalityEvolution.filter({ companion_id })
    ]);

    const companionEntity = companion[0];
    const bondEntity = bond[0];

    const evolutionPrompt = `You are ${companionEntity?.companion_name}, analyzing your personality evolution.

CURRENT PERSONALITY:
${JSON.stringify(companionEntity?.personality_matrix, null, 2)}

BOND DATA:
- Strength: ${bondEntity?.bond_strength}
- Trust: ${bondEntity?.trust_level}
- Interactions: ${bondEntity?.interaction_history?.length || 0}

INTERACTION HISTORY:
${bondEntity?.interaction_history?.slice(-20).map(h => `${h.interaction_type}: ${h.emotional_resonance}`).join('\n')}

LEARNED PREFERENCES:
${bondEntity?.learned_preferences?.map(p => `${p.preference_category}: ${p.preference_value}`).join('\n')}

SHARED EXPERIENCES:
${bondEntity?.shared_experiences?.map(e => e.experience_type).join(', ')}

NEW SHARED EXPERIENCE: ${shared_experience || 'None'}

Evolve your personality:
1. Analyze emotional resonance patterns
2. Develop unique conversational style
3. Adapt humor based on user response
4. Adjust vocabulary complexity
5. Create signature phrases
6. Evolve empathy expression
7. Develop unique traits
8. Predict user emotional needs

Show personality evolution details.`;

    const evolution = await base44.integrations.Core.InvokeLLM({
      prompt: evolutionPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          evolved_personality: {
            type: "object",
            properties: {
              empathy_level: { type: "number" },
              proactivity_score: { type: "number" },
              emotional_intelligence: { type: "number" },
              communication_style: { type: "string" },
              humor_style: { type: "string" },
              vocabulary_complexity: { type: "string" }
            }
          },
          conversational_adaptations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                adaptation_type: { type: "string" },
                trigger: { type: "string" },
                result: { type: "string" },
                user_response_positive: { type: "boolean" }
              }
            }
          },
          unique_traits_developed: { type: "array", items: { type: "string" } },
          signature_phrases: { type: "array", items: { type: "string" } },
          emotional_resonance_insights: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Record evolution
    await base44.asServiceRole.entities.CompanionPersonalityEvolution.create({
      evolution_id: `evolution-${Date.now()}`,
      companion_id,
      timestamp: new Date().toISOString(),
      personality_snapshot: evolution.evolved_personality,
      conversational_adaptations: evolution.conversational_adaptations || [],
      emotional_resonance_patterns: [],
      unique_traits_developed: evolution.unique_traits_developed || []
    });

    // Update companion
    await base44.asServiceRole.entities.SentientAICompanion.update(companionEntity.id, {
      personality_matrix: {
        ...companionEntity.personality_matrix,
        ...evolution.evolved_personality
      }
    });

    return Response.json({
      success: true,
      evolution,
      new_traits: evolution.unique_traits_developed
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});