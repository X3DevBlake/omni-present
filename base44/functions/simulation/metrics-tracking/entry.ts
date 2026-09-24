import { base44 } from '@/api/base44Client';

export async function recordMetrics(simulationId, userEmail, metricsData) {
  const metrics = {
    simulation_id: simulationId,
    user_email: userEmail,
    timestamp: new Date().toISOString(),
    agent_count: metricsData.agentCount || 0,
    average_performance: metricsData.averagePerformance || 0,
    collaboration_score: metricsData.collaborationScore || 0,
    objective_completion: metricsData.objectiveCompletion || 0,
    resource_efficiency: metricsData.resourceEfficiency || 0,
    events_triggered: metricsData.eventsTriggered || 0,
    anomalies_detected: metricsData.anomaliesDetected || 0,
    agent_states: metricsData.agentStates || {}
  };

  return await base44.entities.SimulationMetrics.create(metrics);
}

export async function getMetricsHistory(simulationId, limit = 100) {
  return await base44.entities.SimulationMetrics.filter(
    { simulation_id: simulationId },
    '-timestamp',
    limit
  );
}

export async function calculateAverageMetrics(simulationId) {
  const metrics = await getMetricsHistory(simulationId, 1000);
  
  if (metrics.length === 0) return null;

  const avgPerformance = metrics.reduce((sum, m) => sum + (m.average_performance || 0), 0) / metrics.length;
  const avgCollaboration = metrics.reduce((sum, m) => sum + (m.collaboration_score || 0), 0) / metrics.length;
  const avgCompletion = metrics.reduce((sum, m) => sum + (m.objective_completion || 0), 0) / metrics.length;
  const avgEfficiency = metrics.reduce((sum, m) => sum + (m.resource_efficiency || 0), 0) / metrics.length;

  return {
    average_performance: avgPerformance,
    average_collaboration: avgCollaboration,
    average_completion: avgCompletion,
    average_efficiency: avgEfficiency,
    total_records: metrics.length
  };
}

export async function detectAnomalies(simulationId) {
  const metrics = await getMetricsHistory(simulationId, 50);
  
  const anomalies = [];
  const threshold = 2; // Standard deviations

  // Calculate mean and std for each metric
  const performances = metrics.map(m => m.average_performance || 0);
  const mean = performances.reduce((a, b) => a + b, 0) / performances.length;
  const variance = performances.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / performances.length;
  const std = Math.sqrt(variance);

  metrics.forEach((metric, idx) => {
    const zscore = Math.abs((metric.average_performance - mean) / std);
    if (zscore > threshold) {
      anomalies.push({
        timestamp: metric.timestamp,
        metric_index: idx,
        z_score: zscore,
        value: metric.average_performance
      });
    }
  });

  return anomalies;
}