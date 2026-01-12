/**
 * Spawn Holographic Agent into Simulation or Device
 */

import { base44 } from '@base44/sdk';

export default async function spawnHolographicAgent(context) {
  const { 
    user_email, 
    agent_name, 
    simulation_id, 
    device_id, 
    latitude, 
    longitude,
    personality_config 
  } = context.params;

  try {
    // Create holographic agent
    const agent = await base44.asServiceRole.entities.HolographicAgent.create({
      name: agent_name,
      user_email,
      avatar_3d_url: '/assets/default-hologram.glb',
      hologram_color: personality_config?.color || '#00FFFF',
      personality_traits: personality_config?.traits || {
        empathy: 0.7,
        assertiveness: 0.6,
        creativity: 0.8,
        analytical: 0.75
      },
      current_location: {
        latitude: latitude || 0,
        longitude: longitude || 0,
        altitude: 0,
        device_id: device_id || null
      },
      current_device_id: device_id || null,
      state: {},
      active_task: null,
      skills: ['communication', 'data_analysis', 'scheduling'],
      voice_id: 'default_voice',
      communication_preferences: {
        preferred_channel: 'slack',
        slack_user_id: null,
        phone_number: null
      },
      status: 'active'
    });

    // Add agent to simulation if provided
    if (simulation_id) {
      const sim = await base44.asServiceRole.entities.WorldSimulation.get(simulation_id);
      await base44.asServiceRole.entities.WorldSimulation.update(simulation_id, {
        active_agents: [...(sim.active_agents || []), agent.id]
      });
    }

    // Generate agent personality and voice with Gemini
    await base44.integrations.Core.InvokeLLM({
      prompt: `Initialize AI agent: ${agent_name}
Personality: ${JSON.stringify(personality_config)}
Generate unique voice characteristics and communication style.`
    });

    // Send notification
    await base44.integrations.Core.SendEmail({
      to: user_email,
      subject: `Agent ${agent_name} Spawned`,
      body: `Your holographic agent ${agent_name} is now active in the simulation.`
    });

    return {
      success: true,
      agent_id: agent.id,
      agent
    };

  } catch (error) {
    console.error('Agent spawn error:', error);
    return { success: false, error: error.message };
  }
}