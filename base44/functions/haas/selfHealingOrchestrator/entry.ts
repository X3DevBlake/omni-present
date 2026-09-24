import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mission_command_id } = await req.json();

    // Fetch mission and performance metrics
    const missions = await base44.entities.MissionCommand.filter({ command_id: mission_command_id });
    if (!missions || missions.length === 0) {
      return Response.json({ error: 'Mission not found' }, { status: 404 });
    }

    const mission = missions[0];

    // Analyze current mission performance
    const metrics = await base44.entities.SystemMetric.list('-created_date', 30);
    const missionMetrics = metrics.filter(m => 
      mission.task_assignments?.some(ta => ta.agent_id === m.component_id)
    );

    // Detect issues
    const issues = missionMetrics.filter(m => m.anomaly_detected);

    if (issues.length === 0) {
      return Response.json({ 
        success: true, 
        message: 'Mission operating normally',
        healing_events: []
      });
    }

    // AI generates self-healing adaptations
    const healingPrompt = `Mission experiencing issues:

Mission Goal: ${mission.high_level_goal}
Issues Detected: ${issues.map(i => `${i.metric_name}: ${i.metric_value} (deviation: ${i.deviation_from_baseline})`).join('; ')}

Propose self-healing adaptations:
1. Identify root causes
2. Suggest configuration changes
3. Recommend agent reassignments if needed`;

    const healing = await base44.integrations.Core.InvokeLLM({
      prompt: healingPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          healing_actions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                event_type: { type: 'string' },
                trigger: { type: 'string' },
                adaptation_taken: { type: 'string' },
                effectiveness: { type: 'number' }
              }
            }
          }
        }
      }
    });

    // Apply healing actions and update mission
    const updatedMission = {
      ...mission,
      self_healing_events: [
        ...(mission.self_healing_events || []),
        ...healing.healing_actions
      ],
      mission_status: 'adapting'
    };

    await base44.entities.MissionCommand.update(mission.id, updatedMission);

    return Response.json({
      success: true,
      mission_id: mission_command_id,
      healing_actions: healing.healing_actions,
      issues_addressed: issues.length
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      details: 'Failed to execute self-healing'
    }, { status: 500 });
  }
});