import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id } = await req.json();

    // Get agent data
    const agents = await base44.asServiceRole.entities.Agent.filter({ id: agent_id });
    const agent = agents[0];

    if (!agent) {
      return Response.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Get recent KPIs and tasks
    const [kpis, collaborations] = await Promise.all([
      base44.asServiceRole.entities.AgentKPI.filter({ agent_id }, '-created_date', 30),
      base44.asServiceRole.entities.AgentCollaboration.filter({
        $or: [
          { initiator_agent_id: agent_id },
          { participant_agent_ids: { $in: [agent_id] } }
        ]
      }, '-created_date', 20),
    ]);

    // AI-powered metrics analysis
    const metricsAnalysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `As an AI performance analyst, analyze this agent's metrics and behavior:

Agent: ${agent.name}
Recent KPIs: ${JSON.stringify(kpis.slice(0, 5))}
Collaborations: ${collaborations.length}

Calculate:
1. Task completion rate (0-100)
2. Efficiency score (0-100)
3. Error rate (0-100)
4. Resource utilization estimates
5. Skill evolution patterns
6. Behavioral anomalies
7. Collaboration effectiveness (0-100)`,
      response_json_schema: {
        type: "object",
        properties: {
          task_completion_rate: { type: "number" },
          efficiency_score: { type: "number" },
          error_rate: { type: "number" },
          resource_utilization: { type: "object" },
          skill_evolution: { type: "array", items: { type: "object" } },
          anomalies_detected: { type: "array", items: { type: "object" } },
          collaboration_effectiveness: { type: "number" }
        }
      }
    });

    // Store metrics
    const metrics = await base44.asServiceRole.entities.AgentPerformanceMetrics.create({
      agent_id,
      time_period: new Date().toISOString().split('T')[0],
      task_completion_rate: metricsAnalysis.task_completion_rate,
      efficiency_score: metricsAnalysis.efficiency_score,
      error_rate: metricsAnalysis.error_rate,
      resource_utilization: metricsAnalysis.resource_utilization,
      skill_evolution: metricsAnalysis.skill_evolution,
      anomalies_detected: metricsAnalysis.anomalies_detected.map(a => ({
        ...a,
        timestamp: new Date().toISOString()
      })),
      collaboration_effectiveness: metricsAnalysis.collaboration_effectiveness,
    });

    return Response.json({
      success: true,
      metrics_id: metrics.id,
      summary: {
        completion_rate: metricsAnalysis.task_completion_rate,
        efficiency: metricsAnalysis.efficiency_score,
        anomalies: metricsAnalysis.anomalies_detected.length,
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});