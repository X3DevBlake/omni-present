import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [agents, models, threats, predictions, collaborations] = await Promise.all([
      base44.entities.Agent.filter({ created_by: user.email }),
      base44.entities.ModelDeployment.filter({ created_by: user.email }),
      base44.entities.ThreatIntelligence.filter({ threat_status: { $ne: 'resolved' } }),
      base44.entities.PredictiveAnalytics.list('-created_date', 5),
      base44.entities.CollaborativeWorkspace.list('-created_date', 10)
    ]);

    const activeCollaborations = collaborations.filter(c => 
      c.participants?.some(p => p.participant_id === user.id && p.active)
    );

    const criticalThreats = threats.filter(t => t.severity_level === 'critical');

    const summary = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a personalized executive summary for user ${user.full_name}. 
      Data: ${agents.length} agents, ${models.length} models deployed, ${criticalThreats.length} critical threats, 
      ${activeCollaborations.length} active collaborations, ${predictions.length} recent predictions.
      Provide a brief 2-sentence summary highlighting key achievements and urgent items.`,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          highlights: {
            type: "array",
            items: { type: "string" }
          },
          urgent_items: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    const metrics = {
      total_agents: agents.length,
      active_agents: agents.filter(a => a.status === 'active').length,
      models_deployed: models.length,
      critical_threats: criticalThreats.length,
      active_collaborations: activeCollaborations.length,
      recent_predictions: predictions.length,
      system_health: 98 - (criticalThreats.length * 5)
    };

    return Response.json({
      success: true,
      summary: summary.summary,
      highlights: summary.highlights,
      urgent_items: summary.urgent_items,
      metrics,
      message: 'Dashboard summary generated'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});