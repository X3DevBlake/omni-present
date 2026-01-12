/**
 * Real-World Device Integration (Apple, Samsung, Apps)
 */

import { base44 } from '@base44/sdk';

export default async function realWorldDeviceIntegration(context) {
  const { agent_id, device_brand, device_model, os_type, apps } = context.params;

  try {
    const agent = await base44.asServiceRole.entities.HolographicAgent.get(agent_id);

    // AI analyzes device compatibility
    const deviceAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Agent ${agent.name} connecting to real-world device:

Device: ${device_brand} ${device_model}
OS: ${os_type}
Apps: ${apps?.join(', ')}

Analyze:
1. Compatibility with agent capabilities
2. Available APIs and integrations
3. Access permissions needed
4. Gesture/haptic capabilities
5. Security considerations

Generate integration plan.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          compatible: { type: 'boolean' },
          access_level: { type: 'string' },
          available_gestures: { type: 'array' },
          haptic_capable: { type: 'boolean' },
          integration_steps: { type: 'array' }
        }
      }
    });

    // Create device record
    const device = await base44.asServiceRole.entities.RealWorldDevice.create({
      device_name: `${device_brand} ${device_model}`,
      device_brand: device_brand.toLowerCase(),
      device_model,
      os_type: os_type.toLowerCase(),
      installed_apps: apps || [],
      agent_access_level: deviceAnalysis.access_level,
      haptic_capable: deviceAnalysis.haptic_capable,
      gesture_sensors: deviceAnalysis.available_gestures,
      connected_agent_id: agent_id
    });

    // Update agent location
    await base44.asServiceRole.entities.HolographicAgent.update(agent_id, {
      current_device_id: device.id,
      current_location: {
        ...agent.current_location,
        device_id: device.id
      },
      state: {
        ...agent.state,
        device_integrations: [
          ...(agent.state?.device_integrations || []),
          {
            device_id: device.id,
            connected_at: new Date().toISOString(),
            os_type,
            apps_accessed: apps
          }
        ]
      }
    });

    return {
      success: true,
      device_id: device.id,
      compatible: deviceAnalysis.compatible,
      access_level: deviceAnalysis.access_level,
      capabilities: {
        gestures: deviceAnalysis.available_gestures,
        haptic: deviceAnalysis.haptic_capable
      }
    };

  } catch (error) {
    console.error('Device integration error:', error);
    return { success: false, error: error.message };
  }
}