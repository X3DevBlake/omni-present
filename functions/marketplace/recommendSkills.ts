import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { agent_id, performance_metrics } = await req.json();

        const agent = await base44.entities.Agent.get(agent_id);
        
        // AI Logic to recommend skills
        const prompt = `
            Agent: ${agent.name}
            Role: ${agent.role || 'Generalist'}
            Performance: ${JSON.stringify(performance_metrics || {})}
            Current Skills: ${JSON.stringify(agent.skills || [])}
            
            Recommend 3 advanced, sci-fi/cyberpunk skills that would drastically improve this agent's utility in a "Swarm Intelligence" network.
            For each skill, provide:
            - name: Creative name
            - cost: Cost in Omni credits
            - boost: Efficiency boost percentage
            - description: Technical description
        `;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    recommendations: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                cost: { type: "number" },
                                boost: { type: "string" },
                                description: { type: "string" }
                            }
                        }
                    }
                },
                required: ["recommendations"]
            }
        });

        return Response.json(response);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});