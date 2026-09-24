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
      include_guild_learning = true,
      time_horizon_days = 30
    } = await req.json();

    // Fetch financial AND learning data
    const [accounts, cryptoAssets, guilds, learningInsights, agents] = await Promise.all([
      base44.asServiceRole.entities.OmniBankAccount.filter({ created_by: user.email }),
      base44.asServiceRole.entities.CryptoAsset.filter({ created_by: user.email }),
      base44.asServiceRole.entities.AgentLearningGuild.list('-created_date', 10),
      base44.asServiceRole.entities.OmegaLearningInsight.list('-created_date', 20),
      base44.asServiceRole.entities.Agent.list('-created_date', 50)
    ]);

    // Guild-enhanced financial simulation
    const simulationPrompt = `You are a Guild-Enhanced Financial Simulator with omega collective intelligence.

SCENARIO: "${scenario_description}"

FINANCIAL STATE:
- Fiat: $${accounts.reduce((sum, a) => sum + (a.balance || 0), 0).toFixed(2)}
- Crypto: $${cryptoAssets.reduce((sum, a) => sum + (a.current_value_usd || 0), 0).toFixed(2)}

LEARNING GUILDS: ${guilds.length}
${guilds.map(g => `
${g.guild_name}:
- Members: ${g.member_agents?.length}
- Collective IQ: ${g.collective_intelligence?.collective_iq}
- Synergy: ${g.guild_consciousness?.synergy_score}
`).join('\n')}

LEARNING INSIGHTS: ${learningInsights.length}

Simulate GUILD-ENHANCED FINANCIAL OUTCOMES:
1. Predict how collaborative learning improves trading strategies
2. Model emergent financial intelligence from guild synthesis
3. Assess collective risk assessment capabilities
4. Estimate guild-driven portfolio optimization
5. Predict novel DeFi strategies from collective creativity
6. Calculate synergy bonus on returns
7. Identify guild-specific opportunities
8. Measure knowledge transfer financial impact

Show how collective intelligence amplifies financial success.`;

    const simulation = await base44.integrations.Core.InvokeLLM({
      prompt: simulationPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          baseline_prediction: {
            type: "object",
            properties: {
              value_change_usd: { type: "number" },
              risk_score: { type: "number" }
            }
          },
          guild_enhanced_prediction: {
            type: "object",
            properties: {
              value_change_usd: { type: "number" },
              risk_score: { type: "number" },
              synergy_bonus_percentage: { type: "number" },
              emergent_strategies: { type: "array", items: { type: "string" } }
            }
          },
          guild_contributions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                guild_name: { type: "string" },
                contribution_type: { type: "string" },
                financial_impact_usd: { type: "number" },
                confidence: { type: "number" }
              }
            }
          },
          collective_intelligence_insights: {
            type: "array",
            items: { type: "string" }
          },
          emergent_opportunities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                opportunity: { type: "string" },
                guild_source: { type: "string" },
                expected_return: { type: "number" },
                novelty_score: { type: "number" }
              }
            }
          }
        }
      }
    });

    // Store simulation
    await base44.asServiceRole.entities.FinancialEcosystemSimulation.create({
      simulation_id: `guild-fin-${Date.now()}`,
      scenario_description: `${scenario_description} (Guild-Enhanced)`,
      predicted_outcomes: {
        total_value_change_usd: simulation.guild_enhanced_prediction?.value_change_usd || 0,
        risk_level_change: simulation.guild_enhanced_prediction?.risk_score || 0
      },
      simulation_status: 'completed'
    });

    return Response.json({
      success: true,
      simulation,
      synergy_bonus: simulation.guild_enhanced_prediction?.synergy_bonus_percentage
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});