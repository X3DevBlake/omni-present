import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Slack, Mail, Smartphone, CreditCard, BarChart3, Cloud } from 'lucide-react';

const integrations = [
  { name: 'Slack', icon: Slack, color: 'from-cyan-500 to-blue-500', improvements: 10 },
  { name: 'Google Workspace', icon: Mail, color: 'from-red-500 to-yellow-500', improvements: 10 },
  { name: 'Eleven Labs & Twilio', icon: Smartphone, color: 'from-purple-500 to-pink-500', improvements: 13 },
  { name: 'Stripe & Plaid', icon: CreditCard, color: 'from-green-500 to-emerald-500', improvements: 10 },
  { name: 'Cloudinary', icon: BarChart3, color: 'from-orange-500 to-red-500', improvements: 10 },
  { name: 'Snowflake', icon: Cloud, color: 'from-blue-500 to-cyan-500', improvements: 15 },
];

export default function Phase7IntegrationHub() {
  const [selectedIntegration, setSelectedIntegration] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Phase 7: Ecosystem Integration Hub
          </h1>
          <p className="text-white/60">Autonomous integration with 6+ external services (68 improvements)</p>
        </div>

        {/* Integration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {integrations.map((integration, idx) => {
            const Icon = integration.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                onClick={() => setSelectedIntegration(integration)}
                className={`cursor-pointer p-6 rounded-lg border-2 transition-all ${
                  selectedIntegration?.name === integration.name
                    ? 'bg-white/10 border-cyan-400'
                    : 'bg-white/5 border-white/10 hover:border-white/30'
                }`}
              >
                <div className={`bg-gradient-to-r ${integration.color} p-3 rounded-lg w-fit mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-bold mb-2">{integration.name}</h3>
                <p className="text-cyan-400 text-sm font-semibold">{integration.improvements} Improvements</p>
              </motion.div>
            );
          })}
        </div>

        {/* Details */}
        {selectedIntegration && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-lg p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-4">{selectedIntegration.name}</h2>
            <p className="text-white/80 mb-6">
              {selectedIntegration.improvements} autonomous improvements enabling seamless integration and intelligent automation.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-cyan-400 font-semibold mb-2">Status</p>
                <p className="text-green-400">✓ Fully Integrated</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-cyan-400 font-semibold mb-2">Autonomy Level</p>
                <p className="text-white">Advanced (AI-Driven)</p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}