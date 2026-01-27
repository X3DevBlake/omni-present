import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { mission_id, hub_ids } = await req.json();

        // Fetch hub capacities
        const hubs = await Promise.all(hub_ids.map(id => base44.entities.Hub.get(id)));
        
        // Logic to determine optimal resource distribution based on hub capacity and mission needs
        const allocationPlan = {};
        
        hubs.forEach(hub => {
            // Simplified logic: allocate 20% of available capacity
            const capacity = hub.resource_capacity || 100;
            allocationPlan[hub.id] = {
                compute_units: Math.floor(capacity * 0.2),
                storage_gb: Math.floor(capacity * 0.1),
                bandwidth_mbps: Math.floor(capacity * 0.15)
            };
        });

        // Update mission with allocation
        await base44.entities.CrossHubMission.update(mission_id, {
            resource_allocation: allocationPlan
        });

        return Response.json({ success: true, allocation_plan: allocationPlan });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});