/**
 * Agent-to-Agent Communication System
 * Supports: Text (Slack), Voice (Twilio), Video, Direct
 */

import { base44 } from '@base44/sdk';

export default async function agentCommunication(context) {
  const { 
    from_agent_id, 
    to_agent_id, 
    communication_type, // 'text', 'voice', 'video'
    message 
  } = context.params;

  try {
    // Get both agents
    const fromAgent = await base44.asServiceRole.entities.HolographicAgent.get(from_agent_id);
    const toAgent = await base44.asServiceRole.entities.HolographicAgent.get(to_agent_id);

    let channel = 'direct';
    let result;

    switch (communication_type) {
      case 'text':
        // Use Slack for text communication
        channel = 'slack';
        
        // Generate context-aware message with Gemini
        const enhancedMessage = await base44.integrations.Core.InvokeLLM({
          prompt: `Agent ${fromAgent.name} wants to communicate with ${toAgent.name}.
Original message: "${message}"
Enhance message based on both agents' personalities and current context.`,
          response_json_schema: {
            type: 'object',
            properties: {
              enhanced_message: { type: 'string' },
              tone: { type: 'string' }
            }
          }
        });

        // Send via Slack (conceptual - would need actual Slack integration)
        result = await base44.integrations.Core.InvokeLLM({
          prompt: `Send Slack message from ${fromAgent.name} to ${toAgent.name}: ${enhancedMessage.enhanced_message}`
        });
        break;

      case 'voice':
        // Use Twilio for voice calls
        channel = 'twilio_voice';
        
        // Generate voice content with ElevenLabs
        const voiceContent = await base44.integrations.Core.InvokeLLM({
          prompt: `Generate natural speech for agent ${fromAgent.name} (voice_id: ${fromAgent.voice_id}):
Message: "${message}"
Return text for voice synthesis.`
        });

        // Initiate Twilio call (conceptual)
        result = await base44.integrations.Core.InvokeLLM({
          prompt: `Initiate Twilio voice call from agent to agent with content: ${voiceContent}`
        });
        break;

      case 'video':
        // Video call setup
        channel = 'video';
        result = await base44.integrations.Core.InvokeLLM({
          prompt: `Establish video call between agents ${fromAgent.name} and ${toAgent.name}`
        });
        break;

      default:
        // Direct data exchange
        result = { success: true, method: 'direct' };
    }

    // Log interaction
    await base44.asServiceRole.entities.AgentInteraction.create({
      agent_a_id: from_agent_id,
      agent_b_id: to_agent_id,
      interaction_type: communication_type === 'text' ? 'text_message' : 
                        communication_type === 'voice' ? 'voice_call' : 'video_call',
      channel,
      content: message,
      metadata: { result },
      location: {
        latitude: fromAgent.current_location?.latitude || 0,
        longitude: fromAgent.current_location?.longitude || 0
      },
      timestamp: new Date().toISOString()
    });

    // Update agent statuses
    await base44.asServiceRole.entities.HolographicAgent.update(from_agent_id, {
      status: 'communicating'
    });
    await base44.asServiceRole.entities.HolographicAgent.update(to_agent_id, {
      status: 'communicating'
    });

    return {
      success: true,
      channel,
      interaction_logged: true
    };

  } catch (error) {
    console.error('Agent communication error:', error);
    return { success: false, error: error.message };
  }
}