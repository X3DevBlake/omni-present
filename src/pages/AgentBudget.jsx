import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Edit, Save, X } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AgentBudget() {
  const [user, setUser] = useState(null);
  const [agents, setAgents] = useState([]);
  const [editingAgent, setEditingAgent] = useState(null);
  const [budgetAmount, setBudgetAmount] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      // Mock agents - in real app, fetch from Agent entity
      const mockAgents = [
        { id: '1', name: 'Shopping Assistant', omni_budget: 50, personality: 'Frugal', spent: 12.5 },
        { id: '2', name: 'Research Agent', omni_budget: 100, personality: 'Curious', spent: 45.2 },
        { id: '3', name: 'Travel Planner', omni_budget: 200, personality: 'Adventurous', spent: 98.7 },
      ];
      setAgents(mockAgents);
    } catch (err) {
      toast.error('Failed to load agents');
    }
  };

  const handleUpdateBudget = async (agent) => {
    if (!budgetAmount || parseFloat(budgetAmount) <= 0) {
      toast.error('Please enter a valid budget');
      return;
    }

    const amount = parseFloat(budgetAmount);
    const difference = amount - agent.omni_budget;

    if (difference > (user?.omni_balance || 0)) {
      toast.error('Insufficient Omni balance');
      return;
    }

    // Update agent budget
    const updatedAgents = agents.map(a => 
      a.id === agent.id ? { ...a, omni_budget: amount } : a
    );
    setAgents(updatedAgents);

    // Update user balance
    await base44.auth.updateMe({
      omni_balance: (user.omni_balance || 0) - difference
    });

    toast.success(`Budget updated for ${agent.name}`);
    setEditingAgent(null);
    setBudgetAmount('');
    loadData();
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
            Agent <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Budgets</span>
          </h1>
          <p className="text-white/60 text-lg">Allocate Omni tokens to your AI agents</p>
        </motion.div>

        {/* User Balance */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white/60 text-sm mb-1">Available Balance</div>
              <div className="text-cyan-400 text-3xl font-bold">{(user?.omni_balance || 0).toFixed(2)} OMNI</div>
            </div>
            <div>
              <div className="text-white/60 text-sm mb-1">Total Allocated</div>
              <div className="text-purple-400 text-3xl font-bold">
                {agents.reduce((sum, a) => sum + a.omni_budget, 0).toFixed(2)} OMNI
              </div>
            </div>
          </div>
        </div>

        {/* Agents List */}
        <div className="space-y-4">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">{agent.name}</h3>
                    <div className="text-white/60 text-sm">Personality: {agent.personality}</div>
                  </div>
                </div>

                <div className="text-right">
                  {editingAgent === agent.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={budgetAmount}
                        onChange={(e) => setBudgetAmount(e.target.value)}
                        placeholder={agent.omni_budget.toString()}
                        className="w-32 bg-black/60 border border-cyan-500 rounded-lg px-3 py-2 text-white outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleUpdateBudget(agent)}
                        className="p-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/30"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingAgent(null);
                          setBudgetAmount('');
                        }}
                        className="p-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-white/60 text-sm">Budget</div>
                        <div className="text-cyan-400 text-2xl font-bold">{agent.omni_budget} OMNI</div>
                        <div className="text-white/40 text-xs">Spent: {agent.spent} OMNI</div>
                      </div>
                      <button
                        onClick={() => {
                          setEditingAgent(agent.id);
                          setBudgetAmount(agent.omni_budget.toString());
                        }}
                        className="p-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Budget Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-white/60 mb-2">
                  <span>Budget Usage</span>
                  <span>{((agent.spent / agent.omni_budget) * 100).toFixed(1)}%</span>
                </div>
                <div className="bg-black/40 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${Math.min((agent.spent / agent.omni_budget) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}