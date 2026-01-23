import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === 'create_listing') {
      const { listing_type, item_details, pricing } = await req.json();

      // AI verification and pricing suggestion
      const verification = await base44.integrations.Core.InvokeLLM({
        prompt: `Evaluate this ${listing_type} for marketplace listing: ${item_details.name} - ${item_details.description}. Provide safety score (0-1), suggested price adjustment, and performance validation.`,
        response_json_schema: {
          type: 'object',
          properties: {
            safety_score: { type: 'number' },
            price_suggestion: { type: 'number' },
            performance_validated: { type: 'boolean' },
            security_concerns: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      const listing = await base44.entities.OmegaMarketplaceListing.create({
        seller_id: user.id,
        listing_type: listing_type,
        item_details: {
          ...item_details,
          version: item_details.version || '1.0.0',
          capabilities: item_details.capabilities || [],
          performance_metrics: {}
        },
        pricing: {
          price_omni: pricing?.price_omni || verification.price_suggestion,
          price_usd: (pricing?.price_omni || verification.price_suggestion) * 2.5,
          pricing_model: 'one_time',
          subscription_available: false
        },
        verification_status: {
          verified: false,
          security_audited: false,
          performance_validated: verification.performance_validated,
          safety_score: verification.safety_score
        },
        marketplace_metrics: {
          total_purchases: 0,
          average_rating: 0,
          review_count: 0,
          revenue_generated: 0
        },
        compatibility: {
          compatible_platforms: ['omni_present', 'omega_core'],
          required_dependencies: [],
          minimum_ecosystem_version: '1.0.0'
        },
        deployment_info: {
          deployment_method: 'instant',
          setup_complexity: 'low',
          estimated_setup_time_minutes: 5,
          documentation_url: ''
        },
        api_access: {
          api_key_required: false,
          rate_limits: {},
          endpoints_available: []
        },
        listing_status: 'pending_review'
      });

      return Response.json({
        success: true,
        listing: listing,
        message: 'Listing created and pending review'
      });
    }

    if (action === 'purchase_listing') {
      const { listing_id } = await req.json();

      const listings = await base44.entities.OmegaMarketplaceListing.filter({ listing_id });
      const listing = listings[0];

      if (!listing) {
        return Response.json({ error: 'Listing not found' }, { status: 404 });
      }

      // Process purchase
      await base44.entities.OmegaMarketplaceListing.update(listing.id, {
        marketplace_metrics: {
          ...listing.marketplace_metrics,
          total_purchases: (listing.marketplace_metrics?.total_purchases || 0) + 1,
          revenue_generated: (listing.marketplace_metrics?.revenue_generated || 0) + listing.pricing.price_omni
        }
      });

      return Response.json({
        success: true,
        message: 'Purchase successful',
        item: listing.item_details,
        price_paid: listing.pricing.price_omni
      });
    }

    if (action === 'get_marketplace_listings') {
      const { listing_type, verified_only } = await req.json();

      let query = {};
      if (listing_type) query.listing_type = listing_type;
      
      const listings = await base44.entities.OmegaMarketplaceListing.filter(query);

      const filtered = verified_only 
        ? listings.filter(l => l.verification_status?.verified)
        : listings;

      return Response.json({
        success: true,
        listings: filtered,
        total_listings: filtered.length
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});