import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, CloudRain, Flame, Wind, Snowflake, Play, Settings } from 'lucide-react';
import { toast } from 'sonner';

const SCENARIOS = [
  { id: 'scarcity', name: 'Resource Scarcity', icon: '🌾', description: 'Food and water drop to critical levels', severity: 'high', effects: { food: -50, water: -30 } },
  { id: 'abundance', name: 'Resource Boom', icon: '💰', description: 'Resources become abundant', severity: 'low', effects: { food: +100, water: +50, tools: +10 } },
  { id: 'disaster', name: 'Natural Disaster', icon: '🌪️', description: 'Catastrophic event destroys infrastructure', severity: 'critical', effects: { shelter: -80, tools: -50, food: -30 } },
  { id: 'disease', name: 'Disease Outbreak', icon: '🦠', description: 'Illness spreads reducing productivity', severity: 'high', effects: { productivity: -60, morale: -40 } },
  { id: 'discovery', name: 'Major Discovery', icon: '💡', description: 'New knowledge breakthrough', severity: 'low', effects: { knowledge: +100, morale: +30 } },
  { id: 'invasion', name: 'External Threat', icon: '⚔️', description: 'Outside force threatens society', severity: 'critical', effects: { security: -70, morale: -50 } },
  { id: 'migration', name: 'Mass Migration', icon: '👥', description: 'Large population influx', severity: 'medium', effects: { population: +50, food: -40, shelter: -30 } },
  { id: 'technology', name: 'Tech Breakthrough', icon: '🔬', description: 'Advanced technology discovered', severity: 'low', effects: { knowledge: +80, tools: +40, efficiency: +50 } }
];

const BEHAVIOR_SEEDS = [
  { id: 'cooperation', name: 'Encourage Cooperation', description: 'Boost collaborative behaviors', modifier: { cooperationRate: 1.5 } },
  { id: 'competition', name: 'Increase Competition', description: 'Foster competitive dynamics', modifier: { competitionRate: 1.5 } },
  { id: 'aggression', name: 'Heighten Aggression', description: 'Increase conflict likelihood', modifier: { aggressionRate: 2.0 } },
  { id: 'harmony', name: 'Promote Harmony', description: 'Reduce conflicts and tensions', modifier: { harmonyRate: 1.8 } },
  { id: 'innovation', name: 'Spark Innovation', description: 'Boost creative problem-solving', modifier: { innovationRate: 1.6 } },
  { id: 'tradition', name: 'Strengthen Tradition', description: 'Reinforce established patterns', modifier: { traditionRate: 1.4 } }
];

