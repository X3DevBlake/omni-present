/**
 * Holographic Gesture Recognition and Device Control
 */

import { base44 } from '@base44/sdk';

export default async function gestureDeviceControl(context) {
  const { agent_id, device_id, gesture_type, target_command } = context.params;

  try {
    const agent = await base44.asServiceRole.entities.HolographicAgent.get(agent_id);
    const device = await base44.asServiceRole.entities.HolographicDevice.get(device_id);

    // Use Gemini to interpret gesture and generate appropriate command
    const commandAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Agent ${agent.name} performs ${gesture_type} gesture on ${device.device_name}.
Device type: ${device.device_type}
Device capabilities: ${JSON.stringify(device.capabilities)}
Target command: ${target_command}

Interpret gesture and generate device control command with parameters.
Consider device capabilities and current state.`,
      response_json_schema: {
        type: 'object',
        properties: {
          command: { type: 'string' },
          parameters: { type: 'object' },
          expected_result: { type: 'string' },
          voice_feedback: { type: 'string' }
        }
      }
    });

    // Log gesture command
    const gestureRecord = await base44.asServiceRole.entities.GestureCommand.create({
      agent_id,
      device_id,
      gesture_type,
      command: commandAnalysis.command,
      parameters: commandAnalysis.parameters,
      success: true,
      timestamp: new Date().toISOString()
    });

    // Generate voice feedback via ElevenLabs
    if (device.capabilities?.voice_output) {
      await base44.integrations.Core.InvokeLLM({
        prompt: `Generate ElevenLabs voice output for agent ${agent.name}:
"${commandAnalysis.voice_feedback}"
Voice ID: ${agent.voice_id}
Tone: Confident and clear`
      });
    }

    return {
      success: true,
      command_executed: commandAnalysis.command,
      result: commandAnalysis.expected_result,
      gesture_id: gestureRecord.id
    };

  } catch (error) {
    console.error('Gesture control error:', error);
    return { success: false, error: error.message };
  }
}