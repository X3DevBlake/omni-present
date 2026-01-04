import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Plus, Trash2, AlertTriangle, TrendingUp, Zap, Activity } from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from './GlassCard';

const SCENARIO_TEMPLATES = {
  'peak-load': {
    name: 'Peak Load Surge',
    description: 'Sudden 3x increase in workload',
    conditions: { cpuMultiplier: 3, gpuMultiplier: 3, duration: 120 }
  },
  'network-degradation': {
    name: 'Network Degradation',
    description: 'Gradual bandwidth reduction',
    conditions: { networkBandwidth: 0.4, latencyIncrease: 200 }
  },
  'component-failure': {
    name: 'Component Failure',
    description: 'GPU node failure during operation',
    conditions: { failedComponents: ['gpu-1'], redistributeLoad: true }
  },
  'memory-pressure': {
    name: 'Memory Pressure Event',
    description: 'Large dataset causing memory saturation',
    conditions: { memoryMultiplier: 2.5, swapUsage: true }
  },
  'thermal-stress': {
    name: 'Thermal Stress Test',
    description: 'Sustained high load in high ambient temperature',
    conditions: { ambientTemp: 35, cpuMultiplier: 2, gpuMultiplier: 2.5, duration: 300 }
  }
};

export default function ScenarioSimulator({ blueprint, telemetry, onSimulate, onClose }) {
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customScenario, setCustomScenario] = useState({
    name: '',
    loadConditions: { cpu: 100, gpu: 100, memory: 100, network: 100 },
    events: [],
    duration: 60
  });
  const [simulationResults, setSimulationResults] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const runSimulation = async (scenario) => {
    setIsSimulating(true);
    
    // Simulate the scenario
    setTimeout(() => {
      const basePerformance = {
        throughput: 1000,
        latency: 5,
        stability: 95
      };

      let results = { ...basePerformance };
      const impacts = [];

      if (scenario.conditions) {
        const { cpuMultiplier, gpuMultiplier, networkBandwidth, failedComponents, memoryMultiplier } = scenario.conditions;

        // CPU impact
        if (cpuMultiplier) {
          const cpuLoad = telemetry.cpuLoad * cpuMultiplier;
          if (cpuLoad > 100) {
            results.throughput *= 0.6;
            results.latency *= 2.5;
            results.stability -= 30;
            impacts.push({
              component: 'CPU',
              severity: 'critical',
              impact: `${Math.round(cpuLoad)}% load - severe throttling`,
              metric: 'Performance degraded 40%'
            });
          } else if (cpuLoad > 85) {
            results.throughput *= 0.85;
            results.latency *= 1.3;
            impacts.push({
              component: 'CPU',
              severity: 'warning',
              impact: `${Math.round(cpuLoad)}% load - approaching limits`,
              metric: 'Performance reduced 15%'
            });
          }
        }

        // GPU impact
        if (gpuMultiplier) {
          const gpuLoad = telemetry.gpuLoad * gpuMultiplier;
          if (gpuLoad > 100) {
            results.throughput *= 0.5;
            results.latency *= 3;
            results.stability -= 40;
            impacts.push({
              component: 'GPU Arrays',
              severity: 'critical',
              impact: `${Math.round(gpuLoad)}% load - queue overflow`,
              metric: 'Throughput halved, latency tripled'
            });
          }
        }

        // Network impact
        if (networkBandwidth && networkBandwidth < 1) {
          results.throughput *= networkBandwidth;
          results.latency *= (2 - networkBandwidth);
          impacts.push({
            component: 'Network',
            severity: 'warning',
            impact: `${Math.round(networkBandwidth * 100)}% bandwidth available`,
            metric: `Throughput reduced to ${Math.round(networkBandwidth * 100)}%`
          });
        }

        // Component failure
        if (failedComponents?.length > 0) {
          const failureRate = failedComponents.length * 0.25;
          results.throughput *= (1 - failureRate);
          results.stability -= failureRate * 100;
          impacts.push({
            component: failedComponents.join(', '),
            severity: 'critical',
            impact: 'Component failure detected',
            metric: `${failedComponents.length} node(s) offline - redundancy active`
          });
        }

        // Memory pressure
        if (memoryMultiplier && memoryMultiplier > 1) {
          const memoryLoad = telemetry.memoryUsage * memoryMultiplier;
          if (memoryLoad > 100) {
            results.throughput *= 0.4;
            results.latency *= 5;
            impacts.push({
              component: 'Memory',
              severity: 'critical',
              impact: `${Math.round(memoryLoad)}% usage - thrashing detected`,
              metric: 'Severe performance degradation'
            });
          }
        }
      }

      // Custom load conditions
      if (scenario.loadConditions) {
        const avgLoad = (scenario.loadConditions.cpu + scenario.loadConditions.gpu) / 2;
        if (avgLoad > 90) {
          results.stability -= 15;
          impacts.push({
            component: 'System',
            severity: 'warning',
            impact: 'Sustained high load across all components',
            metric: 'Stability reduced, thermal stress increased'
          });
        }
      }

      // Process events
      if (scenario.events?.length > 0) {
        scenario.events.forEach(event => {
          if (event.type === 'latency-spike') {
            results.latency += event.value;
            impacts.push({
              component: 'Network',
              severity: 'warning',
              impact: `Latency spike: +${event.value}ms`,
              metric: `Total latency: ${Math.round(results.latency)}ms`
            });
          } else if (event.type === 'bandwidth-limit') {
            results.throughput *= (event.value / 100);
            impacts.push({
              component: 'Network',
              severity: 'warning',
              impact: `Bandwidth limited to ${event.value}%`,
              metric: `Throughput: ${Math.round(results.throughput)} req/s`
            });
          } else if (event.type === 'component-failure') {
            results.stability -= 20;
            results.throughput *= 0.75;
            impacts.push({
              component: event.component || 'Unknown',
              severity: 'critical',
              impact: 'Component failure',
              metric: 'Failover initiated, -25% capacity'
            });
          }
        });
      }

      setSimulationResults({
        scenario: scenario.name || 'Custom Scenario',
        performance: results,
        impacts,
        recommendations: generateRecommendations(results, impacts),
        timestamp: Date.now()
      });

      setIsSimulating(false);
      onSimulate?.(results);
      toast.success('Simulation complete');
    }, 2000);
  };

  const generateRecommendations = (results, impacts) => {
    const recommendations = [];

    if (results.stability < 70) {
      recommendations.push({
        priority: 'critical',
        action: 'Implement redundancy failover',
        reason: 'System stability critically low'
      });
    }

    if (results.latency > 20) {
      recommendations.push({
        priority: 'high',
        action: 'Scale out compute nodes or optimize network paths',
        reason: 'Latency exceeds acceptable threshold'
      });
    }

    if (results.throughput < 600) {
      recommendations.push({
        priority: 'high',
        action: 'Add processing capacity or enable load shedding',
        reason: 'Throughput degraded significantly'
      });
    }

    const criticalImpacts = impacts.filter(i => i.severity === 'critical');
    if (criticalImpacts.length > 0) {
      recommendations.push({
        priority: 'critical',
        action: 'Address critical component issues immediately',
        reason: `${criticalImpacts.length} critical impact(s) detected`
      });
    }

    return recommendations;
  };

  const addCustomEvent = () => {
    setCustomScenario(prev => ({
      ...prev,
      events: [...prev.events, {
        type: 'latency-spike',
        time: 30,
        value: 50,
        component: 'network'
      }]
    }));
  };

  const removeEvent = (index) => {
    setCustomScenario(prev => ({
      ...prev,
      events: prev.events.filter((_, i) => i !== index)
    }));
  };

  const getSeverityColor = (severity) => {
    if (severity === 'critical') return 'text-red-400 bg-red-500/10 border-red-500/30';
    if (severity === 'warning') return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl my-8"
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Scenario Simulator</h2>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'templates' ? 'bg-cyan-500/20 text-cyan-400' : 'text-white/60 hover:text-white'
              }`}
            >
              Templates
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'custom' ? 'bg-purple-500/20 text-purple-400' : 'text-white/60 hover:text-white'
              }`}
            >
              Custom Scenario
            </button>
            {simulationResults && (
              <button
                onClick={() => setActiveTab('results')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'results' ? 'bg-pink-500/20 text-pink-400' : 'text-white/60 hover:text-white'
                }`}
              >
                Results
              </button>
            )}
          </div>

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(SCENARIO_TEMPLATES).map(([key, template]) => (
                <motion.div
                  key={key}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedTemplate === key
                      ? 'border-cyan-500/60 bg-cyan-500/10'
                      : 'border-white/20 bg-white/5 hover:border-white/40'
                  }`}
                  onClick={() => setSelectedTemplate(key)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h3 className="text-white font-semibold mb-2">{template.name}</h3>
                  <p className="text-white/60 text-sm mb-3">{template.description}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        runSimulation(template);
                      }}
                      disabled={isSimulating}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-sm transition-colors disabled:opacity-50"
                    >
                      <Play className="w-4 h-4" />
                      Run
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Custom Scenario Tab */}
          {activeTab === 'custom' && (
            <div className="space-y-6">
              <div>
                <label className="text-white text-sm mb-2 block">Scenario Name</label>
                <input
                  type="text"
                  value={customScenario.name}
                  onChange={(e) => setCustomScenario(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Custom Scenario"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['cpu', 'gpu', 'memory', 'network'].map(resource => (
                  <div key={resource}>
                    <label className="text-white/60 text-xs mb-2 block uppercase">{resource} Load %</label>
                    <input
                      type="number"
                      value={customScenario.loadConditions[resource]}
                      onChange={(e) => setCustomScenario(prev => ({
                        ...prev,
                        loadConditions: { ...prev.loadConditions, [resource]: Number(e.target.value) }
                      }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">Events</h3>
                  <button
                    onClick={addCustomEvent}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Event
                  </button>
                </div>

                <div className="space-y-3">
                  {customScenario.events.map((event, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <select
                          value={event.type}
                          onChange={(e) => {
                            const newEvents = [...customScenario.events];
                            newEvents[idx].type = e.target.value;
                            setCustomScenario(prev => ({ ...prev, events: newEvents }));
                          }}
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                        >
                          <option value="latency-spike">Latency Spike</option>
                          <option value="bandwidth-limit">Bandwidth Limit</option>
                          <option value="component-failure">Component Failure</option>
                        </select>
                        
                        <input
                          type="number"
                          placeholder="Time (s)"
                          value={event.time}
                          onChange={(e) => {
                            const newEvents = [...customScenario.events];
                            newEvents[idx].time = Number(e.target.value);
                            setCustomScenario(prev => ({ ...prev, events: newEvents }));
                          }}
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                        />
                        
                        <input
                          type="number"
                          placeholder="Value"
                          value={event.value}
                          onChange={(e) => {
                            const newEvents = [...customScenario.events];
                            newEvents[idx].value = Number(e.target.value);
                            setCustomScenario(prev => ({ ...prev, events: newEvents }));
                          }}
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                        />
                        
                        <button
                          onClick={() => removeEvent(idx)}
                          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => runSimulation(customScenario)}
                disabled={isSimulating || !customScenario.name}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSimulating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Simulating...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Run Simulation
                  </>
                )}
              </button>
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && simulationResults && (
            <div className="space-y-6">
              <div>
                <h3 className="text-white font-semibold text-xl mb-1">{simulationResults.scenario}</h3>
                <p className="text-white/50 text-sm">
                  Completed at {new Date(simulationResults.timestamp).toLocaleTimeString()}
                </p>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                  <div className="text-cyan-400 text-xs mb-1">Throughput</div>
                  <div className="text-white text-2xl font-bold">{Math.round(simulationResults.performance.throughput)}</div>
                  <div className="text-white/50 text-xs">req/s</div>
                </div>
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                  <div className="text-purple-400 text-xs mb-1">Latency</div>
                  <div className="text-white text-2xl font-bold">{Math.round(simulationResults.performance.latency)}</div>
                  <div className="text-white/50 text-xs">ms</div>
                </div>
                <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/30">
                  <div className="text-pink-400 text-xs mb-1">Stability</div>
                  <div className="text-white text-2xl font-bold">{Math.round(simulationResults.performance.stability)}</div>
                  <div className="text-white/50 text-xs">%</div>
                </div>
              </div>

              {/* Component Impacts */}
              <div>
                <h4 className="text-white font-semibold mb-3">Component Impact Analysis</h4>
                <div className="space-y-2">
                  {simulationResults.impacts.map((impact, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border ${getSeverityColor(impact.severity)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold mb-1">{impact.component}</div>
                          <div className="text-sm opacity-80">{impact.impact}</div>
                        </div>
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="text-xs opacity-60 mt-2">{impact.metric}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              {simulationResults.recommendations.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-3">Recommendations</h4>
                  <div className="space-y-2">
                    {simulationResults.recommendations.map((rec, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-start gap-3">
                          <TrendingUp className="w-5 h-5 text-cyan-400 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-white font-medium mb-1">{rec.action}</div>
                            <div className="text-white/60 text-sm">{rec.reason}</div>
                            <div className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                              rec.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                              rec.priority === 'high' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {rec.priority.toUpperCase()} PRIORITY
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}