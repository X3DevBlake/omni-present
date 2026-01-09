import React from 'react';
import { motion } from 'framer-motion';
import { Book, Code, Zap } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function APIDocumentation() {
  const endpoints = [
    { method: 'GET', path: '/api/v1/agents', description: 'List all agents' },
    { method: 'POST', path: '/api/v1/agents', description: 'Create new agent' },
    { method: 'GET', path: '/api/v1/blueprints', description: 'List blueprints' },
    { method: 'POST', path: '/api/v1/simulations', description: 'Start simulation' }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">API Documentation</h1>
          <p className="text-white/60">Comprehensive REST API reference</p>
        </motion.div>

        <div className="space-y-4">
          {endpoints.map((endpoint, i) => (
            <motion.div key={i} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-black/50 transition-all cursor-pointer" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-center gap-4 mb-2">
                <span className={`px-3 py-1 rounded-lg font-mono text-xs font-bold ${
                  endpoint.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                  endpoint.method === 'POST' ? 'bg-green-500/20 text-green-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {endpoint.method}
                </span>
                <code className="text-white font-mono">{endpoint.path}</code>
              </div>
              <p className="text-white/60 text-sm">{endpoint.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}