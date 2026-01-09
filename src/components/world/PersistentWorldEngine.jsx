import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Download, Upload, Cloud, Clock, Wind, Droplets, Sun } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function PersistentWorldEngine({ worldData, onWorldUpdate }) {
  const [autoSave, setAutoSave] = useState(true);
  const [saveInterval, setSaveInterval] = useState(60);
  const [lastSaved, setLastSaved] = useState(null);
  const [worldStates, setWorldStates] = useState([]);

  useEffect(() => {
    loadWorldStates();
  }, []);

  useEffect(() => {
    if (!autoSave) return;
    
    const interval = setInterval(async () => {
      await saveWorldState();
    }, saveInterval * 1000);

    return () => clearInterval(interval);
  }, [autoSave, saveInterval, worldData]);

  const loadWorldStates = async () => {
    try {
      const states = await base44.entities.WorldState.list('-created_date', 10);
      setWorldStates(states);
    } catch (err) {
      console.error('Failed to load world states');
    }
  };

  const saveWorldState = async () => {
    try {
      await base44.entities.WorldState.create({
        name: `World State ${new Date().toLocaleString()}`,
        environment_data: worldData.environment || {},
        resources: worldData.resources || {},
        weather_state: worldData.weather || {},
        physics_state: worldData.physics || {},
        time_cycle: worldData.timeCycle || 0,
        agent_positions: worldData.agentPositions || [],
        terrain_modifications: worldData.terrainMods || []
      });
      setLastSaved(new Date());
      await loadWorldStates();
    } catch (err) {
      console.error('Failed to save world state');
    }
  };

  const loadWorldState = async (state) => {
    onWorldUpdate?.({
      environment: state.environment_data,
      resources: state.resources,
      weather: state.weather_state,
      physics: state.physics_state,
      timeCycle: state.time_cycle,
      agentPositions: state.agent_positions,
      terrainMods: state.terrain_modifications
    });
    toast.success('World state loaded!');
  };

  const exportWorld = () => {
    const data = JSON.stringify(worldData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `world_state_${Date.now()}.json`;
    a.click();
    toast.success('World exported!');
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Cloud className="w-6 h-6 text-cyan-400" />
          <div>
            <h3 className="text-white font-bold">World Persistence</h3>
            <p className="text-white/60 text-sm">
              {lastSaved ? `Last saved: ${lastSaved.toLocaleTimeString()}` : 'Not saved yet'}
            </p>
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={autoSave} onChange={(e) => setAutoSave(e.target.checked)} className="w-4 h-4" />
          <span className="text-white text-sm">Auto-save</span>
        </label>
      </div>

      {autoSave && (
        <div className="mb-4">
          <label className="text-white/70 text-sm mb-2 block">Save Interval (seconds)</label>
          <input type="number" min="10" max="300" value={saveInterval} onChange={(e) => setSaveInterval(parseInt(e.target.value))} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" />
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <button onClick={saveWorldState} className="flex-1 py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-lg text-sm hover:bg-cyan-500/30 flex items-center justify-center gap-2">
          <Save className="w-4 h-4" />
          Save Now
        </button>
        <button onClick={exportWorld} className="flex-1 py-2 bg-green-500/20 border border-green-500/40 text-green-300 rounded-lg text-sm hover:bg-green-500/30 flex items-center justify-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      <div className="bg-white/5 rounded-xl p-4">
        <h4 className="text-white font-semibold mb-3 text-sm">Saved States ({worldStates.length})</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {worldStates.map(state => (
            <div key={state.id} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 cursor-pointer" onClick={() => loadWorldState(state)}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-white text-sm">{state.name}</span>
                <span className="text-white/40 text-xs">{new Date(state.created_date).toLocaleDateString()}</span>
              </div>
              <div className="text-white/60 text-xs">Cycle: {state.time_cycle || 0}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}