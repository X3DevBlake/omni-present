export default async function generateProactiveAlerts(data, context) {
  const { user_email } = data;
  
  // Get recent KPIs for all user agents
  const agents = await context.entities.Agent.filter({ created_by: user_email });
  const kpis = await context.entities.AgentKPI.filter({ user_email }).sort('-created_date').limit(50);
  
  const alerts = [];
  
  // Analyze each agent's performance
  for (const agent of agents) {
    const agentKPIs = kpis.filter(k => k.agent_id === agent.id).slice(0, 5);
    
    if (agentKPIs.length < 2) continue;
    
    const latest = agentKPIs[0];
    const previous = agentKPIs[1];
    
    // Performance degradation detection
    if (latest.success_rate < previous.success_rate - 10) {
      alerts.push({
        alert_type: 'performance_degradation',
        severity: 'high',
        title: `${agent.name} Success Rate Dropped`,
        description: `Success rate decreased from ${previous.success_rate}% to ${latest.success_rate}%`,
        affected_agents: [agent.id],
        metrics: { previous: previous.success_rate, current: latest.success_rate },
        suggested_actions: [
          'Review recent task logs',
          'Check API integrations',
          'Consider retraining the agent'
        ],
        confidence_score: 85
      });
    }
    
    // Response time spike
    if (latest.response_time > previous.response_time * 1.5) {
      alerts.push({
        alert_type: 'performance_degradation',
        severity: 'medium',
        title: `${agent.name} Response Time Increased`,
        description: `Response time increased by ${Math.round((latest.response_time / previous.response_time - 1) * 100)}%`,
        affected_agents: [agent.id],
        metrics: { previous: previous.response_time, current: latest.response_time },
        suggested_actions: [
          'Optimize query patterns',
          'Check system resources',
          'Review database indexes'
        ],
        confidence_score: 75
      });
    }
    
    // Efficiency improvement (positive alert)
    if (latest.efficiency > previous.efficiency * 1.2) {
      alerts.push({
        alert_type: 'unusual_pattern',
        severity: 'low',
        title: `${agent.name} Efficiency Improved`,
        description: `Efficiency increased by ${Math.round((latest.efficiency / previous.efficiency - 1) * 100)}%`,
        affected_agents: [agent.id],
        metrics: { previous: previous.efficiency, current: latest.efficiency },
        suggested_actions: [
          'Document current practices',
          'Apply learnings to other agents',
          'Monitor for sustainability'
        ],
        confidence_score: 90
      });
    }
  }
  
  // Create alert records
  const createdAlerts = await Promise.all(
    alerts.map(alert => context.entities.ProactiveAlert.create(alert))
  );
  
  return { alerts: createdAlerts, count: createdAlerts.length };
}