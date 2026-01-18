export default async function autonomousLiquidityManagement(data, context) {
  const { pool_id, rebalance_trigger } = data;
  
  const pool = await context.entities.LiquidityPool.get(pool_id);
  if (!pool) throw new Error('Pool not found');
  
  const historicalData = await context.entities.MarketAsset.filter({
    symbol: { $in: pool.pair.split('/') }
  }).sort('-created_date').limit(100);
  
  const token0Data = historicalData.filter(h => h.symbol === pool.pair.split('/')[0]);
  const token1Data = historicalData.filter(h => h.symbol === pool.pair.split('/')[1]);
  
  const currentRatio = token0Data[0]?.price / token1Data[0]?.price;
  const entryRatio = pool.entry_price || currentRatio;
  const priceChange = ((currentRatio - entryRatio) / entryRatio) * 100;
  
  const ilCalculation = await context.functions['defi/calculate-impermanent-loss']({
    pool_id,
    initial_price_a: entryRatio * token1Data[0]?.price,
    initial_price_b: token1Data[0]?.price,
    current_price_a: token0Data[0]?.price,
    current_price_b: token1Data[0]?.price
  });
  
  const rebalanceDecision = await context.integrations.Core.InvokeLLM({
    prompt: `Autonomously decide liquidity pool rebalancing:

Pool: ${pool.pair}
Current Value: $${pool.amount_deposited}
Entry Price Ratio: ${entryRatio.toFixed(4)}
Current Price Ratio: ${currentRatio.toFixed(4)}
Price Change: ${priceChange.toFixed(2)}%
Impermanent Loss: ${ilCalculation.impermanent_loss_percentage}%

APY: ${pool.apy}%
TVL: $${pool.tvl}

Recent Token 0 Prices: ${token0Data.slice(0, 5).map(d => d.price).join(', ')}
Recent Token 1 Prices: ${token1Data.slice(0, 5).map(d => d.price).join(', ')}

Trigger: ${rebalance_trigger}

Decision needed:
1. Continue (no action)
2. Rebalance (adjust position ratios)
3. Exit (withdraw liquidity)
4. Add liquidity (increase position)
5. Switch pool (move to better opportunity)

Provide reasoning and specific actions.`,
    response_json_schema: {
      type: "object",
      properties: {
        decision: { type: "string", enum: ["continue", "rebalance", "exit", "add_liquidity", "switch_pool"] },
        reasoning: { type: "string" },
        urgency: { type: "string", enum: ["immediate", "within_hour", "within_day", "low"] },
        actions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              action_type: { type: "string" },
              details: { type: "object" }
            }
          }
        },
        expected_outcome: {
          type: "object",
          properties: {
            new_apy: { type: "number" },
            il_reduction: { type: "number" },
            profit_improvement: { type: "number" }
          }
        },
        risk_assessment: { type: "string" }
      }
    }
  });
  
  let executedActions = [];
  
  if (rebalanceDecision.decision === 'rebalance') {
    await context.entities.LiquidityPool.update(pool_id, {
      rebalance_count: (pool.rebalance_count || 0) + 1,
      last_rebalance: new Date().toISOString(),
      rebalance_history: [
        ...(pool.rebalance_history || []),
        {
          timestamp: new Date().toISOString(),
          price_ratio: currentRatio,
          il_at_rebalance: ilCalculation.impermanent_loss_percentage,
          reasoning: rebalanceDecision.reasoning
        }
      ]
    });
    executedActions.push('Rebalanced position ratios');
  }
  
  if (rebalanceDecision.decision === 'exit') {
    await context.entities.LiquidityPool.update(pool_id, {
      status: 'withdrawn',
      exit_date: new Date().toISOString(),
      final_value: pool.amount_deposited * (1 + pool.apy / 100 / 365 * 30),
      exit_reason: rebalanceDecision.reasoning
    });
    executedActions.push('Exited position');
  }
  
  if (rebalanceDecision.decision === 'add_liquidity') {
    const additionalAmount = pool.amount_deposited * 0.2;
    await context.entities.LiquidityPool.update(pool_id, {
      amount_deposited: pool.amount_deposited + additionalAmount
    });
    executedActions.push(`Added $${additionalAmount.toFixed(2)} liquidity`);
  }
  
  await context.entities.AgentInteractionLog.create({
    agent_id: pool.managed_by_agent,
    action_taken: `Liquidity management: ${rebalanceDecision.decision}`,
    status: 'success',
    metadata: {
      pool_id,
      decision: rebalanceDecision,
      actions: executedActions
    }
  });
  
  return {
    decision: rebalanceDecision,
    impermanent_loss: ilCalculation,
    actions_executed: executedActions,
    autonomous: true,
    timestamp: new Date().toISOString()
  };
}