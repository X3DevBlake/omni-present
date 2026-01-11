import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Target, TrendingUp, Zap } from 'lucide-react';

export default function FinancialCoachingModule() {
  const [activeTab, setActiveTab] = useState('chat');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    { type: 'coach', text: 'Hi! I\'m your AI financial coach. Ask me anything about budgeting, saving, investing, or debt management.' }
  ]);

  const goals = [
    { title: 'Emergency Fund', target: 5000, current: 3200, progress: 64 },
    { title: 'Home Down Payment', target: 50000, current: 12500, progress: 25 },
    { title: 'Retirement', target: 1000000, current: 85000, progress: 8.5 },
  ];

  const handleSendQuestion = () => {
    if (!question.trim()) return;
    setMessages([...messages, { type: 'user', text: question }]);
    setQuestion('');
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        type: 'coach', 
        text: 'Great question! Based on your profile, I recommend focusing on [specific advice]. Here\'s why this matters for your goals...' 
      }]);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-3">
        {[
          { id: 'chat', label: 'Q&A Coach', icon: MessageCircle },
          { id: 'goals', label: 'Goals', icon: Target },
          { id: 'advice', label: 'Advice', icon: TrendingUp },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-white/5 border-white/10 text-white/80 hover:border-white/30'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          );
        })}
      </div>

      {/* Chat */}
      {activeTab === 'chat' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4"
        >
          <div className="h-64 overflow-y-auto space-y-3 mb-4">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: msg.type === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.type === 'user'
                    ? 'bg-cyan-500/20 border border-cyan-400/30 text-white'
                    : 'bg-purple-500/20 border border-purple-400/30 text-white/80'
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendQuestion()}
              placeholder="Ask me a financial question..."
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendQuestion}
              className="bg-cyan-500/20 border border-cyan-400 rounded-lg px-4 py-2 text-cyan-300 hover:bg-cyan-500/30 transition-all"
            >
              Send
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Goals */}
      {activeTab === 'goals' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {goals.map((goal, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -2 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-bold">{goal.title}</p>
                <span className="text-cyan-400 text-sm font-semibold">{goal.progress}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${goal.progress}%` }}
                  className="h-full bg-green-500"
                />
              </div>
              <p className="text-white/60 text-sm">${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Advice */}
      {activeTab === 'advice' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/20 rounded-lg p-6 space-y-4"
        >
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-white font-bold mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Today's Tip
              </p>
              <p className="text-white/80 text-sm">Set up automatic transfers of $500/month to your emergency fund. You're 64% there!</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-white font-bold mb-2">Quick Win</p>
              <p className="text-white/80 text-sm">Review your subscriptions this week - typical savings: $50-100/month</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-white font-bold mb-2">Next Milestone</p>
              <p className="text-white/80 text-sm">Reach $4,000 in emergency fund (66%) - just $800 more!</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}