import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Phone, Send, Volume2, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { orchestrateSlackToVoice, orchestrateTwilioFlow, synthesizeAndDeliver } from '../../functions/integrations/unified-voice-orchestration';

export default function UnifiedCommunicationBridge() {
  const [messageInput, setMessageInput] = useState('');
  const [deliveryChannels, setDeliveryChannels] = useState(['slack']);
  const [conversations, setConversations] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const handleUnifiedMessage = async () => {
    if (!messageInput.trim()) return;

    setProcessing(true);
    try {
      const conversation = {
        id: Date.now(),
        input: messageInput,
        channels: deliveryChannels,
        timestamp: new Date(),
        status: 'processing',
      };

      setConversations(prev => [conversation, ...prev]);

      // Route based on primary channel
      if (deliveryChannels.includes('slack')) {
        const result = await orchestrateSlackToVoice(messageInput, userEmail);
        setConversations(prev =>
          prev.map(c => c.id === conversation.id
            ? { ...c, status: 'completed', response: result.response }
            : c
          )
        );
      }

      // Synthesize and deliver to all channels
      await synthesizeAndDeliver(messageInput, deliveryChannels, userEmail);

      setMessageInput('');
    } catch (error) {
      console.error('Error:', error);
      setConversations(prev =>
        prev.map(c => c.id === conversation.id ? { ...c, status: 'error' } : c)
      );
    } finally {
      setProcessing(false);
    }
  };

  const toggleChannel = (channel) => {
    setDeliveryChannels(prev =>
      prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  return (
    <div className="space-y-4">
      {/* Channel Selection */}
      <div className="space-y-2">
        <p className="text-white font-bold text-sm">Delivery Channels</p>
        <div className="grid grid-cols-2 gap-2">
          {['slack', 'twilio', 'whatsapp', 'voice_call'].map(channel => (
            <motion.button
              key={channel}
              whileHover={{ scale: 1.05 }}
              onClick={() => toggleChannel(channel)}
              className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                deliveryChannels.includes(channel)
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
              }`}
            >
              {channel === 'slack' && <MessageSquare className="w-3 h-3 inline mr-1" />}
              {channel === 'twilio' && <Phone className="w-3 h-3 inline mr-1" />}
              {channel === 'whatsapp' && '💬'}
              {channel === 'voice_call' && <Volume2 className="w-3 h-3 inline mr-1" />}
              {channel.charAt(0).toUpperCase() + channel.slice(1).replace(/_/g, ' ')}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="space-y-2">
        <textarea
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Enter message for cross-platform delivery..."
          className="w-full h-24 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 resize-none"
          disabled={processing}
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={handleUnifiedMessage}
          disabled={!messageInput.trim() || processing}
          className="w-full px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          {processing ? 'Orchestrating...' : 'Send to All Channels'}
        </motion.button>
      </div>

      {/* Conversation History */}
      <div className="space-y-2">
        <p className="text-white font-bold text-sm">Delivery History</p>
        {conversations.map((conv, idx) => (
          <motion.div
            key={conv.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`border rounded-lg p-3 ${
              conv.status === 'completed'
                ? 'bg-green-500/10 border-green-400/30'
                : conv.status === 'error'
                ? 'bg-red-500/10 border-red-400/30'
                : 'bg-yellow-500/10 border-yellow-400/30'
            }`}
          >
            <p className="text-white text-sm font-semibold truncate">{conv.input}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {conv.channels.map(ch => (
                <span key={ch} className="text-xs px-2 py-1 bg-white/10 rounded text-white/70">
                  {ch}
                </span>
              ))}
            </div>
            <p className={`text-xs mt-1 ${
              conv.status === 'completed' ? 'text-green-300' :
              conv.status === 'error' ? 'text-red-300' :
              'text-yellow-300'
            }`}>
              {conv.status.charAt(0).toUpperCase() + conv.status.slice(1)}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}