import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cloud, Zap as Lightning, Mountain, Waves, Wind, AlertTriangle, Thermometer } from 'lucide-react';
import { toast } from 'sonner';

export class WorldState {
  constructor() {
    this.weather = {
      type: 'clear',
      intensity: 0,
      duration: 0
    };
    this.temperature = 20;
    this.terrain = {
      fertility: 0.7,
      stability: 1.0,
      waterLevel: 0.5
    };
    this.geologicalEvents = [];
    this.alienInfluences = [];
    this.season = 'spring';
    this.dayNightCycle = 0.5;
    this.disasters = [];
  }

  update(deltaTime) {
    this.updateWeather(deltaTime);
    this.updateGeologicalEvents(deltaTime);
    this.updateAlienInfluences(deltaTime);
    this.updateSeasons(deltaTime);
  }

  updateWeather(deltaTime) {
    if (this.weather.duration > 0) {
      this.weather.duration -= deltaTime;
      if (this.weather.duration <= 0) {
        this.weather = { type: 'clear', intensity: 0, duration: 0 };
      }
    }

    // Random weather changes
    if (Math.random() > 0.98) {
      const weatherTypes = ['rain', 'storm', 'fog', 'heat_wave', 'cold_snap'];
      this.weather = {
        type: weatherTypes[Math.floor(Math.random() * weatherTypes.length)],
        intensity: Math.random() * 0.8 + 0.2,
        duration: 5000 + Math.random() * 10000
      };
    }
  }

  updateGeologicalEvents(deltaTime) {
    // Random geological events
    if (Math.random() > 0.995) {
      const eventTypes = ['earthquake', 'landslide', 'volcanic', 'erosion'];
      const event = {
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        magnitude: Math.random() * 0.7 + 0.3,
        epicenter: { x: Math.random(), y: Math.random() },
        timestamp: Date.now(),
        duration: 3000 + Math.random() * 5000
      };

      this.geologicalEvents.push(event);
      this.applyGeologicalImpact(event);
    }

    // Remove expired events
    this.geologicalEvents = this.geologicalEvents.filter(
      e => Date.now() - e.timestamp < e.duration
    );
  }

  applyGeologicalImpact(event) {
    switch (event.type) {
      case 'earthquake':
        this.terrain.stability -= event.magnitude * 0.3;
        break;
      case 'volcanic':
        this.terrain.fertility += event.magnitude * 0.2;
        this.temperature += event.magnitude * 5;
        break;
      case 'erosion':
        this.terrain.fertility -= event.magnitude * 0.1;
        break;
    }

    this.terrain.stability = Math.max(0, Math.min(1, this.terrain.stability));
    this.terrain.fertility = Math.max(0, Math.min(1, this.terrain.fertility));
  }

  updateAlienInfluences(deltaTime) {
    // Simulated "alien" or external mysterious events
    if (Math.random() > 0.997) {
      const influenceTypes = ['energy_anomaly', 'resource_bloom', 'temporal_distortion', 'mutation_field'];
      const influence = {
        type: influenceTypes[Math.floor(Math.random() * influenceTypes.length)],
        strength: Math.random() * 0.8 + 0.2,
        location: { x: Math.random(), y: Math.random() },
        radius: Math.random() * 0.3 + 0.1,
        timestamp: Date.now(),
        duration: 8000 + Math.random() * 12000
      };

      this.alienInfluences.push(influence);
    }

    this.alienInfluences = this.alienInfluences.filter(
      inf => Date.now() - inf.timestamp < inf.duration
    );
  }

  updateSeasons(deltaTime) {
    const seasons = ['spring', 'summer', 'autumn', 'winter'];
    const seasonIndex = Math.floor(Date.now() / 30000) % 4;
    this.season = seasons[seasonIndex];

    // Seasonal effects
    switch (this.season) {
      case 'spring':
        this.terrain.fertility = Math.min(1, this.terrain.fertility + 0.001);
        break;
      case 'summer':
        this.temperature = 25 + Math.random() * 5;
        break;
      case 'autumn':
        this.terrain.fertility = Math.max(0.5, this.terrain.fertility - 0.0005);
        break;
      case 'winter':
        this.temperature = 5 + Math.random() * 5;
        break;
    }
  }

