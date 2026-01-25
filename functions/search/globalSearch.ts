import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { query } = await req.json();

        if (!query || query.length < 2) {
            return Response.json({ results: [] });
        }

        // Parallel search across multiple entities
        const [hubs, courses, resources] = await Promise.all([
            base44.entities.Hub.list(),
            base44.entities.Course.list(),
            base44.entities.AcademyResource.list()
        ]);

        const q = query.toLowerCase();

        const results = [
            ...hubs.filter(h => h.name.toLowerCase().includes(q) || h.description?.toLowerCase().includes(q))
                .map(h => ({ type: 'Hub', title: h.name, subtitle: h.category, link: h.page })),
            
            ...courses.filter(c => c.title.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q))
                .map(c => ({ type: 'Course', title: c.title, subtitle: c.category, link: 'OmniPresentAcademy' })), // Deep link if possible

            ...resources.filter(r => r.title.toLowerCase().includes(q) || r.summary?.toLowerCase().includes(q))
                .map(r => ({ type: 'Resource', title: r.title, subtitle: 'Academy Material', link: r.url, isExternal: true }))
        ];

        return Response.json({ results: results.slice(0, 10) }); // Limit to top 10
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});