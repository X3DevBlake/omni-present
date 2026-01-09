import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, FolderOpen, Play, Settings, Plus, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ScenarioEditor({ show, onClose, onScenarioApply }) {
  const [scenarioName, setScenarioName] = useState('');
  const [environmentalEvents, setEnvironmentalEvents] = useState([]);
  const [agentConditions, setAgentConditions] = useState({
    count: 10,
    startingResources: { food: 100, water: 100, materials: 50 },
    skills: []
  });
  const [societalRules, setSocietalRules] = useState([]);
  const [economicParams, setEconomicParams] = useState({
    inflationRate: 0,
    marketStability: 1.0,
    tradeEnabled: true
  });
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ type: 'weather', intensity: 0.5, duration: 5000 });

  const eventTypes = ['weather', 'geological', 'resource_scarcity', 'disease', 'discovery'];

  const addEnvironmentalEvent = () => {
    setEnvironmentalEvents([...environmentalEvents, { ...newEvent, id: Date.now() }]);
    setNewEvent({ type: 'weather', intensity: 0.5, duration: 5000 });
    setShowNewEvent(false);
  };

  const addSocietalRule = () => {
    const rule = {
      id: Date.now(),
      name: 'New Rule',
      type: 'resource_distribution',
      parameters: {}
    };
    setSocietalRules([...societalRules, rule]);
  };

  const saveScenario = async () => {
    if (!scenarioName) {
      toast.error('Enter scenario name');
      return;
    }

    const scenario = {
      id: Date.now().toString(),
      name: scenarioName,
      environmentalEvents,
      agentConditions,
      societalRules,
      economicParams,
      createdAt: Date.now()
    };

    try {
      const user = await base44.auth.me();
      const scenarios = user.saved_scenarios || [];
      await base44.auth.updateMe({
        saved_scenarios: [...scenarios, scenario]
      });
      toast.success('Scenario saved!');
      setSavedScenarios([...scenarios, scenario]);
    } catch (err) {
      toast.error('Failed to save scenario');
    }
  };

  const loadScenario = (scenario) => {
    setScenarioName(scenario.name);
    setEnvironmentalEvents(scenario.environmentalEvents);
    setAgentConditions(scenario.agentConditions);
    setSocietalRules(scenario.societalRules);
    setEconomicParams(scenario.economicParams);
    toast.success('Scenario loaded!');
  };

  const applyScenario = () => {
    const scenario = {
      name: scenarioName,
      environmentalEvents,
      agentConditions,
      societalRules,
      economicParams
    };
    onScenarioApply?.(scenario);
    toast.success('Scenario applied to simulation!');
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                <Settings className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Scenario Editor</h3>
                <p className="text-white/60 text-sm">Design custom simulation scenarios</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={saveScenario} className="px-4 py-2 bg-green-500/20 border border-green-500/40 text-green-300 rounded-lg hover:bg-green-500/30">
                <Save className="w-4 h-4" />
              </button>
              <button onClick={applyScenario} className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-lg hover:bg-cyan-500/30">
                <Play className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="mb-6">
                <label className="text-white font-semibold mb-2 block">Scenario Name</label>
                <input
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  placeholder="Enter scenario name..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40"
                />
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-semibold">Environmental Events</h4>
                  <button onClick={() => setShowNewEvent(true)} className="px-3 py-1 bg-orange-500/20 border border-orange-500/40 text-orange-300 rounded-lg text-sm hover:bg-orange-500/30">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {showNewEvent && (
                  <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
                    <select value={newEvent.type} onChange={(e) => setNewEvent({...newEvent, type: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white mb-3">
                      {eventTypes.map(type => (
                        <option key={type} value={type}>{type.replace('_', ' ')}</option>
                      ))}
                    </select>
                    <div className="flex gap-4 mb-3">
                      <div className="flex-1">
                        <label className="text-white/60 text-xs mb-1 block">Intensity</label>
                        <input type="range" min="0" max="1" step="0.1" value={newEvent.intensity} onChange={(e) => setNewEvent({...newEvent, intensity: parseFloat(e.target.value)})} className="w-full" />
                        <div className="text-cyan-400 text-xs text-center">{newEvent.intensity}</div>
                      </div>
                      <div className="flex-1">
                        <label className="text-white/60 text-xs mb-1 block">Duration (ms)</label>
                        <input type="number" value={newEvent.duration} onChange={(e) => setNewEvent({...newEvent, duration: parseInt(e.target.value)})} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={addEnvironmentalEvent} className="flex-1 py-2 bg-orange-500/20 border border-orange-500/40 text-orange-300 rounded-lg hover:bg-orange-500/30 text-sm">Add Event</button>
                      <button onClick={() => setShowNewEvent(false)} className="px-4 py-2 bg-white/5 text-white/70 rounded-lg hover:bg-white/10 text-sm">Cancel</button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {environmentalEvents.map((event, i) => (
                    <div key={event.id} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm capitalize">{event.type.replace('_', ' ')}</div>
                        <div className="text-white/60 text-xs">Intensity: {event.intensity} • Duration: {event.duration}ms</div>
                      </div>
                      <button onClick={() => setEnvironmentalEvents(environmentalEvents.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3">Agent Starting Conditions</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Agent Count</label>
                    <input type="number" value={agentConditions.count} onChange={(e) => setAgentConditions({...agentConditions, count: parseInt(e.target.value)})} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Starting Food</label>
                    <input type="number" value={agentConditions.startingResources.food} onChange={(e) => setAgentConditions({...agentConditions, startingResources: {...agentConditions.startingResources, food: parseInt(e.target.value)}})} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Starting Water</label>
                    <input type="number" value={agentConditions.startingResources.water} onChange={(e) => setAgentConditions({...agentConditions, startingResources: {...agentConditions.startingResources, water: parseInt(e.target.value)}})} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Starting Materials</label>
                    <input type="number" value={agentConditions.startingResources.materials} onChange={(e) => setAgentConditions({...agentConditions, startingResources: {...agentConditions.startingResources, materials: parseInt(e.target.value)}})} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-semibold">Societal Rules</h4>
                  <button onClick={addSocietalRule} className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-lg text-sm hover:bg-purple-500/30">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {societalRules.map((rule, i) => (
                    <div key={rule.id} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                      <input type="text" value={rule.name} onChange={(e) => {
                        const updated = [...societalRules];
                        updated[i].name = e.target.value;
                        setSocietalRules(updated);
                      }} className="flex-1 bg-transparent border-none text-white outline-none" />
                      <button onClick={() => setSocietalRules(societalRules.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Economic Parameters</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Inflation Rate</label>
                    <input type="range" min="-0.2" max="0.5" step="0.05" value={economicParams.inflationRate} onChange={(e) => setEconomicParams({...economicParams, inflationRate: parseFloat(e.target.value)})} className="w-full" />
                    <div className="text-cyan-400 text-xs text-center">{(economicParams.inflationRate * 100).toFixed(0)}%</div>
                  </div>
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Market Stability</label>
                    <input type="range" min="0" max="1" step="0.1" value={economicParams.marketStability} onChange={(e) => setEconomicParams({...economicParams, marketStability: parseFloat(e.target.value)})} className="w-full" />
                    <div className="text-cyan-400 text-xs text-center">{economicParams.marketStability}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={economicParams.tradeEnabled} onChange={(e) => setEconomicParams({...economicParams, tradeEnabled: e.target.checked})} className="w-4 h-4" />
                    <label className="text-white text-sm">Enable Trading</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-80 border-l border-white/10 p-4 overflow-y-auto">
              <h4 className="text-white font-semibold mb-3 text-sm">Saved Scenarios</h4>
              {savedScenarios.length === 0 ? (
                <p className="text-white/60 text-sm text-center py-4">No saved scenarios</p>
              ) : (
                <div className="space-y-2">
                  {savedScenarios.map(scenario => (
                    <div key={scenario.id} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 cursor-pointer" onClick={() => loadScenario(scenario)}>
                      <div className="text-white text-sm font-medium mb-1">{scenario.name}</div>
                      <div className="text-white/60 text-xs">
                        {scenario.environmentalEvents.length} events • {scenario.agentConditions.count} agents
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}