  getResourceModifiers() {
    const modifiers = { food: 1.0, water: 1.0, materials: 1.0 };

    // Weather effects
    if (this.weather.type === 'rain') {
      modifiers.water *= 1.5;
      modifiers.food *= 0.9;
    } else if (this.weather.type === 'storm') {
      modifiers.water *= 2.0;
      modifiers.food *= 0.6;
      modifiers.materials *= 0.7;
    } else if (this.weather.type === 'drought') {
      modifiers.water *= 0.3;
      modifiers.food *= 0.4;
    }

    // Terrain effects
    modifiers.food *= this.terrain.fertility;
    modifiers.materials *= this.terrain.stability;

    // Seasonal effects
    if (this.season === 'winter') {
      modifiers.food *= 0.5;
    } else if (this.season === 'spring') {
      modifiers.food *= 1.3;
    }

    return modifiers;
  }

  getAgentBehaviorModifiers() {
    const modifiers = {
      movementSpeed: 1.0,
      energyCost: 1.0,
      visibility: 1.0,
      stressLevel: 0.0
    };

    if (this.weather.type === 'storm') {
      modifiers.movementSpeed *= 0.6;
      modifiers.visibility *= 0.3;
      modifiers.stressLevel += 0.4;
    } else if (this.weather.type === 'fog') {
      modifiers.visibility *= 0.4;
    }

    if (this.geologicalEvents.length > 0) {
      modifiers.stressLevel += 0.6;
    }

    if (this.alienInfluences.length > 0) {
      modifiers.stressLevel += 0.3;
    }

    return modifiers;
  }
}

