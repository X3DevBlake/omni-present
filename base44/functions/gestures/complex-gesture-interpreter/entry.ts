/**
 * Complex Multi-Step Gesture Interpretation
 */

import { base44 } from '@base44/sdk';

export default async function complexGestureInterpreter(context) {
  const { agent_id, device_id, gesture_sequence } = context.params;

  try {
    const interpretation = await base44.integrations.Core.InvokeLLM({
      prompt: `Interpret complex gesture sequence:
${JSON.stringify(gesture_sequence)}

Generate:
1. Step-by-step execution plan
2. Haptic feedback for each step
3. Command result
4. Timing coordination`,
      response_json_schema: {
        type: 'object',
        properties: {
          steps: { type: 'array' },
          command_result: { type: 'string' }
        }
      }
    });

    const sequence = await base44.asServiceRole.entities.ComplexGestureSequence.create({
      agent_id,
      device_id,
      gesture_steps: interpretation.steps,
      command_result: interpretation.command_result,
      execution_success: true
    });

    for (const step of interpretation.steps) {
      await base44.asServiceRole.functions['devices/haptic-feedback-sync']({
        agent_id,
        device_id,
        action_type: step.gesture_type
      });
      await new Promise(resolve => setTimeout(resolve, step.timing_ms || 100));
    }

    return { success: true, sequence_id: sequence.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}