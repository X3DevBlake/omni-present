import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Fetch real data
        const missions = await base44.entities.CrossHubMission.filter({ status: 'active' });
        const hubs = await base44.entities.Hub.list();
        
        if (missions.length === 0) return Response.json({ predictions: [] });

        const prompt = `
            You are "Orion", a predictive analytics AI overseeing cross-hub missions.
            
            Active Missions: ${JSON.stringify(missions.map(m => ({ title: m.title, hubs: m.involved_hubs, resources: m.resource_allocation })))}
            Hub Capacities: ${JSON.stringify(hubs.map(h => ({ name: h.name, id: h.id, capacity: h.compute_capacity })))}
            
            Analyze the system for potential bottlenecks, resource conflicts, or failure points.
            Generate 1-3 predictive alerts. Be extremely specific and technical.
            
            Return a JSON object with:
            - predictions: array of objects {
                mission_id: string,
                mission_title: string,
                type: 'bottleneck' | 'failure_risk' | 'optimization_opportunity',
                severity: 'low' | 'medium' | 'high' | 'critical',
                probability: number (0-1),
                predicted_time: string (e.g. "T-minus 45 minutes"),
                issue_description: string,
                suggestion: string (Actionable AI fix),
                technical_details: string (Jargon-heavy explanation)
            }
        `;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    predictions: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                mission_id: { type: "string" },
                                mission_title: { type: "string" },
                                type: { type: "string" },
                                severity: { type: "string" },
                                probability: { type: "number" },
                                predicted_time: { type: "string" },
                                issue_description: { type: "string" },
                                suggestion: { type: "string" },
                                technical_details: { type: "string" }
                            },
                            required: ["mission_title", "type", "severity", "suggestion"]
                        }
                    }
                }
            }
        });

        return Response.json({ predictions: response.predictions });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});