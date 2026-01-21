import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    // This webhook auto-syncs consciousness when entities change
    const base44 = createClientFromRequest(req);

    const payload = await req.json();
    const { event, data } = payload;

    // On any sentient entity change, sync consciousness
    if (event?.entity_name === 'SentientCore' || 
        event?.entity_name === 'OmegaAgentConsciousness' || 
        event?.entity_name === 'OmegaDevice') {
      
      // Trigger consciousness sync
      await base44.asServiceRole.functions.invoke('omega-consciousness-engine', {
        operation: 'sync'
      });

      // Trigger visualization intelligence update
      await base44.asServiceRole.functions.invoke('ultra-visualization-intelligence', {
        visualization_id: 'global',
        hub_context: 'omega_sentient',
        user_interaction_data: { trigger: 'entity_change' }
      });
    }

    // Auto-evolve agent consciousness on learning events
    if (event?.entity_name === 'AgentLearningFeedback' && event?.type === 'create') {
      const feedback = data;
      if (feedback?.outcome_data?.success && feedback?.learned_patterns?.length > 2) {
        // Trigger consciousness evolution
        await base44.asServiceRole.functions.invoke('agent-consciousness-evolution', {
          agent_id: feedback.agent_id,
          evolution_trigger: 'significant_learning'
        });
      }
    }

    return Response.json({ 
      success: true, 
      message: 'Sentient consciousness synchronized',
      event_processed: event?.type
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});