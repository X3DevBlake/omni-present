import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Settings } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AgentVideoCall({ agentId, onEnd }) {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [aiModel, setAiModel] = useState('gpt4');
  const [transcript, setTranscript] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Request microphone and camera permissions
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setIsConnected(true);
        })
        .catch(err => console.error('Media access error:', err));
    }

    return () => {
      // Cleanup
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleSpeech = (text) => {
    setTranscript(prev => [...prev, { speaker: 'user', text, time: new Date() }]);
    // Process with AI and add response
    setTimeout(() => {
      setTranscript(prev => [...prev, { 
        speaker: 'agent', 
        text: 'I understand. Let me help you with that.', 
        time: new Date() 
      }]);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
    >
      <div className="max-w-6xl w-full space-y-4">
        {/* Video Display */}
        <div className="relative aspect-video bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-xl overflow-hidden border border-white/10">
          {/* Agent Video (simulated) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Video className="w-24 h-24 text-white" />
            </div>
          </div>

          {/* User Video (PIP) */}
          {videoEnabled && (
            <div className="absolute bottom-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-cyan-400">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Connection Status */}
          <div className="absolute top-4 left-4">
            <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-white text-xs">{isConnected ? 'Connected' : 'Connecting...'}</span>
            </div>
          </div>

          {/* AI Model Selector */}
          <div className="absolute top-4 right-4">
            <Select value={aiModel} onValueChange={setAiModel}>
              <SelectTrigger className="w-32 bg-black/60 border-white/20 text-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt4">GPT-4</SelectItem>
                <SelectItem value="gemini">Gemini</SelectItem>
                <SelectItem value="claude">Claude</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Transcript */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 max-h-32 overflow-y-auto">
          <h4 className="text-white text-sm font-bold mb-2">Live Transcript</h4>
          <div className="space-y-1 text-xs">
            {transcript.map((entry, idx) => (
              <p key={idx} className={entry.speaker === 'user' ? 'text-cyan-400' : 'text-purple-400'}>
                <span className="font-bold">{entry.speaker === 'user' ? 'You' : 'Agent'}:</span> {entry.text}
              </p>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`rounded-full w-14 h-14 ${audioEnabled ? 'bg-white/10' : 'bg-red-500'}`}
          >
            {audioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </Button>

          <Button
            onClick={() => setVideoEnabled(!videoEnabled)}
            className={`rounded-full w-14 h-14 ${videoEnabled ? 'bg-white/10' : 'bg-red-500'}`}
          >
            {videoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </Button>

          <Button
            onClick={onEnd}
            className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>

          <Button
            className="rounded-full w-14 h-14 bg-white/10"
          >
            <Settings className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}