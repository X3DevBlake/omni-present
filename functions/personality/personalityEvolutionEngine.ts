import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, interaction_data } = await req.json();

    // Fetch existing personality evolution records
    const evolutions = await base44.entities.AgentPersonalityEvolution.filter({ agent_id });
    let currentEvolution = evolutions[0];

    if (!currentEvolution) {
      // Initialize personality
      currentEvolution = await base44.asServiceRole.entities.AgentPersonalityEvolution.create({
        evolution_id: `evo_${agent_id}_${Date.now()}`,
        agent_id,
        personality_snapshot: {
          communication_style: 'casual',
          proactivity_level: 0.5,
          empathy_score: 0.6,
          creativity_index: 0.5,
          assertiveness: 0.5,
          patience_level: 0.7,
          humor_frequency: 0.3,
          technical_depth: 0.6
        },
        learned_traits: [],
        user_interaction_patterns: [],
        personality_drift: {
          drift_magnitude: 0,
          drift_direction: 'neutral',
          concerns: [],
          recommended_adjustments: []
        },
        communication_adaptations: [],
        emotional_intelligence_growth: {
          emotional_recognition_accuracy: 0.7,
          response_appropriateness: 0.75,
          conflict_resolution_skill: 0.6
        },
        version: '1.0.0'
      });
    }

    // Analyze interaction and evolve personality
    const evolutionPrompt = `Analyze this interaction and suggest personality evolution:

Current Personality: ${JSON.stringify(currentEvolution.personality_snapshot)}
Interaction: ${JSON.stringify(interaction_data)}

How should the agent's personality evolve? Consider:
1. What traits should be strengthened/weakened?
2. What new traits should be learned?
3. How should communication style adapt?
4. Any concerns about drift?`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: evolutionPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          personality_updates: { type: "object" },
          new_traits: { type: "array" },
          communication_adaptations: { type: "array" },
          concerns: { type: "array" }
        }
      }
    });

    // Apply personality updates
    const updatedSnapshot = {
      ...currentEvolution.personality_snapshot,
      ...analysis.personality_updates
    };

    const newTraits = (analysis.new_traits || []).map(trait => ({
      trait_name: trait.name,
      strength: trait.strength || 0.5,
      learned_from: interaction_data.user_id || 'general_interaction',
      acquired_date: new Date().toISOString()
    }));

    const evolved = await base44.asServiceRole.entities.AgentPersonalityEvolution.update(
      currentEvolution.id,
      {
        personality_snapshot: updatedSnapshot,
        learned_traits: [...(currentEvolution.learned_traits || []), ...newTraits],
        communication_adaptations: [
          ...(currentEvolution.communication_adaptations || []),
          ...(analysis.communication_adaptations || [])
        ],
        personality_drift: {
          drift_magnitude: 0.05,
          drift_direction: 'adaptive',
          concerns: analysis.concerns || [],
          recommended_adjustments: []
        },
        version: `${parseFloat(currentEvolution.version) + 0.1}.0`
      }
    );

    return Response.json({
      success: true,
      evolved_personality: evolved,
      new_traits: newTraits,
      drift_concerns: analysis.concerns
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});