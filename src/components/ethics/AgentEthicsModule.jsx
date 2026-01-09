import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle2, Plus, Filter } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AgentEthicsModule({ agentId, agentName = 'Agent' }) {
  const [guidelines, setGuidelines] = useState([]);
  const [ethicsLogs, setEthicsLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('guidelines');
  const [showGuidelineForm, setShowGuidelineForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'harm_prevention',
    severity: 'warning'
  });

  useEffect(() => {
    loadEthicsData();
  }, [agentId]);

  const loadEthicsData = async () => {
    try {
      const [guidelineData, logData] = await Promise.all([
        base44.entities.EthicalGuideline.list(),
        base44.entities.AgentEthicsLog.filter({ agent_id: agentId }, '-created_date')
      ]);
      setGuidelines(guidelineData);
      setEthicsLogs(logData);
    } catch (err) {
      console.error('Failed to load ethics data:', err);
    } finally {
      setLoading(false);
    }
  };

  const createGuideline = async () => {
    if (!formData.title.trim()) {
      toast.error('Title required');
      return;
    }

    try {
      const newGuideline = {
        ...formData,
        applicable_to: [agentId],
        triggers: [],
        exceptions: [],
        enforcement_level: 100
      };

      await base44.entities.EthicalGuideline.create(newGuideline);
      setGuidelines(prev => [newGuideline, ...prev]);
      setFormData({ title: '', description: '', category: 'harm_prevention', severity: 'warning' });
      setShowGuidelineForm(false);
      toast.success('Guideline created!');
    } catch (err) {
      toast.error('Failed to create guideline');
    }
  };

  if (loading) {
    return <div className="text-white/40">Loading ethics module...</div>;
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'block':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'critical':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-white/10 text-white/60 border-white/20';
    }
  };

  return (
    <div className="bg-black/40 border border-red-500/30 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-400" />
          Ethics Module
        </h3>
        <span className="text-xs text-white/50">{ethicsLogs.length} actions reviewed</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {[
          { id: 'guidelines', label: '📋 Guidelines' },
          { id: 'logs', label: '📝 Activity Logs' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-red-400 text-red-400'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Guidelines Tab */}
      {activeTab === 'guidelines' && (
        <div className="space-y-3">
          {showGuidelineForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-white/5 border border-red-500/30 rounded-lg p-4 space-y-3"
            >
              <input
                type="text"
                placeholder="Guideline title..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-white/40"
              />

              <textarea
                placeholder="Detailed description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-white/40 h-16"
              />

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
                >
                  <option value="harm_prevention">Harm Prevention</option>
                  <option value="honesty">Honesty</option>
                  <option value="fairness">Fairness</option>
                  <option value="privacy">Privacy</option>
                  <option value="transparency">Transparency</option>
                  <option value="consent">Consent</option>
                </select>

                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
                >
                  <option value="warning">Warning</option>
                  <option value="block">Block</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={createGuideline}
                  className="flex-1 py-2 bg-red-500/20 border border-red-500/40 text-red-300 rounded font-medium text-xs"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowGuidelineForm(false)}
                  className="flex-1 py-2 bg-white/10 border border-white/20 text-white/60 rounded font-medium text-xs"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {guidelines.length === 0 ? (
            <div className="text-center py-4 text-white/40 text-xs">No guidelines defined</div>
          ) : (
            guidelines.map(guideline => (
              <motion.div
                key={guideline.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-lg p-3"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm">{guideline.title}</p>
                    <p className="text-white/70 text-xs">{guideline.description}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded border font-medium ${getSeverityColor(guideline.severity)}`}>
                    {guideline.severity}
                  </span>
                </div>
                <p className="text-white/60 text-xs capitalize">Category: {guideline.category}</p>
              </motion.div>
            ))
          )}

          {!showGuidelineForm && (
            <motion.button
              onClick={() => setShowGuidelineForm(true)}
              whileHover={{ scale: 1.05 }}
              className="w-full py-2 border border-dashed border-red-500/40 text-red-400 rounded font-medium text-xs hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Guideline
            </motion.button>
          )}
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {ethicsLogs.length === 0 ? (
            <div className="text-center py-4 text-white/40 text-xs">No activity logs</div>
          ) : (
            ethicsLogs.map(log => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-lg p-2"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1">
                    <p className="text-white font-bold text-xs">{log.action}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {log.ethical_assessment === 'approved' ? (
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                    ) : log.ethical_assessment === 'flagged' ? (
                      <AlertTriangle className="w-3 h-3 text-yellow-400" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                    )}
                    <span className={`text-xs font-bold ${
                      log.ethical_assessment === 'approved' ? 'text-green-400' :
                      log.ethical_assessment === 'flagged' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {log.ethical_assessment}
                    </span>
                  </div>
                </div>

                {log.violated_guidelines?.length > 0 && (
                  <div className="text-xs text-red-400 mb-1">
                    Violated: {log.violated_guidelines.join(', ')}
                  </div>
                )}

                <p className="text-white/60 text-xs">Risk: <span className="capitalize font-bold">{log.risk_level}</span></p>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Summary Stats */}
      <div className="border-t border-white/10 pt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <p className="text-green-400 font-bold text-lg">
            {ethicsLogs.filter(l => l.ethical_assessment === 'approved').length}
          </p>
          <p className="text-white/60">Approved</p>
        </div>
        <div className="text-center">
          <p className="text-yellow-400 font-bold text-lg">
            {ethicsLogs.filter(l => l.ethical_assessment === 'flagged').length}
          </p>
          <p className="text-white/60">Flagged</p>
        </div>
        <div className="text-center">
          <p className="text-red-400 font-bold text-lg">
            {ethicsLogs.filter(l => l.ethical_assessment === 'blocked').length}
          </p>
          <p className="text-white/60">Blocked</p>
        </div>
      </div>
    </div>
  );
}