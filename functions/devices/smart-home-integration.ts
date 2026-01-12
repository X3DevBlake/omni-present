/**
 * Smart Home Ecosystem Integration
 */

import { base44 } from '@base44/sdk';

export default async function smartHomeIntegration(context) {
  const { agent_id, ecosystem, action } = context.params;

  try {
    const agent = await base44.asServiceRole.entities.HolographicAgent.get(agent_id);
    const devices = await base44.asServiceRole.entities.SmartHomeDevice.list({ ecosystem });

    const execution = await base44.integrations.Core.InvokeLLM({
      prompt: `Agent ${agent.name} controlling ${ecosystem} smart home:
Action: ${action}
Available devices: ${devices.map(d => `${d.device_name} (${d.device_category})`).join(', ')}

Execute action across appropriate devices.`,
      response_json_schema: {
        type: 'object',
        properties: {
          devices_affected: { type: 'array' },
          commands: { type: 'array' }
        }
      }
    });

    for (const deviceId of execution.devices_affected) {
      const device = devices.find(d => d.id === deviceId);
      if (device?.haptic_enabled) {
        await base44.asServiceRole.functions['devices/haptic-feedback-sync']({
          agent_id,
          device_id: deviceId,
          action_type: action
        });
      }
    }

    return { success: true, affected: execution.devices_affected.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}