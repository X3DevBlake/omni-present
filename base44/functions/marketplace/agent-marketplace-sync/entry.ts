import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, agentId } = body;

    if (action === 'list') {
      // Fetch available agents
      const agents = await base44.asServiceRole.entities.AgentMarketplaceListing?.list?.()
        .catch(() => []);

      return Response.json({
        success: true,
        agents,
        count: agents?.length || 0,
      });
    }

    if (action === 'install') {
      // Install agent for user
      const purchase = await base44.asServiceRole.entities.AgentPurchase?.create?.({
        user_email: user.email,
        agent_listing_id: agentId,
        purchase_date: new Date().toISOString(),
        status: 'installed',
        license_key: `key-${Date.now()}`,
      }).catch(() => null);

      return Response.json({
        success: true,
        message: 'Agent installed successfully',
        licenseKey: purchase?.license_key,
      });
    }

    if (action === 'search') {
      const { query, category } = body;
      
      // Search agents
      const results = await base44.asServiceRole.entities.AgentMarketplaceListing?.filter?.({
        category: category || { $exists: true },
      }).catch(() => []);

      return Response.json({
        success: true,
        results,
        count: results?.length || 0,
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});