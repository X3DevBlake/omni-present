import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Settings, AlertCircle } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { toast } from 'sonner';

export default function AgentCardSettings() {
  const [agents] = useState([
    { id: '1', name: 'Shopping Assistant', hasCard: true, cardLimit: 50, cardNumber: '**** 1234' },
    { id: '2', name: 'Research Agent', hasCard: false, cardLimit: 0, cardNumber: null },
    { id: '3', name: 'Travel Planner', hasCard: true, cardLimit: 200, cardNumber: '**** 5678' },
  ]);

  const [selectedAgent, setSelectedAgent] = useState(null);
  const [cardLimit, setCardLimit] = useState('');

  const issueCard = (agent) => {
    setSelectedAgent(agent);
    setCardLimit(agent.cardLimit.toString());
  };

  const handleIssueCard = () => {
    toast.success(`Virtual card issued to ${selectedAgent.name}!`);
    setSelectedAgent(null);
    setCardLimit('');
  };

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Agent <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Card Management</span>
          </h1>
          <p className="text-white/60 text-lg">Issue and manage virtual cards for AI agents</p>
        </motion.div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-8">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-yellow-300 text-sm">
              <p className="font-medium mb-1">Agent Virtual Cards</p>
              <p className="text-yellow-300/80">
                Virtual cards allow agents to make autonomous online purchases. Each card has its own spending limit and can be frozen or cancelled at any time.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                    <CreditCard className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">{agent.name}</h3>
                    {agent.hasCard ? (
                      <div className="text-white/60 text-sm">Card: {agent.cardNumber}</div>
                    ) : (
                      <div className="text-white/60 text-sm">No card issued</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {agent.hasCard ? (
                    <>
                      <div className="text-right">
                        <div className="text-white/60 text-sm">Spending Limit</div>
                        <div className="text-cyan-400 text-2xl font-bold">${agent.cardLimit}</div>
                      </div>
                      <button
                        onClick={() => issueCard(agent)}
                        className="p-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => issueCard(agent)}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium rounded-xl hover:opacity-90 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Issue Card
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Issue Card Modal */}
        {selectedAgent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md w-full"
            >
              <h3 className="text-white font-bold text-2xl mb-6">
                {selectedAgent.hasCard ? 'Update Card Settings' : 'Issue Virtual Card'}
              </h3>

              <div className="mb-6">
                <label className="text-white/60 text-sm mb-2 block">Agent</label>
                <div className="bg-white/5 rounded-xl p-3 text-white">{selectedAgent.name}</div>
              </div>

              <div className="mb-6">
                <label className="text-white/60 text-sm mb-2 block">Daily Spending Limit ($)</label>
                <input
                  type="number"
                  value={cardLimit}
                  onChange={(e) => setCardLimit(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleIssueCard}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-xl hover:opacity-90"
                >
                  {selectedAgent.hasCard ? 'Update' : 'Issue Card'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AuroraBackground>
  );
}