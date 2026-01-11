import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, TrendingUp, Lightbulb } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function FinancialAdvisorChatbot({ userEmail, userContext }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'advisor',
      text: 'Hello! I\'m your financial advisor. I have access to your portfolio, goals, and financial data. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeAndRespond = async (userQuestion) => {
    setLoading(true);
    try {
      // Analyze user sentiment and question
      const sentimentResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze user question for financial advisor:
        
        User Email: ${userEmail}
        Question: "${userQuestion}"
        User Context: ${JSON.stringify(userContext)}
        
        Determine:
        1. Sentiment and emotional state
        2. Question category (investment, planning, risk, market, goal-based, etc)
        3. Complexity level
        4. Urgency
        5. Required data (portfolio, market data, etc)`,
        response_json_schema: {
          type: 'object',
          properties: {
            sentiment: { type: 'string' },
            category: { type: 'string' },
            complexity: { type: 'string' },
            urgency: { type: 'string' },
          },
        },
      });

      // Get comprehensive financial advice
      const adviceResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide personalized financial advice:
        
        User: ${userEmail}
        Question: "${userQuestion}"
        Portfolio Context: ${JSON.stringify(userContext?.portfolio || {})}
        Financial Goals: ${JSON.stringify(userContext?.goals || [])}
        Sentiment: ${sentimentResponse.sentiment}
        
        Provide:
        1. Direct answer to the question
        2. Relevant portfolio insights
        3. Market context
        4. Actionable recommendations (3-5 specific steps)
        5. Risk considerations
        6. Timeline/urgency
        
        Adapt tone to user sentiment: ${sentimentResponse.sentiment}.
        Be empathetic if stressed, confident if uncertain.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            answer: { type: 'string' },
            portfolioInsights: { type: 'array', items: { type: 'string' } },
            marketContext: { type: 'string' },
            recommendations: { type: 'array', items: { type: 'object' } },
            riskConsiderations: { type: 'array', items: { type: 'string' } },
            timeline: { type: 'string' },
          },
        },
      });

      // Format response
      const advisorMessage = {
        id: messages.length + 1,
        sender: 'advisor',
        text: adviceResponse.answer,
        details: adviceResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, advisorMessage]);
    } catch (error) {
      console.error('Error getting advice:', error);
      setMessages(prev => [...prev, {
        id: messages.length + 1,
        sender: 'advisor',
        text: 'I encountered an error processing your question. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: input,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Get advisor response
    await analyzeAndRespond(input);
  };

  const quickQuestions = [
    'Should I rebalance my portfolio?',
    'How can I reduce my investment risk?',
    'What are the best savings strategies for my goals?',
    'Explain current market trends',
  ];

  return (
    <div className="flex flex-col h-full bg-white/5 border border-white/10 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Financial Advisor</h3>
        </div>
        <p className="text-white/60 text-sm mt-1">Personalized insights for your portfolio & goals</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-6">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${
                msg.sender === 'user'
                  ? 'bg-cyan-500/20 border border-cyan-400'
                  : 'bg-white/10 border border-white/20'
              } rounded-lg px-4 py-3`}>
                <p className="text-white text-sm">{msg.text}</p>
                {msg.details && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 space-y-2 text-xs text-white/70 border-t border-white/20 pt-2"
                  >
                    {msg.details.recommendations && msg.details.recommendations.length > 0 && (
                      <div>
                        <p className="font-semibold text-white/90 mb-1">Recommendations:</p>
                        {msg.details.recommendations.slice(0, 3).map((rec, i) => (
                          <p key={i} className="ml-2">• {rec.action || rec}</p>
                        ))}
                      </div>
                    )}
                    {msg.details.timeline && (
                      <p><span className="font-semibold text-white/90">Timeline:</span> {msg.details.timeline}</p>
                    )}
                  </motion.div>
                )}
                <p className="text-white/40 text-xs mt-2">{msg.timestamp.toLocaleTimeString()}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-4 border-t border-white/10 bg-white/5"
        >
          <p className="text-white/60 text-sm mb-3">Popular questions:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {quickQuestions.map((q, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setInput(q);
                  setTimeout(() => handleSendMessage({ preventDefault: () => {} }), 0);
                }}
                className="p-2 text-left text-xs text-white/80 bg-white/10 hover:bg-white/20 rounded-lg transition-all border border-white/20 hover:border-white/30"
              >
                <Lightbulb className="w-3 h-3 inline mr-1" />
                {q}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-white/10 p-4 bg-white/5">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a financial question..."
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
            disabled={loading}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50 transition-all"
          >
            {loading ? <TrendingUp className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </motion.button>
        </div>
      </form>
    </div>
  );
}