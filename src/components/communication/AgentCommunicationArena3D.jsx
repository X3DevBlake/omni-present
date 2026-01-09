import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Stars } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import Agent3DNode from './Agent3DNode';
import AgentResponseBubble from './AgentResponseBubble';
import { base44 } from '@/api/base44Client';
import { Mic, Send, Volume2 } from 'lucide-react';

export default function AgentCommunicationArena3D() {
  const [agents, setAgents] = useState([
    { id: 1, name: 'AnalysisBot-01', position: [-5, 0, -3], isActive: true, status: 'analyzing' },
    { id: 2, name: 'TradeBot-02', position: [5, 2, -2], isActive: true, status: 'executing' },
    { id: 3, name: 'ResearchBot-03', position: [0, -3, 5], isActive: false, status: 'idle' },
    { id: 4, name: 'OptimizeBot-04', position: [-3, 1, 3], isActive: true, status: 'learning' }
  ]);

  const [messages, setMessages] = useState([
    { id: 1, sender: 'AnalysisBot-01', text: 'Market volatility detected', timestamp: new Date() }
  ]);

  const [userInput, setUserInput] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(agents[0]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef();

  useEffect(() => {
    // Simulate agent activity updates
    const interval = setInterval(() => {
      setAgents(prev =>
        prev.map(agent => ({
          ...agent,
          isActive: Math.random() > 0.3
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    setIsProcessing(true);
    const userMessage = {
      id: Date.now(),
      sender: 'You',
      text: userInput,
      timestamp: new Date(),
      isUser: true
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');

    try {
      // Simulate agent response via LLM
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a simulated agent named "${selectedAgent.name}". Respond briefly to: "${userInput}". Keep response under 50 words.`,
        add_context_from_internet: false
      });

      // Text-to-speech simulation
      const utterance = new SpeechSynthesisUtterance(response);
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);

      const agentMessage = {
        id: Date.now() + 1,
        sender: selectedAgent.name,
        text: response,
        timestamp: new Date(),
        isUser: false
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('Error getting agent response:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMicInput = () => {
    setIsListening(!isListening);
    if (!isListening && 'webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setUserInput(transcript);
      };
      recognition.start();
    }
  };

  return (
    <div className="space-y-6">
      {/* 3D Arena Canvas */}
      <div className="bg-black/60 backdrop-blur-xl border border-cyan-500/30 rounded-2xl overflow-hidden h-[600px] relative">
        <Canvas camera={{ position: [0, 5, 12], fov: 60 }} ref={canvasRef}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <pointLight position={[-10, -10, -10]} intensity={0.8} color="#00f5ff" />
          
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0.5} />
          <Grid gridSize={20} cellSize={1} cellColor="#ffffff20" sectionSize={5} sectionColor="#00f5ff40" />

          {/* Agent Nodes */}
          {agents.map(agent => (
            <group
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              style={{ cursor: 'pointer' }}
            >
              <Agent3DNode
                position={agent.position}
                agentName={agent.name}
                isActive={agent.isActive}
                dataFlow={agent.isActive}
              />
            </group>
          ))}

          <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={1} />
        </Canvas>

        {/* Agent Info Overlay */}
        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-4 bg-black/80 border border-cyan-500/50 rounded-lg p-4 backdrop-blur-xl"
          >
            <h3 className="text-cyan-400 font-bold">{selectedAgent.name}</h3>
            <p className="text-white/70 text-sm">Status: <span className="text-green-400">{selectedAgent.status}</span></p>
            <div className="mt-2 flex gap-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded ${selectedAgent.isActive ? 'bg-cyan-500' : 'bg-white/20'}`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Communication Interface */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Agent List */}
        <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4">Active Agents</h3>
          <div className="space-y-2">
            {agents.map(agent => (
              <motion.button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                whileHover={{ x: 5 }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all border ${
                  selectedAgent?.id === agent.id
                    ? 'bg-cyan-500/30 border-cyan-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${agent.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="text-white text-sm font-semibold">{agent.name}</p>
                    <p className="text-white/50 text-xs">{agent.status}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Message Feed & Input */}
        <div className="lg:col-span-2 space-y-4">
          {/* Messages */}
          <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 max-h-80 overflow-y-auto">
            <h3 className="text-white font-bold mb-4">Communication Log</h3>
            <div className="space-y-3">
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <AgentResponseBubble key={msg.id} message={msg} delay={idx * 0.1} />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Input Interface */}
          <div className="bg-black/40 backdrop-blur-xl border border-green-500/30 rounded-2xl p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={`Message ${selectedAgent?.name || 'agents'}...`}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 text-sm"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleMicInput}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                  isListening
                    ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                    : 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                }`}
              >
                <Mic className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleSendMessage}
                disabled={isProcessing || !userInput.trim()}
                className="px-4 py-2 bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 font-semibold hover:bg-cyan-500/40 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}