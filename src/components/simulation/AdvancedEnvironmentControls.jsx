import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Zap, Wind, Droplet, Settings, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

export default function AdvancedEnvironmentControls() {
  const [environment, setEnvironment] = useState({
    weather: 'clear',
    temperature: 20,
    windSpeed: 0,
    humidity: 50,
    gravity: 9.8,
    timeOfDay: 12,
    resourceDensity: 1,
    eventIntensity: 0.5
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [events, setEvents] = useState([]);

  const triggerEvent = (eventType) => {
    const eventMap = {
      storm: { name: 'Severe Storm', intensity: 1 },
      earthquake: { name: 'Earthquake', intensity: 0.8 },
      resource_surge: { name: 'Resource Surge', intensity: 0.6 },
      agent_conflict: { name: 'Agent Conflict', intensity: 0.7 }
    };

    const event = { id: Date.now(), ...eventMap[eventType], active: true };
    setEvents(prev => [event, ...prev.slice(0, 4)]);
    toast.success(`${eventMap[eventType].name} triggered!`);
  };

  return (
    <div className="bg-black/40 border border-purple-500/30 rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-400" />
          Environment Controls
        </h3>
        <button
          onClick={() => setIsSimulating(!isSimulating)}
          className={`px-4 py-2 rounded text-sm font-medium flex items-center gap-2 ${
            isSimulating
              ? 'bg-red-500/20 border border-red-500/40 text-red-300'
              : 'bg-green-500/20 border border-green-500/40 text-green-300'
          }`}
        >
          {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isSimulating ? 'Pause' : 'Start'}
        </button>
      </div>

      {/* Environment Parameters */}
      <div className="space-y-4">
        {/* Weather */}
        <div>
          <label className="text-white/60 text-sm mb-2 block flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            Weather
          </label>
          <select
            value={environment.weather}
            onChange={(e) => setEnvironment({ ...environment, weather: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
          >
            <option value="clear">Clear Sky</option>
            <option value="cloudy">Cloudy</option>
            <option value="rainy">Rainy</option>
            <option value="stormy">Stormy</option>
          </select>
        </div>

        {/* Temperature */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-white/60 text-sm">Temperature</label>
            <span className="text-cyan-400 font-bold">{environment.temperature}°C</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={environment.temperature}
            onChange={(e) => setEnvironment({ ...environment, temperature: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Wind Speed */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-white/60 text-sm flex items-center gap-2">
              <Wind className="w-4 h-4" />
              Wind Speed
            </label>
            <span className="text-cyan-400 font-bold">{environment.windSpeed} m/s</span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            value={environment.windSpeed}
            onChange={(e) => setEnvironment({ ...environment, windSpeed: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Humidity */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-white/60 text-sm flex items-center gap-2">
              <Droplet className="w-4 h-4" />
              Humidity
            </label>
            <span className="text-cyan-400 font-bold">{environment.humidity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={environment.humidity}
            onChange={(e) => setEnvironment({ ...environment, humidity: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Gravity */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-white/60 text-sm">Gravity</label>
            <span className="text-cyan-400 font-bold">{environment.gravity.toFixed(1)} m/s²</span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            step="0.5"
            value={environment.gravity}
            onChange={(e) => setEnvironment({ ...environment, gravity: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Time of Day */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-white/60 text-sm">Time of Day</label>
            <span className="text-cyan-400 font-bold">{environment.timeOfDay}:00</span>
          </div>
          <input
            type="range"
            min="0"
            max="23"
            value={environment.timeOfDay}
            onChange={(e) => setEnvironment({ ...environment, timeOfDay: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Resource Density */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-white/60 text-sm">Resource Density</label>
            <span className="text-cyan-400 font-bold">{(environment.resourceDensity * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={environment.resourceDensity}
            onChange={(e) => setEnvironment({ ...environment, resourceDensity: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Event Intensity */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-white/60 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Event Intensity
            </label>
            <span className="text-cyan-400 font-bold">{(environment.eventIntensity * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={environment.eventIntensity}
            onChange={(e) => setEnvironment({ ...environment, eventIntensity: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      {/* Event Triggers */}
      <div className="border-t border-white/10 pt-4">
        <p className="text-white/60 text-sm font-bold mb-3">Trigger Events:</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'storm', label: 'Storm' },
            { id: 'earthquake', label: 'Earthquake' },
            { id: 'resource_surge', label: 'Resource Surge' },
            { id: 'agent_conflict', label: 'Conflict' }
          ].map(event => (
            <motion.button
              key={event.id}
              onClick={() => triggerEvent(event.id)}
              whileHover={{ scale: 1.05 }}
              className="py-2 px-3 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded text-xs font-medium hover:bg-purple-500/30 transition-all"
            >
              {event.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Active Events */}
      {events.length > 0 && (
        <div className="border-t border-white/10 pt-4">
          <p className="text-white/60 text-sm font-bold mb-2">Active Events:</p>
          <div className="space-y-1">
            {events.map(event => (
              <div key={event.id} className="bg-white/5 border border-red-500/30 rounded p-2">
                <div className="flex items-center justify-between">
                  <p className="text-white text-xs font-bold">{event.name}</p>
                  <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-red-500"
                      animate={{ width: '0%' }}
                      transition={{ duration: 10 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current State */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-3">
        <p className="text-white/60 text-xs font-bold mb-2">Simulation State:</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
          <div>Status: <span className="text-cyan-400">{isSimulating ? 'Running' : 'Paused'}</span></div>
          <div>Weather: <span className="text-cyan-400">{environment.weather}</span></div>
          <div>Time: <span className="text-cyan-400">{environment.timeOfDay}:00</span></div>
          <div>Events: <span className="text-cyan-400">{events.length}</span></div>
        </div>
      </div>
    </div>
  );
}