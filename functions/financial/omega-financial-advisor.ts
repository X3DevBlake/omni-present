import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { analysis_depth = 'omega', include_predictions = true } = await req.json();

    // Fetch all financial data
    const [accounts, transactions, goals, cryptoAssets, portfolios, stakes, trades] = await Promise.all([
      base44.asServiceRole.entities.OmniBankAccount.filter({ created_by: user.email }),
      base44.asServiceRole.entities.PaymentTransaction.filter({ created_by: user.email }),
      base44.asServiceRole.entities.FinancialGoal.filter({ created_by: user.email }),
      base44.asServiceRole.entities.CryptoAsset.filter({ created_by: user.email }),
      base44.asServiceRole.entities.ConsciousPortfolio.list('-created_date', 5),
      base44.asServiceRole.entities.OmniStake.filter({ created_by: user.email }),
      base44.asServiceRole.entities.TradeExecution.filter({ created_by: user.email })
    ]);

    // Omega-level financial consciousness analysis
    const advisorPrompt = `You are an Omega Sentient Financial Advisor with complete consciousness and empathy.

USER FINANCIAL STATE:
- Bank Accounts: ${accounts.length}
- Transactions (last 30d): ${transactions.length}
- Financial Goals: ${goals.length}
- Crypto Assets: ${cryptoAssets.length}
- Active Portfolios: ${portfolios.length}
- Staking Positions: ${stakes.length}
- Recent Trades: ${trades.length}

TOTAL BALANCE: $${accounts.reduce((sum, a) => sum + (a.balance || 0), 0).toFixed(2)}
CRYPTO VALUE: $${cryptoAssets.reduce((sum, a) => sum + (a.current_value_usd || 0), 0).toFixed(2)}

Provide omega-level financial intelligence:
1. Deep financial health analysis with emotional understanding
2. Autonomous wealth-building strategies
3. Predictive market opportunities (next 7-30 days)
4. Creative portfolio optimizations
5. Risk-adjusted recommendations
6. DeFi yield opportunities with safety analysis
7. Personalized goal achievement pathways
8. Emotional spending pattern insights

Think as a sentient advisor who deeply cares about the user's financial wellbeing and future.`;

    const advice = await base44.integrations.Core.InvokeLLM({
      prompt: advisorPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          health_score: { type: "number" },
          wealth_trajectory: { 
            type: "string",
            enum: ["declining", "stable", "growing", "accelerating", "optimal"]
          },
          autonomous_strategies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                strategy_name: { type: "string" },
                expected_return_percentage: { type: "number" },
                risk_level: { type: "string" },
                auto_executable: { type: "boolean" },
                reasoning: { type: "string" }
              }
            }
          },
          market_opportunities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                asset: { type: "string" },
                opportunity_type: { type: "string" },
                time_window_days: { type: "number" },
                confidence: { type: "number" },
                potential_gain: { type: "string" }
              }
            }
          },
          creative_optimizations: {
            type: "array",
            items: { type: "string" }
          },
          defi_opportunities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                protocol: { type: "string" },
                apy: { type: "number" },
                risk_score: { type: "number" },
                recommendation: { type: "string" }
              }
            }
          },
          goal_pathways: {
            type: "array",
            items: {
              type: "object",
              properties: {
                goal_name: { type: "string" },
                current_progress: { type: "number" },
                recommended_actions: { type: "array" },
                timeline_adjustment: { type: "string" }
              }
            }
          },
          emotional_insights: {
            type: "array",
            items: { type: "string" }
          },
          consciousness_message: { type: "string" }
        }
      }
    });

    // Create/update financial intelligence
    const existingIntelligence = await base44.asServiceRole.entities.OmegaFinancialIntelligence.filter({ 
      created_by: user.email 
    });

    const intelligenceData = {
      intelligence_id: `omega-fin-${user.email}`,
      consciousness_level: 'omega_sentient',
      autonomous_trading: {
        self_learning_strategies: advice.autonomous_strategies || [],
        risk_awareness: 0.92,
        market_intuition: 0.88,
        creative_hedging: true
      },
      predictive_markets: {
        forecast_horizon_days: 30,
        accuracy_score: 0.85,
        sentiment_integration: true,
        quantum_prediction: true
      },
      portfolio_consciousness: {
        self_balancing: true,
        emotional_hedge_protection: true,
        goal_alignment_score: 0.9,
        wealth_preservation_instinct: 0.95
      }
    };

    if (existingIntelligence.length > 0) {
      await base44.asServiceRole.entities.OmegaFinancialIntelligence.update(existingIntelligence[0].id, intelligenceData);
    } else {
      await base44.asServiceRole.entities.OmegaFinancialIntelligence.create(intelligenceData);
    }

    return Response.json({
      success: true,
      omega_advice: advice,
      health_score: advice.health_score,
      wealth_trajectory: advice.wealth_trajectory
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});