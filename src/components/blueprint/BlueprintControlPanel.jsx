import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Settings, TrendingUp, Upload, History, Save, RotateCcw, GitCompare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function BlueprintControlPanel({ show, onClose, blueprint }) {
  const [activeTab, setActiveTab] = useState('simulate');
  const [simulationLoad, setSimulationLoad] = useState(50);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);
  const [componentVersions, setComponentVersions] = useState({});
  const [selectedComponentForVersion, setSelectedComponentForVersion] = useState(null);

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Simulate performance of blueprint with ${blueprint.components?.length || 0} components under ${simulationLoad}% load.
        
        Provide:
        1. Response time estimates
        2. Throughput metrics
        3. Resource utilization
        4. Bottlenecks if any
        5. Scaling recommendations`,
        response_json_schema: {
          type: "object",
          properties: {
            responseTime: { type: "string" },
            throughput: { type: "string" },
            utilization: { type: "object" },
            bottlenecks: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      setSimulationResults(result);
      toast.success('Simulation complete!');
    } catch (error) {
      toast.error('Simulation failed');
    } finally {
      setIsSimulating(false);
    }
  };

  const deployBlueprint = async () => {
    try {
      toast.success('Deployment initiated! (Mock deployment)');
    } catch (error) {
      toast.error('Deployment failed');
    }
  };

  const saveComponentVersion = (componentIndex) => {
    const component = blueprint.components[componentIndex];
    if (!component) return;

    const version = {
      id: Date.now(),
      timestamp: new Date(),
      data: { ...component },
      note: `Saved version of ${component.label}`
    };

    setComponentVersions(prev => ({
      ...prev,
      [componentIndex]: [...(prev[componentIndex] || []), version]
    }));

    toast.success('Component version saved!');
  };

  const revertComponentVersion = (componentIndex, versionId) => {
    const versions = componentVersions[componentIndex];
    const version = versions?.find(v => v.id === versionId);
    if (version) {
      toast.success(`Reverted ${version.data.label} to ${new Date(version.timestamp).toLocaleString()}`);
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>

          <h3 className="text-2xl font-bold text-white mb-6">Blueprint Control Panel</h3>

          <div className="flex gap-2 mb-6 overflow-x-auto">
            {[
              { id: 'simulate', label: 'Simulate', icon: TrendingUp },
              { id: 'parameters', label: 'Parameters', icon: Settings },
              { id: 'versions', label: 'Versions', icon: History },
              { id: 'deploy', label: 'Deploy', icon: Upload }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-300'
                      : 'bg-white/5 border border-white/10 text-white/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'simulate' && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-white text-sm font-medium">Simulation Load</label>
                  <span className="text-cyan-400 text-sm">{simulationLoad}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={simulationLoad}
                  onChange={(e) => setSimulationLoad(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <button
                onClick={runSimulation}
                disabled={isSimulating}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                {isSimulating ? 'Running...' : 'Run Simulation'}
              </button>

              {simulationResults && (
                <div className="space-y-3 mt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
                      <div className="text-green-400 text-xs font-medium mb-1">Response Time</div>
                      <div className="text-white text-sm">{simulationResults.responseTime}</div>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                      <div className="text-blue-400 text-xs font-medium mb-1">Throughput</div>
                      <div className="text-white text-sm">{simulationResults.throughput}</div>
                    </div>
                  </div>

                  {simulationResults.bottlenecks?.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                      <h5 className="text-red-400 font-semibold mb-2 text-sm">Bottlenecks</h5>
                      <ul className="space-y-1">
                        {simulationResults.bottlenecks.map((b, i) => (
                          <li key={i} className="text-white/70 text-xs">• {b}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {simulationResults.recommendations?.length > 0 && (
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                      <h5 className="text-cyan-400 font-semibold mb-2 text-sm">Recommendations</h5>
                      <ul className="space-y-1">
                        {simulationResults.recommendations.map((r, i) => (
                          <li key={i} className="text-white/70 text-xs">• {r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'parameters' && (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-3">Blueprint Parameters</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-white/70 text-sm mb-1 block">Max Latency (ms)</label>
                    <input type="number" defaultValue="100" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white" />
                  </div>
                  <div>
                    <label className="text-white/70 text-sm mb-1 block">Min Throughput (req/s)</label>
                    <input type="number" defaultValue="1000" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white" />
                  </div>
                  <div>
                    <label className="text-white/70 text-sm mb-1 block">Cost Budget ($/month)</label>
                    <input type="number" defaultValue="5000" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white" />
                  </div>
                </div>
              </div>
              <button className="w-full py-3 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-xl hover:bg-cyan-500/30">
                Save Parameters
              </button>
            </div>
          )}

          {activeTab === 'versions' && (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-3">Component Version Control</h4>
                {blueprint.components?.length > 0 ? (
                  <div className="space-y-3">
                    {blueprint.components.map((comp, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: comp.color }} />
                            <span className="text-white text-sm font-medium">{comp.label}</span>
                          </div>
                          <button
                            onClick={() => saveComponentVersion(i)}
                            className="flex items-center gap-1 px-2 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded text-xs hover:bg-cyan-500/30"
                          >
                            <Save className="w-3 h-3" />
                            Save
                          </button>
                        </div>
                        
                        {componentVersions[i]?.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <div className="text-white/60 text-xs mb-1">{componentVersions[i].length} version(s)</div>
                            {componentVersions[i].slice(0, 3).map(version => (
                              <div key={version.id} className="flex items-center justify-between bg-white/5 rounded px-2 py-1">
                                <span className="text-white/70 text-xs">{new Date(version.timestamp).toLocaleString()}</span>
                                <button
                                  onClick={() => revertComponentVersion(i, version.id)}
                                  className="text-cyan-400 text-xs hover:text-cyan-300"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/60 text-sm">No components in blueprint</p>
                )}
              </div>

              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <GitCompare className="w-4 h-4 text-purple-400" />
                  <h5 className="text-purple-400 font-semibold text-sm">Version Comparison</h5>
                </div>
                <p className="text-white/60 text-xs">Select two versions to compare changes and configurations</p>
              </div>
            </div>
          )}

          {activeTab === 'deploy' && (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-3">Deployment Configuration</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-white/70 text-sm mb-1 block">Environment</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white">
                      <option>Production</option>
                      <option>Staging</option>
                      <option>Development</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-white/70 text-sm mb-1 block">Region</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white">
                      <option>US East</option>
                      <option>US West</option>
                      <option>EU Central</option>
                      <option>Asia Pacific</option>
                    </select>
                  </div>
                </div>
              </div>
              <button
                onClick={deployBlueprint}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-xl hover:opacity-90 flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Deploy Blueprint
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}