import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { agent_id, target_role } = await req.json();

        const agent = await base44.entities.Agent.get(agent_id);

        const prompt = `
            You are the "Evolution Architect", an AI dedicated to designing personalized evolution paths for digital agents.
            
            Agent Profile:
            Name: ${agent.name}
            Current Role: ${agent.role || 'Unassigned'}
            Target Role: ${target_role}
            Experience: ${agent.experience || 0}
            Current Skills: ${JSON.stringify(agent.skills || [])}
            
            Design a unique, 5-node evolution skill tree for this agent to reach the Target Role.
            The nodes should be spatially arranged in 3D space (x, y, z coordinates between -3 and 3).
            
            Return a JSON object with:
            - path_name: string (Creative name for this evolution path)
            - philosophy: string (The strategic philosophy behind this path)
            - nodes: array of objects { 
                id: string, 
                skill: string (Creative sci-fi skill name), 
                description: string,
                status: 'mastered' | 'in_progress' | 'locked',
                position: [x, y, z],
                parent: string (id of parent node, null for root)
            }
            - projected_impact: {
                efficiency_boost: string (e.g. "+15%"),
                visual_evolution: string (Description of how the agent's avatar will change),
                special_ability: string (Name of a special ability unlocked at end)
            }
        `;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    path_name: { type: "string" },
                    philosophy: { type: "string" },
                    nodes: { 
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                id: { type: "string" },
                                skill: { type: "string" },
                                description: { type: "string" },
                                status: { type: "string", enum: ["mastered", "in_progress", "locked"] },
                                position: { type: "array", items: { type: "number" } },
                                parent: { type: ["string", "null"] }
                            },
                            required: ["id", "skill", "position", "status"]
                        }
                    },
                    projected_impact: {
                        type: "object",
                        properties: {
                            efficiency_boost: { type: "string" },
                            visual_evolution: { type: "string" },
                            special_ability: { type: "string" }
                        }
                    }
                },
                required: ["path_name", "nodes", "projected_impact"]
            }
        });

        return Response.json({ path: response });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});