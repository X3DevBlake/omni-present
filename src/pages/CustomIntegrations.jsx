import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plug, Plus, GitBranch } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import IntegrationBuilder from '../components/visualbuilders/IntegrationBuilder';
import { toast } from 'sonner';

export default function CustomIntegrations() {
  const [showBuilder, setShowBuilder] = useState(false);
  const customIntegrations = [
    { id: 1, name: 'Internal CRM Sync', status: 'active', requests: 1240 },
    { id: 2, name: 'Legacy System Bridge', status: 'testing', requests: 89 }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="flex justify-between items-center mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Custom Integrations</h1>
            <p className="text-white/60">Build your own connectors</p>
          </div>
          <button
            onClick={() => setShowBuilder(!showBuilder)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:opacity-90 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {showBuilder ? 'Hide Builder' : 'New Integration'}
          </button>
        </motion.div>

        {showBuilder && (
          <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <IntegrationBuilder
              onSave={(workflow) => {
                toast.success('Integration workflow saved!');
                setShowBuilder(false);
              }}
            />
          </motion.div>
        )}

        <div className="space-y-4">
          {customIntegrations.map((integration, i) => (
            <motion.div key={integration.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Plug className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{integration.name}</h3>
                    <p className="text-white/60 text-sm">{integration.requests.toLocaleString()} requests today</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${
                  integration.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {integration.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}