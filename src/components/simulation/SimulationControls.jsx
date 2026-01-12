import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Settings, Plus, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SimulationControls({ simulation, running, onToggle, userEmail }) {
  const [showMenu, setShowMenu] = useState(false);
  const [spawning, setSpawning] = useState(false);

  const spawnAgent = async () => {
    setSpawning(true);
    try {
      await base44.integrations.Core.InvokeLLM({
        prompt: `Spawn a new holographic agent in simulation ${simulation.id}.
Generate unique name and personality.
Place at random location within simulation bounds.`,
        response_json_schema: {
          type: 'object',
          properties: {
            agent_name: { type: 'string' },
            agent_id: { type: 'string' }
          }
        }
      });
      alert('Agent spawned successfully!');
    } catch (error) {
      console.error('Error spawning agent:', error);
    } finally {
      setSpawning(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-2"
    >
      {/* Main Controls */}
      <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-3 space-y-2">
        <button
          onClick={onToggle}
          className={`w-full px-4 py-2 rounded font-semibold flex items-center justify-center gap-2 ${
            running
              ? 'bg-red-500/20 border border-red-400 text-red-300 hover:bg-red-500/30'
              : 'bg-green-500/20 border border-green-400 text-green-300 hover:bg-green-500/30'
          }`}
        >
          {running ? (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run
            </>
          )}
        </button>

        <button
          onClick={spawnAgent}
          disabled={spawning}
          className="w-full px-4 py-2 bg-cyan-500/20 border border-cyan-400 text-cyan-300 rounded font-semibold hover:bg-cyan-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Spawn Agent
        </button>

        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-full px-4 py-2 bg-purple-500/20 border border-purple-400 text-purple-300 rounded font-semibold hover:bg-purple-500/30 flex items-center justify-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>

      {/* Extended Menu */}
      {showMenu && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-3 space-y-2"
        >
          <div>
            <label className="text-white/60 text-xs">Simulation Speed</label>
            <input 
              type="range" 
              min="0.5" 
              max="5" 
              step="0.5"
              defaultValue={simulation?.simulation_speed || 1}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-xs">Google Earth Terrain</span>
            <input type="checkbox" defaultChecked={simulation?.google_earth_config?.terrain_enabled} />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-xs">Buildings</span>
            <input type="checkbox" defaultChecked={simulation?.google_earth_config?.buildings_enabled} />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}