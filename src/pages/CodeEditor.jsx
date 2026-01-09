import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Play, Save, FileCode } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function CodeEditor() {
  const [code, setCode] = useState(`// Agent Behavior Script
function onAgentSpawn(agent) {
  agent.setGoal('explore');
  agent.speed = 1.0;
}

function onAgentUpdate(agent, deltaTime) {
  if (agent.energy < 20) {
    agent.setGoal('recharge');
  }
}

function onAgentInteract(agent, target) {
  console.log('Agent interacted with:', target.type);
}`);

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="flex justify-between items-center mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Code Editor</h1>
            <p className="text-white/60">Write custom agent behavior scripts</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-green-500/20 border border-green-500/40 text-green-400 rounded-lg hover:bg-green-500/30 flex items-center gap-2">
              <Play className="w-4 h-4" />
              Run
            </button>
            <button className="px-4 py-2 bg-blue-500/20 border border-blue-500/40 text-blue-400 rounded-lg hover:bg-blue-500/30 flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-[600px] bg-transparent text-white font-mono text-sm resize-none outline-none"
                spellCheck="false"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2"><FileCode className="w-5 h-5" />Files</h3>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded cursor-pointer">agent_behavior.js</div>
                <div className="p-2 bg-white/5 text-white/60 rounded cursor-pointer">environment.js</div>
                <div className="p-2 bg-white/5 text-white/60 rounded cursor-pointer">utils.js</div>
              </div>
            </div>
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <h3 className="text-white font-bold mb-3">Console</h3>
              <div className="text-xs text-green-400 font-mono">
                <div>{'>'} Script loaded successfully</div>
                <div>{'>'} Ready to run</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}