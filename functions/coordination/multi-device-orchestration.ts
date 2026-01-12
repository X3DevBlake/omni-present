/**
 * Multi-Device Orchestration System
 */

import { base44 } from '@base44/sdk';

export default async function multiDeviceOrchestration(context) {
  const { agent_id, orchestration_name, device_ids, scenario } = context.params;

  try {
    const devices = await Promise.all(
      device_ids.map(id => base44.asServiceRole.entities.RealWorldDevice.get(id))
    );

    const plan = await base44.integrations.Core.InvokeLLM({
      prompt: `Agent orchestrating action across ${devices.length} devices:
Scenario: ${scenario}
Devices: ${devices.map(d => `${d.device_name} (${d.device_category})`).join(', ')}

Create synchronized action plan with precise timing.`,
      response_json_schema: {
        type: 'object',
        properties: {
          actions: { type: 'array' }
        }
      }
    });

    const orchestration = await base44.asServiceRole.entities.MultiDeviceOrchestration.create({
      agent_id,
      orchestration_name,
      devices_involved: device_ids,
      actions: plan.actions,
      execution_status: 'executing'
    });

    for (const action of plan.actions) {
      await base44.asServiceRole.functions['devices/haptic-feedback-sync']({
        agent_id,
        device_id: action.device_id,
        action_type: action.command
      });
    }

    await base44.asServiceRole.entities.MultiDeviceOrchestration.update(orchestration.id, {
      execution_status: 'completed'
    });

    return { success: true, orchestration_id: orchestration.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}