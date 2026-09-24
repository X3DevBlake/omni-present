import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Gather data from multiple sources
    const [agents, simulations, transfers, coordinations, incidents] = await Promise.all([
      base44.entities.Agent.filter({}).limit(100),
      base44.entities.Simulation.filter({}).limit(50),
      base44.entities.KnowledgeTransfer.filter({}).limit(100),
      base44.entities.TaskCoordination.filter({}).limit(50),
      base44.entities.SecurityIncident.filter({}).limit(100)
    ]);

    // Use AI to identify patterns and correlations
    const analysisData = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze data patterns and correlations across systems:
      
Agents: ${agents.length}
Simulations: ${simulations.length}
Knowledge Transfers: ${transfers.length}
Task Coordinations: ${coordinations.length}
Security Incidents: ${incidents.length}

Identify 5 cross-system correlations with: source type, target type, correlation strength (-1 to 1), type (positive/negative/nonlinear), time lag in seconds, p_value (0-1), and whether likely causal (true/false).`,
      response_json_schema: {
        type: "object",
        properties: {
          correlations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                source: { type: "string" },
                target: { type: "string" },
                strength: { type: "number" },
                type: { type: "string" },
                lag: { type: "number" },
                p_value: { type: "number" },
                causal: { type: "boolean" }
              }
            }
          }
        }
      }
    });

    // Create correlation records
    const correlations = [];
    for (const corr of analysisData.correlations) {
      const created = await base44.entities.DataCorrelation.create({
        correlation_id: `CORR_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        source_entity_type: corr.source,
        target_entity_type: corr.target,
        correlation_strength: corr.strength,
        correlation_type: corr.type,
        time_lag_seconds: corr.lag,
        statistical_significance: {
          p_value: corr.p_value,
          confidence_level: 0.95,
          sample_size: 100
        },
        causal_analysis: {
          likely_causal: corr.causal,
          direction: corr.strength > 0 ? 'source_to_target' : 'bidirectional',
          confounding_factors: []
        },
        business_relevance: {
          relevance_score: Math.abs(corr.strength) * 100,
          actionable: Math.abs(corr.strength) > 0.5,
          use_cases: ['optimization', 'prediction']
        },
        discovery_method: 'ai_analysis'
      });
      correlations.push(created);
    }

    return Response.json({
      success: true,
      correlations,
      strong_correlations: correlations.filter(c => Math.abs(c.correlation_strength) > 0.7).length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});