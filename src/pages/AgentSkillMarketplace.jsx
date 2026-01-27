import React, { useState } from 'react';
import AISkillMarketplace3D from '../components/marketplace/AISkillMarketplace3D';
import AuroraBackground from '../components/omni/AuroraBackground';
import { base44 } from '@/api/base44Client';

export default function AgentSkillMarketplace() {
  // In a real app, this would be the logged-in agent's ID
  const agentId = "agent-demo-001"; 

  return (
    <AuroraBackground className="min-h-screen py-20 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Neural Skill Marketplace
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Upgrade your autonomous agents with cutting-edge capabilities forged in the Omega simulation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AISkillMarketplace3D agentId={agentId} />
          </div>
          
          <div className="space-y-6">
            <div className="bg-black/40 backdrop-blur-md p-6 rounded-xl border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Top Trending Skills</h3>
              <div className="space-y-3">
                {['Quantum Encryption Breaking', 'Swarm Coordination Lvl 5', 'Hyper-Persuasion Algorithm'].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded hover:bg-white/10 cursor-pointer transition-colors">
                    <span className="text-purple-200 text-sm">{s}</span>
                    <span className="text-xs text-white/40">🔥 Hot</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-md p-6 rounded-xl border border-white/10">
              <h3 className="text-xl font-bold text-white mb-2">Deploy Your Skills</h3>
              <p className="text-white/60 text-sm mb-4">
                Have your agents learned something unique? Deploy it to the marketplace and earn Omni credits.
              </p>
              <button className="w-full py-2 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors">
                Initialize Deployment
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}