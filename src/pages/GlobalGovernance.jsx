import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Settings, Lock, AlertCircle, CheckCircle2, ToggleRight } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import EnhancedHubNav from '../components/navigation/EnhancedHubNav';

export default function GlobalGovernance() {
  const [policies, setPolicies] = useState([
    {
      id: 1,
      title: 'Data Privacy Controls',
      description: 'Manage how agents access and handle user data',
      category: 'privacy',
      status: 'active',
      rules: [
        'Encrypt sensitive data at rest and in transit',
        'Log all data access attempts',
        'Implement data retention limits',
        'Regular privacy audits'
      ]
    },
    {
      id: 2,
      title: 'Resource Allocation Limits',
      description: 'Set maximum resource usage per agent',
      category: 'resources',
      status: 'active',
      rules: [
        'CPU usage cap: 80%',
        'Memory limit: 16GB per agent',
        'Daily bandwidth quota',
        'Concurrent execution limits'
      ]
    },
    {
      id: 3,
      title: 'Autonomous Decision Constraints',
      description: 'Define boundaries for agent autonomous decisions',
      category: 'safety',
      status: 'active',
      rules: [
        'Require approval for transactions >$10k',
        'Whitelist third-party integrations',
        'Implement rollback mechanisms',
        'Human-in-the-loop for critical decisions'
      ]
    },
    {
      id: 4,
      title: 'Model Governance Framework',
      description: 'Oversee AI model training and deployment',
      category: 'models',
      status: 'pending',
      rules: [
        'Bias detection in training data',
        'Regular model audits',
        'Version control for all models',
        'Gradual rollout procedures'
      ]
    },
    {
      id: 5,
      title: 'Security & Threat Response',
      description: 'Define incident response and security protocols',
      category: 'security',
      status: 'active',
      rules: [
        'Real-time threat monitoring',
        'Automatic anomaly detection',
        'Incident escalation procedures',
        'Regular security patches'
      ]
    }
  ]);

  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const togglePolicyStatus = (id) => {
    setPolicies(prev => prev.map(p =>
      p.id === id ? { ...p, status: p.status === 'active' ? 'paused' : 'active' } : p
    ));
  };

  const getCategoryColor = (cat) => {
    const colors = {
      privacy: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
      resources: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
      safety: 'from-red-500/20 to-orange-500/20 border-red-500/30',
      models: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
      security: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
    };
    return colors[cat] || colors.privacy;
  };

  return (
    <AuroraBackground>
      <EnhancedHubNav currentHub="LabsHome" />
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
            <Shield className="w-10 h-10 text-cyan-400" />
            AI Governance & Ethics Panel
          </h1>
          <p className="text-white/60">Define global policies for AI agent behavior, resource usage, and decision-making</p>
        </motion.div>

        {/* Policy Overview */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-6"
          >
            <h3 className="text-white/70 text-sm mb-2">Active Policies</h3>
            <div className="text-4xl font-bold text-cyan-400">{policies.filter(p => p.status === 'active').length}</div>
            <p className="text-xs text-white/50 mt-2">Governing all agents</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6"
          >
            <h3 className="text-white/70 text-sm mb-2">Total Rules</h3>
            <div className="text-4xl font-bold text-purple-400">{policies.reduce((sum, p) => sum + p.rules.length, 0)}</div>
            <p className="text-xs text-white/50 mt-2">Across all policies</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6"
          >
            <h3 className="text-white/70 text-sm mb-2">Compliance Rate</h3>
            <div className="text-4xl font-bold text-green-400">98.7%</div>
            <p className="text-xs text-white/50 mt-2">Agent adherence</p>
          </motion.div>
        </div>

        {/* Policies Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          <AnimatePresence>
            {policies.map((policy, idx) => (
              <motion.div
                key={policy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedPolicy(policy)}
                className={`bg-gradient-to-br ${getCategoryColor(policy.category)} rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/20 transition-all border group`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-2">{policy.title}</h3>
                    <p className="text-white/60 text-sm">{policy.description}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePolicyStatus(policy.id);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      policy.status === 'active'
                        ? 'bg-green-500/30 border border-green-500/50 text-green-300'
                        : 'bg-yellow-500/30 border border-yellow-500/50 text-yellow-300'
                    }`}
                  >
                    {policy.status === 'active' ? '✓ Active' : '⏸ Paused'}
                  </button>
                </div>

                {/* Rules Preview */}
                <div className="space-y-1 mb-4">
                  {policy.rules.slice(0, 2).map((rule, i) => (
                    <div key={i} className="text-xs text-white/60 flex gap-2">
                      <CheckCircle2 className="w-3 h-3 text-cyan-400 flex-shrink-0 mt-0.5" />
                      {rule}
                    </div>
                  ))}
                  {policy.rules.length > 2 && (
                    <div className="text-xs text-white/50">+{policy.rules.length - 2} more rules</div>
                  )}
                </div>

                <button className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm font-semibold transition-all">
                  View & Edit
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Selected Policy Details */}
        <AnimatePresence>
          {selectedPolicy && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{selectedPolicy.title}</h2>
                <button
                  onClick={() => setSelectedPolicy(null)}
                  className="text-white/60 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <p className="text-white/70 mb-6">{selectedPolicy.description}</p>

              {/* Rules List */}
              <div className="mb-8">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  Policy Rules ({selectedPolicy.rules.length})
                </h3>
                <div className="space-y-3">
                  {selectedPolicy.rules.map((rule, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center gap-4"
                    >
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold">{rule}</p>
                      </div>
                      <button className="p-2 hover:bg-white/10 rounded transition-colors">
                        <Settings className="w-4 h-4 text-white/60" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Compliance Metrics */}
              <div className="grid md:grid-cols-3 gap-4 pt-6 border-t border-white/10">
                <div>
                  <h4 className="text-white/70 text-xs mb-2">Agent Compliance</h4>
                  <div className="text-2xl font-bold text-green-400">98.9%</div>
                </div>
                <div>
                  <h4 className="text-white/70 text-xs mb-2">Last Audited</h4>
                  <div className="text-2xl font-bold text-white">2h ago</div>
                </div>
                <div>
                  <h4 className="text-white/70 text-xs mb-2">Violations</h4>
                  <div className="text-2xl font-bold text-yellow-400">3</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuroraBackground>
  );
}