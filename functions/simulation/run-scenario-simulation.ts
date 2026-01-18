import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { scenarioId, agentCount, duration, parameters } = body;

    // Create simulation record
    const simulation = await base44.asServiceRole.entities.Simulation?.create?.({
      scenario_id: scenarioId,
      agent_count: agentCount,
      duration_seconds: duration,
      status: 'initializing',
      start_time: new Date().toISOString(),
      parameters: parameters || {},
    }).catch(() => null);

    // Simulate scenario execution
    const metrics = {
      agentsActive: agentCount,
      totalSteps: 0,
      eventsProcessed: 0,
      anomaliesDetected: [],
      finalState: {},
    };

    // Generate simulation events
    for (let step = 0; step < 100; step++) {
      metrics.totalSteps++;
      metrics.eventsProcessed += Math.floor(Math.random() * 50) + 10;

      // Randomly detect anomalies
      if (Math.random() > 0.85) {
        metrics.anomaliesDetected.push({
          step,
          type: ['spike', 'breakdown', 'timeout'][Math.floor(Math.random() * 3)],
          severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        });
      }

      // Update simulation
      await base44.asServiceRole.entities.Simulation?.update?.(simulation?.id, {
        status: 'running',
        progress: Math.round((step / 100) * 100),
        total_steps: metrics.totalSteps,
        events_processed: metrics.eventsProcessed,
      }).catch(() => null);
    }

    // Complete simulation
    const finalState = {
      totalInteractions: metrics.eventsProcessed,
      anomalies: metrics.anomaliesDetected.length,
      averageAgentUtilization: 78 + Math.random() * 15,
      systemHealth: 'excellent',
    };

    await base44.asServiceRole.entities.Simulation?.update?.(simulation?.id, {
      status: 'completed',
      end_time: new Date().toISOString(),
      results: finalState,
    }).catch(() => null);

    return Response.json({
      success: true,
      simulationId: simulation?.id,
      metrics: {
        ...metrics,
        finalState,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});