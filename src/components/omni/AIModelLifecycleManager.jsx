import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AIModelLifecycleManager({ 
  deployedModels, 
  monitoringData,
  onInitiateRetraining,
  onClose 
}) {
  const [modelAnalysis, setModelAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);

  useEffect(() => {
    analyzeModels();
    const interval = setInterval(analyzeModels, 15000);
    return () => clearInterval(interval);
  }, [deployedModels, monitoringData]);

  const analyzeModels = async () => {
    if (!deployedModels?.length) return;
    
    setIsAnalyzing(true);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Analyze AI model lifecycle and performance drift:
          
          Deployed Models: ${JSON.stringify(deployedModels)}
          Monitoring Data: ${JSON.stringify(monitoringData)}
          
          For each model, analyze:
          1. PERFORMANCE DRIFT: Compare current metrics vs baseline (accuracy, latency, throughput)
          2. DATA DRIFT: Input distribution changes affecting model quality
          3. RETRAINING NEEDS: When and why retraining is required
          4. VERSION STRATEGY: A/B testing approach, rollout strategy
          5. LIFECYCLE STAGE: Development, staging, production, deprecated
          6. HEALTH SCORE: Overall model health (0-100)
          
          Provide recommendations for:
          - Models requiring immediate retraining
          - Models suitable for fine-tuning vs full retraining
          - A/B testing strategies for model updates
          - Automatic deployment triggers
          - Versioning and rollback strategies
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            models: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  modelId: { type: 'string' },
                  modelName: { type: 'string' },
                  healthScore: { type: 'number' },
                  performanceDrift: { type: 'number' },
                  dataDrift: { type: 'number' },
                  retrainingRequired: { type: 'boolean' },
                  retrainingUrgency: { type: 'string' },
                  recommendedAction: { type: 'string' },
                  abTestingStrategy: { type: 'string' },
                  lifecycleStage: { type: 'string' },
                  metrics: {
                    type: 'object',
                    properties: {
                      accuracy: { type: 'number' },
                      latency: { type: 'number' },
                      throughput: { type: 'number' }
                    }
                  }
                }
              }
            },
            criticalModels: { type: 'array', items: { type: 'string' } },
            automatedActions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  modelId: { type: 'string' },
                  action: { type: 'string' },
                  scheduledTime: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setModelAnalysis(result);

      // Check for critical models requiring immediate attention
      if (result.criticalModels?.length > 0) {
        toast.warning(`${result.criticalModels.length} models require immediate attention`);
      }

    } catch (error) {
      console.error('Model analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const initiateRetraining = async (model) => {
    try {
      await onInitiateRetraining?.({
        modelId: model.modelId,
        retrainingType: model.recommendedAction.includes('fine-tune') ? 'fine-tune' : 'full',
        abTestingEnabled: true,
        rolloutStrategy: model.abTestingStrategy
      });

      toast.success(`Retraining initiated for ${model.modelName}`);
    } catch (error) {
      console.error('Failed to initiate retraining:', error);
      toast.error('Failed to start retraining pipeline');
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
        className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">AI Model Lifecycle Manager</h2>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {modelAnalysis?.models && (
          <div className="space-y-4">
            {/* Critical Models Alert */}
            {modelAnalysis.criticalModels?.length > 0 && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-semibold">
                    {modelAnalysis.criticalModels.length} Critical Models Requiring Attention
                  </span>
                </div>
                <div className="text-white/70 text-sm">
                  {modelAnalysis.criticalModels.join(', ')}
                </div>
              </div>
            )}

            {/* Model Cards */}
            {modelAnalysis.models.map((model) => {
              const isSelected = selectedModel?.modelId === model.modelId;
              const needsAttention = modelAnalysis.criticalModels?.includes(model.modelId);

              return (
                <div
                  key={model.modelId}
                  onClick={() => setSelectedModel(model)}
                  className={`p-5 rounded-xl border cursor-pointer transition-all ${
                    needsAttention ? 'bg-red-500/10 border-red-500/40' :
                    model.healthScore > 80 ? 'bg-green-500/10 border-green-500/30' :
                    'bg-yellow-500/10 border-yellow-500/30'
                  } ${isSelected ? 'ring-2 ring-cyan-500' : ''}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold">{model.modelName}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          model.lifecycleStage === 'production' ? 'bg-green-500/20 text-green-400' :
                          model.lifecycleStage === 'staging' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {model.lifecycleStage}
                        </span>
                        {model.retrainingRequired && (
                          <span className="px-2 py-0.5 rounded text-xs bg-orange-500/20 text-orange-400">
                            {model.retrainingUrgency}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm mb-3">
                        <div>
                          <span className="text-white/50">Health:</span>
                          <span className={`ml-2 font-semibold ${
                            model.healthScore > 80 ? 'text-green-400' :
                            model.healthScore > 60 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {model.healthScore}/100
                          </span>
                        </div>
                        <div>
                          <span className="text-white/50">Perf. Drift:</span>
                          <span className={`ml-2 ${model.performanceDrift > 15 ? 'text-red-400' : 'text-white/80'}`}>
                            {model.performanceDrift}%
                          </span>
                        </div>
                        <div>
                          <span className="text-white/50">Data Drift:</span>
                          <span className={`ml-2 ${model.dataDrift > 20 ? 'text-red-400' : 'text-white/80'}`}>
                            {model.dataDrift}%
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="p-2 rounded bg-black/30">
                          <div className="text-white/50 text-xs mb-1">Accuracy</div>
                          <div className="text-white font-medium">{model.metrics?.accuracy}%</div>
                        </div>
                        <div className="p-2 rounded bg-black/30">
                          <div className="text-white/50 text-xs mb-1">Latency</div>
                          <div className="text-white font-medium">{model.metrics?.latency}ms</div>
                        </div>
                        <div className="p-2 rounded bg-black/30">
                          <div className="text-white/50 text-xs mb-1">Throughput</div>
                          <div className="text-white font-medium">{model.metrics?.throughput}/s</div>
                        </div>
                      </div>

                      <div className="text-white/70 text-sm mb-2">
                        <span className="text-white/50">Recommendation:</span> {model.recommendedAction}
                      </div>
                      
                      {model.abTestingStrategy && (
                        <div className="text-cyan-400 text-xs">
                          A/B Strategy: {model.abTestingStrategy}
                        </div>
                      )}
                    </div>

                    {model.retrainingRequired && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          initiateRetraining(model);
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-400"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Retrain
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Automated Actions Schedule */}
            {modelAnalysis.automatedActions?.length > 0 && (
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <h3 className="text-cyan-400 font-semibold mb-3">Scheduled Automated Actions</h3>
                <div className="space-y-2">
                  {modelAnalysis.automatedActions.map((action, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded bg-black/30">
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium mb-1">{action.action}</div>
                        <div className="text-white/60 text-xs">Model: {action.modelId}</div>
                      </div>
                      <div className="text-cyan-400 text-sm">{action.scheduledTime}</div>
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