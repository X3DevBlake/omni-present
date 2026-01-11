import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, RotateCw, Zap } from 'lucide-react';

export default function InteractionController() {
  const [controls, setControls] = useState({
    rotationSpeed: 0.5,
    zoomLevel: 1,
    particleIntensity: 0.8,
  });

  const [activeMode, setActiveMode] = useState('explore');

  useEffect(() => {
    // Detect device capabilities
    const supportsWebGL2 = !!document.createElement('canvas').getContext('webgl2');
    const supportsGyroscope = window.DeviceOrientationEvent !== undefined;

    console.log('WebGL2 Support:', supportsWebGL2);
    console.log('Gyroscope Support:', supportsGyroscope);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-50 space-y-3"
    >
      {/* Control Panel */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="bg-black/70 backdrop-blur-md border border-white/20 rounded-lg p-4 space-y-4 max-w-xs"
      >
        <h3 className="text-white font-bold flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          3D Controls
        </h3>

        {/* Rotation Speed */}
        <div>
          <label className="text-white/80 text-sm mb-2 block">Rotation Speed</label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={controls.rotationSpeed}
            onChange={(e) => setControls({ ...controls, rotationSpeed: parseFloat(e.target.value) })}
            className="w-full"
          />
          <p className="text-white/60 text-xs mt-1">{(controls.rotationSpeed * 100).toFixed(0)}%</p>
        </div>

        {/* Zoom Level */}
        <div>
          <label className="text-white/80 text-sm mb-2 block">Zoom Level</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={controls.zoomLevel}
            onChange={(e) => setControls({ ...controls, zoomLevel: parseFloat(e.target.value) })}
            className="w-full"
          />
          <p className="text-white/60 text-xs mt-1">{(controls.zoomLevel * 100).toFixed(0)}%</p>
        </div>

        {/* Particle Intensity */}
        <div>
          <label className="text-white/80 text-sm mb-2 block">Particle Intensity</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={controls.particleIntensity}
            onChange={(e) => setControls({ ...controls, particleIntensity: parseFloat(e.target.value) })}
            className="w-full"
          />
          <p className="text-white/60 text-xs mt-1">{(controls.particleIntensity * 100).toFixed(0)}%</p>
        </div>

        {/* Mode Selector */}
        <div>
          <label className="text-white/80 text-sm mb-2 block">Interaction Mode</label>
          <div className="grid grid-cols-2 gap-2">
            {['explore', 'analyze', 'compare'].map((mode) => (
              <motion.button
                key={mode}
                whileHover={{ scale: 1.05 }}
                onClick={() => setActiveMode(mode)}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                  activeMode === mode
                    ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-300'
                    : 'bg-white/10 border border-white/20 text-white/80'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Performance Stats */}
        <div className="bg-white/5 rounded p-2">
          <p className="text-white/60 text-xs mb-1">Performance</p>
          <div className="space-y-0.5 text-white/70 text-xs">
            <p>FPS: <span className="text-cyan-400">60</span></p>
            <p>Memory: <span className="text-cyan-400">120MB</span></p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="p-3 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300 hover:bg-cyan-500/30 transition-all"
          title="Reset View"
        >
          <RotateCw className="w-4 h-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="p-3 bg-purple-500/20 border border-purple-400 rounded-lg text-purple-300 hover:bg-purple-500/30 transition-all"
          title="Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-black/60 backdrop-blur-md border border-white/20 rounded-lg p-3 text-white/70 text-xs space-y-1 max-w-xs"
      >
        <p><span className="font-bold">Mouse:</span> Drag to rotate</p>
        <p><span className="font-bold">Scroll:</span> Zoom in/out</p>
        <p><span className="font-bold">Mobile:</span> Touch to interact</p>
      </motion.div>
    </motion.div>
  );
}