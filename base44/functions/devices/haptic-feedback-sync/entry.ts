/**
 * Haptic Feedback Synchronization System
 */

import { base44 } from '@base44/sdk';

export default async function hapticFeedbackSync(context) {
  const { agent_id, device_id, action_type } = context.params;

  try {
    const [agent, device] = await Promise.all([
      base44.asServiceRole.entities.HolographicAgent.get(agent_id),
      base44.asServiceRole.entities.RealWorldDevice.get(device_id)
    ]);

    const hapticPattern = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate haptic feedback pattern for action: ${action_type}
Device: ${device.device_brand} ${device.device_model}
Agent personality: ${JSON.stringify(agent.personality_traits)}

Create immersive haptic pattern matching:
- Action intensity
- Agent personality
- Device capabilities`,
      response_json_schema: {
        type: 'object',
        properties: {
          pattern: { type: 'array' },
          duration_ms: { type: 'number' },
          intensity: { type: 'number' }
        }
      }
    });

    await base44.asServiceRole.entities.GestureCommand.create({
      agent_id,
      device_id,
      gesture_type: 'haptic_feedback',
      command: action_type,
      parameters: hapticPattern,
      success: true,
      timestamp: new Date().toISOString()
    });

    return { success: true, pattern: hapticPattern };
  } catch (error) {
    return { success: false, error: error.message };
  }
}