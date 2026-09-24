import { base44 } from '@/api/base44Client';

export async function initiateVideoCall(userEmail, agentId, aiModel = 'gpt4') {
  const session = {
    user_email: userEmail,
    agent_id: agentId,
    session_id: `session_${Date.now()}`,
    ai_model: aiModel,
    video_stream_url: `wss://stream.omni.ai/${Date.now()}`,
    audio_enabled: true,
    video_enabled: true,
    transcript: [],
    status: 'connecting',
    started_at: new Date().toISOString()
  };

  return await base44.entities.VideoCallSession.create(session);
}

export async function processAudioInput(sessionId, audioData) {
  const session = await base44.entities.VideoCallSession.filter({ session_id: sessionId });
  if (session.length === 0) return null;

  const sessionData = session[0];

  // Convert audio to text
  const transcription = await base44.integrations.Core.InvokeLLM({
    prompt: `Transcribe this audio and respond naturally as AI agent`,
    file_urls: [audioData]
  });

  // Generate response using selected AI model
  const response = await generateAIResponse(
    sessionData.ai_model,
    transcription,
    sessionData.transcript
  );

  // Update transcript
  const transcript = sessionData.transcript || [];
  transcript.push({
    timestamp: new Date().toISOString(),
    speaker: 'user',
    text: transcription
  });
  transcript.push({
    timestamp: new Date().toISOString(),
    speaker: 'agent',
    text: response.text
  });

  await base44.entities.VideoCallSession.update(session[0].id, { transcript });

  return {
    transcription,
    response: response.text,
    video_frame: response.video_frame
  };
}

async function generateAIResponse(model, userInput, conversationHistory) {
  const historyContext = conversationHistory
    .slice(-10)
    .map(t => `${t.speaker}: ${t.text}`)
    .join('\n');

  let response;

  if (model === 'gpt4') {
    response = await base44.integrations.Core.InvokeLLM({
      prompt: `Conversation history:\n${historyContext}\n\nUser: ${userInput}\n\nRespond as helpful AI agent with personality and emotion. Be conversational and natural.`
    });
  } else if (model === 'gemini') {
    response = await base44.integrations.Core.InvokeLLM({
      prompt: `Use Google Gemini style: ${historyContext}\n\nUser: ${userInput}`,
      add_context_from_internet: true
    });
  } else {
    response = await base44.integrations.Core.InvokeLLM({
      prompt: `${historyContext}\n\nUser: ${userInput}`
    });
  }

  return {
    text: response,
    video_frame: generateVideoFrame(response) // Placeholder
  };
}

function generateVideoFrame(text) {
  // In production, use AI video generation (e.g., D-ID, Synthesia)
  // For now, return placeholder
  return {
    url: 'https://placeholder-video-frame.jpg',
    emotion: detectEmotion(text)
  };
}

function detectEmotion(text) {
  const emotions = ['happy', 'neutral', 'thoughtful', 'excited', 'concerned'];
  return emotions[Math.floor(Math.random() * emotions.length)];
}

export async function endVideoCall(sessionId) {
  const session = await base44.entities.VideoCallSession.filter({ session_id: sessionId });
  if (session.length === 0) return null;

  return await base44.entities.VideoCallSession.update(session[0].id, {
    status: 'ended',
    ended_at: new Date().toISOString()
  });
}

export async function switchAIModel(sessionId, newModel) {
  const session = await base44.entities.VideoCallSession.filter({ session_id: sessionId });
  if (session.length === 0) return null;

  return await base44.entities.VideoCallSession.update(session[0].id, {
    ai_model: newModel
  });
}