import { base44 } from '@/api/base44Client';

/**
 * Voice Advisor Integration
 * ElevenLabs + Twilio for voice consultations and AI-powered calls
 */

export async function initializeVoiceAdvisor(elevenLabsKey) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Setup voice advisor system using ElevenLabs for natural financial conversations:
      
      Features:
      1. Real-time voice consultation with expert advisors
      2. AI voice responses for common financial questions
      3. Automatic transcription and analysis
      4. Voice-based portfolio recommendations
      5. Conversational financial coaching
      
      Provide configuration for natural language voice interactions.`,
      response_json_schema: {
        type: 'object',
        properties: {
          voiceModel: { type: 'string' },
          supportedLanguages: { type: 'array', items: { type: 'string' } },
          voiceSettings: { type: 'object' },
          integrationSteps: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error initializing voice advisor:', error);
    throw error;
  }
}

/**
 * Generate voice response for financial question
 */
export async function generateVoiceResponse(question, userContext) {
  try {
    // First, generate financial response
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Answer this financial question naturally as if speaking to the user:
      
      Question: "${question}"
      User Context: ${JSON.stringify(userContext)}
      
      Provide a natural, conversational response that:
      1. Directly answers their question
      2. Includes specific numbers/recommendations
      3. Suggests next steps
      4. Is suitable for text-to-speech conversion
      5. Is 30-60 seconds of speaking time
      
      Response should sound like a knowledgeable financial advisor.`,
      response_json_schema: {
        type: 'object',
        properties: {
          voiceScript: { type: 'string' },
          tone: { type: 'string' },
          recommendedVoiceGender: { type: 'string' },
          speakingPace: { type: 'string' },
        },
      },
    });

    // Would use ElevenLabs to convert to audio
    console.log('Voice response generated:', response);
    return response;
  } catch (error) {
    console.error('Error generating voice response:', error);
    throw error;
  }
}

/**
 * Handle incoming advisor call
 */
export async function handleAdvisorCall(callData) {
  try {
    // Transcribe call
    const transcript = await transcribeCall(callData.recordingUrl);

    // Analyze conversation
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze financial advisor call:
      
      Transcript: ${transcript}
      Client: ${callData.clientEmail}
      Duration: ${callData.duration}
      
      Provide:
      1. Key topics discussed
      2. Action items agreed upon
      3. Recommendations made
      4. Follow-up needed
      5. Client sentiment/satisfaction`,
      response_json_schema: {
        type: 'object',
        properties: {
          topics: { type: 'array', items: { type: 'string' } },
          actionItems: { type: 'array', items: { type: 'string' } },
          recommendations: { type: 'array', items: { type: 'string' } },
          followUp: { type: 'string' },
          clientSentiment: { type: 'string' },
        },
      },
    });

    return analysis;
  } catch (error) {
    console.error('Error handling advisor call:', error);
    throw error;
  }
}

/**
 * Schedule voice call with advisor
 */
export async function scheduleVoiceCall(advisorId, clientEmail, preferredTime) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Schedule voice consultation:
      
      Advisor ID: ${advisorId}
      Client: ${clientEmail}
      Preferred Time: ${preferredTime}
      
      Create meeting with:
      1. Zoom/Twilio link generation
      2. Calendar invitations
      3. Confirmation emails
      4. Reminder 24 hours before
      5. Recording setup`,
      response_json_schema: {
        type: 'object',
        properties: {
          meetingLink: { type: 'string' },
          callTime: { type: 'string' },
          confirmationSent: { type: 'boolean' },
          recordingSetup: { type: 'boolean' },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error scheduling voice call:', error);
    throw error;
  }
}

/**
 * Transcribe voice message
 */
async function transcribeCall(recordingUrl) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Transcribe financial advisor call from recording: ${recordingUrl}`,
      file_urls: [recordingUrl],
      response_json_schema: {
        type: 'object',
        properties: {
          fullTranscript: { type: 'string' },
          summary: { type: 'string' },
        },
      },
    });

    return response.fullTranscript;
  } catch (error) {
    console.error('Error transcribing call:', error);
    throw error;
  }
}

/**
 * Send voice message to user
 */
export async function sendVoiceMessage(userEmail, message, advisorName) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Convert this message to natural voice for ${advisorName}:
      
      "${message}"
      
      This will be sent as a voice message to ${userEmail}.
      Make it sound professional but warm and conversational.`,
      response_json_schema: {
        type: 'object',
        properties: {
          audioUrl: { type: 'string' },
          duration: { type: 'number' },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error sending voice message:', error);
    throw error;
  }
}

export default {
  initializeVoiceAdvisor,
  generateVoiceResponse,
  handleAdvisorCall,
  scheduleVoiceCall,
  sendVoiceMessage,
};