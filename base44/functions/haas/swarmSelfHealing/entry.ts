import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mission_id } = await req.json();

    // Fetch mission
    const missions = await base44.entities.AIGeneratedMission.filter({ mission_id });
    if (!missions || missions.length === 0) {
      return Response.json({ error: 'Mission not found' }, { status: 404 });
    }

    const mission = missions[0];

    // Fetch swarm configuration
    const swarmConfigs = await base44.entities.SwarmConfiguration.filter({ 
      swarm_id: mission.assigned_swarm_id 
    });

    // Fetch agent performance metrics
    const agentMetrics = await base44.entities.SystemMetric.filter({
      component_type: 'agent'
    }, '-created_date', 20);

    // AI analyzes mission performance and detects issues
    const analysisPrompt = `Analyze ongoing mission for self-healing:

Mission: ${mission.high_level_goal}
Status: ${mission.mission_status}
Completion: ${mission.performance_metrics?.completion_percentage || 0}%
Efficiency: ${mission.performance_metrics?.efficiency_score || 1.0}

Agent Metrics (recent):
${agentMetrics.slice(0, 5).map(m => `${m.component_id}: ${m.metric_name}=${m.metric_value}, anomaly=${m.anomaly_detected}`).join('\n')}

Detect:
1. Performance issues requiring adaptation
2. Agent reassignments needed
3. Configuration optimizations
4. Self-healing actions`;

    const healingActions = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          issues_detected: {
            type: 'array',
            items: {type: 'string'}
          },
          adaptations_required: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                adaptation_type: {type: 'string'},
                agents_affected: {type: 'array', items: {type: 'string'}},
                parameters_to_change: {type: 'object'}
              }
            }
          },
          reassignments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                task_id: {type: 'string'},
                from_agent: {type: 'string'},
                to_agent: {type: 'string'},
                reason: {type: 'string'}
              }
            }
          }
        }
      }
    });

    // Apply adaptations
    const adaptationEvents = healingActions.adaptations_required?.map(adapt => ({
      timestamp: new Date().toISOString(),
      trigger: adapt.adaptation_type,
      adaptation_type: 'self_healing',
      agents_affected: adapt.agents_affected
    })) || [];

    // Update mission with adaptation events
    const updatedAdaptations = [...(mission.adaptation_events || []), ...adaptationEvents];
    
    await base44.entities.AIGeneratedMission.update(mission.id, {
      adaptation_events: updatedAdaptations,
      performance_metrics: {
        ...mission.performance_metrics,
        adaptation_count: updatedAdaptations.length
      }
    });

    return Response.json({
      success: true,
      mission_id,
      issues_detected: healingActions.issues_detected?.length || 0,
      adaptations_applied: adaptationEvents.length,
      healing_actions: healingActions
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      details: 'Failed to execute swarm self-healing'
    }, { status: 500 });
  }
});