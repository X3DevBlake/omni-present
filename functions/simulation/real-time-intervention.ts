import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { simulation_id, intervention_type, target, new_value } = await req.json();

    // Get current simulation state
    const simulation = await base44.entities.Simulation.get(simulation_id);

    if (!simulation) {
      return Response.json({ error: 'Simulation not found' }, { status: 404 });
    }

    // Use AI to predict impact
    const impactPrediction = await base44.integrations.Core.InvokeLLM({
      prompt: `Predict the impact of a ${intervention_type} intervention on a simulation. Current simulation status: ${simulation.status}. Target: ${JSON.stringify(target)}. New value: ${JSON.stringify(new_value)}. Provide: number of affected agents, cascade probability (0-1), stability change (-1 to 1), and list of potential emergent behaviors.`,
      response_json_schema: {
        type: "object",
        properties: {
          affected_agents: { type: "number" },
          cascade_probability: { type: "number" },
          stability_change: { type: "number" },
          emergent_behaviors: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Create intervention record
    const intervention = await base44.entities.SimulationIntervention.create({
      simulation_id,
      intervention_type,
      triggered_by: 'user',
      target,
      changes_applied: {
        old_value: target.current_value || 'N/A',
        new_value: JSON.stringify(new_value),
        magnitude: Math.abs(new_value - (target.current_value || 0))
      },
      predicted_impact: {
        affected_agents: impactPrediction.affected_agents,
        cascade_probability: impactPrediction.cascade_probability,
        stability_change: impactPrediction.stability_change
      },
      reversible: true
    });

    // Apply the intervention based on type
    let appliedChanges = {};

    if (intervention_type === 'parameter_change') {
      await base44.entities.Simulation.update(simulation_id, {
        parameters: {
          ...simulation.parameters,
          [target.parameter_name]: new_value
        }
      });
      appliedChanges.parameters_updated = true;
    } else if (intervention_type === 'agent_injection') {
      const newAgent = await base44.entities.SimulationAgent.create({
        simulation_id,
        agent_name: `Injected_${Date.now()}`,
        agent_type: new_value.agent_type || 'observer',
        behavior_profile: new_value.behavior_profile || {},
        position: new_value.position || { x: 0, y: 0, z: 0 },
        status: 'active'
      });
      appliedChanges.agent_injected = newAgent.id;
    } else if (intervention_type === 'event_trigger') {
      const event = await base44.entities.SimulationEvent.create({
        simulation_id,
        event_type: new_value.event_type || 'custom',
        event_data: new_value,
        severity: new_value.severity || 'medium',
        affected_entities: []
      });
      appliedChanges.event_triggered = event.id;
    }

    // Update intervention with outcome
    await base44.entities.SimulationIntervention.update(intervention.id, {
      actual_outcome: {
        success: true,
        emergent_behaviors: impactPrediction.emergent_behaviors,
        metrics_delta: appliedChanges
      }
    });

    return Response.json({
      success: true,
      intervention_id: intervention.id,
      predicted_impact: impactPrediction,
      applied_changes: appliedChanges
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});