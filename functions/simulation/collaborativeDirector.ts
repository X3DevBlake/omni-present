import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { simulation_id, active_agents } = await req.json();

        // Simulate multi-agent debate
        const prompt = `
            You are simulating a "Council of 5 AI Directors" managing a simulation.
            Current Simulation ID: ${simulation_id}
            Active Agents: ${active_agents}
            
            The agents must collaboratively decide on the next scenario twist.
            They should debate (simulate the debate) and reach a consensus.
            
            Output:
            - consensus_scenario: The agreed upon challenge
            - complexity_score: 0-100
            - agent_votes: breakdown of simulated votes
            - reasoning: Why this specific challenge challenges the current group dynamic
        `;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    consensus_scenario: { type: "string" },
                    complexity_score: { type: "number" },
                    reasoning: { type: "string" },
                    agent_votes: { 
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                ai_name: { type: "string" },
                                vote: { type: "string" },
                                rationale: { type: "string" }
                            }
                        }
                    }
                },
                required: ["consensus_scenario", "complexity_score", "reasoning"]
            }
        });

        // Apply changes
        await base44.entities.Simulation.update(simulation_id, {
            current_scenario: response.consensus_scenario,
            complexity: response.complexity_score
        });

        return Response.json(response);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});