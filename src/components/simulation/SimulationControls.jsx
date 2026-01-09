import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sliders, Zap, Droplets, Wind } from 'lucide-react';

export default function SimulationControls({ onUpdate }) {
  const [physics, setPhysics] = useState({ gravity: 9.8, friction: 0.5 });
  const [environment, setEnvironment] = useState({ weather: 'clear', time: 'day' });

  const updatePhysics = (key, value) => {
    const newPhysics = { ...physics, [key]: value };
    setPhysics(newPhysics);
    onUpdate({ physics: newPhysics, environment });
  };

  const updateEnvironment = (key, value) => {
    const newEnvironment = { ...environment, [key]: value };
    setEnvironment(newEnvironment);
    onUpdate({ physics, environment: newEnvironment });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
    >
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Sliders className="w-5 h-5 text-cyan-400" />
        Simulation Parameters
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Physics Controls */}
        <div>
          <h4 className="text-white/80 font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Physics
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-white/60 text-sm">Gravity: {physics.gravity} m/s²</label>
              <input
                type="range"
                min="0"
                max="20"
                step="0.1"
                value={physics.gravity}
                onChange={(e) => updatePhysics('gravity', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-white/60 text-sm">Friction: {physics.friction}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={physics.friction}
                onChange={(e) => updatePhysics('friction', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Environment Controls */}
        <div>
          <h4 className="text-white/80 font-semibold mb-3 flex items-center gap-2">
            <Wind className="w-4 h-4 text-blue-400" />
            Environment
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-white/60 text-sm mb-2 block">Weather</label>
              <select
                value={environment.weather}
                onChange={(e) => updateEnvironment('weather', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
              >
                <option value="clear">Clear</option>
                <option value="rain">Rain</option>
                <option value="storm">Storm</option>
                <option value="snow">Snow</option>
              </select>
            </div>
            <div>
              <label className="text-white/60 text-sm mb-2 block">Time of Day</label>
              <select
                value={environment.time}
                onChange={(e) => updateEnvironment('time', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
              >
                <option value="day">Day</option>
                <option value="night">Night</option>
                <option value="dawn">Dawn</option>
                <option value="dusk">Dusk</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}