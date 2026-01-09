import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Play, RotateCcw } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function SandboxEnvironment() {
  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="flex justify-between items-center mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Sandbox Environment</h1>
            <p className="text-white/60">Test APIs without affecting production</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-green-500/20 border border-green-500/40 text-green-400 rounded-lg hover:bg-green-500/30 flex items-center gap-2">
              <Play className="w-4 h-4" />
              Run
            </button>
            <button className="px-4 py-2 bg-blue-500/20 border border-blue-500/40 text-blue-400 rounded-lg hover:bg-blue-500/30 flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4">API Request</h3>
            <textarea className="w-full h-64 bg-black/40 border border-white/10 rounded-lg p-4 text-white font-mono text-sm resize-none" defaultValue={`POST /api/v1/agents
Content-Type: application/json

{
  "name": "test-agent",
  "type": "scout"
}`} />
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4">Response</h3>
            <div className="w-full h-64 bg-black/40 border border-white/10 rounded-lg p-4 overflow-auto">
              <pre className="text-green-400 font-mono text-sm">{`{
  "id": "agent_123",
  "name": "test-agent",
  "type": "scout",
  "status": "created",
  "created_at": "2026-01-09T14:30:00Z"
}`}</pre>
            </div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}