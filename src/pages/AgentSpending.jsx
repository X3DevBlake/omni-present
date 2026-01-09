import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Filter } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import TransactionList from '../components/omni/TransactionList';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AgentSpending() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Mock agents
      const mockAgents = [
        { id: '1', name: 'Shopping Assistant', spent: 12.5 },
        { id: '2', name: 'Research Agent', spent: 45.2 },
        { id: '3', name: 'Travel Planner', spent: 98.7 },
      ];
      setAgents(mockAgents);

      // Mock transactions
      const mockTransactions = [
        {
          id: '1',
          type: 'spend',
          amount: 5.5,
          currency: 'omni',
          status: 'confirmed',
          created_date: new Date(),
          metadata: { agent_name: 'Shopping Assistant', item: 'Office Supplies' }
        },
        {
          id: '2',
          type: 'spend',
          amount: 15.0,
          currency: 'omni',
          status: 'confirmed',
          created_date: new Date(Date.now() - 86400000),
          metadata: { agent_name: 'Research Agent', item: 'Data Subscription' }
        },
        {
          id: '3',
          type: 'spend',
          amount: 45.0,
          currency: 'omni',
          status: 'confirmed',
          created_date: new Date(Date.now() - 172800000),
          metadata: { agent_name: 'Travel Planner', item: 'Flight Research Tools' }
        },
      ];
      setTransactions(mockTransactions);
    } catch (err) {
      toast.error('Failed to load spending data');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = selectedAgent === 'all'
    ? transactions
    : transactions.filter(tx => tx.metadata?.agent_name === selectedAgent);

  const totalSpent = agents.reduce((sum, a) => sum + a.spent, 0);

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Agent <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Spending</span>
          </h1>
          <p className="text-white/60 text-lg">Monitor your AI agents' Omni token usage</p>
        </motion.div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="text-white/60 text-sm mb-2">Total Spent</div>
            <div className="text-red-400 text-3xl font-bold">{totalSpent.toFixed(2)} OMNI</div>
          </div>

          {agents.map((agent, index) => (
            <div
              key={agent.id}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <div className="text-white/60 text-sm mb-2">{agent.name}</div>
              <div className="text-purple-400 text-2xl font-bold">{agent.spent.toFixed(2)} OMNI</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-cyan-400" />
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-cyan-500 outline-none"
            >
              <option value="all">All Agents</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.name}>{agent.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Transaction List */}
        <div>
          <h2 className="text-white font-bold text-2xl mb-4">Spending History</h2>
          <TransactionList transactions={filteredTransactions} isLoading={loading} />
        </div>
      </div>
    </AuroraBackground>
  );
}