import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      gesture_type, // 'swipe_left', 'swipe_right', 'pinch', 'grab', 'point', 'wave', 'circle'
      hand_position, // {x, y, z}
      velocity,
      context // current view context
    } = await req.json();

    // Interpret gesture into action
    const interpretationPrompt = `You are an AI gesture interpreter for a 3D spatial environment.

GESTURE DETECTED: ${gesture_type}
HAND POSITION: x=${hand_position?.x}, y=${hand_position?.y}, z=${hand_position?.z}
VELOCITY: ${velocity}
CONTEXT: ${JSON.stringify(context)}

Interpret this gesture into a specific action. Consider:
- Swipe left/right: Navigate or rotate
- Pinch: Scale or zoom
- Grab: Move object or agent
- Point: Select or assign
- Wave: Dismiss or clear
- Circle: Create zone or highlight area

Provide the interpreted command with parameters.`;

    const interpretation = await base44.integrations.Core.InvokeLLM({
      prompt: interpretationPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          command_type: { 
            type: "string", 
            enum: ['select', 'move', 'rotate', 'scale', 'assign_task', 'adjust_environment', 'dismiss', 'navigate']
          },
          target_id: { type: "string" },
          target_type: { type: "string", enum: ['agent', 'object', 'sensor', 'device', 'zone'] },
          parameters: { 
            type: "object",
            properties: {
              new_position: { type: "object" },
              rotation_degrees: { type: "number" },
              scale_factor: { type: "number" },
              task_description: { type: "string" },
              adjustment_value: { type: "number" }
            }
          },
          confidence: { type: "number" },
          feedback_message: { type: "string" }
        }
      }
    });

    // Execute the interpreted command
    let executionResult = null;

    if (interpretation.confidence > 0.6) {
      switch (interpretation.command_type) {
        case 'move':
        case 'adjust_environment':
        case 'assign_task': {
          const manipResponse = await base44.functions.invoke('spatial-manipulation-engine', {
            action_type: interpretation.command_type === 'move' ? 'move_object' : 
                         interpretation.command_type === 'adjust_environment' ? 'adjust_environment' :
                         'assign_agent_task',
            target_id: interpretation.target_id,
            target_type: interpretation.target_type,
            parameters: interpretation.parameters
          });
          executionResult = manipResponse.data;
          break;
        }
        case 'select': {
          executionResult = { selected: interpretation.target_id, type: interpretation.target_type };
          break;
        }
      }
    }

    // Log gesture interaction
    await base44.asServiceRole.entities.GestureCommand.create({
      gesture_type,
      hand_position,
      velocity: velocity || 0,
      interpreted_command: interpretation.command_type,
      confidence: interpretation.confidence,
      executed: interpretation.confidence > 0.6,
      execution_result: executionResult ? JSON.stringify(executionResult) : null,
      timestamp: new Date().toISOString()
    });

    return Response.json({
      success: true,
      interpretation,
      execution_result: executionResult,
      feedback: interpretation.feedback_message
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});