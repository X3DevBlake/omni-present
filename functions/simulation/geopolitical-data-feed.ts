/**
 * Real-Time Geopolitical and Economic Data Feed
 */

import { base44 } from '@base44/sdk';

export default async function geopoliticalDataFeed(context) {
  const { simulation_id } = context.params;

  try {
    // Fetch real-time geopolitical events
    const events = await base44.integrations.Core.InvokeLLM({
      prompt: `Fetch current real-time geopolitical and economic events (last 24 hours):

Sources: News APIs, financial markets, government data
Include:
- Political events (elections, policy changes, conflicts)
- Economic events (market crashes, interest rate changes, trade deals)
- Social events (protests, movements)
- Environmental events (disasters, climate actions)
- Tech events (regulations, breakthroughs)

For each event provide:
- Name, type, affected countries
- Market impact (crypto, stocks, commodities)
- Severity (1-10)
- Simulation effects
- AI predictions`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          events: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                event_name: { type: 'string' },
                event_type: { type: 'string' },
                countries_affected: { type: 'array' },
                market_impact: { type: 'object' },
                severity: { type: 'number' },
                simulation_effects: { type: 'object' },
                ai_predictions: { type: 'array' }
              }
            }
          }
        }
      }
    });

    // Create event records
    const createdEvents = await Promise.all(
      events.events.map(event =>
        base44.asServiceRole.entities.GeopoliticalEvent.create({
          event_name: event.event_name,
          event_type: event.event_type,
          countries_affected: event.countries_affected,
          market_impact: event.market_impact,
          severity: event.severity,
          simulation_effects: event.simulation_effects,
          ai_predictions: event.ai_predictions
        })
      )
    );

    // Apply events to simulation
    const simulation = await base44.asServiceRole.entities.WorldSimulation.get(simulation_id);
    await base44.asServiceRole.entities.WorldSimulation.update(simulation_id, {
      environment_state: {
        ...simulation.environment_state,
        geopolitical_events: createdEvents.map(e => e.id),
        market_sentiment: events.events[0]?.market_impact?.crypto || 'neutral',
        last_event_update: new Date().toISOString()
      }
    });

    return {
      success: true,
      events_loaded: createdEvents.length,
      high_severity_count: createdEvents.filter(e => e.severity >= 7).length
    };

  } catch (error) {
    console.error('Geopolitical feed error:', error);
    return { success: false, error: error.message };
  }
}