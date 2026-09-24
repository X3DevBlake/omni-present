import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { from_token, to_token, from_amount, slippage_tolerance } = await req.json();

    // Get current market rates (simulated - would integrate real DEX API)
    const marketRates = {
      'ETH-USDT': 2500,
      'BTC-USDT': 45000,
      'OMNI-USDT': 0.5,
      'ETH-BTC': 0.055,
      'ETH-OMNI': 5000,
      'BTC-OMNI': 90000
    };

    const pair = `${from_token}-${to_token}`;
    const reversePair = `${to_token}-${from_token}`;
    
    let exchange_rate = marketRates[pair] || (marketRates[reversePair] ? 1 / marketRates[reversePair] : 1);
    
    // Apply slippage
    exchange_rate = exchange_rate * (1 - (slippage_tolerance || 0.5) / 100);
    
    const to_amount = from_amount * exchange_rate;
    const gas_fee = 0.001; // Simulated gas fee
    const price_impact = (from_amount / 1000000) * 100; // Simulated impact

    // Create swap record
    const swap = await base44.entities.CryptoSwap.create({
      user_id: user.id,
      from_token,
      to_token,
      from_amount,
      to_amount,
      exchange_rate,
      slippage_tolerance: slippage_tolerance || 0.5,
      dex_used: 'UniswapV3',
      gas_fee,
      price_impact,
      status: 'processing',
      transaction_hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      ai_optimized: true
    });

    // Get user's crypto holdings
    const fromHolding = await base44.entities.CryptoToken.filter({
      symbol: from_token,
      created_by: user.email
    }).limit(1);

    if (!fromHolding.length || fromHolding[0].balance < from_amount) {
      return Response.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Update balances
    await base44.entities.CryptoToken.update(fromHolding[0].id, {
      balance: fromHolding[0].balance - from_amount
    });

    // Find or create destination token
    const toHolding = await base44.entities.CryptoToken.filter({
      symbol: to_token,
      created_by: user.email
    }).limit(1);

    if (toHolding.length) {
      await base44.entities.CryptoToken.update(toHolding[0].id, {
        balance: toHolding[0].balance + to_amount
      });
    } else {
      await base44.entities.CryptoToken.create({
        symbol: to_token,
        name: to_token,
        balance: to_amount,
        current_price: exchange_rate
      });
    }

    // Complete swap
    await base44.entities.CryptoSwap.update(swap.id, {
      status: 'completed'
    });

    return Response.json({
      success: true,
      swap_id: swap.id,
      from_amount,
      to_amount,
      exchange_rate,
      gas_fee,
      price_impact,
      transaction_hash: swap.transaction_hash,
      status: 'completed'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});