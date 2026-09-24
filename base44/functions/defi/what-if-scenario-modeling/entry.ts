export default async function whatIfScenarioModeling(data, context) {
  const { user_email, scenario_type, parameters } = data;
  
  const assets = await context.entities.CryptoAsset.filter({ user_email });
  const pools = await context.entities.LiquidityPool.filter({ user_email });
  
  const modeling = await context.integrations.Core.InvokeLLM({
    prompt: `AI-driven 'what-if' scenario modeling for DeFi portfolio:

Scenario: ${scenario_type}
Parameters: ${JSON.stringify(parameters)}

Current Portfolio:
Assets: ${assets.map(a => `${a.symbol}: $${(a.balance * (a.current_price || 0)).toFixed(2)}`).join(', ')}
LP Positions: ${pools.length} pools

Model complex interdependencies:
1. Protocol-to-protocol contagion
2. Liquidity cascade effects
3. Oracle manipulation impacts
4. Governance attack vectors
5. Smart contract exploit chains
6. Market panic scenarios
7. Regulatory shock waves
8. Bridge failure propagation

Simulate 24 hours forward with minute-level granularity.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: "object",
      properties: {
        scenario_name: { type: "string" },
        simulation_timeline: {
          type: "array",
          items: {
            type: "object",
            properties: {
              time_minutes: { type: "number" },
              events: { type: "array", items: { type: "string" } },
              portfolio_value: { type: "number" },
              affected_positions: { type: "array", items: { type: "string" } },
              cascading_effects: { type: "array", items: { type: "string" } }
            }
          }
        },
        final_impact: {
          type: "object",
          properties: {
            portfolio_loss_percentage: { type: "number" },
            value_at_risk: { type: "number" },
            positions_liquidated: { type: "number" },
            recovery_time_days: { type: "number" }
          }
        },
        interdependencies: {
          type: "array",
          items: {
            type: "object",
            properties: {
              protocol_a: { type: "string" },
              protocol_b: { type: "string" },
              connection_type: { type: "string" },
              risk_multiplier: { type: "number" }
            }
          }
        },
        mitigation_strategies: { type: "array", items: { type: "string" } }
      }
    }
  });
  
  await context.entities.SimulationScenario.create({
    scenario_name: modeling.scenario_name,
    description: `What-if scenario: ${scenario_type}`,
    agent_count: 1,
    duration_minutes: 1440,
    status: 'completed',
    results: {
      timeline: modeling.simulation_timeline,
      final_impact: modeling.final_impact,
      interdependencies: modeling.interdependencies
    }
  });
  
  return {
    scenario: modeling,
    max_loss: modeling.final_impact.portfolio_loss_percentage,
    recovery_time: modeling.final_impact.recovery_time_days
  };
}