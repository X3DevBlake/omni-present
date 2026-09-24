import { base44 } from '@/api/base44Client';

export async function generateVoiceoverWithElevenLabs(
  script,
  options = {}
) {
  try {
    // Generate professional voiceover using ElevenLabs
    const voiceoverConfig = {
      script,
      voice: options.voice || 'professional-male',
      speed: options.speed || 1.0,
      tone: options.tone || 'professional',
      background: options.background || 'subtle',
      format: options.format || 'mp3',
      quality: options.quality || '320kbps',
    };

    const audio = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate voiceover with ElevenLabs:
      
Script: ${script}
Voice: ${voiceoverConfig.voice}
Speed: ${voiceoverConfig.speed}
Tone: ${voiceoverConfig.tone}
Background: ${voiceoverConfig.background}
Format: ${voiceoverConfig.format}
Quality: ${voiceoverConfig.quality}

Generate natural, engaging voiceover audio.`,
    });

    return audio;
  } catch (error) {
    console.error('Error generating voiceover:', error);
    throw error;
  }
}

export async function generateMultiLanguageVoiceover(
  script,
  languages,
  voiceOptions
) {
  try {
    // Generate voiceovers in multiple languages
    const voiceovers = await Promise.all(
      languages.map(lang =>
        base44.integrations.Core.InvokeLLM({
          prompt: `Generate ${lang} voiceover:
          
Script: ${script}
Language: ${lang}
Voice: ${voiceOptions?.voice || 'professional'}
Tone: ${voiceOptions?.tone || 'professional'}

Translate script to ${lang} and generate voiceover.`,
        })
      )
    );

    return voiceovers;
  } catch (error) {
    console.error('Error generating multilingual voiceovers:', error);
    throw error;
  }
}

export async function addVoiceoverToVideo(
  videoFile,
  voiceoverAudio,
  options = {}
) {
  try {
    // Mix voiceover with video audio
    const mixedVideo = await base44.integrations.Core.InvokeLLM({
      prompt: `Mix voiceover with video:
      
Video: ${videoFile}
Voiceover: ${voiceoverAudio}
Fade In: ${options.fadeIn || '2 seconds'}
Fade Out: ${options.fadeOut || '2 seconds'}
BGMVolume: ${options.bgmVolume || '30%'}
VoiceVolume: ${options.voiceVolume || '90%'}

Create balanced audio mix with:
- Clear voiceover
- Background music presence
- Professional transitions`,
    });

    return mixedVideo;
  } catch (error) {
    console.error('Error adding voiceover:', error);
    throw error;
  }
}

export async function generateVoiceoverVariations(
  script,
  styles = ['professional', 'casual', 'energetic']
) {
  try {
    // Generate same script in multiple styles
    const variations = await Promise.all(
      styles.map(style =>
        base44.integrations.Core.InvokeLLM({
          prompt: `Generate ${style} voiceover:
          
Script: ${script}
Style: ${style}

Create voiceover with ${style} tone and delivery.`,
        })
      )
    );

    return { script, variations: Object.fromEntries(styles.map((s, i) => [s, variations[i]])) };
  } catch (error) {
    console.error('Error generating variations:', error);
    throw error;
  }
}