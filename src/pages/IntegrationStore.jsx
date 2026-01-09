import React from 'react';
import { motion } from 'framer-motion';
import { Plug, Check } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function IntegrationStore() {
  const integrations = [
    { id: 1, name: 'Slack', category: 'Communication', installed: true, icon: '💬' },
    { id: 2, name: 'Google Drive', category: 'Storage', installed: false, icon: '📁' },
    { id: 3, name: 'Stripe', category: 'Payments', installed: true, icon: '💳' },
    { id: 4, name: 'AWS S3', category: 'Storage', installed: false, icon: '☁️' },
    { id: 5, name: 'Twilio', category: 'Communication', installed: false, icon: '📞' },
    { id: 6, name: 'Salesforce', category: 'CRM', installed: true, icon: '📊' }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Integration Store</h1>
          <p className="text-white/60">500+ integrations to extend your platform</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration, i) => (
            <motion.div key={integration.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-black/50 transition-all" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{integration.icon}</div>
                  <div>
                    <h3 className="text-white font-bold">{integration.name}</h3>
                    <span className="text-white/60 text-sm">{integration.category}</span>
                  </div>
                </div>
                {integration.installed && (
                  <div className="p-1 bg-green-500/20 rounded-full">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                )}
              </div>
              <button className={`w-full py-2 rounded-lg font-medium ${
                integration.installed 
                  ? 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30' 
                  : 'bg-blue-500/20 border border-blue-500/40 text-blue-400 hover:bg-blue-500/30'
              }`}>
                {integration.installed ? 'Uninstall' : 'Install'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}