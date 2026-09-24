import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token_pairs, min_profit_threshold = 1.0 } = await req.json();
    
    // Get current crypto asset data
    const assets = await base44.entities.CryptoAssetData.list();
    
    // Mock DEX price data (in production, would call actual DEX APIs)
    const mockDexPrices = {
      'uniswap': {},
      'sushiswap': {},
      'curve': {},
      'pancakeswap': {}
    };
    
    // Simulate price variations across DEXs
    assets.forEach(asset => {
      if (asset.current_price_usd) {
        mockDexPrices.uniswap[asset.token_symbol] = asset.current_price_usd;
        mockDexPrices.sushiswap[asset.token_symbol] = asset.current_price_usd * (0.98 + Math.random() * 0.04);
        mockDexPrices.curve[asset.token_symbol] = asset.current_price_usd * (0.97 + Math.random() * 0.06);
        mockDexPrices.pancakeswap[asset.token_symbol] = asset.current_price_usd * (0.96 + Math.random() * 0.08);
      }
    });
    
    const opportunities = [];
    
    // Scan for arbitrage opportunities
    for (const [dex1, prices1] of Object.entries(mockDexPrices)) {
      for (const [dex2, prices2] of Object.entries(mockDexPrices)) {
        if (dex1 === dex2) continue;
        
        for (const [token, price1] of Object.entries(prices1)) {
          const price2 = prices2[token];
          if (!price2) continue;
          
          const priceDiff = ((price2 - price1) / price1) * 100;
          
          // Estimate gas costs (simplified)
          const estimatedGasCost = 15; // USD
          const estimatedProfit = (Math.abs(priceDiff) * 1000) - estimatedGasCost; // Assuming $1000 trade
          
          if (Math.abs(priceDiff) >= min_profit_threshold && estimatedProfit > 0) {
            const opportunity = {
              token_pair: `${token}/USDT`,
              source_chain: dex1,
              target_chain: dex2,
              source_price: price1,
              target_price: price2,
              price_difference_percentage: Math.abs(priceDiff),
              estimated_profit: estimatedProfit,
              gas_costs: {
                source_chain: 8,
                target_chain: 7,
                bridge_fee: 0
              },
              execution_complexity: 'simple',
              time_sensitivity: Math.min(Math.abs(priceDiff) * 10, 100),
              status: 'detected',
              auto_execute: false
            };
            
            opportunities.push(opportunity);
            
            // Store in database
            await base44.entities.ArbitrageOpportunity.create(opportunity);
          }
        }
      }
    }
    
    // Sort by estimated profit
    opportunities.sort((a, b) => b.estimated_profit - a.estimated_profit);
    
    return Response.json({
      opportunities: opportunities.slice(0, 20),
      total_found: opportunities.length,
      scan_timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});