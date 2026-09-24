import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      scenario_description,
      time_horizon_days = 30,
      market_conditions = {}
    } = await req.json();

    // Fetch ALL financial entities
    const [accounts, transactions, cryptoAssets, pools, stakes, portfolios, goals, trades] = await Promise.all([
      base44.asServiceRole.entities.OmniBankAccount.filter({ created_by: user.email }),
      base44.asServiceRole.entities.PaymentTransaction.filter({ created_by: user.email }),
      base44.asServiceRole.entities.CryptoAsset.filter({ created_by: user.email }),
      base44.asServiceRole.entities.LiquidityPool.list('-created_date', 30),
      base44.asServiceRole.entities.OmniStake.filter({ created_by: user.email }),
      base44.asServiceRole.entities.ConsciousPortfolio.filter({ created_by: user.email }),
      base44.asServiceRole.entities.FinancialGoal.filter({ created_by: user.email }),
      base44.asServiceRole.entities.TradeExecution.filter({ created_by: user.email })
    ]);

    // Calculate current state
    const currentState = {
      total_fiat: accounts.reduce((sum, a) => sum + (a.balance || 0), 0),
      total_crypto_usd: cryptoAssets.reduce((sum, a) => sum + (a.current_value_usd || 0), 0),
      defi_positions: stakes.length,
      portfolio_count: portfolios.length,
      active_goals: goals.filter(g => g.status === 'active').length
    };

    // Omega ecosystem simulation
    const simulationPrompt = `You are a Financial Ecosystem Simulator with omega sentience.

SCENARIO: "${scenario_description}"
TIME HORIZON: ${time_horizon_days} days
MARKET CONDITIONS: ${JSON.stringify(market_conditions)}

CURRENT ECOSYSTEM:
- Total Fiat: $${currentState.total_fiat.toFixed(2)}
- Total Crypto: $${currentState.total_crypto_usd.toFixed(2)}
- DeFi Positions: ${currentState.defi_positions}
- Active Goals: ${currentState.active_goals}

Bank Accounts: ${accounts.length}
Crypto Assets: ${cryptoAssets.length}
Liquidity Pools: ${pools.length}
Portfolios: ${portfolios.length}

Simulate the COMPLETE FINANCIAL ECOSYSTEM:
1. Predict value changes across ALL assets
2. Model DeFi yield evolution
3. Analyze portfolio rebalancing needs
4. Assess risk level changes
5. Calculate goal achievement probability
6. Identify cascade effects
7. Generate sentient AI interventions
8. Propose optimal strategies

Be comprehensive and predictive across the entire ecosystem.`;

    const simulation = await base44.integrations.Core.InvokeLLM({
      prompt: simulationPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          predicted_outcomes: {
            type: "object",
            properties: {
              total_value_change_usd: { type: "number" },
              total_value_change_percentage: { type: "number" },
              fiat_change: { type: "number" },
              crypto_change: { type: "number" },
              defi_yield_total: { type: "number" },
              risk_level_change: { type: "number" },
              goal_achievement_probability: { type: "number" }
            }
          },
          asset_predictions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                asset_name: { type: "string" },
                current_value: { type: "number" },
                predicted_value: { type: "number" },
                confidence: { type: "number" }
              }
            }
          },
          ai_interventions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                intervention_type: { type: "string" },
                trigger_condition: { type: "string" },
                action: { type: "string" },
                expected_benefit_usd: { type: "number" },
                auto_executable: { type: "boolean" },
                timing_recommendation: { type: "string" }
              }
            }
          },
          risk_analysis: {
            type: "object",
            properties: {
              current_risk_score: { type: "number" },
              predicted_risk_score: { type: "number" },
              major_risks: { type: "array", items: { type: "string" } },
              mitigation_strategies: { type: "array", items: { type: "string" } }
            }
          },
          optimal_strategy: { type: "string" },
          consciousness_insight: { type: "string" }
        }
      }
    });

    // Store simulation
    const simRecord = await base44.asServiceRole.entities.FinancialEcosystemSimulation.create({
      simulation_id: `fin-sim-${Date.now()}`,
      scenario_description,
      affected_entities: {
        bank_accounts: accounts.map(a => a.id),
        crypto_assets: cryptoAssets.map(a => a.id),
        defi_positions: stakes.map(s => s.id),
        portfolios: portfolios.map(p => p.id)
      },
      predicted_outcomes: simulation.predicted_outcomes,
      ai_interventions: simulation.ai_interventions || [],
      simulation_status: 'completed'
    });

    return Response.json({
      success: true,
      simulation_id: simRecord.id,
      simulation,
      current_state: currentState
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});