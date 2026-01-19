import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, resource_type, amount_requested, duration_hours } = await req.json();

    // Check available resources
    const resources = await base44.asServiceRole.entities.ComputeResource.filter({ 
      resource_type,
      is_tradeable: true 
    });

    const totalAvailable = resources.reduce((sum, r) => sum + (r.available_amount || 0), 0);

    if (totalAvailable < amount_requested) {
      return Response.json({ 
        error: 'Insufficient resources available',
        available: totalAvailable,
        requested: amount_requested 
      }, { status: 400 });
    }

    // Create resource allocation
    const allocation = await base44.asServiceRole.entities.ComputeResource.create({
      agent_id,
      resource_type,
      allocated_amount: amount_requested,
      used_amount: 0,
      available_amount: amount_requested,
      cost_per_unit: 0.01, // tokens per unit
      priority_level: 'normal',
      allocation_strategy: 'dynamic',
    });

    // Log request as approved
    await base44.asServiceRole.entities.ResourceRequest.create({
      requester_agent_id: agent_id,
      resource_type,
      amount_requested,
      duration_hours,
      status: 'allocated',
      allocated_resource_id: allocation.id,
    });

    return Response.json({
      success: true,
      allocation_id: allocation.id,
      allocated_amount: amount_requested,
      estimated_cost: (amount_requested * 0.01).toFixed(2),
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});