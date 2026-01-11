import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Lightbulb, TrendingUp, AlertCircle, Zap, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function GeminiCopilotAdvisor() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'copilot',
      text: 'Hey! I\'m your Gemini-powered financial copilot. I can answer questions about your finances, suggest optimizations, and help you understand complex financial strategies. What would you like to explore?',
      timestamp: new Date(),
      type: 'greeting',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [proactiveAdvice, setProactiveAdvice] = useState(null);
  const messagesEndRef = useRef(null);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateProactiveAdvice = async (question) => {
    try {
      const userContext = await base44.entities.FinancialHealthScore.filter({ user_email: userEmail }, '-updated_date', 1);
      const anomalies = await base44.entities.FraudAlert.filter({ user_email: userEmail, status: 'pending' }, '-detected_at', 5);
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a personalized financial copilot. User asked: "${question}"
        
User Context:
- Financial Health Score: ${userContext?.[0]?.overall_score || 'N/A'}
- Recent Anomalies: ${anomalies?.length || 0}
- Active Anomalies: ${anomalies?.map(a => a.alert_type).join(', ') || 'None'}

Provide:
1. Direct answer to their question
2. Proactive advice based on their profile
3. Actionable next steps
4. References to relevant features in the app

Be conversational, insightful, and specific to their situation.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            answer: { type: 'string' },
            proactiveInsight: { type: 'string' },
            actionItems: { type: 'array', items: { type: 'string' } },
            relatedFeatures: { type: 'array', items: { type: 'string' } },
            confidenceLevel: { type: 'string' },
          },
        },
      });

      return response;
    } catch (error) {
      console.error('Error generating advice:', error);
      return null;
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: input,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const advice = await generateProactiveAdvice(input);
      
      if (advice) {
        const copilotMessage = {
          id: messages.length + 2,
          sender: 'copilot',
          text: advice.answer,
          proactiveInsight: advice.proactiveInsight,
          actionItems: advice.actionItems,
          relatedFeatures: advice.relatedFeatures,
          timestamp: new Date(),
          type: 'advice',
        };
        setMessages(prev => [...prev, copilotMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    'How can I optimize my portfolio allocation?',
    'Should I be concerned about my recent market losses?',
    'Explain tax-loss harvesting for me',
    'What\'s my path to financial independence?',
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-lg overflow-hidden border border-purple-500/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border-b border-purple-500/20 px-6 py-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
          <h3 className="text-xl font-bold text-white">Gemini Copilot</h3>
          <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-1 rounded-full">AI Advisor</span>
        </div>
        <p className="text-white/60 text-sm">Your personalized financial guidance powered by Gemini</p>
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
              <div className={`max-w-md ${
                msg.sender === 'user'
                  ? 'bg-cyan-500/20 border border-cyan-400'
                  : 'bg-purple-500/20 border border-purple-400'
              } rounded-lg px-4 py-3`}>
                <p className="text-white text-sm mb-2">{msg.text}</p>

                {msg.proactiveInsight && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-purple-400/30 space-y-2"
                  >
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white/90 text-xs font-semibold">Proactive Insight</p>
                        <p className="text-white/70 text-xs mt-1">{msg.proactiveInsight}</p>
                      </div>
                    </div>

                    {msg.actionItems?.length > 0 && (
                      <div className="mt-2">
                        <p className="text-white/90 text-xs font-semibold mb-1">Next Steps</p>
                        <ul className="space-y-1">
                          {msg.actionItems.map((item, i) => (
                            <li key={i} className="text-white/70 text-xs flex items-start gap-1">
                              <span className="text-cyan-400 mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {msg.relatedFeatures?.length > 0 && (
                      <div className="mt-2">
                        <p className="text-white/90 text-xs font-semibold mb-1">Related Features</p>
                        <div className="flex flex-wrap gap-1">
                          {msg.relatedFeatures.map((feature, i) => (
                            <span key={i} className="text-xs px-2 py-1 bg-purple-500/30 rounded border border-purple-400/30 text-white/80">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                <p className="text-white/40 text-xs mt-2">{msg.timestamp.toLocaleTimeString()}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-purple-500/20 border border-purple-400 rounded-lg px-4 py-3">
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce delay-200" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-4 border-t border-purple-500/20 bg-purple-500/5"
        >
          <p className="text-white/60 text-xs mb-3">Popular questions:</p>
          <div className="grid grid-cols-1 gap-2">
            {suggestedQuestions.map((q, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setInput(q);
                  setTimeout(() => handleSendMessage({ preventDefault: () => {} }), 0);
                }}
                className="p-2 text-left text-xs text-white/80 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-all border border-purple-400/30 hover:border-purple-400/50"
              >
                <Lightbulb className="w-3 h-3 inline mr-1" />
                {q}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-purple-500/20 p-4 bg-purple-500/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your finances..."
            className="flex-1 bg-white/10 border border-purple-400/30 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
            disabled={loading}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </form>
    </div>
  );
}