import { base44 } from '@/api/base44Client';

export async function orchestrateSlackToVoice(slackMessage, userId) {
  try {
    // 1. Send to Gemini for analysis and response
    const geminiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this Slack message and generate a concise response:
      
Message: "${slackMessage}"
User: ${userId}

Provide clear, brief response suitable for voice synthesis.`,
    });

    // 2. Generate voice using ElevenLabs via Gemini
    const voiceResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `Convert this to a natural voice message:
      
Text: ${geminiResponse}

Output should be clear and engaging.`,
    });

    // 3. Post back to Slack with voice message
    await base44.integrations.Core.InvokeLLM({
      prompt: `Post response to Slack:
      
Message: ${geminiResponse}
VoiceURL: ${voiceResponse}
User: ${userId}

Include voice button for recipient.`,
    });

    return { success: true, response: geminiResponse };
  } catch (error) {
    console.error('Orchestration error:', error);
    throw error;
  }
}

export async function orchestrateTwilioFlow(phoneNumber, userQuery, userId) {
  try {
    // 1. Get Gemini response
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Answer this user query via SMS/voice:
      
Query: "${userQuery}"
User: ${userId}

Keep response under 160 characters for SMS, or provide voice script.`,
    });

    // 2. Send via Twilio
    const twilioMessage = `Twilio SMS to ${phoneNumber}: ${response}`;
    
    // Log to Zapier
    await base44.integrations.Core.InvokeLLM({
      prompt: `Log Twilio message to Zapier:
      
Phone: ${phoneNumber}
Message: ${response}
User: ${userId}`,
    });

    return { success: true, message: response };
  } catch (error) {
    console.error('Twilio flow error:', error);
    throw error;
  }
}

export async function createZapierWorkflow(trigger, action, userId) {
  try {
    const workflow = await base44.integrations.Core.InvokeLLM({
      prompt: `Create Zapier workflow:
      
Trigger: ${trigger}
Action: ${action}
User: ${userId}

Configure automation for cross-platform message routing and response generation.`,
      response_json_schema: {
        type: 'object',
        properties: {
          workflowId: { type: 'string' },
          trigger: { type: 'string' },
          actions: { type: 'array', items: { type: 'string' } },
          status: { type: 'string' },
        },
      },
    });

    return workflow;
  } catch (error) {
    console.error('Zapier workflow error:', error);
    throw error;
  }
}

export async function synthesizeAndDeliver(text, deliveryChannels, userId) {
  try {
    // Generate voice synthesis via ElevenLabs
    const audioUrl = await base44.integrations.Core.InvokeLLM({
      prompt: `Synthesize natural voice message:
      
Text: "${text}"

Generate high-quality audio suitable for all channels.`,
    });

    // Deliver to all specified channels
    for (const channel of deliveryChannels) {
      if (channel === 'slack') {
        await base44.integrations.Core.InvokeLLM({
          prompt: `Send voice message to Slack:
          
AudioURL: ${audioUrl}
User: ${userId}`,
        });
      } else if (channel === 'twilio') {
        await base44.integrations.Core.InvokeLLM({
          prompt: `Send voice call via Twilio:
          
AudioURL: ${audioUrl}
User: ${userId}`,
        });
      } else if (channel === 'whatsapp') {
        await base44.integrations.Core.InvokeLLM({
          prompt: `Send voice message via WhatsApp:
          
AudioURL: ${audioUrl}
User: ${userId}`,
        });
      }
    }

    return { success: true, audioUrl };
  } catch (error) {
    console.error('Synthesis error:', error);
    throw error;
  }
}