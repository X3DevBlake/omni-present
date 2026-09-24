export default async function generateSpeech(request, context) {
  const { text, stability = 0.5, similarityBoost = 0.7, voiceId } = request.body;

  const apiKey = context.secrets.ELEVENLABS_API_KEY;
  const defaultVoiceId = context.secrets.VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';
  const finalVoiceId = voiceId || defaultVoiceId;

  if (!apiKey) {
    return {
      statusCode: 400,
      body: { error: 'ELEVENLABS_API_KEY not configured' }
    };
  }

  // Validate text
  if (!text || text.trim().length === 0) {
    return {
      statusCode: 400,
      body: { error: 'Text is required' }
    };
  }

  if (text.length > 2500) {
    return {
      statusCode: 400,
      body: { error: 'Text must be less than 2500 characters' }
    };
  }

  // Validate parameters
  if (stability < 0 || stability > 1) {
    return {
      statusCode: 400,
      body: { error: 'Stability must be between 0 and 1' }
    };
  }

  if (similarityBoost < 0 || similarityBoost > 1) {
    return {
      statusCode: 400,
      body: { error: 'Similarity boost must be between 0 and 1' }
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${finalVoiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: stability,
            similarity_boost: similarityBoost
          }
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = btoa(
      new Uint8Array(audioBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    const audioDataUrl = `data:audio/mpeg;base64,${audioBase64}`;

    // Store voice message
    await context.entities.VoiceMessage.create({
      user_email: context.user.email,
      text_content: text,
      audio_url: audioDataUrl,
      voice_id: finalVoiceId,
      voice_settings: { stability, similarity_boost: similarityBoost },
      status: 'ready'
    });

    return {
      statusCode: 200,
      body: {
        audio: audioDataUrl,
        voiceId: finalVoiceId,
        settings: { stability, similarityBoost }
      }
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        statusCode: 408,
        body: { error: 'Request timeout after 30 seconds' }
      };
    }

    return {
      statusCode: 500,
      body: { error: error.message }
    };
  }
}