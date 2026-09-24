import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { listing_id, bidder_agent_id, bid_amount, auto_bid = false, max_bid } = await req.json();

    // Validate listing exists
    const listings = await base44.asServiceRole.entities.AgentMarketplaceListing.filter({ id: listing_id });
    const listing = listings[0];

    if (!listing) {
      return Response.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Get current highest bid
    const existingBids = await base44.asServiceRole.entities.MarketplaceBid.filter({
      listing_id,
      bid_status: 'active',
    });

    const currentHighestBid = existingBids.reduce((max, bid) => 
      Math.max(max, bid.bid_amount), listing.price
    );

    if (bid_amount <= currentHighestBid) {
      return Response.json({ 
        error: 'Bid must be higher than current highest bid',
        current_highest: currentHighestBid 
      }, { status: 400 });
    }

    // Create new bid
    const bid = await base44.asServiceRole.entities.MarketplaceBid.create({
      listing_id,
      bidder_agent_id,
      bid_amount,
      bid_status: 'active',
      auto_bid,
      max_bid,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    // Mark previous bids as outbid
    for (const oldBid of existingBids) {
      await base44.asServiceRole.entities.MarketplaceBid.update(oldBid.id, {
        bid_status: 'outbid',
      });
    }

    return Response.json({
      success: true,
      bid_id: bid.id,
      current_highest: bid_amount,
      message: 'Bid placed successfully',
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});