import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, CheckCircle, Server } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function AIModelDeployment() {
  const deployments = [
    { id: 1, model: 'Vision Model v3', environment: 'Production', status: 'live', requests: 124000 },
    { id: 2, model: 'Agent Coordinator', environment: 'Staging', status: 'testing', requests: 340 },
    { id: 3, model: 'Behavior Predictor', environment: 'Development', status: 'ready', requests: 0 }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">AI Model Deployment</h1>
          <p className="text-white/60">Deploy models to production environments</p>
        </motion.div>

        <div className="grid gap-6">
          {deployments.map((deployment, i) => (
            <motion.div key={deployment.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    deployment.status === 'live' ? 'bg-green-500/20' :
                    deployment.status === 'testing' ? 'bg-blue-500/20' :
                    'bg-gray-500/20'
                  }`}>
                    <Rocket className={`w-6 h-6 ${
                      deployment.status === 'live' ? 'text-green-400' :
                      deployment.status === 'testing' ? 'text-blue-400' :
                      'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{deployment.model}</h3>
                    <div className="flex items-center gap-3 text-sm text-white/60">
                      <span className="flex items-center gap-1">
                        <Server className="w-4 h-4" />
                        {deployment.environment}
                      </span>
                      <span>•</span>
                      <span>{deployment.requests.toLocaleString()} requests</span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${
                  deployment.status === 'live' ? 'bg-green-500/20 text-green-400' :
                  deployment.status === 'testing' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {deployment.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}