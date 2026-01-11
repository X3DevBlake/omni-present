import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle2, AlertCircle, Clock, RefreshCw, Shield, Zap } from 'lucide-react';
import ZapierWorkflowManager from './ZapierWorkflowManager';

export default function IntegrationManagementHub() {
  const [selectedTab, setSelectedTab] = useState('active');
  const [showNewIntegration, setShowNewIntegration] = useState(false);

  const integrations = {
    active: [
      {
        id: 1,
        name: 'Stripe',
        category: 'Payments',
        status: 'connected',
        health: 'excellent',
        lastSync: '2 minutes ago',
        syncFrequency: 'Real-time',
        webhooks: ['payment.success', 'payment.failed'],
        dataPoints: ['transactions', 'customers', 'subscriptions'],
        uptime: 99.9,
        features: ['OAuth', '2-way sync', 'Webhooks', 'Auto-retry'],
      },
      {
        id: 2,
        name: 'Google Sheets',
        category: 'Data Storage',
        status: 'connected',
        health: 'good',
        lastSync: '15 minutes ago',
        syncFrequency: 'Hourly',
        webhooks: ['sheet.updated'],
        dataPoints: ['portfolios', 'goals', 'transactions'],
        uptime: 99.5,
        features: ['OAuth', 'One-way sync', 'Scheduled'],
      },
      {
        id: 3,
        name: 'Slack',
        category: 'Notifications',
        status: 'connected',
        health: 'excellent',
        lastSync: '1 minute ago',
        syncFrequency: 'Real-time',
        webhooks: ['alerts', 'reports', 'notifications'],
        dataPoints: ['messages', 'alerts'],
        uptime: 99.8,
        features: ['OAuth', 'Webhooks', 'Custom channels'],
      },
    ],
    recommended: [
      {
        id: 4,
        name: 'Bloomberg',
        category: 'Market Data',
        reason: 'Anomaly detected: Missing real-time market data',
        estimatedBenefit: 'Real-time price feeds for 500+ assets',
      },
      {
        id: 5,
        name: 'Salesforce',
        category: 'CRM',
        reason: 'User frequently requests client management features',
        estimatedBenefit: 'Centralized client & relationship tracking',
      },
    ],
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'excellent': return 'green';
      case 'good': return 'blue';
      case 'warning': return 'yellow';
      case 'critical': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (health) => {
    switch (health) {
      case 'excellent':
      case 'good':
        return CheckCircle2;
      case 'warning':
        return AlertCircle;
      case 'critical':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Integration Management</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowNewIntegration(!showNewIntegration)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300 hover:bg-cyan-500/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Integration
        </motion.button>
      </div>

      {/* New Integration Form */}
      <AnimatePresence>
        {showNewIntegration && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white/5 border border-white/10 rounded-lg p-6"
          >
            <h3 className="text-white font-bold mb-4">Connect New Service</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Search integrations (Salesforce, HubSpot, etc.)"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
              />
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="flex-1 px-4 py-2 bg-green-500/20 border border-green-400 rounded-lg text-green-300 hover:bg-green-500/30"
                >
                  <Shield className="w-4 h-4 inline mr-2" />
                  OAuth Connect
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowNewIntegration(false)}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white/80 hover:bg-white/20"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-white/10">
        {['active', 'recommended', 'zapier'].map(tab => (
          <motion.button
            key={tab}
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 border-b-2 transition-all ${
              selectedTab === tab
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            {tab === 'active' && 'Active Integrations'}
            {tab === 'recommended' && 'Recommended'}
            {tab === 'zapier' && '⚡ Zapier Workflows'}
            {tab === 'active' && (
              <span className="ml-2 px-2 py-0.5 bg-cyan-500/20 border border-cyan-400/30 rounded text-xs text-cyan-300">
                {integrations.active.length}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Active Integrations */}
      {selectedTab === 'active' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 gap-4"
        >
          {integrations.active.map((integration) => {
            const StatusIcon = getStatusIcon(integration.health);
            const colorMap = {
              green: 'green-400',
              blue: 'blue-400',
              yellow: 'yellow-400',
              red: 'red-400',
            };

            return (
              <motion.div
                key={integration.id}
                whileHover={{ y: -2 }}
                className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-white/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${colorMap[getHealthColor(integration.health)]}/20`}>
                      <StatusIcon className={`w-5 h-5 text-${colorMap[getHealthColor(integration.health)]}`} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{integration.name}</h3>
                      <p className="text-white/60 text-sm">{integration.category}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 bg-${colorMap[getHealthColor(integration.health)]}/20 border border-${colorMap[getHealthColor(integration.health)]}/50 rounded-full text-xs font-semibold text-${colorMap[getHealthColor(integration.health)]}`}>
                    {integration.health}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-white/5 rounded p-2">
                    <p className="text-white/60 text-xs mb-1">Last Sync</p>
                    <p className="text-white text-sm font-semibold">{integration.lastSync}</p>
                  </div>
                  <div className="bg-white/5 rounded p-2">
                    <p className="text-white/60 text-xs mb-1">Frequency</p>
                    <p className="text-white text-sm font-semibold">{integration.syncFrequency}</p>
                  </div>
                  <div className="bg-white/5 rounded p-2">
                    <p className="text-white/60 text-xs mb-1">Uptime</p>
                    <p className="text-white text-sm font-semibold">{integration.uptime}%</p>
                  </div>
                  <div className="bg-white/5 rounded p-2">
                    <p className="text-white/60 text-xs mb-1">Status</p>
                    <p className="text-green-400 text-sm font-semibold">Healthy</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-white/60 text-xs font-semibold">Features:</p>
                  <div className="flex flex-wrap gap-2">
                    {integration.features.map((feature, idx) => (
                      <span key={idx} className="px-2 py-1 bg-white/10 rounded text-xs text-white/80">
                        <Zap className="w-3 h-3 inline mr-1" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-white/10">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="flex-1 px-3 py-1.5 bg-white/10 border border-white/20 rounded text-white/80 hover:border-white/30 text-sm transition-all flex items-center justify-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Sync Now
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="flex-1 px-3 py-1.5 bg-white/10 border border-white/20 rounded text-white/80 hover:border-white/30 text-sm transition-all"
                  >
                    Settings
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Recommended */}
      {selectedTab === 'recommended' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 gap-4"
        >
          {integrations.recommended.map((rec) => (
            <motion.div
              key={rec.id}
              whileHover={{ y: -2 }}
              className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-400/20 rounded-lg p-6 hover:border-purple-400/40 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-bold">{rec.name}</h3>
                  <p className="text-white/60 text-sm">{rec.category}</p>
                </div>
                <Lightbulb className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-white/80 text-sm mb-3">{rec.reason}</p>
              <p className="text-white/60 text-xs mb-4">✨ {rec.estimatedBenefit}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="w-full px-4 py-2 bg-purple-500/20 border border-purple-400 rounded-lg text-purple-300 hover:bg-purple-500/30 transition-all text-sm font-semibold"
              >
                Connect Now
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Zapier Workflows */}
      {selectedTab === 'zapier' && <ZapierWorkflowManager />}
    </div>
  );
}