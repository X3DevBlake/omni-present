import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token_pairs = ['ETH/USDT', 'BTC/USDT'], min_profit_threshold = 100 } = await req.json();

    // Mock price data - in production, integrate with real DEX APIs
    const mockPrices = {
      'ETH/USDT': {
        ethereum: 2450,
        polygon: 2465,
        arbitrum: 2458,
        optimism: 2462
      },
      'BTC/USDT': {
        ethereum: 42000,
        polygon: 42150,
        arbitrum: 42080
      }
    };

    const opportunities = [];

    for (const pair of token_pairs) {
      const prices = mockPrices[pair] || {};
      const chains = Object.keys(prices);

      // Find arbitrage opportunities
      for (let i = 0; i < chains.length; i++) {
        for (let j = i + 1; j < chains.length; j++) {
          const sourceChain = chains[i];
          const targetChain = chains[j];
          const sourcePrice = prices[sourceChain];
          const targetPrice = prices[targetChain];

          if (!sourcePrice || !targetPrice) continue;

          const priceDiff = Math.abs(targetPrice - sourcePrice);
          const priceDiffPercentage = (priceDiff / sourcePrice) * 100;

          // Estimate costs
          const gasCosts = {
            source_chain: 10,
            target_chain: 10,
            bridge_fee: 5
          };

          const totalCosts = gasCosts.source_chain + gasCosts.target_chain + gasCosts.bridge_fee;
          const estimatedProfit = (priceDiff * 100) - totalCosts; // Assuming 100 units

          if (estimatedProfit > min_profit_threshold && priceDiffPercentage > 0.5) {
            const opportunity = await base44.asServiceRole.entities.ArbitrageOpportunity.create({
              token_pair: pair,
              source_chain: sourceChain,
              target_chain: targetChain,
              source_price: sourcePrice,
              target_price: targetPrice,
              price_difference_percentage: priceDiffPercentage,
              estimated_profit: estimatedProfit,
              gas_costs: gasCosts,
              execution_complexity: priceDiffPercentage > 2 ? 'simple' : 'moderate',
              time_sensitivity: priceDiffPercentage * 10, // Higher diff = more urgent
              status: 'detected'
            });

            opportunities.push(opportunity);
          }
        }
      }
    }

    return Response.json({ 
      success: true,
      opportunities_found: opportunities.length,
      opportunities
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});