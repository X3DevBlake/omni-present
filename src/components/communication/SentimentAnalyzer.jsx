import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, MessageSquare, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SentimentAnalyzer({ userEmail }) {
  const [messages, setMessages] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    analyzeIncomingMessages();
  }, []);

  const analyzeIncomingMessages = async () => {
    setAnalyzing(true);
    try {
      // Fetch recent conversations
      const conversations = await base44.entities.AIConversation.list(
        { user_email: userEmail },
        '-created_date',
        20
      );

      // Analyze sentiment with Gemini
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze sentiment and urgency for these messages:

${JSON.stringify(conversations.map(c => ({ message: c.user_message, context: c.context })), null, 2)}

For each, provide:
- sentiment (positive/neutral/negative)
- urgency_score (0-10)
- priority (low/medium/high/critical)
- reason

Return as JSON array.`,
        response_json_schema: {
          type: 'object',
          properties: {
            analyzed_messages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  message_id: { type: 'number' },
                  sentiment: { type: 'string' },
                  urgency_score: { type: 'number' },
                  priority: { type: 'string' },
                  reason: { type: 'string' }
                }
              }
            }
          }
        }
      });

      const enriched = conversations.map((conv, idx) => ({
        ...conv,
        analysis: analysis.analyzed_messages[idx]
      }));

      // Sort by urgency
      enriched.sort((a, b) => (b.analysis?.urgency_score || 0) - (a.analysis?.urgency_score || 0));
      
      setMessages(enriched);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'from-red-500/20 to-orange-500/20 border-red-500/40';
      case 'high': return 'from-orange-500/20 to-yellow-500/20 border-orange-500/40';
      case 'medium': return 'from-yellow-500/20 to-green-500/20 border-yellow-500/40';
      default: return 'from-blue-500/20 to-cyan-500/20 border-blue-500/40';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'negative': return '😟';
      case 'positive': return '😊';
      default: return '😐';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          Message Sentiment & Priority
        </h3>
        <button
          onClick={analyzeIncomingMessages}
          disabled={analyzing}
          className="px-3 py-1 bg-cyan-500/20 border border-cyan-400 text-cyan-300 rounded text-sm hover:bg-cyan-500/30 disabled:opacity-50"
        >
          {analyzing ? 'Analyzing...' : 'Refresh'}
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`bg-gradient-to-br ${getPriorityColor(msg.analysis?.priority)} rounded-lg p-3`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getSentimentIcon(msg.analysis?.sentiment)}</span>
                <div>
                  <p className="text-white font-semibold text-sm">
                    {msg.analysis?.priority?.toUpperCase() || 'MEDIUM'} Priority
                  </p>
                  <p className="text-white/60 text-xs">
                    Urgency: {msg.analysis?.urgency_score || 5}/10
                  </p>
                </div>
              </div>
              {msg.analysis?.priority === 'critical' && (
                <AlertCircle className="w-5 h-5 text-red-400 animate-pulse" />
              )}
            </div>
            <p className="text-white/80 text-sm mb-2 line-clamp-2">{msg.user_message}</p>
            <p className="text-white/50 text-xs italic">{msg.analysis?.reason}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}