export default function DynamicWorldEngine({ show, onClose, agents, onWorldUpdate }) {
  const [worldState] = useState(new WorldState());
  const [eventHistory, setEventHistory] = useState([]);
  const [impactMetrics, setImpactMetrics] = useState({
    agentsAffected: 0,
    behaviorChanges: 0,
    resourceImpact: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      worldState.update(0.1);
      
      // Track significant events
      if (worldState.weather.type !== 'clear' && worldState.weather.intensity > 0.5) {
        const recentWeather = eventHistory.find(e => 
          e.type === 'weather' && Date.now() - e.timestamp < 2000
        );
        
        if (!recentWeather) {
          const event = {
            type: 'weather',
            subtype: worldState.weather.type,
            intensity: worldState.weather.intensity,
            timestamp: Date.now()
          };
          setEventHistory(prev => [...prev, event].slice(-20));
          toast.warning(`Weather event: ${worldState.weather.type}`);
        }
      }

      if (worldState.geologicalEvents.length > 0) {
        worldState.geologicalEvents.forEach(geoEvent => {
          if (Date.now() - geoEvent.timestamp < 1000) {
            const event = {
              type: 'geological',
              subtype: geoEvent.type,
              magnitude: geoEvent.magnitude,
              timestamp: geoEvent.timestamp
            };
            setEventHistory(prev => [...prev, event].slice(-20));
            toast.error(`Geological event: ${geoEvent.type}!`);
          }
        });
      }

      if (worldState.alienInfluences.length > 0) {
        worldState.alienInfluences.forEach(influence => {
          if (Date.now() - influence.timestamp < 1000) {
            const event = {
              type: 'alien',
              subtype: influence.type,
              strength: influence.strength,
              timestamp: influence.timestamp
            };
            setEventHistory(prev => [...prev, event].slice(-20));
            toast.info(`Anomaly detected: ${influence.type}`);
          }
        });
      }

      updateImpactMetrics();
      onWorldUpdate?.(worldState);
    }, 1000);

    return () => clearInterval(interval);
  }, [worldState, eventHistory]);

  const updateImpactMetrics = () => {
    const resourceMods = worldState.getResourceModifiers();
    const behaviorMods = worldState.getAgentBehaviorModifiers();

    setImpactMetrics({
      agentsAffected: agents.length,
      behaviorChanges: Object.values(behaviorMods).filter(v => v !== 1.0).length,
      resourceImpact: Object.values(resourceMods).reduce((sum, v) => sum + Math.abs(1 - v), 0)
    });
  };

  if (!show) return null;

  const resourceMods = worldState.getResourceModifiers();
  const behaviorMods = worldState.getAgentBehaviorModifiers();

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <Cloud className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Dynamic World Engine</h3>
                <p className="text-white/60 text-sm">Complex environmental simulation and external events</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4">
                  <h4 className="text-blue-400 font-semibold mb-4 flex items-center gap-2">
                    <Cloud className="w-5 h-5" />
                    Current Weather
                  </h4>
                  <div className="text-white text-3xl mb-2 capitalize">{worldState.weather.type}</div>
                  {worldState.weather.intensity > 0 && (
                    <div className="text-white/70 text-sm mb-3">
                      Intensity: {(worldState.weather.intensity * 100).toFixed(0)}%
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Temperature</span>
                      <span className="text-white">{worldState.temperature.toFixed(1)}°C</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Season</span>
                      <span className="text-white capitalize">{worldState.season}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4">
                  <h4 className="text-green-400 font-semibold mb-4 flex items-center gap-2">
                    <Mountain className="w-5 h-5" />
                    Terrain Status
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/60">Fertility</span>
                        <span className="text-white">{(worldState.terrain.fertility * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500"
                          style={{ width: `${worldState.terrain.fertility * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/60">Stability</span>
                        <span className="text-white">{(worldState.terrain.stability * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500"
                          style={{ width: `${worldState.terrain.stability * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-white font-semibold mb-3">Resource Modifiers</h4>
                  <div className="space-y-2">
                    {Object.entries(resourceMods).map(([resource, modifier]) => (
                      <div key={resource} className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm capitalize">{resource}</span>
                          <span className={`text-sm font-bold ${
                            modifier > 1 ? 'text-green-400' : modifier < 1 ? 'text-red-400' : 'text-white'
                          }`}>
                            {modifier > 1 ? '+' : ''}{((modifier - 1) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-3">Behavior Modifiers</h4>
                  <div className="space-y-2">
                    {Object.entries(behaviorMods).map(([behavior, modifier]) => (
                      <div key={behavior} className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm capitalize">{behavior.replace(/([A-Z])/g, ' $1')}</span>
                          <span className={`text-sm font-bold ${
                            modifier > 1 || (behavior === 'stressLevel' && modifier > 0) ? 'text-red-400' : 
                            modifier < 1 ? 'text-yellow-400' : 'text-white'
                          }`}>
                            {behavior === 'stressLevel' ? 
                              `${(modifier * 100).toFixed(0)}%` : 
                              `${(modifier * 100).toFixed(0)}%`
                            }
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {(worldState.geologicalEvents.length > 0 || worldState.alienInfluences.length > 0) && (
                <div className="grid grid-cols-2 gap-6">
                  {worldState.geologicalEvents.length > 0 && (
                    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-4">
                      <h4 className="text-orange-400 font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Active Geological Events
                      </h4>
                      <div className="space-y-2">
                        {worldState.geologicalEvents.map((event, i) => (
                          <div key={i} className="bg-white/5 rounded-lg p-2">
                            <div className="text-white text-sm capitalize">{event.type}</div>
                            <div className="text-orange-400 text-xs">
                              Magnitude: {(event.magnitude * 100).toFixed(0)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {worldState.alienInfluences.length > 0 && (
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                      <h4 className="text-purple-400 font-semibold mb-3">👽 Alien Influences</h4>
                      <div className="space-y-2">
                        {worldState.alienInfluences.map((influence, i) => (
                          <div key={i} className="bg-white/5 rounded-lg p-2">
                            <div className="text-white text-sm capitalize">{influence.type.replace('_', ' ')}</div>
                            <div className="text-purple-400 text-xs">
                              Strength: {(influence.strength * 100).toFixed(0)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="w-80 border-l border-white/10 p-4 overflow-y-auto">
              <h4 className="text-white font-semibold mb-3 text-sm">Event History</h4>
              {eventHistory.length === 0 ? (
                <p className="text-white/60 text-sm text-center py-4">No events yet</p>
              ) : (
                <div className="space-y-2">
                  {eventHistory.slice().reverse().map((event, i) => (
                    <div key={i} className={`rounded-lg p-3 border ${
                      event.type === 'weather' ? 'bg-blue-500/10 border-blue-500/30' :
                      event.type === 'geological' ? 'bg-orange-500/10 border-orange-500/30' :
                      'bg-purple-500/10 border-purple-500/30'
                    }`}>
                      <div className="text-white text-sm capitalize">{event.subtype}</div>
                      <div className="text-white/60 text-xs">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-4">
                <h4 className="text-cyan-400 font-semibold mb-3 text-sm">Impact Metrics</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/60">Agents Affected</span>
                    <span className="text-white font-semibold">{impactMetrics.agentsAffected}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Behavior Changes</span>
                    <span className="text-yellow-400 font-semibold">{impactMetrics.behaviorChanges}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Resource Impact</span>
                    <span className="text-red-400 font-semibold">{impactMetrics.resourceImpact.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}