import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { simulation_id } = await req.json();

        // 1. Fetch current simulation state and agent performance
        const simulation = await base44.entities.Simulation.get(simulation_id);
        const agents = await base44.entities.Agent.filter({ current_simulation_id: simulation_id });

        if (!simulation || agents.length === 0) {
            return Response.json({ action: 'none', reason: 'No active simulation or agents' });
        }

        // 2. Analyze Performance (Simplified logic)
        const avgHealth = agents.reduce((sum, a) => sum + (a.health || 100), 0) / agents.length;
        const successRate = agents.reduce((sum, a) => sum + (a.success_rate || 0), 0) / agents.length;

        let intervention = {};
        let reasoning = "";

        // 3. AI Decision Logic
        if (avgHealth > 90 && successRate > 80) {
            // Agents are too comfortable, increase difficulty
            intervention = {
                type: 'escalate',
                parameter: 'threat_level',
                value: Math.min((simulation.threat_level || 50) + 10, 100),
                event: 'Sudden Environmental Hazard'
            };
            reasoning = "High agent performance detected. Introducing stressor to test resilience.";
        } else if (avgHealth < 40) {
            // Agents are failing, stabilize to allow recovery/learning
            intervention = {
                type: 'stabilize',
                parameter: 'threat_level',
                value: Math.max((simulation.threat_level || 50) - 15, 10),
                event: 'Reinforcement Arrival'
            };
            reasoning = "Critical failure imminent. Reducing pressure to facilitate recovery learning.";
        } else {
            // Maintain dynamic flux
            intervention = {
                type: 'maintain',
                parameter: 'environmental_complexity',
                value: Math.min((simulation.environmental_complexity || 30) + 5, 100),
                event: 'Weather Pattern Shift'
            };
            reasoning = "Performance nominal. Increasing environmental complexity to test adaptability.";
        }

        // 4. Apply Intervention
        if (intervention.type !== 'maintain') {
             await base44.entities.SimulationIntervention.create({
                simulation_id,
                intervention_type: 'ai_autonomous',
                parameter: intervention.parameter,
                value: intervention.value,
                timestamp: new Date().toISOString(),
                ai_reasoning: reasoning
            });
            
            // Update sim state
            await base44.entities.Simulation.update(simulation_id, {
                [intervention.parameter]: intervention.value,
                last_ai_intervention: new Date().toISOString()
            });
        }

        return Response.json({ success: true, intervention, reasoning });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});