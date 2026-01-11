import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Mic, Video, Share2, MessageSquare, Loader } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function VirtualConsultationRoom() {
  const [participants, setParticipants] = useState([
    { id: 'user', name: 'You', role: 'client', status: 'active' },
    { id: 'expert', name: 'Financial Expert', role: 'expert', status: 'active' },
  ]);
  const [sharedModel, setSharedModel] = useState('portfolio_3d');
  const [analysis, setAnalysis] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));

    subscribeToRoomEvents();
  }, []);

  const subscribeToRoomEvents = () => {
    // Subscribe to collaboration updates
    const unsubscribe = base44.entities.CollaborativeDocument?.subscribe?.((event) => {
      if (event.type === 'update') {
        handleRoomUpdate(event.data);
      }
    });

    return unsubscribe;
  };

  const handleRoomUpdate = (data) => {
    if (data.type === 'message') {
      setMessages(prev => [...prev, data]);
    } else if (data.type === 'model_change') {
      setSharedModel(data.model);
    }
  };

  const startRealTimeAnalysis = async () => {
    setAnalyzing(true);
    try {
      // Get real-time analysis from Gemini as users interact with 3D model
      const realTimeAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide real-time analysis for collaborative consultation:
        
Shared Model: ${sharedModel}
Participants: ${participants.map(p => p.name).join(', ')}
Context: Financial consultation in progress

Analyze:
1. Key opportunities visible in current visualization
2. Risk factors to discuss
3. Recommendations based on shared view
4. Questions to explore further`,
        add_context_from_internet: true,
      });

      setAnalysis(realTimeAnalysis);

      // Broadcast analysis to all participants
      await broadcastToParticipants({
        type: 'analysis_update',
        content: realTimeAnalysis,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error generating analysis:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const broadcastToParticipants = async (data) => {
    try {
      await base44.integrations.Core.InvokeLLM({
        prompt: `Broadcast to consultation participants:
        
Message: ${JSON.stringify(data)}
Participants: ${participants.map(p => p.name).join(', ')}`,
      });
    } catch (error) {
      console.error('Error broadcasting:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      sender: 'You',
      content: newMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Broadcast message
    await broadcastToParticipants(message);

    // Get expert response
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Respond as financial expert in consultation:
        
User Message: "${newMessage}"
Current Model: ${sharedModel}

Provide relevant, actionable response based on visualization.`,
      });

      const expertMessage = {
        id: Date.now() + 1,
        sender: 'Expert',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, expertMessage]);
      await broadcastToParticipants(expertMessage);
    } catch (error) {
      console.error('Error getting response:', error);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4 h-screen">
      {/* Left: Participants */}
      <div className="border-r border-white/10 p-4 space-y-4">
        <p className="text-white font-bold text-sm flex items-center gap-2">
          <Users className="w-4 h-4" /> Participants
        </p>

        <div className="space-y-2">
          {participants.map(participant => (
            <motion.div
              key={participant.id}
              className="bg-white/5 border border-white/10 rounded-lg p-3"
            >
              <p className="text-white font-semibold text-sm">{participant.name}</p>
              <p className="text-white/60 text-xs">{participant.role}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <p className="text-white/60 text-xs">{participant.status}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Controls */}
        <div className="space-y-2 border-t border-white/10 pt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-xs flex items-center justify-center gap-2 hover:bg-white/20"
          >
            <Mic className="w-3 h-3" /> Audio
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-xs flex items-center justify-center gap-2 hover:bg-white/20"
          >
            <Video className="w-3 h-3" /> Video
          </motion.button>
        </div>
      </div>

      {/* Center: 3D Model & Analysis */}
      <div className="border-r border-white/10 p-4 space-y-4">
        <div className="bg-white/5 border border-white/10 rounded-lg h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-white/60 text-sm">{sharedModel}</p>
            <p className="text-white/40 text-xs mt-1">Shared 3D Visualization</p>
          </div>
        </div>

        {/* Real-time Analysis */}
        <div className="space-y-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={startRealTimeAnalysis}
            disabled={analyzing}
            className="w-full px-3 py-2 bg-cyan-500/20 border border-cyan-400 rounded text-cyan-300 text-xs hover:bg-cyan-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <>
                <Loader className="w-3 h-3 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Share2 className="w-3 h-3" />
                Start Real-time Analysis
              </>
            )}
          </motion.button>

          {analysis && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-3"
            >
              <p className="text-purple-200 text-xs leading-relaxed">{analysis}</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Right: Chat */}
      <div className="flex flex-col p-4 space-y-4">
        <p className="text-white font-bold text-sm flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> Discussion
        </p>

        <div className="flex-1 overflow-y-auto space-y-3">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-xs p-2 rounded-lg ${
                  msg.sender === 'You'
                    ? 'bg-cyan-500/20 text-cyan-100 ml-4'
                    : 'bg-purple-500/20 text-purple-100 mr-4'
                }`}
              >
                <p className="font-semibold">{msg.sender}</p>
                <p className="text-white/80">{msg.content}</p>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask a question..."
            className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white placeholder-white/40 text-xs"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="px-2 py-1 bg-cyan-500/20 border border-cyan-400 rounded text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50"
          >
            Send
          </motion.button>
        </div>
      </div>
    </div>
  );
}