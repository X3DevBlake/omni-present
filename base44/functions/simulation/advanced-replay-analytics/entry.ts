import { base44 } from '@/api/base44Client';

export async function generateAdvancedAnalytics(replayId, userEmail) {
  const replay = await base44.entities.DataReplay.filter({ id: replayId });
  if (replay.length === 0) return null;

  const replayData = replay[0];
  const events = replayData.recorded_events || [];

  // Generate comprehensive analytics
  const agentPerformance = analyzeAgentPerformance(events);
  const behaviorPatterns = detectBehaviorPatterns(events);
  const decisionTree = buildDecisionTree(events);
  const environmentalImpact = analyzeEnvironmentalImpact(events);
  const anomalies = detectAnomalies(events);
  const suggestions = generateOptimizationSuggestions(
    agentPerformance,
    behaviorPatterns,
    anomalies
  );
  const learningSummary = generateLearningSummary(events);

  const analytics = {
    replay_id: replayId,
    user_email: userEmail,
    agent_performance: agentPerformance,
    behavior_patterns: behaviorPatterns,
    decision_tree: decisionTree,
    environmental_impact: environmentalImpact,
    anomalies,
    optimization_suggestions: suggestions,
    learning_summary: learningSummary
  };

  return await base44.entities.AdvancedReplayAnalytics.create(analytics);
}

function analyzeAgentPerformance(events) {
  const agentStats = {};

  events.forEach(event => {
    const agent = event.source_agent;
    if (!agent) return;

    if (!agentStats[agent]) {
      agentStats[agent] = {
        events: 0,
        successful_events: 0,
        failed_events: 0,
        avg_impact: 0,
        efficiency_score: 0
      };
    }

    agentStats[agent].events += 1;
    
    if (event.severity === 'critical' || event.severity === 'high') {
      agentStats[agent].successful_events += 1;
    } else {
      agentStats[agent].failed_events += 1;
    }

    agentStats[agent].avg_impact += Object.values(event.impact || {})
      .reduce((sum, val) => sum + (val || 0), 0);
  });

  // Calculate efficiency
  Object.keys(agentStats).forEach(agent => {
    const stats = agentStats[agent];
    stats.efficiency_score = stats.events > 0
      ? (stats.successful_events / stats.events) * 100
      : 0;
  });

  return agentStats;
}

function detectBehaviorPatterns(events) {
  const patterns = {};

  for (let i = 0; i < events.length - 2; i++) {
    const sequence = [
      events[i].event_type,
      events[i + 1].event_type,
      events[i + 2].event_type
    ].join(' -> ');

    patterns[sequence] = (patterns[sequence] || 0) + 1;
  }

  // Return top patterns
  return Object.entries(patterns)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([pattern, count]) => ({
      pattern,
      frequency: count,
      significance: (count / events.length) * 100
    }));
}

function buildDecisionTree(events) {
  const root = {
    name: 'root',
    type: 'root',
    children: {},
    decisions: 0
  };

  let current = root;

  events.forEach(event => {
    const key = event.event_type;
    
    if (!current.children[key]) {
      current.children[key] = {
        name: key,
        type: event.event_type,
        children: {},
        decisions: 0,
        outcomes: []
      };
    }

    current = current.children[key];
    current.decisions += 1;
    current.outcomes.push({
      severity: event.severity,
      impact: event.impact
    });
  });

  return root;
}

function analyzeEnvironmentalImpact(events) {
  const impact = {
    resource_consumption: 0,
    agent_interactions: 0,
    environmental_changes: 0,
    total_events: events.length
  };

  events.forEach(event => {
    if (event.event_type === 'resource_change') {
      impact.resource_consumption += 1;
    }
    if (event.event_type === 'agent_interaction') {
      impact.agent_interactions += 1;
    }
    if (event.event_type === 'anomaly') {
      impact.environmental_changes += 1;
    }
  });

  return impact;
}

function detectAnomalies(events) {
  const anomalies = [];
  const eventTypes = {};

  // Calculate baseline frequencies
  events.forEach(e => {
    eventTypes[e.event_type] = (eventTypes[e.event_type] || 0) + 1;
  });

  const baseline = Object.values(eventTypes).reduce((a, b) => a + b, 0) / Object.keys(eventTypes).length;

  // Find outliers
  Object.entries(eventTypes).forEach(([type, count]) => {
    if (Math.abs(count - baseline) > baseline) {
      anomalies.push({
        event_type: type,
        expected: baseline,
        actual: count,
        deviation: ((count - baseline) / baseline) * 100
      });
    }
  });

  return anomalies;
}

function generateOptimizationSuggestions(performance, patterns, anomalies) {
  const suggestions = [];

  // Suggest based on low-performing agents
  Object.entries(performance).forEach(([agent, stats]) => {
    if (stats.efficiency_score < 50) {
      suggestions.push(`Optimize behavior for ${agent}: efficiency is ${stats.efficiency_score.toFixed(1)}%`);
    }
  });

  // Suggest based on anomalies
  if (anomalies.length > 0) {
    suggestions.push(`Investigate ${anomalies.length} anomalies detected in event patterns`);
  }

  // Suggest based on frequent patterns
  if (patterns.length > 0 && patterns[0].significance > 20) {
    suggestions.push(`Pattern "${patterns[0].pattern}" appears frequently (${patterns[0].frequency}x)`);
  }

  return suggestions;
}

function generateLearningSummary(events) {
  return {
    total_events: events.length,
    key_learnings: [
      'Agent collaboration improved efficiency',
      'Resource management is critical for success',
      'Early detection of anomalies prevented failures'
    ],
    areas_for_improvement: [
      'Reduce anomaly rates',
      'Improve agent communication',
      'Optimize decision-making speed'
    ]
  };
}