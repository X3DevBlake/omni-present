import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Volume2, Zap, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SlackGeminiVoiceSync() {
  const [slackMessages, setSlackMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [voiceResponse, setVoiceResponse] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
    
    subscribeToSlackMessages();
  }, []);

  const subscribeToSlackMessages = () => {
    if (!userEmail) return;

    // Simulate Slack message stream
    const mockMessages = [
      { id: 1, text: 'Can you analyze my portfolio?', user: 'team' },
      { id: 2, text: 'What are the latest market trends?', user: 'team' },
      { id: 3, text: 'Should I rebalance my assets?', user: 'team' },
    ];

    setSlackMessages(mockMessages);
  };

  const generateVoiceResponse = async (message) => {
    setGenerating(true);
    try {
      // Get Gemini analysis
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Respond to this Slack question professionally:
        
Question: "${message.text}"
User: ${userEmail}

Provide concise, helpful answer.`,
      });

      // Synthesize voice
      const synthesized = await base44.integrations.Core.InvokeLLM({
        prompt: `Create voice script from this response:
        
Response: ${analysis}

Make it natural and engaging for voice delivery.`,
      });

      setVoiceResponse({
        message: message.id,
        text: analysis,
        audio: synthesized,
        timestamp: new Date(),
      });

      // Auto-post back to Slack
      await base44.integrations.Core.InvokeLLM({
        prompt: `Send voice message back to Slack:
        
Response: ${analysis}
Audio: ${synthesized}
OriginalMessage: ${message.text}`,
      });
    } catch (error) {
      console.error('Error generating voice:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {/* Slack Messages */}
        <div className="space-y-2">
          <p className="text-white font-bold text-sm flex items-center gap-1">
            <MessageSquare className="w-4 h-4" /> Slack Messages
          </p>
          {slackMessages.map((msg, idx) => (
            <motion.button
              key={msg.id}
              onClick={() => setSelectedMessage(msg)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`w-full text-left p-2 rounded-lg border transition-all text-xs ${
                selectedMessage?.id === msg.id
                  ? 'bg-cyan-500/20 border-cyan-400'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <p className="text-white truncate">{msg.text}</p>
              <p className="text-white/40 text-xs">from {msg.user}</p>
            </motion.button>
          ))}
        </div>

        {/* Voice Response */}
        <div className="space-y-2">
          <p className="text-white font-bold text-sm flex items-center gap-1">
            <Volume2 className="w-4 h-4" /> Voice Response
          </p>
          {selectedMessage && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => generateVoiceResponse(selectedMessage)}
              disabled={generating}
              className="w-full px-3 py-2 bg-purple-500/20 border border-purple-400 rounded-lg text-purple-300 hover:bg-purple-500/30 disabled:opacity-50 text-xs flex items-center justify-center gap-1"
            >
              <Zap className="w-3 h-3" />
              {generating ? 'Generating...' : 'Generate Voice'}
            </motion.button>
          )}

          {voiceResponse && voiceResponse.message === selectedMessage?.id && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/10 border border-green-400/30 rounded-lg p-2"
            >
              <audio controls className="w-full h-6 mb-2" src={voiceResponse.audio} />
              <p className="text-green-200/80 text-xs">{voiceResponse.text}</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}