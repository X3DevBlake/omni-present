export default async function calculateAgentKPIs(data, context) {
  const { agent_id, time_range_days = 7 } = data;
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - time_range_days);
  
  // Get agent interactions and tasks
  const interactions = await context.entities.AgentInteractionLog.filter({
    agent_id,
    created_date: { $gte: cutoffDate.toISOString() }
  });
  
  // Calculate metrics
  const totalTasks = interactions.length;
  const successfulTasks = interactions.filter(i => i.status === 'success').length;
  const successRate = totalTasks > 0 ? (successfulTasks / totalTasks) * 100 : 0;
  
  const responseTimes = interactions
    .filter(i => i.response_time)
    .map(i => i.response_time);
  const avgResponseTime = responseTimes.length > 0 
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
    : 0;
  
  // Calculate efficiency (tasks per hour)
  const efficiency = totalTasks / (time_range_days * 24);
  
  // Create or update KPI record
  const kpi = await context.entities.AgentKPI.create({
    agent_id,
    tasks_completed: totalTasks,
    success_rate: Math.round(successRate * 10) / 10,
    response_time: Math.round(avgResponseTime * 100) / 100,
    efficiency: Math.round(efficiency * 10) / 10,
    time_period: `${time_range_days}d`,
    user_email: context.user.email
  });
  
  return kpi;
}