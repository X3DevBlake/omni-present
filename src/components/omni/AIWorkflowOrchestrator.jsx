import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Network, Play, RotateCcw, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AIWorkflowOrchestrator({ deployedBlueprints, onClose }) {
  const [workflow, setWorkflow] = useState(null);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [executionLog, setExecutionLog] = useState([]);

  const analyzeWorkflow = async () => {
    setIsOrchestrating(true);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Analyze and optimize workflow for deployed services:
          
          Services: ${JSON.stringify(deployedBlueprints)}
          
          Determine:
          1. SERVICE DEPENDENCIES: Which services depend on others
          2. OPTIMAL EXECUTION ORDER: Best sequence for performance and cost
          3. PARALLELIZATION: What can run concurrently
          4. RETRY STRATEGIES: How to handle failures for each component
          5. RESOURCE OPTIMIZATION: Load balancing and scheduling
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            executionPlan: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  stage: { type: 'number' },
                  services: { type: 'array', items: { type: 'string' } },
                  parallel: { type: 'boolean' },
                  estimatedDuration: { type: 'string' }
                }
              }
            },
            dependencies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  service: { type: 'string' },
                  dependsOn: { type: 'array', items: { type: 'string' } }
                }
              }
            },
            retryStrategies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  service: { type: 'string' },
                  maxRetries: { type: 'number' },
                  backoffStrategy: { type: 'string' }
                }
              }
            },
            optimizations: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setWorkflow(result);
    } catch (error) {
      console.error('Workflow analysis failed:', error);
    } finally {
      setIsOrchestrating(false);
    }
  };

  const executeWorkflow = async () => {
    if (!workflow) return;

    setExecutionLog([]);
    
    for (const stage of workflow.executionPlan) {
      const stageLog = {
        stage: stage.stage,
        services: stage.services,
        status: 'running',
        startTime: Date.now()
      };
      
      setExecutionLog(prev => [...prev, stageLog]);

      // Simulate execution with potential failures
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const success = Math.random() > 0.15;
      
      if (!success) {
        // Apply retry strategy
        const retryStrategy = workflow.retryStrategies.find(r => 
          stage.services.includes(r.service)
        );
        
        if (retryStrategy) {
          toast.warning(`Retrying ${stage.services[0]} (${retryStrategy.maxRetries} attempts)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      stageLog.status = success ? 'completed' : 'failed';
      stageLog.endTime = Date.now();
      setExecutionLog(prev => prev.map(l => l.stage === stage.stage ? stageLog : l));

      if (success) {
        toast.success(`Stage ${stage.stage} completed`);
      } else {
        toast.error(`Stage ${stage.stage} failed`);
        break;
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Network className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">AI Workflow Orchestrator</h2>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <button
          onClick={analyzeWorkflow}
          disabled={isOrchestrating}
          className="w-full mb-6 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-medium disabled:opacity-50"
        >
          {isOrchestrating ? 'Analyzing...' : 'Analyze Workflow'}
        </button>

        {workflow && (
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-semibold mb-3">Execution Plan</h3>
              <div className="space-y-2">
                {workflow.executionPlan.map((stage, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">Stage {stage.stage}</span>
                        {stage.parallel && (
                          <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400">
                            Parallel
                          </span>
                        )}
                      </div>
                      <span className="text-white/60 text-sm">{stage.estimatedDuration}</span>
                    </div>
                    <div className="text-white/70 text-sm">
                      Services: {stage.services.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
              <h3 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Retry Strategies
              </h3>
              {workflow.retryStrategies.map((strategy, idx) => (
                <div key={idx} className="mb-2 text-sm">
                  <span className="text-white font-medium">{strategy.service}:</span>
                  <span className="text-white/70 ml-2">
                    {strategy.maxRetries} retries, {strategy.backoffStrategy}
                  </span>
                </div>
              ))}
            </div>

            {workflow.optimizations?.length > 0 && (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                <h3 className="text-green-400 font-semibold mb-2">Optimizations Applied</h3>
                {workflow.optimizations.map((opt, idx) => (
                  <div key={idx} className="text-white/70 text-sm mb-1">• {opt}</div>
                ))}
              </div>
            )}

            <button
              onClick={executeWorkflow}
              className="w-full py-3 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 font-medium flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Execute Workflow
            </button>

            {executionLog.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3">Execution Log</h3>
                <div className="space-y-2">
                  {executionLog.map((log, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border ${
                      log.status === 'completed' ? 'bg-green-500/10 border-green-500/30' :
                      log.status === 'failed' ? 'bg-red-500/10 border-red-500/30' :
                      'bg-yellow-500/10 border-yellow-500/30'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {log.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-400" />}
                          {log.status === 'failed' && <X className="w-4 h-4 text-red-400" />}
                          {log.status === 'running' && <RotateCcw className="w-4 h-4 text-yellow-400 animate-spin" />}
                          <span className="text-white text-sm">Stage {log.stage}</span>
                        </div>
                        <span className="text-white/60 text-xs">
                          {log.endTime ? `${((log.endTime - log.startTime) / 1000).toFixed(1)}s` : 'Running...'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}