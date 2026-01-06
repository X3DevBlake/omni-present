import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Play, Settings } from 'lucide-react';
import { toast } from 'sonner';

const EVENT_TYPES = [
  { id: 'resource_change', name: 'Resource Change', params: ['resource', 'amount'] },
  { id: 'conflict', name: 'Trigger Conflict', params: ['intensity', 'participants'] },
  { id: 'discovery', name: 'Discovery Event', params: ['type', 'value'] },
  { id: 'weather', name: 'Weather Change', params: ['type', 'duration'] },
  { id: 'migration', name: 'Population Migration', params: ['amount', 'direction'] },
  { id: 'alliance', name: 'Force Alliance', params: ['factions', 'strength'] },
  { id: 'disaster', name: 'Natural Disaster', params: ['severity', 'affected_area'] }
];

const EMERGENT_BEHAVIORS = [
  { id: 'rebellion', name: 'Rebellion', trigger: 'high_oppression' },
  { id: 'innovation', name: 'Innovation Wave', trigger: 'resource_abundance' },
  { id: 'cooperation', name: 'Mass Cooperation', trigger: 'common_threat' },
  { id: 'migration', name: 'Mass Migration', trigger: 'resource_scarcity' },
  { id: 'cultural_shift', name: 'Cultural Shift', trigger: 'generational_change' }
];

export default function AdvancedEventEditor({ show, onClose, onScenarioCreate }) {
  const [scenarioName, setScenarioName] = useState('');
  const [stages, setStages] = useState([]);
  const [currentStage, setCurrentStage] = useState(null);
  const [seededBehaviors, setSeededBehaviors] = useState([]);
  const [whatIfParams, setWhatIfParams] = useState({});

  const addStage = () => {
    const newStage = {
      id: `stage_${Date.now()}`,
      name: `Stage ${stages.length + 1}`,
      events: [],
      delay: 5,
      conditions: []
    };
    setStages([...stages, newStage]);
    setCurrentStage(newStage);
  };

  const addEventToStage = (stageId, eventType) => {
    const stage = stages.find(s => s.id === stageId);
    if (!stage) return;

    const event = {
      id: `event_${Date.now()}`,
      type: eventType.id,
      name: eventType.name,
      params: {},
      enabled: true
    };

    stage.events.push(event);
    setStages([...stages]);
    toast.success(`Added ${eventType.name}`);
  };

  const updateEventParam = (stageId, eventId, param, value) => {
    const stage = stages.find(s => s.id === stageId);
    if (!stage) return;

    const event = stage.events.find(e => e.id === eventId);
    if (!event) return;

    event.params[param] = value;
    setStages([...stages]);
  };

  const removeStage = (stageId) => {
    setStages(stages.filter(s => s.id !== stageId));
    if (currentStage?.id === stageId) {
      setCurrentStage(null);
    }
  };

  const toggleBehaviorSeed = (behaviorId) => {
    if (seededBehaviors.includes(behaviorId)) {
      setSeededBehaviors(seededBehaviors.filter(b => b !== behaviorId));
    } else {
      setSeededBehaviors([...seededBehaviors, behaviorId]);
    }
  };

  const createScenario = () => {
    if (!scenarioName.trim() || stages.length === 0) {
      toast.error('Add scenario name and at least one stage');
      return;
    }

    const scenario = {
      id: `scenario_${Date.now()}`,
      name: scenarioName,
      stages,
      seededBehaviors,
      whatIfParams,
      createdAt: Date.now()
    };

    onScenarioCreate?.(scenario);
    toast.success('Scenario created!');
    onClose();
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                <Settings className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Advanced Event Editor</h3>
                <p className="text-white/60 text-sm">Create multi-stage environmental scenarios</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Left: Scenario Setup */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-4">
                  <label className="text-cyan-400 text-sm mb-2 block">Scenario Name</label>
                  <input type="text" value={scenarioName} onChange={(e) => setScenarioName(e.target.value)} placeholder="Resource War" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-semibold">Scenario Stages</h4>
                    <button onClick={addStage} className="flex items-center gap-2 px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-lg text-sm hover:bg-cyan-500/30">
                      <Plus className="w-4 h-4" />
                      Add Stage
                    </button>
                  </div>

                  <div className="space-y-4">
                    {stages.map((stage, idx) => (
                      <div key={stage.id} className={`bg-white/5 border rounded-xl p-4 ${currentStage?.id === stage.id ? 'border-cyan-500/50' : 'border-white/10'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                              {idx + 1}
                            </div>
                            <input type="text" value={stage.name} onChange={(e) => {
                              stage.name = e.target.value;
                              setStages([...stages]);
                            }} className="bg-transparent border-none text-white font-semibold outline-none" />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setCurrentStage(stage)} className="text-cyan-400 hover:text-cyan-300">
                              <Settings className="w-4 h-4" />
                            </button>
                            <button onClick={() => removeStage(stage.id)} className="text-red-400 hover:text-red-300">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="text-white/60 text-xs mb-1 block">Delay (seconds)</label>
                          <input type="number" value={stage.delay} onChange={(e) => {
                            stage.delay = parseInt(e.target.value);
                            setStages([...stages]);
                          }} className="w-24 bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm" />
                        </div>

                        {stage.events.length > 0 ? (
                          <div className="space-y-2">
                            {stage.events.map(event => (
                              <div key={event.id} className="bg-white/5 rounded p-2">
                                <div className="text-white text-sm font-medium mb-2">{event.name}</div>
                                <div className="flex gap-2">
                                  {EVENT_TYPES.find(t => t.id === event.type)?.params.map(param => (
                                    <input key={param} type="text" placeholder={param} value={event.params[param] || ''} onChange={(e) => updateEventParam(stage.id, event.id, param, e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs" />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-white/40 text-sm text-center py-2">No events - add from panel →</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Event Library & Behavior Seeds */}
              <div className="space-y-6">
                {currentStage && (
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                    <h4 className="text-purple-400 font-semibold mb-3">Add Events to {currentStage.name}</h4>
                    <div className="space-y-2">
                      {EVENT_TYPES.map(eventType => (
                        <button key={eventType.id} onClick={() => addEventToStage(currentStage.id, eventType)} className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white text-sm">
                          {eventType.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <h4 className="text-yellow-400 font-semibold mb-3">Seed Emergent Behaviors</h4>
                  <div className="space-y-2">
                    {EMERGENT_BEHAVIORS.map(behavior => (
                      <label key={behavior.id} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={seededBehaviors.includes(behavior.id)} onChange={() => toggleBehaviorSeed(behavior.id)} className="rounded" />
                        <span className="text-white text-sm">{behavior.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-white/10 flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg">
              Cancel
            </button>
            <button onClick={createScenario} className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:opacity-90">
              <Play className="w-4 h-4 inline mr-2" />
              Create Scenario
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}