import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FinancialAdvisorChatbot from '../components/ai/FinancialAdvisorChatbot';
import IntegrationManagementHub from '../components/integrations/IntegrationManagementHub';
import { base44 } from '@/api/base44Client';

export default function FinancialAdvisorHub() {
  const [userEmail, setUserEmail] = useState(null);
  const [userContext, setUserContext] = useState({});
  const [activeTab, setActiveTab] = useState('advisor');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await base44.auth.me();
        setUserEmail(user.email);

        // Load user financial context (portfolio, goals, etc)
        setUserContext({
          portfolio: {
            totalValue: 250000,
            allocation: { stocks: 60, bonds: 30, crypto: 10 },
            yearToDateReturn: 12.5,
          },
          goals: [
            { name: 'Retirement', target: 1000000, current: 250000 },
            { name: 'Home Purchase', target: 500000, current: 150000 },
          ],
          riskProfile: 'moderate-aggressive',
        });
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Financial Intelligence Hub
          </h1>
          <p className="text-white/60">AI-powered advisory, integration management, and real-time market insights</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8 border-b border-white/10 pb-4">
          {[
            { id: 'advisor', label: 'Financial Advisor', icon: '💬' },
            { id: 'integrations', label: 'Integrations', icon: '🔗' },
          ].map(tab => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-lg border transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-white/5 border-white/10 text-white/80 hover:border-white/30'
              }`}
            >
              {tab.icon} {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {activeTab === 'advisor' && userEmail && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <FinancialAdvisorChatbot userEmail={userEmail} userContext={userContext} />
              </div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-3 font-semibold">Portfolio Overview</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-white/80">Total Value</p>
                      <p className="text-cyan-400 font-bold">$250,000</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-white/80">YTD Return</p>
                      <p className="text-green-400 font-bold">+12.5%</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-white/80">Risk Profile</p>
                      <p className="text-white/80 text-sm">Mod-Aggressive</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-3 font-semibold">Financial Goals</p>
                  {userContext.goals?.map((goal, idx) => (
                    <div key={idx} className="mb-3 last:mb-0">
                      <p className="text-white text-sm font-semibold mb-1">{goal.name}</p>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(goal.current / goal.target) * 100}%` }}
                          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                        />
                      </div>
                      <p className="text-white/60 text-xs mt-1">
                        ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {activeTab === 'integrations' && <IntegrationManagementHub />}
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { title: 'Sentiment-Aware', desc: 'Adapts tone based on user emotions' },
            { title: 'Real-Time Data', desc: 'OAuth + 2-way sync for live updates' },
            { title: 'Webhook Events', desc: 'Instant alerts & notifications' },
            { title: 'Auto-Discovery', desc: 'AI suggests new integrations' },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-3 hover:border-white/30 transition-all"
            >
              <p className="text-white text-sm font-bold">{feature.title}</p>
              <p className="text-white/60 text-xs mt-1">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}