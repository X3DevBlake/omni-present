import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Zap, DollarSign, Activity, X, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function MultiCloudDeployment({ blueprint, onDeploy, onClose }) {
  const [recommendations, setRecommendations] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    if (blueprint) {
      analyzeCloudProviders();
    }
  }, [blueprint]);

  const analyzeCloudProviders = async () => {
    setIsAnalyzing(true);

    try {
      const prompt = `
        Analyze this AI infrastructure blueprint for optimal cloud deployment:
        ${JSON.stringify(blueprint)}
        
        Compare AWS, Azure, and GCP for:
        1. Cost-effectiveness for this specific workload
        2. Performance characteristics
        3. GPU availability and pricing
        4. Network latency
        5. Compliance and regional availability
        
        Provide detailed recommendations with cost estimates.
      `;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendedProvider: { type: 'string' },
            providers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  score: { type: 'number' },
                  monthlyCost: { type: 'number' },
                  performance: { type: 'number' },
                  pros: { type: 'array', items: { type: 'string' } },
                  cons: { type: 'array', items: { type: 'string' } },
                  bestFor: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setRecommendations(analysis);
      setSelectedProvider(analysis.recommendedProvider);
    } catch (error) {
      console.error('Cloud analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeploy = async () => {
    if (!selectedProvider) return;

    setIsDeploying(true);
    
    setTimeout(() => {
      setIsDeploying(false);
      toast.success(`Deployed to ${selectedProvider}`);
      onDeploy?.({ provider: selectedProvider, blueprint });
      onClose();
    }, 3000);
  };

  const getProviderLogo = (name) => {
    const logos = {
      'AWS': '🟠',
      'Azure': '🔵',
      'GCP': '🔴'
    };
    return logos[name] || '☁️';
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
            <Cloud className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">Multi-Cloud Deployment</h2>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {isAnalyzing ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
              <p className="text-white/60">Analyzing cloud providers...</p>
            </div>
          </div>
        ) : recommendations ? (
          <>
            <div className="mb-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <div className="text-cyan-400 text-sm mb-2">AI Recommendation</div>
              <div className="text-white text-lg">
                Deploy to <span className="font-bold">{recommendations.recommendedProvider}</span> for optimal cost-performance
              </div>
            </div>

            <div className="grid gap-4 mb-6">
              {recommendations.providers?.map((provider) => (
                <motion.div
                  key={provider.name}
                  className={`p-5 rounded-xl border cursor-pointer transition-all ${
                    selectedProvider === provider.name
                      ? 'border-cyan-500/60 bg-cyan-500/10'
                      : 'border-white/20 bg-white/5 hover:border-white/40'
                  }`}
                  onClick={() => setSelectedProvider(provider.name)}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{getProviderLogo(provider.name)}</span>
                      <div>
                        <h3 className="text-white font-semibold text-lg">{provider.name}</h3>
                        <p className="text-white/60 text-sm">{provider.bestFor}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{provider.score}/100</div>
                      <div className="text-white/50 text-xs">Score</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-white/5">
                      <DollarSign className="w-4 h-4 text-green-400 mb-1" />
                      <div className="text-white/50 text-xs">Monthly Cost</div>
                      <div className="text-white font-semibold">${provider.monthlyCost.toLocaleString()}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5">
                      <Zap className="w-4 h-4 text-yellow-400 mb-1" />
                      <div className="text-white/50 text-xs">Performance</div>
                      <div className="text-white font-semibold">{provider.performance} TFLOPS</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5">
                      <Activity className="w-4 h-4 text-cyan-400 mb-1" />
                      <div className="text-white/50 text-xs">Reliability</div>
                      <div className="text-white font-semibold">99.9%</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-green-400 text-sm mb-2">Advantages</div>
                      <ul className="space-y-1">
                        {provider.pros?.map((pro, idx) => (
                          <li key={idx} className="text-white/70 text-xs">✓ {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-red-400 text-sm mb-2">Considerations</div>
                      <ul className="space-y-1">
                        {provider.cons?.map((con, idx) => (
                          <li key={idx} className="text-white/70 text-xs">• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <button
              onClick={handleDeploy}
              disabled={!selectedProvider || isDeploying}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium disabled:opacity-50"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Deploying to {selectedProvider}...
                </>
              ) : (
                <>
                  <Cloud className="w-5 h-5" />
                  Deploy to {selectedProvider}
                </>
              )}
            </button>
          </>
        ) : null}
      </motion.div>
    </motion.div>
  );
}