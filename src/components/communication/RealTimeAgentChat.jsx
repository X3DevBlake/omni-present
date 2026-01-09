import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Phone, Video, Mic, MicOff, Settings, X } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import { toast } from 'sonner';

function AgentAvatar({ agentColor = '#00f5ff' }) {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color={agentColor}
          emissive={agentColor}
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <coneGeometry args={[0.8, 1, 32]} />
        <meshStandardMaterial color={agentColor} emissive={agentColor} emissiveIntensity={0.4} />
      </mesh>
    </Float>
  );
}

export default function RealTimeAgentChat({ agentName = 'Agent-01', agentColor = '#00f5ff' }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: agentName, message: 'Hello! How can I assist you today?', timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [videoActive, setVideoActive] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      sender: 'You',
      message: inputText,
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInputText('');
    setIsSending(true);

    setTimeout(() => {
      const agentResponse = {
        id: messages.length + 2,
        sender: agentName,
        message: `Processing: "${inputText}". I understand and will help with that.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, agentResponse]);
      setIsSending(false);
    }, 800);
  };

  const handleVoiceToggle = () => {
    if (!isVoiceActive) {
      toast.success('Voice recording started');
    } else {
      toast.success('Voice message sent');
    }
    setIsVoiceActive(!isVoiceActive);
  };

  const handleCallStart = () => {
    setCallActive(!callActive);
    toast.success(callActive ? 'Call ended' : 'Call started');
  };

  const handleVideoStart = () => {
    setVideoActive(!videoActive);
    toast.success(videoActive ? 'Video call ended' : 'Video call started');
  };

  return (
    <motion.div
      className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg">{agentName}</h3>
            <p className="text-white/60 text-xs">AI Agent • Online</p>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={handleCallStart}
              className={`p-2 rounded-lg transition-colors ${
                callActive
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-white/5 hover:bg-white/10 text-white/70'
              }`}
            >
              <Phone className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={handleVideoStart}
              className={`p-2 rounded-lg transition-colors ${
                videoActive
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-white/5 hover:bg-white/10 text-white/70'
              }`}
            >
              <Video className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="flex h-[600px]">
        {/* 3D Agent Avatar */}
        <div className="w-1/3 border-r border-white/10 bg-black/20">
          <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1} color={agentColor} />
            <AgentAvatar agentColor={agentColor} />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
          </Canvas>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender === 'You'
                        ? 'bg-cyan-500/30 border border-cyan-500/50 text-white'
                        : 'bg-purple-500/20 border border-purple-500/30 text-white/90'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs text-white/40 mt-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isSending && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-white/10 p-4 space-y-3">
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleVoiceToggle}
                className={`p-2 rounded-lg transition-colors ${
                  isVoiceActive
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-white/5 hover:bg-white/10 text-white/70'
                }`}
              >
                {isVoiceActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </motion.button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50"
              />

              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isSending}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2 font-medium"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
            <p className="text-xs text-white/40 text-center">
              {isVoiceActive ? '🎤 Voice recording active' : 'Press Enter to send or use voice'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}