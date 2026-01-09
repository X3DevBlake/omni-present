import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Upload, Video, Play, Pause, Download, Wand2, Volume2, Settings, Sliders, Save, Trash2, Copy } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AgentAudio() {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceName, setVoiceName] = useState('');
  const [creationMode, setCreationMode] = useState('record'); // record, upload-audio, upload-video, ai-generate
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [voiceSettings, setVoiceSettings] = useState({
    pitch: 1.0,
    speed: 1.0,
    emotion: 'neutral',
    accent: 'none'
  });

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const audioRef = useRef(null);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudioBlob(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('Recording started');
    } catch (error) {
      toast.error('Microphone access denied');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    }
  };

  const processAudioBlob = async (blob) => {
    setIsProcessing(true);
    try {
      const file = new File([blob], 'recording.wav', { type: 'audio/wav' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const newVoice = {
        id: Date.now().toString(),
        name: voiceName || `Voice ${voices.length + 1}`,
        audioUrl: file_url,
        createdAt: new Date(),
        settings: { ...voiceSettings },
        source: creationMode
      };

      setVoices([...voices, newVoice]);
      setVoiceName('');
      toast.success('Voice created successfully!');
    } catch (error) {
      toast.error('Failed to process audio');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      if (type === 'video') {
        // Extract audio from video
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Extract and process audio from video file. Return audio characteristics and optimized settings.`,
          file_urls: [file_url],
          response_json_schema: {
            type: "object",
            properties: {
              pitch: { type: "number" },
              speed: { type: "number" },
              emotion: { type: "string" },
              quality: { type: "string" }
            }
          }
        });

        setVoiceSettings({
          pitch: result.pitch || 1.0,
          speed: result.speed || 1.0,
          emotion: result.emotion || 'neutral',
          accent: 'none'
        });
      }

      const newVoice = {
        id: Date.now().toString(),
        name: voiceName || file.name.replace(/\.[^/.]+$/, ""),
        audioUrl: file_url,
        createdAt: new Date(),
        settings: { ...voiceSettings },
        source: type === 'video' ? 'upload-video' : 'upload-audio'
      };

      setVoices([...voices, newVoice]);
      setVoiceName('');
      toast.success(`Voice extracted from ${type}`);
    } catch (error) {
      toast.error(`Failed to process ${type}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!voiceName) {
      toast.error('Please enter a voice name/description');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate voice profile parameters for: "${voiceName}". Include pitch, speed, emotion, and accent characteristics for a realistic voice.`,
        response_json_schema: {
          type: "object",
          properties: {
            pitch: { type: "number" },
            speed: { type: "number" },
            emotion: { type: "string" },
            accent: { type: "string" },
            description: { type: "string" }
          }
        }
      });

      const newVoice = {
        id: Date.now().toString(),
        name: voiceName,
        audioUrl: null, // AI-generated voices use synthetic engine
        createdAt: new Date(),
        settings: {
          pitch: result.pitch || 1.0,
          speed: result.speed || 1.0,
          emotion: result.emotion || 'neutral',
          accent: result.accent || 'none'
        },
        source: 'ai-generate',
        description: result.description
      };

      setVoices([...voices, newVoice]);
      setVoiceName('');
      toast.success('AI voice profile generated!');
    } catch (error) {
      toast.error('Failed to generate AI voice');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlayVoice = (voice) => {
    if (voice.audioUrl && audioRef.current) {
      if (isPlaying && selectedVoice?.id === voice.id) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.src = voice.audioUrl;
        audioRef.current.play();
        setIsPlaying(true);
        setSelectedVoice(voice);
      }
    } else {
      toast.info('This is an AI-generated voice profile (synthetic playback coming soon)');
    }
  };

  const handleDeleteVoice = (id) => {
    setVoices(voices.filter(v => v.id !== id));
    toast.success('Voice deleted');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-full">
            <span className="text-pink-400 text-sm font-semibold">🎙️ Agent Voice Studio</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Create Custom
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent"> Agent Voices</span>
          </h1>
          <p className="text-white/60 text-lg max-w-3xl mx-auto">
            Record, upload, or AI-generate unique voices for your AI agents
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Creation Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mode Selection */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold text-xl mb-4">Creation Mode</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { mode: 'record', label: 'Record', icon: Mic },
                  { mode: 'upload-audio', label: 'Upload Audio', icon: Upload },
                  { mode: 'upload-video', label: 'Extract from Video', icon: Video },
                  { mode: 'ai-generate', label: 'AI Generate', icon: Wand2 }
                ].map(({ mode, label, icon: Icon }) => (
                  <button
                    key={mode}
                    onClick={() => setCreationMode(mode)}
                    className={`p-4 rounded-xl border transition-all ${
                      creationMode === mode
                        ? 'bg-pink-500/20 border-pink-500/40 text-pink-300'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-xs font-medium">{label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Creation Interface */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <input
                type="text"
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
                placeholder="Voice name or description..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white mb-4 placeholder-white/40"
              />

              {creationMode === 'record' && (
                <div className="text-center">
                  <div className="mb-6">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 mx-auto flex items-center justify-center mb-4">
                      <Mic className={`w-16 h-16 ${isRecording ? 'text-red-400 animate-pulse' : 'text-pink-400'}`} />
                    </div>
                    {isRecording && (
                      <div className="text-white text-2xl font-bold">{formatTime(recordingTime)}</div>
                    )}
                  </div>
                  <button
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    className={`px-8 py-4 rounded-xl font-bold text-white ${
                      isRecording
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90'
                    }`}
                  >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </button>
                </div>
              )}

              {creationMode === 'upload-audio' && (
                <div className="text-center">
                  <label className="block cursor-pointer">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 mx-auto flex items-center justify-center mb-4 hover:scale-105 transition-transform">
                      <Upload className="w-16 h-16 text-blue-400" />
                    </div>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => handleFileUpload(e, 'audio')}
                      className="hidden"
                    />
                    <div className="text-white mb-2">Upload Audio File</div>
                    <div className="text-white/40 text-sm">MP3, WAV, M4A supported</div>
                  </label>
                </div>
              )}

              {creationMode === 'upload-video' && (
                <div className="text-center">
                  <label className="block cursor-pointer">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 mx-auto flex items-center justify-center mb-4 hover:scale-105 transition-transform">
                      <Video className="w-16 h-16 text-purple-400" />
                    </div>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileUpload(e, 'video')}
                      className="hidden"
                    />
                    <div className="text-white mb-2">Upload Video File</div>
                    <div className="text-white/40 text-sm">Audio will be extracted automatically</div>
                  </label>
                </div>
              )}

              {creationMode === 'ai-generate' && (
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mx-auto flex items-center justify-center mb-6">
                    <Wand2 className="w-16 h-16 text-cyan-400" />
                  </div>
                  <p className="text-white/60 mb-4">Describe the voice characteristics you want</p>
                  <button
                    onClick={handleAIGenerate}
                    disabled={isProcessing || !voiceName}
                    className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 disabled:opacity-50"
                  >
                    {isProcessing ? 'Generating...' : 'Generate Voice Profile'}
                  </button>
                </div>
              )}
            </div>

            {/* Voice Settings */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                <Sliders className="w-5 h-5" />
                Voice Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Pitch: {voiceSettings.pitch.toFixed(2)}</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={voiceSettings.pitch}
                    onChange={(e) => setVoiceSettings({ ...voiceSettings, pitch: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Speed: {voiceSettings.speed.toFixed(2)}</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={voiceSettings.speed}
                    onChange={(e) => setVoiceSettings({ ...voiceSettings, speed: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Emotion</label>
                  <select
                    value={voiceSettings.emotion}
                    onChange={(e) => setVoiceSettings({ ...voiceSettings, emotion: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="neutral">Neutral</option>
                    <option value="happy">Happy</option>
                    <option value="sad">Sad</option>
                    <option value="excited">Excited</option>
                    <option value="calm">Calm</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Voice Library */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold text-xl mb-4">Voice Library ({voices.length})</h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {voices.length === 0 ? (
                <div className="text-center py-12">
                  <Volume2 className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40">No voices created yet</p>
                </div>
              ) : (
                voices.map((voice) => (
                  <div key={voice.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-white font-medium mb-1">{voice.name}</div>
                        <div className="text-white/40 text-xs">
                          {voice.source === 'record' ? '🎙️ Recorded' :
                           voice.source === 'upload-audio' ? '📁 Audio Upload' :
                           voice.source === 'upload-video' ? '🎬 Video Extract' :
                           '🤖 AI Generated'}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePlayVoice(voice)}
                          className="p-2 bg-pink-500/20 rounded-lg hover:bg-pink-500/30"
                        >
                          {isPlaying && selectedVoice?.id === voice.id ? (
                            <Pause className="w-4 h-4 text-pink-400" />
                          ) : (
                            <Play className="w-4 h-4 text-pink-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteVoice(voice.id)}
                          className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-white/60">Pitch: {voice.settings.pitch}</div>
                      <div className="text-white/60">Speed: {voice.settings.speed}</div>
                      <div className="text-white/60 col-span-2">Emotion: {voice.settings.emotion}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
      </div>
    </AuroraBackground>
  );
}