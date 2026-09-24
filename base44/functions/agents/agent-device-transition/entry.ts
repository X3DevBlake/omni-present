/**
 * Agent Cross-Platform Device Transition
 * Maintains state, context, and tasks across devices
 */

import { base44 } from '@base44/sdk';

export default async function agentDeviceTransition(context) {
  const { 
    agent_id, 
    to_device_id, 
    schedule_time, // Optional: for scheduled transitions via Google Calendar
    reason 
  } = context.params;

  try {
    // Get agent and devices
    const agent = await base44.asServiceRole.entities.HolographicAgent.get(agent_id);
    const fromDeviceId = agent.current_device_id;
    const toDevice = await base44.asServiceRole.entities.HolographicDevice.get(to_device_id);

    // Capture current state snapshot
    const stateSnapshot = {
      location: agent.current_location,
      active_task: agent.active_task,
      state: agent.state,
      timestamp: new Date().toISOString()
    };

    let calendar_event_id = null;

    // If scheduled, create Google Calendar event
    if (schedule_time) {
      const calendarEvent = await base44.integrations.Core.InvokeLLM({
        prompt: `Create Google Calendar event for agent ${agent.name} transition:
From: Device ${fromDeviceId}
To: Device ${to_device_id} (${toDevice.device_name})
Time: ${schedule_time}
Reason: ${reason}

Include: transition preparation reminder 5 min before.`,
        response_json_schema: {
          type: 'object',
          properties: {
            event_id: { type: 'string' },
            event_url: { type: 'string' }
          }
        }
      });
      calendar_event_id = calendarEvent.event_id;
    }

    // Create transition record
    const transition = await base44.asServiceRole.entities.AgentTransition.create({
      agent_id,
      from_device_id: fromDeviceId,
      to_device_id,
      transition_reason: reason,
      state_snapshot: stateSnapshot,
      calendar_event_id,
      status: schedule_time ? 'initiated' : 'in_progress',
      timestamp: new Date().toISOString()
    });

    // If immediate transition, execute now
    if (!schedule_time) {
      await executeTransition(agent_id, to_device_id, stateSnapshot);
    }

    // Notify owner
    await base44.integrations.Core.SendEmail({
      to: agent.user_email,
      subject: `Agent ${agent.name} Transitioning`,
      body: `Your agent ${agent.name} is ${schedule_time ? 'scheduled to transition' : 'transitioning'} to ${toDevice.device_name}.`
    });

    return {
      success: true,
      transition_id: transition.id,
      scheduled: !!schedule_time,
      calendar_event_id
    };

  } catch (error) {
    console.error('Agent transition error:', error);
    return { success: false, error: error.message };
  }
}

async function executeTransition(agentId, toDeviceId, stateSnapshot) {
  // Update agent location and device
  await base44.asServiceRole.entities.HolographicAgent.update(agentId, {
    current_device_id: toDeviceId,
    state: stateSnapshot.state,
    status: 'active'
  });

  // Update device connections
  const device = await base44.asServiceRole.entities.HolographicDevice.get(toDeviceId);
  await base44.asServiceRole.entities.HolographicDevice.update(toDeviceId, {
    connected_agents: [...(device.connected_agents || []), agentId]
  });
}