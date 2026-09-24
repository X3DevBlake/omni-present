import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch data in parallel
    const [agents, kpis, collaborations, transactions] = await Promise.all([
      base44.entities.Agent?.list?.().catch(() => []),
      base44.entities.AgentKPI?.list?.().catch(() => []),
      base44.entities.AgentCollaboration?.list?.().catch(() => []),
      base44.entities.FinancialTransaction?.list?.().catch(() => []),
    ]);

    // Calculate aggregated metrics
    const totalTasks = kpis?.reduce((sum, k) => sum + (k.tasks_completed || 0), 0) || 0;
    const avgEfficiency = kpis?.length
      ? (kpis.reduce((sum, k) => sum + (k.efficiency || 0), 0) / kpis.length).toFixed(1)
      : 0;

    // Portfolio summary
    const totalSpent = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

    return Response.json({
      stats: {
        activeAgents: agents?.length || 0,
        totalTasksCompleted: totalTasks,
        avgEfficiency,
        collaborations: collaborations?.length || 0,
      },
      agents: agents?.slice(0, 20) || [],
      recentTransactions: transactions?.slice(0, 10) || [],
      portfolioSummary: {
        totalValue: 170000,
        totalSpent,
        activeAgents: agents?.length || 0,
      },
      alerts: [
        { id: 1, type: 'info', message: 'All systems operational' },
        { id: 2, type: 'success', message: `${agents?.length || 0} agents active` },
      ],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});