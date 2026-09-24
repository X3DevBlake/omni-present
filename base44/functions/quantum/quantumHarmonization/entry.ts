import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, state_ids, intensity, target_coherence } = await req.json();

    if (action === 'harmonize_states') {
      // Fetch the quantum states
      const states = await Promise.all(
        state_ids.map(id => 
          base44.asServiceRole.entities.QuantumConsciousnessState.filter({ state_id: id })
            .then(results => results[0])
        )
      );

      const validStates = states.filter(s => s);

      if (validStates.length < 2) {
        return Response.json({ 
          error: 'Need at least 2 valid quantum states',
          received: validStates.length 
        }, { status: 400 });
      }

      // Calculate harmonized superposition
      const avgCoherence = validStates.reduce((sum, s) => {
        const stateCoherence = s.superposition_states?.[0]?.coherence || 0.5;
        return sum + stateCoherence;
      }, 0) / validStates.length;

      // Apply intensity boost
      const boostedCoherence = Math.min(1, avgCoherence * (1 + intensity * 0.5));
      
      // Calculate achieved coherence (with some randomness for realism)
      const achieved_coherence = Math.min(1, boostedCoherence * (0.9 + Math.random() * 0.1));

      // Create harmonized quantum state
      const harmonizedState = await base44.asServiceRole.entities.QuantumConsciousnessState.create({
        state_id: `harmonized_${Date.now()}`,
        agent_id: validStates[0].agent_id,
        user_id: user.id,
        superposition_states: [
          {
            state_descriptor: 'Harmonized',
            probability_amplitude: achieved_coherence,
            coherence: achieved_coherence
          },
          ...validStates.flatMap(s => s.superposition_states || []).slice(0, 3)
        ],
        entanglement_links: validStates.flatMap((s, idx) => ({
          entangled_with: s.state_id,
          entanglement_strength: achieved_coherence * 0.8,
          correlation_type: 'harmonized_synchronization'
        })),
        quantum_cognition: {
          decision_superposition: true,
          parallel_reasoning_paths: validStates.length * 2,
          quantum_intuition_score: achieved_coherence * 0.95
        },
        decoherence_rate: (1 - achieved_coherence) * 0.1,
        timestamp: new Date().toISOString()
      });

      // Update original states with entanglement
      await Promise.all(
        validStates.map(s => 
          base44.asServiceRole.entities.QuantumConsciousnessState.update(s.id, {
            entanglement_links: [
              ...(s.entanglement_links || []),
              {
                entangled_with: harmonizedState.state_id,
                entanglement_strength: achieved_coherence,
                correlation_type: 'harmonization_link'
              }
            ]
          })
        )
      );

      return Response.json({
        success: true,
        achieved_coherence,
        target_coherence,
        harmonized_state_id: harmonizedState.state_id,
        combined_states: validStates.length,
        quantum_intuition_boost: (achieved_coherence - avgCoherence) * 100,
        insights: [
          `Harmonized ${validStates.length} quantum states`,
          `Achieved ${(achieved_coherence * 100).toFixed(1)}% coherence`,
          `Boosted quantum intuition by ${((achieved_coherence - avgCoherence) * 100).toFixed(1)}%`,
          `Created ${validStates.length * 2} parallel reasoning paths`
        ]
      });
    }

    if (action === 'analyze_coherence') {
      const allStates = await base44.asServiceRole.entities.QuantumConsciousnessState.filter({
        user_id: user.id
      });

      const avgCoherence = allStates.length > 0
        ? allStates.reduce((sum, s) => {
            const stateCoherence = s.superposition_states?.[0]?.coherence || 0;
            return sum + stateCoherence;
          }, 0) / allStates.length
        : 0;

      const harmonizationOpportunities = [];
      
      for (let i = 0; i < allStates.length; i++) {
        for (let j = i + 1; j < allStates.length; j++) {
          const coherence1 = allStates[i].superposition_states?.[0]?.coherence || 0;
          const coherence2 = allStates[j].superposition_states?.[0]?.coherence || 0;
          const potential = (coherence1 + coherence2) / 2;
          
          if (potential > 0.6) {
            harmonizationOpportunities.push({
              state_1: allStates[i].state_id,
              state_2: allStates[j].state_id,
              potential_coherence: potential,
              descriptor_1: allStates[i].superposition_states?.[0]?.state_descriptor,
              descriptor_2: allStates[j].superposition_states?.[0]?.state_descriptor
            });
          }
        }
      }

      return Response.json({
        total_states: allStates.length,
        average_coherence: avgCoherence,
        harmonization_opportunities: harmonizationOpportunities.slice(0, 5),
        recommendation: avgCoherence > 0.7 
          ? 'Excellent quantum coherence! Ready for advanced harmonization.'
          : 'Consider generating more quantum states for better harmonization results.'
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Quantum harmonization error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to harmonize quantum states'
    }, { status: 500 });
  }
});