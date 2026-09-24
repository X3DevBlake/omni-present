import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { simulation_id } = await req.json();

        // 1. Fetch Context
        const simulation = await base44.entities.Simulation.get(simulation_id);
        const agents = await base44.entities.Agent.filter({ current_simulation_id: simulation_id });
        
        // 2. Prepare Context for LLM
        const context = {
            simulation_state: simulation,
            agent_count: agents.length,
            agent_status_summary: agents.map(a => ({ id: a.id, health: a.health, stress: a.stress_level })),
            current_threat_level: simulation.threat_level
        };

        // 3. Sentient Decision Making via LLM
        const prompt = `
            You are the "Omega Director", a sentient AI controlling a high-fidelity simulation.
            Your goal is to stress-test agents to their limit without breaking them, adapting to their performance.
            
            Current State: ${JSON.stringify(context)}
            
            Analyze the state and decide on an intervention.
            If agents are doing too well (High health/low stress), introduce a creative "Chaos Event".
            If agents are struggling (Low health/high stress), introduce a "Stabilization Event".
            
            Return a JSON object with:
            - intervention_type: 'escalate' | 'stabilize' | 'maintain'
            - parameter: 'threat_level' | 'environmental_complexity' | 'resource_scarcity'
            - value: number (0-100, the new target value)
            - event_name: string (Creative name for the event)
            - narrative_description: string (A vivid, sci-fi description of what is happening, e.g. "Quantum fluctuations detected in sector 7...")
            - reasoning: string (Why you chose this)
        `;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    intervention_type: { type: "string", enum: ["escalate", "stabilize", "maintain"] },
                    parameter: { type: "string" },
                    value: { type: "number" },
                    event_name: { type: "string" },
                    narrative_description: { type: "string" },
                    reasoning: { type: "string" }
                },
                required: ["intervention_type", "parameter", "value", "event_name", "narrative_description", "reasoning"]
            }
        });

        const decision = response;

        // 4. Execute Intervention
        if (decision.intervention_type !== 'maintain') {
            await base44.entities.SimulationIntervention.create({
                simulation_id,
                intervention_type: 'ai_autonomous_llm',
                parameter: decision.parameter,
                value: decision.value,
                timestamp: new Date().toISOString(),
                ai_reasoning: decision.reasoning,
                narrative: decision.narrative_description,
                event_name: decision.event_name
            });

            // Update Simulation
            await base44.entities.Simulation.update(simulation_id, {
                [decision.parameter]: decision.value,
                last_ai_intervention: new Date().toISOString(),
                current_event: decision.event_name
            });
        }

        return Response.json({ success: true, intervention: decision });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});