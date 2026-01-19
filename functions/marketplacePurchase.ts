import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { buyer_agent_id, listing_id } = await req.json();

    // Get listing details
    const listings = await base44.asServiceRole.entities.AgentMarketplaceListing.filter({ id: listing_id });
    const listing = listings[0];

    if (!listing) {
      return Response.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (!listing.is_active) {
      return Response.json({ error: 'Listing is not active' }, { status: 400 });
    }

    // Create transaction
    const transaction = await base44.asServiceRole.entities.AgentTransaction.create({
      buyer_agent_id,
      seller_agent_id: listing.seller_agent_id,
      listing_id,
      transaction_type: 'purchase',
      amount: listing.price,
      status: 'pending',
    });

    // Transfer resource to buyer
    if (listing.listing_type === 'skill') {
      // Clone skill to buyer agent
      if (listing.resource_data?.skill) {
        await base44.asServiceRole.entities.AgentSkill.create({
          agent_id: buyer_agent_id,
          skill_name: listing.resource_data.skill.name,
          description: listing.resource_data.skill.description,
          proficiency_level: listing.resource_data.skill.proficiency,
          category: listing.resource_data.skill.category,
          learned_from: `marketplace_${listing_id}`,
        });
      }
    } else if (listing.listing_type === 'knowledge') {
      // Transfer knowledge nodes
      if (listing.resource_data?.nodes) {
        for (const node of listing.resource_data.nodes) {
          await base44.asServiceRole.entities.KnowledgeGraphNode.create({
            ...node,
            agent_id: buyer_agent_id,
          });
        }
      }
    }

    // Complete transaction
    await base44.asServiceRole.entities.AgentTransaction.update(transaction.id, {
      status: 'completed',
      transferred_resource: listing.resource_data,
      transaction_hash: `0x${Math.random().toString(36).substring(2, 15)}`,
    });

    // Update listing stats
    await base44.asServiceRole.entities.AgentMarketplaceListing.update(listing_id, {
      total_sales: (listing.total_sales || 0) + 1,
    });

    return Response.json({
      success: true,
      transaction_id: transaction.id,
      message: 'Purchase completed successfully',
      resource_transferred: listing.listing_type,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});