import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { current_page, recent_activity } = await req.json();

    // Fetch contextual data
    const [alerts, goals, simulations, agents] = await Promise.all([
      base44.asServiceRole.entities.ProactiveAlert.filter({ status: 'active' }),
      base44.asServiceRole.entities.CollaborationTask.filter({ status: 'in_progress' }),
      base44.asServiceRole.entities.Simulation.filter({ status: 'running' }),
      base44.asServiceRole.entities.Agent.list(),
    ]);

    // Generate AI-driven suggestions
    const suggestions = [];

    // Critical alerts
    if (alerts.length > 0) {
      suggestions.push({
        priority: 'critical',
        title: 'Performance Alerts',
        description: `${alerts.length} issues need immediate attention`,
        destination: '/AutonomousAgentSystem',
        reason: 'System health monitoring',
      });
    }

    // Active simulations
    if (simulations.length > 0) {
      suggestions.push({
        priority: 'high',
        title: 'Active Simulations',
        description: `${simulations.length} simulations running`,
        destination: '/CollaborativeSimulationStudio',
        reason: 'Monitor real-time progress',
      });
    }

    // Stalled goals
    const stalledGoals = goals.filter(g => (g.progress_percentage || 0) < 30);
    if (stalledGoals.length > 0) {
      suggestions.push({
        priority: 'medium',
        title: 'Goals Need Boost',
        description: `${stalledGoals.length} goals below 30% progress`,
        destination: '/AgentOrchestrationHub',
        reason: 'Optimize agent collaboration',
      });
    }

    // Context-based suggestions
    if (current_page?.includes('AI') && agents.length > 10) {
      suggestions.push({
        priority: 'low',
        title: 'Agent Analytics',
        description: 'View comprehensive performance metrics',
        destination: '/AIAnalyticsHub',
        reason: 'Understand agent performance trends',
      });
    }

    return Response.json({
      success: true,
      suggestions: suggestions.slice(0, 5),
      context: {
        alerts_count: alerts.length,
        active_simulations: simulations.length,
        total_agents: agents.length,
        in_progress_goals: goals.length,
      },
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});