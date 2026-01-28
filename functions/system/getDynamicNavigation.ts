import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Fetch pages
        const pages = await base44.entities.Page.filter({ is_active: true });
        
        // Also fetch Hubs to merge legacy system
        const hubs = await base44.entities.Hub.list({ limit: 1000 });

        // Transform Hubs to Pages format if needed, or just return both
        const navigation = {
            pages: pages.sort((a, b) => a.title.localeCompare(b.title)),
            hubs: hubs.map(h => ({
                title: h.name,
                route_path: h.path || `/hub/${h.id}`,
                icon_name: h.icon || "Circle",
                category: h.category
            }))
        };

        return Response.json({ success: true, navigation });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});