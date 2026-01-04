import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Zap, Database, Cpu, CheckCircle, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function MultiStageSimulator({ blueprint, onSimulationComplete, onClose }) {
  const [pipeline, setPipeline] = useState([
    { stage: 'Data Loading', duration: 60, cpu: 30, gpu: 0, memory: 40, io: 80, enabled: true },
    { stage: 'Preprocessing', duration: 180, cpu: 70, gpu: 20, memory: 60, io: 40, enabled: true },
    { stage: 'Training', duration: 3600, cpu: 40, gpu: 95, memory: 85, io: 20, enabled: true },
    { stage: 'Validation', duration: 300, cpu: 35, gpu: 80, memory: 50, io: 30, enabled: true },
    { stage: 'Model Export', duration: 120, cpu: 25, gpu: 10, memory: 30, io: 70, enabled: true }
  ]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState(null);

  const runSimulation = async () => {
    setIsSimulating(true);
    
    const activePipeline = pipeline.filter(s => s.enabled);
    const totalDuration = activePipeline.reduce((sum, s) => sum + s.duration, 0);
    
    // Simulate with delays
    for (let i = 0; i < activePipeline.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    try {
      const prompt = `
        Analyze this multi-stage ML pipeline simulation on the given infrastructure:
        
        Blueprint: ${JSON.stringify(blueprint)}
        Pipeline Stages: ${JSON.stringify(activePipeline)}
        Total Duration: ${totalDuration} seconds
        
        Provide:
        1. BOTTLENECK ANALYSIS: Identify which stages are constrained by what resources
        2. LONG-TERM OPTIMIZATION: Suggest architectural changes to improve pipeline efficiency:
           - Component upgrades (e.g., faster GPUs for training stage)
           - Architecture changes (e.g., distributed training across multiple nodes)
           - Storage tier optimization (e.g., NVMe for data loading)
           - Network optimization (e.g., RDMA for distributed workloads)
        3. COST-PERFORMANCE TRADEOFFS: For each suggestion, provide cost impact vs time savings
        4. SCALING STRATEGY: Recommend how to scale for 10x workload increase
      `;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            bottlenecks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  stage: { type: 'string' },
                  constraint: { type: 'string' },
                  impact: { type: 'string' },
                  severity: { type: 'string' }
                }
              }
            },
            architecturalOptimizations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  optimization: { type: 'string' },
                  affectedStages: { type: 'array', items: { type: 'string' } },
                  timeSavings: { type: 'string' },
                  costIncrease: { type: 'number' },
                  implementation: { type: 'string' }
                }
              }
            },
            scalingStrategy: {
              type: 'object',
              properties: {
                approach: { type: 'string' },
                recommendations: { type: 'array', items: { type: 'string' } },
                estimatedCost: { type: 'number' }
              }
            }
          }
        }
      });

      setResults(analysis);
      onSimulationComplete?.(analysis);
    } catch (error) {
      console.error('Simulation analysis failed:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Multi-Stage Pipeline Simulator</h2>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Pipeline Configuration */}
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-3">Pipeline Stages</h3>
          <div className="space-y-2">
            {pipeline.map((stage, idx) => (
              <div key={idx} className={`p-4 rounded-xl border transition-all ${
                stage.enabled 
                  ? 'bg-white/5 border-white/20' 
                  : 'bg-white/5 border-white/10 opacity-50'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={stage.enabled}
                      onChange={(e) => {
                        const newPipeline = [...pipeline];
                        newPipeline[idx].enabled = e.target.checked;
                        setPipeline(newPipeline);
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-white font-medium">{stage.stage}</span>
                  </div>
                  <span className="text-white/60 text-sm">{stage.duration}s</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  <div className="p-2 rounded bg-white/5">
                    <Cpu className="w-3 h-3 text-cyan-400 mb-1" />
                    <div className="text-white/50 text-xs">CPU</div>
                    <div className="text-white text-sm">{stage.cpu}%</div>
                  </div>
                  <div className="p-2 rounded bg-white/5">
                    <Zap className="w-3 h-3 text-purple-400 mb-1" />
                    <div className="text-white/50 text-xs">GPU</div>
                    <div className="text-white text-sm">{stage.gpu}%</div>
                  </div>
                  <div className="p-2 rounded bg-white/5">
                    <Database className="w-3 h-3 text-pink-400 mb-1" />
                    <div className="text-white/50 text-xs">Memory</div>
                    <div className="text-white text-sm">{stage.memory}%</div>
                  </div>
                  <div className="p-2 rounded bg-white/5">
                    <div className="text-white/50 text-xs mb-1">I/O</div>
                    <div className="text-white text-sm">{stage.io}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simulate Button */}
        <button
          onClick={runSimulation}
          disabled={isSimulating}
          className="w-full mb-6 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium disabled:opacity-50"
        >
          {isSimulating ? (
            <>
              <Zap className="w-5 h-5 animate-pulse" />
              Simulating Pipeline...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Run Multi-Stage Simulation
            </>
          )}
        </button>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-semibold mb-3">Bottleneck Analysis</h3>
              <div className="space-y-2">
                {results.bottlenecks?.map((bottleneck, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border ${
                    bottleneck.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                    bottleneck.severity === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                    'bg-yellow-500/10 border-yellow-500/30'
                  }`}>
                    <div className="text-white font-medium mb-1">{bottleneck.stage}</div>
                    <div className="text-white/60 text-sm mb-1">Constraint: {bottleneck.constraint}</div>
                    <div className="text-white/80 text-sm">{bottleneck.impact}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">Architectural Optimizations</h3>
              <div className="space-y-3">
                {results.architecturalOptimizations?.map((opt, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/30">
                    <div className="text-white font-medium mb-2">{opt.optimization}</div>
                    <div className="mb-2">
                      <span className="text-white/50 text-sm">Affected Stages: </span>
                      <span className="text-white/80 text-sm">{opt.affectedStages?.join(', ')}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="p-2 rounded bg-white/5">
                        <div className="text-green-400 text-xs">Time Savings</div>
                        <div className="text-white text-sm">{opt.timeSavings}</div>
                      </div>
                      <div className="p-2 rounded bg-white/5">
                        <div className="text-orange-400 text-xs">Cost Increase</div>
                        <div className="text-white text-sm">${opt.costIncrease}/mo</div>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded p-2 text-white/70 text-xs">
                      {opt.implementation}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border border-blue-500/30">
              <h3 className="text-white font-semibold mb-2">Scaling Strategy (10x workload)</h3>
              <div className="text-cyan-400 text-sm mb-2">{results.scalingStrategy?.approach}</div>
              <ul className="space-y-1 mb-3">
                {results.scalingStrategy?.recommendations?.map((rec, idx) => (
                  <li key={idx} className="text-white/70 text-sm flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5" />
                    {rec}
                  </li>
                ))}
              </ul>
              <div className="text-white/60 text-sm">
                Estimated Cost: ${results.scalingStrategy?.estimatedCost?.toLocaleString()}/month
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}