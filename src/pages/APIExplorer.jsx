import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Code } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function APIExplorer() {
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/v1/agents');
  const [method, setMethod] = useState('GET');

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">API Explorer</h1>
          <p className="text-white/60">Interactive API testing tool</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-bold mb-4">Request</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Method</label>
                  <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white">
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>DELETE</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Endpoint</label>
                  <input type="text" value={selectedEndpoint} onChange={(e) => setSelectedEndpoint(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white font-mono" />
                </div>
                <button className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:opacity-90 flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  Send Request
                </button>
              </div>
            </div>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4">Response</h3>
            <div className="bg-black/40 border border-white/10 rounded-lg p-4 h-64 overflow-auto">
              <pre className="text-green-400 font-mono text-sm">{`{
  "status": "success",
  "data": {
    "agents": []
  }
}`}</pre>
            </div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}