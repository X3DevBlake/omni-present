import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Grid3x3, Zap, Wind, Droplets, Trash2 } from 'lucide-react';

export default function EnvironmentDesigner() {
  const [envConfig, setEnvConfig] = useState({
    name: 'Trading Floor Simulation',
    width: 100,
    height: 50,
    depth: 100,
    gravity: 9.8,
    wind: { x: 0, y: 0, z: 0 },
    temperature: 20,
    humidity: 65,
    resources: []
  });

  const [elements, setElements] = useState([
    { id: 1, type: 'obstacle', x: 25, y: 0, z: 30, label: 'Wall-1' },
    { id: 2, type: 'resource', x: 50, y: 5, z: 50, label: 'Resource Cache', amount: 1000 }
  ]);

  const [showAddElement, setShowAddElement] = useState(false);

  const addElement = (type) => {
    const newElement = {
      id: Date.now(),
      type,
      x: Math.random() * envConfig.width,
      y: 0,
      z: Math.random() * envConfig.depth,
      label: `${type}-${Date.now()}`
    };
    setElements([...elements, newElement]);
    setShowAddElement(false);
  };

  const removeElement = (id) => {
    setElements(prev => prev.filter(e => e.id !== id));
  };

  const updateElement = (id, field, value) => {
    setElements(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  return (
    <div className="space-y-6">
      {/* Environment Settings */}
      <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Grid3x3 className="w-5 h-5 text-cyan-400" />
          Environment Configuration
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-white/70 text-sm block mb-2">Environment Name</label>
            <input
              type="text"
              value={envConfig.name}
              onChange={(e) => setEnvConfig({ ...envConfig, name: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-white/70 text-sm block mb-2">Width: <span className="text-cyan-400">{envConfig.width}</span></label>
              <input
                type="range"
                min="50"
                max="500"
                value={envConfig.width}
                onChange={(e) => setEnvConfig({ ...envConfig, width: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-white/70 text-sm block mb-2">Height: <span className="text-cyan-400">{envConfig.height}</span></label>
              <input
                type="range"
                min="20"
                max="200"
                value={envConfig.height}
                onChange={(e) => setEnvConfig({ ...envConfig, height: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-white/70 text-sm block mb-2">Depth: <span className="text-cyan-400">{envConfig.depth}</span></label>
              <input
                type="range"
                min="50"
                max="500"
                value={envConfig.depth}
                onChange={(e) => setEnvConfig({ ...envConfig, depth: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>

          {/* Physics */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-white/70 text-sm font-semibold mb-3">Physics Parameters</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-xs block mb-2">Gravity: <span className="text-cyan-400">{envConfig.gravity}</span> m/s²</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.1"
                  value={envConfig.gravity}
                  onChange={(e) => setEnvConfig({ ...envConfig, gravity: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-white/60" />
                <label className="text-white/70 text-xs">Wind Velocity</label>
              </div>
            </div>
          </div>

          {/* Environment Conditions */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-white/70 text-sm font-semibold mb-3">Environmental Conditions</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-xs block mb-2">Temperature: <span className="text-cyan-400">{envConfig.temperature}°C</span></label>
                <input
                  type="range"
                  min="-20"
                  max="50"
                  value={envConfig.temperature}
                  onChange={(e) => setEnvConfig({ ...envConfig, temperature: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-white/70 text-xs block mb-2">Humidity: <span className="text-cyan-400">{envConfig.humidity}%</span></label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={envConfig.humidity}
                  onChange={(e) => setEnvConfig({ ...envConfig, humidity: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Environment Elements */}
      <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            Environment Elements ({elements.length})
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowAddElement(!showAddElement)}
            className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-purple-400 text-xs font-semibold flex items-center gap-1 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add
          </motion.button>
        </div>

        <AnimatePresence>
          {showAddElement && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/5 border border-white/10 rounded-lg p-3 mb-4 flex gap-2"
            >
              <button onClick={() => addElement('obstacle')} className="flex-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded text-blue-400 text-xs font-semibold transition-all">
                Obstacle
              </button>
              <button onClick={() => addElement('resource')} className="flex-1 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded text-green-400 text-xs font-semibold transition-all">
                Resource
              </button>
              <button onClick={() => addElement('spawn')} className="flex-1 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded text-cyan-400 text-xs font-semibold transition-all">
                Spawn Point
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {elements.map((el, idx) => (
            <motion.div
              key={el.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-lg p-3 group hover:bg-white/10 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold text-sm">{el.label}</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  el.type === 'obstacle' ? 'bg-blue-500/30 text-blue-300' :
                  el.type === 'resource' ? 'bg-green-500/30 text-green-300' :
                  'bg-cyan-500/30 text-cyan-300'
                }`}>
                  {el.type}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                {['x', 'y', 'z'].map(axis => (
                  <div key={axis}>
                    <label className="text-white/50 block mb-1">{axis.toUpperCase()}</label>
                    <input
                      type="number"
                      value={el[axis]}
                      onChange={(e) => updateElement(el.id, axis, parseFloat(e.target.value))}
                      className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => removeElement(el.id)}
                className="w-full px-2 py-1 opacity-0 group-hover:opacity-100 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded text-red-400 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
              >
                <Trash2 className="w-3 h-3" />
                Remove
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}