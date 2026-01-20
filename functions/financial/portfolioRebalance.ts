import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const pools = await base44.asServiceRole.entities.LiquidityPool.filter({
      is_active: true
    });

    const rebalanceNeeded = pools.filter(pool => {
      const ratio = pool.token_b_amount / pool.token_a_amount;
      return Math.abs(ratio - pool.target_ratio) > 0.1;
    });

    for (const pool of rebalanceNeeded) {
      await base44.integrations.Core.SendEmail({
        to: pool.created_by,
        subject: '💰 Portfolio Rebalance Alert',
        body: `Pool ${pool.pool_name} needs rebalancing\nCurrent ratio: ${(pool.token_b_amount / pool.token_a_amount).toFixed(2)}\nTarget: ${pool.target_ratio}`
      });
    }

    return Response.json({ success: true, pools_needing_rebalance: rebalanceNeeded.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});