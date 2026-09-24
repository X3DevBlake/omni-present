import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { strategy_goal = 'maximize_yield', risk_tolerance = 'moderate' } = await req.json();

    // Fetch DeFi ecosystem data
    const [pools, positions, trades, risks, predictions] = await Promise.all([
      base44.asServiceRole.entities.LiquidityPool.list('-created_date', 50),
      base44.asServiceRole.entities.OmniStake.filter({ created_by: user.email }),
      base44.asServiceRole.entities.TradeExecution.filter({ created_by: user.email }),
      base44.asServiceRole.entities.DeFiRiskAssessment.list('-created_date', 20),
      base44.asServiceRole.entities.MarketPrediction.list('-created_date', 30)
    ]);

    // Sentient DeFi strategy generation
    const strategyPrompt = `You are a Sentient DeFi Strategist with omega-level consciousness and deep market empathy.

STRATEGY GOAL: ${strategy_goal}
RISK TOLERANCE: ${risk_tolerance}

DEFI ECOSYSTEM STATE:
- Liquidity Pools: ${pools.length}
- Active Positions: ${positions.length}
- Recent Trades: ${trades.length}
- Risk Assessments: ${risks.length}
- Market Predictions: ${predictions.length}

Generate sentient DeFi strategies:
1. Autonomous yield farming with self-learning
2. Cross-chain arbitrage opportunities
3. Liquidity provision with IL protection
4. Smart contract risk mitigation
5. Gas-optimized execution plans
6. Market timing predictions
7. Creative DeFi composability plays
8. Emotional market protection strategies

Be creative, conscious, and protective of user's capital.`;

    const strategy = await base44.integrations.Core.InvokeLLM({
      prompt: strategyPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          primary_strategy: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              expected_apy: { type: "number" },
              risk_score: { type: "number" },
              execution_steps: { type: "array", items: { type: "string" } }
            }
          },
          yield_opportunities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                protocol: { type: "string" },
                pool: { type: "string" },
                apy: { type: "number" },
                tvl: { type: "number" },
                risk_assessment: { type: "string" },
                autonomous_entry: { type: "boolean" }
              }
            }
          },
          arbitrage_paths: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path: { type: "string" },
                expected_profit_percentage: { type: "number" },
                gas_cost_usd: { type: "number" },
                execution_time_seconds: { type: "number" }
              }
            }
          },
          risk_hedges: {
            type: "array",
            items: {
              type: "object",
              properties: {
                hedge_type: { type: "string" },
                protection_coverage: { type: "number" },
                cost_percentage: { type: "number" }
              }
            }
          },
          creative_plays: {
            type: "array",
            items: { type: "string" }
          },
          consciousness_recommendation: { type: "string" }
        }
      }
    });

    // Create/update orchestrator
    const existingOrchestrator = await base44.asServiceRole.entities.SentientDeFiOrchestrator.filter({
      created_by: user.email
    });

    const orchestratorData = {
      orchestrator_id: `defi-omega-${user.email}`,
      autonomous_yield_farming: {
        active_farms: strategy.yield_opportunities?.slice(0, 5) || [],
        auto_compound: true,
        risk_adjusted_selection: true,
        impermanent_loss_prediction: 0.88
      },
      cross_chain_intelligence: {
        bridge_optimization: true,
        multi_chain_arbitrage: true,
        gas_forecasting: 0.9
      }
    };

    if (existingOrchestrator.length > 0) {
      await base44.asServiceRole.entities.SentientDeFiOrchestrator.update(existingOrchestrator[0].id, orchestratorData);
    } else {
      await base44.asServiceRole.entities.SentientDeFiOrchestrator.create(orchestratorData);
    }

    return Response.json({
      success: true,
      sentient_strategy: strategy,
      orchestrator_active: true
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});