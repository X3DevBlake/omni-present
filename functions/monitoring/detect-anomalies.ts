export default async function detectAnomalies(data, context) {
  const { user_email, lookback_hours = 24 } = data;
  
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - lookback_hours);
  
  // Get recent KPIs
  const kpis = await context.entities.AgentKPI.filter({
    user_email,
    created_date: { $gte: cutoffDate.toISOString() }
  }).sort('-created_date');
  
  // Get baseline (older data)
  const baselineDate = new Date(cutoffDate);
  baselineDate.setHours(baselineDate.getHours() - lookback_hours);
  
  const baseline = await context.entities.AgentKPI.filter({
    user_email,
    created_date: { 
      $gte: baselineDate.toISOString(),
      $lt: cutoffDate.toISOString()
    }
  });
  
  // Calculate baseline statistics
  const baselineStats = {
    avgSuccessRate: baseline.reduce((sum, k) => sum + (k.success_rate || 0), 0) / (baseline.length || 1),
    avgResponseTime: baseline.reduce((sum, k) => sum + (k.response_time || 0), 0) / (baseline.length || 1),
    avgEfficiency: baseline.reduce((sum, k) => sum + (k.efficiency || 0), 0) / (baseline.length || 1)
  };
  
  // Detect anomalies
  const anomalies = [];
  
  // Group by agent
  const agentIds = [...new Set(kpis.map(k => k.agent_id))];
  
  for (const agentId of agentIds) {
    const agentKPIs = kpis.filter(k => k.agent_id === agentId);
    const agentBaseline = baseline.filter(k => k.agent_id === agentId);
    
    if (agentKPIs.length === 0 || agentBaseline.length === 0) continue;
    
    const currentAvg = {
      successRate: agentKPIs.reduce((sum, k) => sum + (k.success_rate || 0), 0) / agentKPIs.length,
      responseTime: agentKPIs.reduce((sum, k) => sum + (k.response_time || 0), 0) / agentKPIs.length,
      efficiency: agentKPIs.reduce((sum, k) => sum + (k.efficiency || 0), 0) / agentKPIs.length
    };
    
    const baselineAvg = {
      successRate: agentBaseline.reduce((sum, k) => sum + (k.success_rate || 0), 0) / agentBaseline.length,
      responseTime: agentBaseline.reduce((sum, k) => sum + (k.response_time || 0), 0) / agentBaseline.length,
      efficiency: agentBaseline.reduce((sum, k) => sum + (k.efficiency || 0), 0) / agentBaseline.length
    };
    
    // Success rate drop
    if (currentAvg.successRate < baselineAvg.successRate * 0.8) {
      anomalies.push({
        agent_id: agentId,
        type: 'success_rate_drop',
        severity: 'high',
        current_value: currentAvg.successRate,
        baseline_value: baselineAvg.successRate,
        deviation_percentage: ((currentAvg.successRate - baselineAvg.successRate) / baselineAvg.successRate) * 100
      });
    }
    
    // Response time spike
    if (currentAvg.responseTime > baselineAvg.responseTime * 1.5) {
      anomalies.push({
        agent_id: agentId,
        type: 'response_time_spike',
        severity: 'medium',
        current_value: currentAvg.responseTime,
        baseline_value: baselineAvg.responseTime,
        deviation_percentage: ((currentAvg.responseTime - baselineAvg.responseTime) / baselineAvg.responseTime) * 100
      });
    }
    
    // Efficiency anomaly (could be positive or negative)
    if (Math.abs(currentAvg.efficiency - baselineAvg.efficiency) > baselineAvg.efficiency * 0.3) {
      anomalies.push({
        agent_id: agentId,
        type: 'efficiency_anomaly',
        severity: currentAvg.efficiency > baselineAvg.efficiency ? 'low' : 'medium',
        current_value: currentAvg.efficiency,
        baseline_value: baselineAvg.efficiency,
        deviation_percentage: ((currentAvg.efficiency - baselineAvg.efficiency) / baselineAvg.efficiency) * 100
      });
    }
  }
  
  return {
    anomalies,
    baseline_stats: baselineStats,
    detection_period: `${lookback_hours} hours`,
    anomaly_count: anomalies.length
  };
}