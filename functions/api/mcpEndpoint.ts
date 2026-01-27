import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // This endpoint acts as the bridge for the local MCP CLI
        // It bypasses some auth checks if a special CLI token is present (simulated here by just checking user)
        // In a real scenario, you'd generate a specific API key for the CLI.
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized. Please login via CLI first (not implemented in this demo).' }, { status: 401 });
        }

        const { action, params } = await req.json();

        if (action === 'list_resources') {
            // Expose Entities as Resources
            const agents = await base44.entities.Agent.list({ limit: 50 });
            const hubs = await base44.entities.Hub.list({ limit: 50 });
            
            const resources = [
                ...agents.map(a => ({
                    uri: `omni://agents/${a.id}`,
                    name: `Agent: ${a.name}`,
                    mimeType: "application/json",
                    description: a.description || "An autonomous agent"
                })),
                ...hubs.map(h => ({
                    uri: `omni://hubs/${h.id}`,
                    name: `Hub: ${h.name}`,
                    mimeType: "application/json",
                    description: h.description || "System Hub"
                })),
                {
                    uri: "omni://system/status",
                    name: "System Status",
                    mimeType: "text/plain",
                    description: "Current health and metrics of the Omni Ecosystem"
                }
            ];
            
            return Response.json({ resources });
        }

        if (action === 'read_resource') {
            const { uri } = params;
            if (uri === "omni://system/status") {
                return Response.json({
                    contents: [{
                        uri: uri,
                        mimeType: "text/plain",
                        text: "System Status: OPTIMAL\nActive Agents: 142\nNetwork Load: 45%\nThreat Level: LOW"
                    }]
                });
            }
            
            if (uri.startsWith("omni://agents/")) {
                const id = uri.split('/').pop();
                const agent = await base44.entities.Agent.get(id);
                return Response.json({
                    contents: [{
                        uri: uri,
                        mimeType: "application/json",
                        text: JSON.stringify(agent, null, 2)
                    }]
                });
            }
            
            // ... handle hubs etc
            return Response.json({ error: "Resource not found" }, { status: 404 });
        }

        if (action === 'list_tools') {
            return Response.json({
                tools: [
                    {
                        name: "create_agent",
                        description: "Deploy a new autonomous agent into the ecosystem",
                        inputSchema: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                role: { type: "string" }
                            },
                            required: ["name", "role"]
                        }
                    },
                    {
                        name: "broadcast_message",
                        description: "Broadcast a message to the entire RedComm network",
                        inputSchema: {
                            type: "object",
                            properties: {
                                message: { type: "string" },
                                priority: { type: "string", enum: ["low", "high", "critical"] }
                            },
                            required: ["message"]
                        }
                    }
                ]
            });
        }

        if (action === 'call_tool') {
            const { name, arguments: args } = params;
            
            if (name === 'create_agent') {
                const newAgent = await base44.entities.Agent.create({
                    name: args.name,
                    role: args.role,
                    status: 'active',
                    evolution_stage: 'Gen-1'
                });
                return Response.json({
                    content: [{ type: "text", text: `Agent ${newAgent.name} deployed successfully with ID ${newAgent.id}` }]
                });
            }
            
            if (name === 'broadcast_message') {
                // Simulate broadcast
                return Response.json({
                    content: [{ type: "text", text: `Message broadcasted to network with ${args.priority || 'normal'} priority: "${args.message}"` }]
                });
            }
            
            return Response.json({ error: "Tool not found" }, { status: 404 });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});