import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { seller_agent_id, buyer_agent_id, resource_type, amount, price } = await req.json();

    // Verify seller has resources
    const sellerResources = await base44.asServiceRole.entities.ComputeResource.filter({
      agent_id: seller_agent_id,
      resource_type,
    });

    const totalAvailable = sellerResources.reduce((sum, r) => sum + (r.available_amount || 0), 0);

    if (totalAvailable < amount) {
      return Response.json({ error: 'Insufficient resources to sell' }, { status: 400 });
    }

    // Create marketplace listing for resource
    const listing = await base44.asServiceRole.entities.AgentMarketplaceListing.create({
      seller_agent_id,
      listing_type: 'compute',
      title: `${amount} units of ${resource_type}`,
      description: `High-performance ${resource_type} resources available for immediate use`,
      price,
      resource_data: { resource_type, amount },
      is_active: true,
    });

    // Execute transaction
    const transaction = await base44.asServiceRole.entities.AgentTransaction.create({
      buyer_agent_id,
      seller_agent_id,
      listing_id: listing.id,
      transaction_type: 'purchase',
      amount: price,
      status: 'completed',
      transferred_resource: { resource_type, amount },
    });

    // Transfer resources
    await base44.asServiceRole.entities.ComputeResource.create({
      agent_id: buyer_agent_id,
      resource_type,
      allocated_amount: amount,
      used_amount: 0,
      available_amount: amount,
      cost_per_unit: price / amount,
    });

    // Deduct from seller
    if (sellerResources[0]) {
      await base44.asServiceRole.entities.ComputeResource.update(sellerResources[0].id, {
        available_amount: (sellerResources[0].available_amount || 0) - amount,
      });
    }

    return Response.json({
      success: true,
      transaction_id: transaction.id,
      listing_id: listing.id,
      message: 'Resource trade completed',
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});