import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Fetch all active missions
        const missions = await base44.entities.Mission.filter({ status: 'active' });
        
        if (!missions.length) return Response.json({ forecasts: [] });

        const prompt = `
            Analyze these active missions for organizational success:
            ${JSON.stringify(missions.map(m => ({ id: m.id, title: m.title, objectives: m.objectives })))}
            
            Predict:
            1. Overall success probability per mission.
            2. Critical dependencies (if Mission A fails, does Mission B fail?).
            3. Strategic resource shifts (e.g., "Move 20% compute from Alpha to Beta").
            
            Return JSON.
        `;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    forecasts: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                mission_id: { type: "string" },
                                success_probability: { type: "number" },
                                dependencies: { type: "array", items: { type: "string" } },
                                risk_factors: { type: "array", items: { type: "string" } },
                                strategic_suggestion: { type: "string" }
                            }
                        }
                    },
                    global_strategy: { type: "string" }
                },
                required: ["forecasts", "global_strategy"]
            }
        });

        return Response.json(response);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});