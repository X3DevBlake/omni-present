/**
 * Dynamic Event Generation from Geopolitical Data
 */

import { base44 } from '@base44/sdk';

export default async function dynamicEventGenerator(context) {
  const { simulation_id } = context.params;

  try {
    const geopoliticalEvents = await base44.asServiceRole.entities.GeopoliticalEvent.list('-created_date', 5);
    const agents = await base44.asServiceRole.entities.HolographicAgent.list();

    const event = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate dynamic simulation event based on real geopolitical data:

Recent events: ${geopoliticalEvents.map(e => e.event_name).join(', ')}
Active agents: ${agents.length}

Create unpredictable, challenging scenario:
1. Event name and category
2. Triggered by which real-world event
3. Impact on specific agents
4. Challenges agents must overcome
5. Duration`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          event_name: { type: 'string' },
          category: { type: 'string' },
          triggered_by: { type: 'string' },
          impact_agents: { type: 'array' },
          challenges: { type: 'array' },
          duration_hours: { type: 'number' }
        }
      }
    });

    const created = await base44.asServiceRole.entities.DynamicEvent.create({
      simulation_id,
      event_name: event.event_name,
      event_category: event.category,
      triggered_by: 'geopolitical',
      impact_agents: event.impact_agents,
      challenges: event.challenges,
      duration_hours: event.duration_hours,
      resolved: false
    });

    return { success: true, event_id: created.id, event };
  } catch (error) {
    return { success: false, error: error.message };
  }
}