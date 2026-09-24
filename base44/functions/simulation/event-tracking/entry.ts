import { base44 } from '@/api/base44Client';

export async function recordEvent(simulationId, userEmail, eventData) {
  const event = {
    simulation_id: simulationId,
    user_email: userEmail,
    event_type: eventData.type,
    timestamp: new Date().toISOString(),
    simulation_time: eventData.simulationTime || 0,
    source_agent: eventData.sourceAgent,
    target_agent: eventData.targetAgent,
    description: eventData.description,
    impact: eventData.impact || {},
    severity: eventData.severity || 'low'
  };

  return await base44.entities.SimulationEvent.create(event);
}

export async function getEventTimeline(simulationId, limit = 100) {
  return await base44.entities.SimulationEvent.filter(
    { simulation_id: simulationId },
    'simulation_time',
    limit
  );
}

export async function filterEvents(simulationId, filters = {}) {
  const query = { simulation_id: simulationId, ...filters };
  return await base44.entities.SimulationEvent.filter(query);
}

export async function getEventStats(simulationId) {
  const events = await getEventTimeline(simulationId, 1000);

  const eventTypes = {};
  const severityCount = { low: 0, medium: 0, high: 0, critical: 0 };
  let totalImpact = 0;

  events.forEach(event => {
    eventTypes[event.event_type] = (eventTypes[event.event_type] || 0) + 1;
    severityCount[event.severity] = (severityCount[event.severity] || 0) + 1;
    totalImpact += Object.values(event.impact || {}).reduce((sum, val) => sum + (val || 0), 0);
  });

  return {
    total_events: events.length,
    event_types: eventTypes,
    severity_distribution: severityCount,
    average_impact: events.length > 0 ? totalImpact / events.length : 0
  };
}