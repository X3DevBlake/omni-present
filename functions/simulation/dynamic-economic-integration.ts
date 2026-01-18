export default async function dynamicEconomicIntegration(data, context) {
  const { scenario_id, real_world_data = true } = data;
  
  const economicData = await context.integrations.Core.InvokeLLM({
    prompt: `Fetch current real-world economic data for simulation integration:

Get latest:
1. Global GDP growth rates
2. Inflation rates (major economies)
3. Interest rates (Fed, ECB, BoJ)
4. Unemployment rates
5. Stock market indices
6. Commodity prices (oil, gold, etc)
7. Currency exchange rates
8. Economic sentiment indicators

Format as simulation parameters.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: "object",
      properties: {
        gdp_growth: { type: "object" },
        inflation_rates: { type: "object" },
        interest_rates: { type: "object" },
        market_indices: { type: "object" },
        commodity_prices: { type: "object" },
        simulation_parameters: {
          type: "object",
          properties: {
            resource_scarcity_multiplier: { type: "number" },
            trade_friction_coefficient: { type: "number" },
            innovation_rate: { type: "number" },
            market_volatility: { type: "number" }
          }
        }
      }
    }
  });
  
  const geopoliticalEvents = await context.integrations.Core.InvokeLLM({
    prompt: `Fetch current geopolitical events for simulation:

Get recent events:
1. International conflicts
2. Trade agreements/disputes
3. Regulatory changes
4. Political instability
5. Natural disasters
6. Technological breakthroughs

Convert to simulation events.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: "object",
      properties: {
        events: {
          type: "array",
          items: {
            type: "object",
            properties: {
              event_type: { type: "string" },
              severity: { type: "number" },
              affected_regions: { type: "array", items: { type: "string" } },
              economic_impact: { type: "string" },
              simulation_trigger: { type: "string" }
            }
          }
        }
      }
    }
  });
  
  const scenario = await context.entities.SimulationScenario.get(scenario_id);
  await context.entities.SimulationScenario.update(scenario_id, {
    orchestration_config: {
      ...scenario.orchestration_config,
      real_world_economic_data: economicData,
      real_world_geopolitical_events: geopoliticalEvents.events,
      last_integration: new Date().toISOString()
    }
  });
  
  for (const event of geopoliticalEvents.events.slice(0, 5)) {
    await context.entities.GeopoliticalEvent.create({
      event_type: event.event_type,
      event_name: event.simulation_trigger,
      severity_level: event.severity,
      affected_regions: event.affected_regions,
      economic_impact: event.economic_impact,
      simulation_parameters: {
        scenario_id,
        trigger_time: Math.random() * 60
      }
    });
  }
  
  return {
    economic_data: economicData,
    geopolitical_events: geopoliticalEvents.events.length,
    integration_timestamp: new Date().toISOString()
  };
}