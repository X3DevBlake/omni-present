import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, interaction_context, user_feedback } = await req.json();

    // Analyze interaction for trait learning
    const learningPrompt = `Analyze this interaction to identify new personality traits the agent should develop:

Agent ID: ${agent_id}
Interaction: ${JSON.stringify(interaction_context)}
User Feedback: ${JSON.stringify(user_feedback)}

Identify:
1. New traits demonstrated or needed
2. Trait strength (0-1)
3. Trait category
4. How it manifests in behavior
5. Potential synergies/conflicts with other traits`;

    const traitAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: learningPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          identified_traits: {
            type: "array",
            items: {
              type: "object",
              properties: {
                trait_name: { type: "string" },
                trait_category: { type: "string" },
                strength: { type: "number" },
                manifestation: { type: "string" }
              }
            }
          },
          synergies: { type: "array" },
          conflicts: { type: "array" }
        }
      }
    });

    const createdTraits = [];

    for (const trait of traitAnalysis.identified_traits || []) {
      // Check if trait already exists
      const existing = await base44.entities.AgentPersonalityTrait.filter({
        agent_id,
        trait_name: trait.trait_name
      });

      if (existing.length > 0) {
        // Update existing trait
        const current = existing[0];
        const newStrength = Math.min((current.strength + trait.strength) / 2, 1.0);
        
        const updated = await base44.asServiceRole.entities.AgentPersonalityTrait.update(
          current.id,
          {
            strength: newStrength,
            development_history: [
              ...(current.development_history || []),
              {
                timestamp: new Date().toISOString(),
                strength_value: newStrength,
                trigger_event: interaction_context.event_type || 'interaction'
              }
            ],
            manifestations: [
              ...(current.manifestations || []),
              {
                situation: interaction_context.context || 'general',
                behavior_change: trait.manifestation,
                user_response: user_feedback?.sentiment || 'neutral'
              }
            ]
          }
        );
        createdTraits.push(updated);
      } else {
        // Create new trait
        const newTrait = await base44.asServiceRole.entities.AgentPersonalityTrait.create({
          trait_id: `trait_${Date.now()}_${Math.random()}`,
          agent_id,
          trait_name: trait.trait_name,
          trait_category: trait.trait_category,
          strength: trait.strength,
          development_history: [{
            timestamp: new Date().toISOString(),
            strength_value: trait.strength,
            trigger_event: 'initial_learning'
          }],
          learned_from: {
            user_id: user.id,
            interaction_count: 1,
            context: interaction_context.context || 'general'
          },
          manifestations: [{
            situation: interaction_context.context || 'general',
            behavior_change: trait.manifestation,
            user_response: user_feedback?.sentiment || 'neutral'
          }],
          synergies: traitAnalysis.synergies || [],
          conflicts: traitAnalysis.conflicts || []
        });
        createdTraits.push(newTrait);
      }
    }

    // Update personality evolution record
    await base44.functions.invoke('personalityEvolutionEngine', {
      agent_id,
      interaction_data: {
        ...interaction_context,
        learned_traits: createdTraits.map(t => t.trait_name)
      }
    });

    return Response.json({
      success: true,
      traits: createdTraits,
      new_traits_count: createdTraits.filter(t => !t.development_history || t.development_history.length === 1).length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});