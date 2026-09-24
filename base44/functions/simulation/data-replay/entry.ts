import { base44 } from '@/api/base44Client';
import { getEventTimeline, getEventStats } from './event-tracking';

export async function startDataReplay(simulationId, userEmail, replayName) {
  const replay = {
    simulation_id: simulationId,
    user_email: userEmail,
    name: replayName || `Replay ${new Date().toISOString()}`,
    status: 'recording',
    recorded_events: [],
    start_timestamp: new Date().toISOString(),
    playback_speed: 1,
    analytics: {},
    insights: []
  };

  return await base44.entities.DataReplay.create(replay);
}

export async function stopDataReplay(replayId, simulationId) {
  // Get all events from the simulation
  const events = await getEventTimeline(simulationId, 10000);

  // Generate analytics
  const analytics = await generateAnalytics(events);

  // Generate insights
  const insights = await generateInsights(analytics);

  return await base44.entities.DataReplay.update(replayId, {
    status: 'recorded',
    recorded_events: events,
    end_timestamp: new Date().toISOString(),
    analytics,
    insights
  });
}

export async function getReplayData(replayId) {
  const replay = await base44.entities.DataReplay.filter({ id: replayId });
  if (replay.length === 0) return null;
  return replay[0];
}

export async function playbackReplay(replayId, speed = 1) {
  return await base44.entities.DataReplay.update(replayId, {
    status: 'replaying',
    playback_speed: speed
  });
}

async function generateAnalytics(events) {
  if (events.length === 0) return {};

  const timelineData = [];
  const agentActivity = {};
  const eventSequence = [];

  events.forEach(event => {
    const timePoint = {
      time: event.simulation_time,
      event_type: event.event_type,
      agents: [event.source_agent, event.target_agent].filter(Boolean)
    };
    timelineData.push(timePoint);

    if (event.source_agent) {
      agentActivity[event.source_agent] = (agentActivity[event.source_agent] || 0) + 1;
    }

    eventSequence.push({
      type: event.event_type,
      time: event.simulation_time,
      severity: event.severity
    });
  });

  return {
    timeline: timelineData,
    agent_activity: agentActivity,
    event_sequence: eventSequence,
    total_events: events.length,
    duration: Math.max(...events.map(e => e.simulation_time || 0))
  };
}

async function generateInsights(analytics) {
  const insights = [];

  // Most active agents
  const sortedAgents = Object.entries(analytics.agent_activity || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  sortedAgents.forEach(([agent, count]) => {
    insights.push(`Agent ${agent} was most active with ${count} interactions`);
  });

  // Event patterns
  const eventTypes = analytics.event_sequence || [];
  const typeFrequency = {};
  eventTypes.forEach(e => {
    typeFrequency[e.type] = (typeFrequency[e.type] || 0) + 1;
  });

  const mostCommon = Object.entries(typeFrequency)
    .sort((a, b) => b[1] - a[1])[0];

  if (mostCommon) {
    insights.push(`Most common event: ${mostCommon[0]} (${mostCommon[1]} times)`);
  }

  return insights;
}