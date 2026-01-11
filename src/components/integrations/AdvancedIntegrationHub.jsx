import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Settings, Globe, AlertCircle, Plus } from 'lucide-react';

export default function AdvancedIntegrationHub() {
  const [activeTab, setActiveTab] = useState('connected');

  const connectedIntegrations = [
    {
      id: 1,
      name: 'Stripe',
      status: 'healthy',
      lastSync: '2 minutes ago',
      uptime: 99.9,
      twoWaySync: true,
      webhooks: 5,
    },
    {
      id: 2,
      name: 'Google Sheets',
      status: 'healthy',
      lastSync: '1 hour ago',
      uptime: 99.8,
      twoWaySync: true,
      webhooks: 2,
    },
    {
      id: 3,
      name: 'Slack',
      status: 'degraded',
      lastSync: '5 minutes ago',
      uptime: 98.5,
      twoWaySync: false,
      webhooks: 3,
    },
  ];

  const recommendations = [
    {
      name: 'Salesforce CRM',
      relevance: 0.92,
      useCase: 'Sync customer data for personalized recommendations',
      effort: 'Medium',
    },
    {
      name: 'Zapier',
      relevance: 0.87,
      useCase: 'Connect 5000+ apps with custom workflows',
      effort: 'Low',
    },
    {
      name: 'Plaid',
      relevance: 0.81,
      useCase: 'Enhanced financial data aggregation',
      effort: 'Medium',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 pb-2">
        {['connected', 'recommended', 'webhooks'].map(tab => (
          <motion.button
            key={tab}
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg border text-sm whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-white/5 border-white/10 text-white/80 hover:border-white/30'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Connected Integrations */}
      {activeTab === 'connected' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {connectedIntegrations.map((integration, idx) => (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="text-white font-bold">{integration.name}</p>
                    <p className="text-white/60 text-xs">Last sync: {integration.lastSync}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  integration.status === 'healthy' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {integration.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-white/60 text-xs">Uptime</p>
                  <p className="text-white font-bold">{integration.uptime}%</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Two-Way Sync</p>
                  <p className="text-white font-bold">{integration.twoWaySync ? 'Enabled' : 'Disabled'}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Webhooks</p>
                  <p className="text-white font-bold">{integration.webhooks}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Recommended */}
      {activeTab === 'recommended' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {recommendations.map((rec, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-white font-bold">{rec.name}</p>
                  <p className="text-white/70 text-sm">{rec.useCase}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1 px-3 py-1 bg-cyan-500/20 border border-cyan-400 rounded text-cyan-300 text-xs hover:bg-cyan-500/30 transition-all"
                >
                  <Plus className="w-3 h-3" />
                  Connect
                </motion.button>
              </div>
              <div className="flex gap-4 text-xs">
                <div>
                  <p className="text-white/60">Relevance</p>
                  <p className="text-green-400 font-bold">{(rec.relevance * 100).toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-white/60">Integration Effort</p>
                  <p className="text-white font-bold">{rec.effort}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Webhooks */}
      {activeTab === 'webhooks' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-400" />
              Active Webhooks
            </h3>
            <span className="text-cyan-400 font-bold">10 registered</span>
          </div>
          <div className="space-y-2">
            {[
              { event: 'transaction.completed', service: 'Stripe', status: 'healthy', deliveryRate: '99.8%' },
              { event: 'user.updated', service: 'Slack', status: 'healthy', deliveryRate: '98.5%' },
              { event: 'sheet.modified', service: 'Google Sheets', status: 'healthy', deliveryRate: '99.9%' },
            ].map((webhook, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded text-sm">
                <div>
                  <p className="text-white font-semibold">{webhook.event}</p>
                  <p className="text-white/60 text-xs">{webhook.service}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white/60 text-xs">Delivery: {webhook.deliveryRate}</span>
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}