import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id } = await req.json();

    // Get agent data and context
    const [presences, interactions, detections] = await Promise.all([
      base44.entities.AgentPhysicalPresence.filter({ agent_id }),
      base44.entities.PhysicalInteraction.filter({ agent_id }).limit(50),
      base44.entities.DynamicObjectDetection.filter({}).limit(30)
    ]);

    if (!presences.length) {
      return Response.json({ error: 'Agent not physically present' }, { status: 404 });
    }

    const presence = presences[0];

    // Analyze environment and patterns
    const recentInteractions = interactions.slice(0, 10);
    const successRate = recentInteractions.filter(i => i.success_score > 80).length / recentInteractions.length;

    // Use AI for autonomous decision making
    const decision = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze environment and make autonomous decision for agent:

Agent location: ${JSON.stringify(presence.current_location)}
Current activity: ${presence.current_activity}
Recent interactions: ${recentInteractions.length}
Success rate: ${(successRate * 100).toFixed(1)}%
Detected objects: ${detections.length}

Based on learned patterns and environmental analysis, propose autonomous action:
1. action_type (proactive_assistance, environmental_optimization, predictive_preparation, preventive_action, contextual_suggestion)
2. proposed_action (detailed description)
3. trigger_pattern (what pattern/cue triggered this)
4. confidence (0-1)
5. execution_steps (array of 3-5 steps)
6. safety_considerations (array of checks)
7. expected_impact (positive outcome)
8. requires_approval (boolean - if action is significant)`,
      response_json_schema: {
        type: "object",
        properties: {
          action_type: { type: "string" },
          proposed_action: { type: "string" },
          trigger_pattern: { type: "string" },
          confidence: { type: "number" },
          execution_steps: {
            type: "array",
            items: { 
              type: "object",
              properties: {
                step: { type: "string" },
                device_id: { type: "string" },
                estimated_duration_seconds: { type: "number" }
              }
            }
          },
          safety_considerations: {
            type: "array",
            items: { type: "string" }
          },
          expected_impact: { type: "string" },
          requires_approval: { type: "boolean" }
        }
      }
    });

    // Create autonomous action record
    const autonomousAction = await base44.entities.AutonomousAction.create({
      agent_id,
      action_type: decision.action_type,
      trigger_analysis: {
        detected_pattern: decision.trigger_pattern,
        confidence: decision.confidence,
        environmental_cues: detections.slice(0, 3).map(d => d.detected_object?.object_type),
        learned_behavior_match: successRate > 0.7
      },
      proposed_action: decision.proposed_action,
      execution_plan: {
        steps: decision.execution_steps,
        required_permissions: ['device_control'],
        safety_checks: decision.safety_considerations
      },
      approval_status: decision.requires_approval ? 'pending' : 'auto_approved',
      execution_status: 'queued'
    });

    // Auto-execute if low-risk
    if (!decision.requires_approval && decision.confidence > 0.8) {
      await base44.entities.AutonomousAction.update(autonomousAction.id, {
        execution_status: 'in_progress'
      });
      
      // Execute via existing function
      await base44.asServiceRole.functions.invoke('execute-physical-action', {
        agent_id,
        action_plan: decision.execution_steps
      });

      await base44.entities.AutonomousAction.update(autonomousAction.id, {
        execution_status: 'completed',
        outcome: {
          success: true,
          user_satisfaction: 90,
          impact_assessment: decision.expected_impact,
          lessons_learned: 'Successfully executed autonomous action'
        }
      });
    }

    return Response.json({
      success: true,
      decision,
      autonomous_action: autonomousAction,
      auto_executed: !decision.requires_approval && decision.confidence > 0.8
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});