export default function AdvancedScenarioControl({ show, onClose, society, onScenarioApply, onBehaviorSeed, onWhatIfTest }) {
  const [activeTab, setActiveTab] = useState('scenarios');
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [selectedBehavior, setSelectedBehavior] = useState(null);
  const [whatIfParams, setWhatIfParams] = useState({ population: 0, resources: 0, conflicts: 0 });
  const [whatIfResults, setWhatIfResults] = useState(null);

  const applyScenario = (scenario) => {
    if (!society) {
      toast.error('No active society');
      return;
    }

    Object.entries(scenario.effects).forEach(([key, value]) => {
      if (society.resources[key] !== undefined) {
        society.resources[key] = Math.max(0, society.resources[key] + value);
      } else if (key === 'productivity' || key === 'morale' || key === 'efficiency') {
        society[key] = (society[key] || 100) + value;
      }
    });

    onScenarioApply?.(scenario);
    toast.success(`${scenario.name} applied!`, { icon: scenario.icon });
  };

  const seedBehavior = (behavior) => {
    if (!society) {
      toast.error('No active society');
      return;
    }

    Object.entries(behavior.modifier).forEach(([key, value]) => {
      society[key] = value;
    });

    onBehaviorSeed?.(behavior);
    toast.success(`${behavior.name} seeded!`);
  };

  const runWhatIf = () => {
    if (!society) {
      toast.error('No active society');
      return;
    }

    const basePopulation = society.agents.length;
    const baseResources = society.resources.food + society.resources.water;
    const baseConflicts = society.conflicts?.length || 0;

    const projectedPopulation = basePopulation + whatIfParams.population;
    const projectedResources = baseResources + whatIfParams.resources;
    const projectedConflicts = baseConflicts + whatIfParams.conflicts;

    const survivalRate = projectedResources / projectedPopulation;
    const stabilityScore = Math.max(0, 100 - (projectedConflicts * 10));
    const growthPotential = survivalRate > 5 ? (survivalRate - 5) * 10 : 0;

    const results = {
      survivalRate: Math.min(100, survivalRate * 10),
      stabilityScore,
      growthPotential: Math.min(100, growthPotential),
      recommendations: [],
      warnings: []
    };

    if (survivalRate < 2) {
      results.warnings.push('Critical resource shortage - mass starvation likely');
    }
    if (projectedConflicts > 10) {
      results.warnings.push('High conflict rate - civil war risk');
    }
    if (projectedPopulation > 100) {
      results.warnings.push('Overpopulation - infrastructure strain');
    }

    if (survivalRate > 5) {
      results.recommendations.push('Invest in population growth');
    }
    if (stabilityScore > 70) {
      results.recommendations.push('Focus on expansion and exploration');
    }

    setWhatIfResults(results);
    onWhatIfTest?.(results);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Advanced Scenario Control</h3>
                <p className="text-white/60 text-sm">Trigger events & test hypotheticals</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          <div className="flex gap-2 p-4 border-b border-white/10">
            {[
              { id: 'scenarios', label: 'Environmental Scenarios' },
              { id: 'behaviors', label: 'Behavior Seeds' },
              { id: 'whatif', label: 'What-If Simulator' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === tab.id ? 'bg-orange-500/30 border border-orange-500/50 text-orange-300' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'scenarios' && (
              <div className="grid grid-cols-2 gap-4">
                {SCENARIOS.map(scenario => (
                  <motion.div key={scenario.id} whileHover={{ scale: 1.02 }} className={`bg-gradient-to-br from-white/5 to-white/10 border rounded-xl p-4 cursor-pointer ${scenario.severity === 'critical' ? 'border-red-500/50' : scenario.severity === 'high' ? 'border-orange-500/50' : 'border-white/20'}`} onClick={() => setSelectedScenario(scenario)}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl">{scenario.icon}</div>
                      <span className={`text-xs px-2 py-1 rounded ${scenario.severity === 'critical' ? 'bg-red-500/20 text-red-300' : scenario.severity === 'high' ? 'bg-orange-500/20 text-orange-300' : 'bg-blue-500/20 text-blue-300'}`}>
                        {scenario.severity}
                      </span>
                    </div>
                    <h4 className="text-white font-semibold mb-1">{scenario.name}</h4>
                    <p className="text-white/60 text-sm mb-3">{scenario.description}</p>
                    <div className="space-y-1">
                      {Object.entries(scenario.effects).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="text-white/60 capitalize">{key}</span>
                          <span className={value > 0 ? 'text-green-400' : 'text-red-400'}>
                            {value > 0 ? '+' : ''}{value}
                          </span>
                        </div>
                      ))}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); applyScenario(scenario); }} className="w-full mt-3 py-2 bg-orange-500/20 border border-orange-500/40 text-orange-300 rounded-lg text-sm hover:bg-orange-500/30">
                      Apply Scenario
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'behaviors' && (
              <div className="grid grid-cols-2 gap-4">
                {BEHAVIOR_SEEDS.map(behavior => (
                  <div key={behavior.id} className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                    <h4 className="text-white font-semibold mb-2">{behavior.name}</h4>
                    <p className="text-white/60 text-sm mb-3">{behavior.description}</p>
                    <div className="bg-white/5 rounded p-2 mb-3 text-xs">
                      {Object.entries(behavior.modifier).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-white/80">
                          <span className="capitalize">{key.replace('Rate', '')}</span>
                          <span className="text-purple-400">×{value}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => seedBehavior(behavior)} className="w-full py-2 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-lg text-sm hover:bg-purple-500/30">
                      Seed Behavior
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'whatif' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
                  <h4 className="text-cyan-400 font-semibold mb-4">Adjust Parameters</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-white/70 text-sm">Population Change</label>
                        <span className="text-cyan-400">{whatIfParams.population > 0 ? '+' : ''}{whatIfParams.population}</span>
                      </div>
                      <input type="range" min="-50" max="50" value={whatIfParams.population} onChange={(e) => setWhatIfParams({...whatIfParams, population: parseInt(e.target.value)})} className="w-full" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-white/70 text-sm">Resource Change</label>
                        <span className="text-cyan-400">{whatIfParams.resources > 0 ? '+' : ''}{whatIfParams.resources}</span>
                      </div>
                      <input type="range" min="-200" max="200" value={whatIfParams.resources} onChange={(e) => setWhatIfParams({...whatIfParams, resources: parseInt(e.target.value)})} className="w-full" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-white/70 text-sm">Conflict Change</label>
                        <span className="text-cyan-400">{whatIfParams.conflicts > 0 ? '+' : ''}{whatIfParams.conflicts}</span>
                      </div>
                      <input type="range" min="-10" max="20" value={whatIfParams.conflicts} onChange={(e) => setWhatIfParams({...whatIfParams, conflicts: parseInt(e.target.value)})} className="w-full" />
                    </div>
                  </div>

                  <button onClick={runWhatIf} className="w-full mt-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:opacity-90">
                    <Play className="w-4 h-4 inline mr-2" />
                    Run Simulation
                  </button>
                </div>

                {whatIfResults && (
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
                    <h4 className="text-green-400 font-semibold mb-4">Simulation Results</h4>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-white/60 text-xs mb-1">Survival Rate</div>
                        <div className="text-2xl font-bold text-green-400">{whatIfResults.survivalRate.toFixed(0)}%</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-white/60 text-xs mb-1">Stability</div>
                        <div className="text-2xl font-bold text-blue-400">{whatIfResults.stabilityScore.toFixed(0)}%</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-white/60 text-xs mb-1">Growth</div>
                        <div className="text-2xl font-bold text-purple-400">{whatIfResults.growthPotential.toFixed(0)}%</div>
                      </div>
                    </div>

                    {whatIfResults.warnings.length > 0 && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-3">
                        <div className="text-red-400 font-semibold text-sm mb-2">⚠️ Warnings</div>
                        {whatIfResults.warnings.map((warning, i) => (
                          <div key={i} className="text-red-300 text-xs mb-1">• {warning}</div>
                        ))}
                      </div>
                    )}

                    {whatIfResults.recommendations.length > 0 && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                        <div className="text-green-400 font-semibold text-sm mb-2">✓ Recommendations</div>
                        {whatIfResults.recommendations.map((rec, i) => (
                          <div key={i} className="text-green-300 text-xs mb-1">• {rec}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}