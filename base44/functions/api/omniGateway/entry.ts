import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // External API Gateway logic
        const supported_integrations = ["Zapier", "Slack", "Discord", "Custom Webhooks"];
        
        return Response.json({
            status: "active",
            version: "v2.0.0-omega",
            integrations: supported_integrations,
            docs_url: "/docs/api",
            endpoints: {
                agents: "/api/v1/agents",
                market: "/api/v1/market",
                simulation: "/api/v1/simulation"
            }
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});