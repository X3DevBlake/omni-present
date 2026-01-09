import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Send, Loader } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AgentVoiceChat({ agentName = 'Agent-01' }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  const startListening = async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      let fullTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript;
      }
      setTranscript(fullTranscript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const sendMessage = async () => {
    if (!transcript.trim()) return;

    const userMessage = transcript;
    setTranscript('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are ${agentName}, an AI agent in a simulation. Respond naturally and conversationally to the user. Keep responses concise (1-2 sentences). 
        
Conversation history:
${messages.map(m => `${m.role}: ${m.content}`).join('\n')}
User: ${userMessage}

Respond as the agent would in real-time conversation.`
      });

      setMessages(prev => [...prev, { role: 'agent', content: response }]);
      toast.success('Agent responded!');
    } catch (err) {
      toast.error('Failed to get agent response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black/40 border border-purple-500/30 rounded-2xl p-6 h-96 flex flex-col">
      <h3 className="text-white font-bold mb-4">🎤 Voice Chat with {agentName}</h3>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-white/40 text-sm py-8">
            Click the mic to start speaking with the agent...
          </div>
        )}
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-xs ${
                msg.role === 'user'
                  ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-100'
                  : 'bg-purple-500/30 border border-purple-500/50 text-purple-100'
              }`}
            >
              <p className="text-xs font-bold mb-1">{msg.role === 'user' ? 'You' : agentName}</p>
              <p className="text-sm">{msg.content}</p>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="space-y-3">
        {transcript && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-2">
            <p className="text-white/70 text-xs">Transcript: <span className="text-cyan-400">{transcript}</span></p>
          </div>
        )}

        <div className="flex gap-2">
          <motion.button
            onClick={isListening ? stopListening : startListening}
            whileHover={{ scale: 1.05 }}
            className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
              isListening
                ? 'bg-red-500/20 border border-red-500/40 text-red-300'
                : 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isListening ? 'Stop' : 'Listen'}
          </motion.button>

          <motion.button
            onClick={sendMessage}
            disabled={!transcript || loading}
            whileHover={{ scale: 1.05 }}
            className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send
          </motion.button>
        </div>
      </div>
    </div>
  );
}