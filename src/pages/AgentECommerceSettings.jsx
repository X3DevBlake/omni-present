import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Settings, Save } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { toast } from 'sonner';

export default function AgentECommerceSettings() {
  const [agents, setAgents] = useState([
    {
      id: '1',
      name: 'Shopping Assistant',
      enabled: true,
      spendingLimit: 50,
      allowedCategories: ['office', 'electronics'],
      autoApprove: false,
    },
    {
      id: '2',
      name: 'Research Agent',
      enabled: false,
      spendingLimit: 100,
      allowedCategories: ['books', 'software'],
      autoApprove: true,
    },
  ]);

  const categories = [
    'office', 'electronics', 'books', 'software', 'health', 'food', 'clothing', 'home', 'sports', 'toys'
  ];

  const toggleCategory = (agentId, category) => {
    setAgents(agents.map(agent => {
      if (agent.id === agentId) {
        const newCategories = agent.allowedCategories.includes(category)
          ? agent.allowedCategories.filter(c => c !== category)
          : [...agent.allowedCategories, category];
        return { ...agent, allowedCategories: newCategories };
      }
      return agent;
    }));
  };

  const updateAgent = (agentId, updates) => {
    setAgents(agents.map(agent => 
      agent.id === agentId ? { ...agent, ...updates } : agent
    ));
  };

  const saveSettings = () => {
    toast.success('Agent e-commerce settings saved!');
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
            Agent <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Shopping Settings</span>
          </h1>
          <p className="text-white/60 text-lg">Configure autonomous purchasing permissions for AI agents</p>
        </motion.div>

        <div className="space-y-6">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">{agent.name}</h3>
                    <div className="text-white/60 text-sm">E-commerce Integration</div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agent.enabled}
                    onChange={(e) => updateAgent(agent.id, { enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Spending Limit */}
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Daily Spending Limit (OMNI)</label>
                  <input
                    type="number"
                    value={agent.spendingLimit}
                    onChange={(e) => updateAgent(agent.id, { spendingLimit: parseFloat(e.target.value) })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none"
                  />
                </div>

                {/* Auto-Approve */}
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Purchase Approval</label>
                  <select
                    value={agent.autoApprove ? 'auto' : 'manual'}
                    onChange={(e) => updateAgent(agent.id, { autoApprove: e.target.value === 'auto' })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none"
                  >
                    <option value="manual">Require Manual Approval</option>
                    <option value="auto">Auto-Approve Purchases</option>
                  </select>
                </div>
              </div>

              {/* Allowed Categories */}
              <div className="mt-6">
                <label className="text-white/60 text-sm mb-3 block">Allowed Product Categories</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(agent.id, category)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        agent.allowedCategories.includes(category)
                          ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                          : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          onClick={saveSettings}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-8 w-full py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          Save Settings
        </motion.button>
      </div>
    </AuroraBackground>
  );
}