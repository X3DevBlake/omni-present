import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Network, Circle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function InterSimulationConnections() {
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    loadConnections();
    const interval = setInterval(loadConnections, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadConnections = async () => {
    const sims = await base44.entities.WorldSimulation.list();
    setConnections(sims.filter(s => s.active_agents?.length > 0));
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Network className="w-5 h-5 text-cyan-400" />
        Active Connections
      </h3>
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {connections.map(sim => (
          <motion.div
            key={sim.id}
            className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-semibold">{sim.simulation_name}</p>
              <div className="flex items-center gap-1">
                <Circle className="w-2 h-2 fill-green-400 text-green-400" />
                <span className="text-green-400 text-xs">Active</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                {sim.active_agents?.length || 0} agents
              </span>
              <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                {sim.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}