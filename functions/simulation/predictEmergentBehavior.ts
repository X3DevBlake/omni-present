import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { simulation_id } = await req.json();

    // Get simulation data
    const simulation = await base44.entities.Simulation.get(simulation_id);
    const agents = await base44.entities.SimulationAgent.filter({ simulation_id }, '', 50);
    const recentEvents = await base44.entities.SimulationEvent.filter(
      { simulation_id }, 
      '-created_date', 
      100
    );

    // AI prediction
    const predictions = await base44.integrations.Core.InvokeLLM({
      prompt: `Predict emergent behaviors in this multi-agent simulation.
      
      Simulation Context:
      - Type: ${simulation.simulation_type || 'general'}
      - Agents: ${agents.length}
      - Recent Events: ${recentEvents.length}
      
      Agent Profiles:
      ${JSON.stringify(agents.slice(0, 10).map(a => ({ 
        id: a.id, 
        personality: a.personality_traits,
        goals: a.goals 
      })))}
      
      Recent Events:
      ${JSON.stringify(recentEvents.slice(0, 20).map(e => e.event_type))}
      
      Predict 3-5 emergent behaviors that might occur:
      - Behavior name and type
      - Confidence (0-100)
      - Expected time (in minutes from now)
      - Triggering conditions
      - Participating agents
      - Potential impact
      
      Return as JSON array.`,
      response_json_schema: {
        type: "object",
        properties: {
          predictions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                behavior_name: { type: "string" },
                behavior_type: { type: "string" },
                confidence: { type: "number" },
                expected_time_minutes: { type: "number" },
                triggering_conditions: { type: "array", items: { type: "object" } },
                participating_agents: { type: "array", items: { type: "string" } },
                potential_impact: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Save predictions
    const savedPredictions = [];
    for (const pred of predictions.predictions || []) {
      const expectedTime = new Date(Date.now() + pred.expected_time_minutes * 60000);
      
      const saved = await base44.asServiceRole.entities.EmergentBehaviorPrediction.create({
        simulation_id,
        behavior_name: pred.behavior_name,
        behavior_type: pred.behavior_type,
        prediction_confidence: pred.confidence,
        expected_occurrence_time: expectedTime.toISOString(),
        triggering_conditions: pred.triggering_conditions,
        participating_agents: pred.participating_agents,
        potential_impact: pred.potential_impact,
        visualization_data: {
          agent_positions: agents.map(a => ({ id: a.id, position: [0, 0, 0] }))
        }
      });
      
      savedPredictions.push(saved);
    }

    return Response.json({ 
      success: true,
      predictions: savedPredictions
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});