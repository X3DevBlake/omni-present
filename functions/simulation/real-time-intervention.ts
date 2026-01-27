import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { simulation_id, parameter, value, intervention_type } = await req.json();

        // Log the intervention
        await base44.entities.SimulationIntervention.create({
            simulation_id,
            intervention_type, // 'threat', 'environment', 'adversary'
            parameter,
            value,
            timestamp: new Date().toISOString()
        });

        // In a real system, this would push updates to a live simulation engine via WebSocket or similar.
        // For now, we update the simulation state record.
        const simulation = await base44.entities.Simulation.get(simulation_id);
        
        let updateData = {};
        if (intervention_type === 'threat') {
            updateData.threat_level = value;
        } else if (intervention_type === 'environment') {
            updateData.environmental_factors = { ...simulation.environmental_factors, [parameter]: value };
        }

        await base44.entities.Simulation.update(simulation_id, updateData);

        return Response.json({ success: true, message: `Simulation ${intervention_type} updated dynamically.` });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});