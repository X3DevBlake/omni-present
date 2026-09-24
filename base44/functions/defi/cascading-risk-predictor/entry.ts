export default async function cascadingRiskPredictor(data, context) {
  const { protocol_network, initial_shock } = data;
  
  const allPools = await context.entities.LiquidityPool.filter({}).limit(100);
  const protocols = [...new Set(allPools.map(p => p.pair.split('/')[0]))];
  
  const protocolGraph = await context.integrations.Core.InvokeLLM({
    prompt: `Analyze DeFi protocol interdependencies and predict cascading risks:

Initial Shock: ${initial_shock.description}
Affected Protocol: ${initial_shock.protocol}
Shock Magnitude: ${initial_shock.magnitude}%

Active Protocols: ${protocols.join(', ')}
Total Liquidity Pools: ${allPools.length}

Model cascading effects:
1. Direct protocol impact
2. Liquidity withdrawal cascades
3. Cross-protocol contagion via shared assets
4. Oracle price impact propagation
5. Liquidation cascades in lending protocols
6. DEX arbitrage destabilization
7. Stablecoin depegging risk

For each affected protocol, calculate:
- Time to contagion (hours)
- Impact severity (1-10)
- Probability of failure
- Mitigation window`,
    response_json_schema: {
      type: "object",
      properties: {
        cascade_timeline: {
          type: "array",
          items: {
            type: "object",
            properties: {
              time_hours: { type: "number" },
              affected_protocols: { type: "array", items: { type: "string" } },
              contagion_mechanism: { type: "string" },
              cumulative_impact_percentage: { type: "number" }
            }
          }
        },
        protocol_impacts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              protocol: { type: "string" },
              time_to_impact_hours: { type: "number" },
              severity: { type: "number" },
              failure_probability: { type: "number" },
              contagion_vectors: { type: "array", items: { type: "string" } },
              mitigation_window_hours: { type: "number" },
              recommended_actions: { type: "array", items: { type: "string" } }
            }
          }
        },
        critical_nodes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              protocol: { type: "string" },
              criticality_score: { type: "number" },
              connected_protocols: { type: "array", items: { type: "string" } }
            }
          }
        },
        system_wide_risk: { type: "number" },
        circuit_breaker_triggers: { type: "array", items: { type: "string" } }
      }
    }
  });
  
  for (const impact of protocolGraph.protocol_impacts) {
    if (impact.failure_probability > 0.3) {
      await context.entities.ProactiveAlert.create({
        alert_type: 'security_threat',
        severity: impact.severity > 7 ? 'critical' : 'high',
        title: `Cascading Risk: ${impact.protocol}`,
        description: `${impact.protocol} at risk in ${impact.time_to_impact_hours}h due to ${impact.contagion_vectors.join(', ')}`,
        suggested_actions: impact.recommended_actions,
        status: 'active',
        confidence_score: impact.failure_probability * 100
      });
    }
  }
  
  await context.entities.SimulationAnomaly.create({
    anomaly_type: 'cascading_risk',
    severity: protocolGraph.system_wide_risk > 70 ? 'critical' : 'high',
    description: `Cascading risk analysis: ${protocolGraph.protocol_impacts.length} protocols affected`,
    detection_method: 'ai_graph_analysis',
    impact_score: protocolGraph.system_wide_risk
  });
  
  return {
    cascade_analysis: protocolGraph,
    protocols_at_risk: protocolGraph.protocol_impacts.length,
    max_contagion_time: Math.max(...protocolGraph.cascade_timeline.map(t => t.time_hours))
  };
}