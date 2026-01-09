import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Minimize2, Maximize2, Sparkles, Mic, Video, MicOff, VideoOff } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import ChatMessages from './ChatMessages';
import VoiceInput from './VoiceInput';
import OmniVideoCall from './OmniVideoCall';

export default function OmniAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m Omni, your holographic AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthRef = useRef(null);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
      speechSynthRef.current = utterance;
    }
  };

  const handleSendMessage = async (messageContent) => {
    const textContent = messageContent || input;
    if (!textContent.trim()) return;

    const userMessage = { role: 'user', content: textContent };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const context = `You are Omni, an advanced AI holographic assistant for Omni-Present, a revolutionary platform combining AI agents, DeFi, physical devices, and immersive 3D experiences.
      
Platform Features:
- DeFi: High-yield liquidity pools (up to 1000% APY), yield farming, staking
- AI Agents: Autonomous agents that learn, shop, and interact in real-time with 247 zeptosecond perception
- Physical Devices: Hardware integration for real-world AI deployment
- Knowledge Base: Agents build interconnected knowledge graphs from experiences
- Marketplace: Buy/sell agents, devices, and assets
- 3D Experiences: Immersive holographic projections and simulations

You are capable of voice interaction and video calls. When users enable voice, speak naturally and conversationally.
Answer helpfully and concisely. User: ${textContent}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: context,
        add_context_from_internet: true
      });

      const assistantMessage = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);

      if (isVoiceEnabled || isVideoEnabled) {
        speakText(response);
      }

    } catch (error) {
      toast.error('Failed to get response from Omni');
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceTranscript = (transcript) => {
    if (transcript) {
      handleSendMessage(transcript);
    }
  };

  const toggleVoice = () => {
    if (isVoiceEnabled && speechSynthRef.current) {
      window.speechSynthesis.cancel();
    }
    setIsVoiceEnabled(!isVoiceEnabled);
  };

  const toggleVideo = () => {
    if (!isVideoEnabled && !isVoiceEnabled) {
      setIsVoiceEnabled(true);
    }
    setIsVideoEnabled(!isVideoEnabled);
  };

  return (
    <>
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center z-40"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Sparkles className="w-6 h-6 text-white" />
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`fixed bottom-6 right-6 bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 flex flex-col ${
              isMinimized ? 'w-80 h-16' : isVideoEnabled ? 'w-[450px] h-[700px]' : 'w-96 h-[600px]'
            }`}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500/30 to-purple-500/30 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Omni Assistant</h3>
                  <div className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    {isSpeaking ? 'Speaking...' : 'Online'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleVoice}
                  className={`p-2 rounded-lg transition-all ${
                    isVoiceEnabled 
                      ? 'bg-purple-500/30 text-purple-400 shadow-lg shadow-purple-500/20' 
                      : 'hover:bg-white/5 text-white/60'
                  }`}
                  title={isVoiceEnabled ? "Disable Voice" : "Enable Voice"}
                >
                  {isVoiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={toggleVideo}
                  className={`p-2 rounded-lg transition-all ${
                    isVideoEnabled 
                      ? 'bg-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/20' 
                      : 'hover:bg-white/5 text-white/60'
                  }`}
                  title={isVideoEnabled ? "Disable Video" : "Enable Video"}
                >
                  {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4 text-white/60" /> : <Minimize2 className="w-4 h-4 text-white/60" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {isVideoEnabled && (
                  <OmniVideoCall isSpeaking={isSpeaking} />
                )}
                
                <ChatMessages
                  messages={messages}
                  isTyping={isTyping}
                  isSpeaking={isSpeaking}
                  input={input}
                  setInput={setInput}
                  onSendMessage={handleSendMessage}
                  isVoiceEnabled={isVoiceEnabled}
                />

                {isVoiceEnabled && (
                  <VoiceInput 
                    onTranscript={handleVoiceTranscript} 
                    isActive={isVoiceEnabled}
                  />
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}