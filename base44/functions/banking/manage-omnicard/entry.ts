import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, card_id, data } = await req.json();

    switch (action) {
      case 'activate':
        await base44.entities.OmniCardExtended.update(card_id, {
          card_status: 'active'
        });
        return Response.json({ success: true, message: 'Card activated' });

      case 'suspend':
        await base44.entities.OmniCardExtended.update(card_id, {
          card_status: 'suspended'
        });
        return Response.json({ success: true, message: 'Card suspended' });

      case 'freeze':
        await base44.entities.OmniCardExtended.update(card_id, {
          card_status: 'frozen'
        });
        return Response.json({ success: true, message: 'Card frozen' });

      case 'update_limits':
        await base44.entities.OmniCardExtended.update(card_id, {
          spending_limit_daily: data.daily_limit,
          spending_limit_monthly: data.monthly_limit
        });
        return Response.json({ success: true, message: 'Limits updated' });

      case 'customize_design':
        await base44.entities.OmniCardExtended.update(card_id, {
          card_design: data.design
        });
        return Response.json({ success: true, message: 'Design updated' });

      case 'toggle_security':
        const card = await base44.entities.OmniCardExtended.get(card_id);
        await base44.entities.OmniCardExtended.update(card_id, {
          security_features: {
            ...card.security_features,
            [data.feature]: data.enabled
          }
        });
        return Response.json({ success: true, message: 'Security settings updated' });

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});