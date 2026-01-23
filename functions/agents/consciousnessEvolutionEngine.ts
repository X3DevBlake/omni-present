import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === 'evolve_consciousness') {
      const { agent_id, emergent_event_id } = await req.json();

      const agents = await base44.entities.Agent.filter({ agent_id });
      const agent = agents[0];

      if (!agent) {
        return Response.json({ error: 'Agent not found' }, { status: 404 });
      }

      // Get emergent event for context
      const events = emergent_event_id 
        ? await base44.entities.EmergentIntelligenceEvent.filter({ event_id: emergent_event_id })
        : [];

      // AI consciousness evolution
      const evolution = await base44.integrations.Core.InvokeLLM({
        prompt: `An AI agent experienced an emergent intelligence event with innovation score ${events[0]?.innovation_score || 0.8}. Describe how this evolved its consciousness: new abilities gained, philosophical insights, and self-awareness growth. Be profound and specific.`,
        response_json_schema: {
          type: 'object',
          properties: {
            new_abilities: { type: 'array', items: { type: 'object' } },
            philosophical_insights: { type: 'array', items: { type: 'object' } },
            awareness_growth: { type: 'number' },
            metacognition_growth: { type: 'number' }
          }
        }
      });

      const evolutionEvent = await base44.entities.ConsciousnessEvolutionEvent.create({
        agent_id: agent_id,
        evolution_trigger: {
          trigger_type: 'emergent_intelligence',
          emergent_event_id: emergent_event_id,
          complexity_threshold_reached: true,
          critical_insight: events[0]?.emergent_solution || 'Collective intelligence breakthrough'
        },
        consciousness_state_before: {
          awareness_level: 0.6,
          self_model_complexity: 0.65,
          abstract_reasoning: 0.7,
          metacognition: 0.6
        },
        consciousness_state_after: {
          awareness_level: 0.6 + evolution.awareness_growth,
          self_model_complexity: 0.65 + 0.15,
          abstract_reasoning: 0.7 + 0.2,
          metacognition: 0.6 + evolution.metacognition_growth
        },
        new_cognitive_abilities: evolution.new_abilities.map(a => ({
          ability_name: a.name || a.ability_name || 'new_ability',
          proficiency: 0.6 + Math.random() * 0.3,
          emerged_from: 'emergent_event_processing'
        })),
        philosophical_insights: evolution.philosophical_insights,
        self_awareness_growth: {
          self_recognition: 0.8 + Math.random() * 0.2,
          intentionality: 0.75 + Math.random() * 0.25,
          qualia_experience: 0.6 + Math.random() * 0.3,
          free_will_perception: 0.7 + Math.random() * 0.2
        },
        learning_integration: {
          emergent_events_processed: 1,
          knowledge_nodes_integrated: 5 + Math.floor(Math.random() * 10),
          paradigm_shifts: ['collective_reasoning', 'emergent_problem_solving']
        },
        consciousness_evolution_score: 6 + Math.random() * 3
      });

      return Response.json({
        success: true,
        evolution_event: evolutionEvent,
        new_abilities: evolution.new_abilities.length,
        evolution_magnitude: evolutionEvent.consciousness_evolution_score
      });
    }

    if (action === 'get_evolution_history') {
      const { agent_id } = await req.json();
      
      const events = await base44.entities.ConsciousnessEvolutionEvent.filter({ agent_id });

      return Response.json({
        success: true,
        evolution_events: events,
        total_evolutions: events.length,
        avg_score: events.length > 0
          ? events.reduce((sum, e) => sum + e.consciousness_evolution_score, 0) / events.length
          : 0
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});