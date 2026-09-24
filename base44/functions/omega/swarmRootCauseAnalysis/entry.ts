import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { swarm_id, issue_type } = await req.json();

    const swarms = await base44.entities.AgentSwarmHierarchy.filter({ swarm_id });
    const swarm = swarms[0];

    if (!swarm) {
      return Response.json({ error: 'Swarm not found' }, { status: 404 });
    }

    // Get historical data
    const anomalies = await base44.entities.AnomalyDetection.filter({
      detection_source: 'agent_behavior'
    }, '-created_date', 10);

    const context = {
      current_capability: swarm.recursive_capability_Cs,
      recent_anomalies: anomalies.length,
      gwt_sustainability: swarm.gwt_implementation?.sustainability_ratio || 0.5,
      broadcast_frequency: swarm.broadcast_history?.length || 0
    };

    // AI root cause analysis
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Perform root cause analysis for swarm ${swarm_id} experiencing ${issue_type}.
      
      Context:
      - Current capability: ${context.current_capability}
      - Recent anomalies: ${context.recent_anomalies}
      - GWT sustainability: ${context.gwt_sustainability}
      - Broadcast frequency: ${context.broadcast_frequency}
      
      Identify the primary root cause and contributing factors with their contribution percentages.
      Provide specific remediation steps.`,
      response_json_schema: {
        type: 'object',
        properties: {
          causes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                contribution: { type: 'number' },
                evidence: { type: 'string' }
              }
            }
          },
          remediation_steps: { type: 'array', items: { type: 'string' } },
          estimated_recovery_time_hours: { type: 'number' }
        }
      }
    });

    return Response.json({
      swarm_id,
      issue_type,
      ...analysis,
      analysis_timestamp: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});