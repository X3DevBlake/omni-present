import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Star, Download, Upload, X, Sparkles, CheckCircle, Settings } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function AIModelMarketplace({ userContext, onModelSelected, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [recommendations, setRecommendations] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [suitabilityAnalysis, setSuitabilityAnalysis] = useState(null);
  const [fineTuneConfig, setFineTuneConfig] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFineTuning, setIsFineTuning] = useState(false);
  const [governanceReport, setGovernanceReport] = useState(null);
  const [semanticSearch, setSemanticSearch] = useState(null);
  const queryClient = useQueryClient();

  const { data: models } = useQuery({
    queryKey: ['ai-models'],
    queryFn: async () => {
      // Mock data - in production, fetch from actual marketplace
      return [
        {
          id: 'model-1',
          name: 'GPT-Vision Fine-tuned',
          description: 'Computer vision model optimized for infrastructure monitoring',
          author: 'AI Labs',
          version: '2.1.0',
          rating: 4.8,
          downloads: 1247,
          category: 'vision',
          license: 'MIT',
          documentation: 'Full API docs included'
        },
        {
          id: 'model-2',
          name: 'Anomaly Detection XL',
          description: 'Time-series anomaly detection for telemetry data',
          author: 'DataScience Co',
          version: '1.5.2',
          rating: 4.6,
          downloads: 892,
          category: 'detection',
          license: 'Apache 2.0',
          documentation: 'Comprehensive guide with examples'
        },
        {
          id: 'model-3',
          name: 'Resource Optimizer Pro',
          description: 'Multi-cloud resource allocation optimization',
          author: 'CloudOps',
          version: '3.0.1',
          rating: 4.9,
          downloads: 2134,
          category: 'optimization',
          license: 'Commercial',
          documentation: 'Enterprise support available'
        }
      ];
    }
  });

  const deployMutation = useMutation({
    mutationFn: async (model) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return model;
    },
    onSuccess: (model) => {
      toast.success(`${model.name} deployed successfully`);
      onModelSelected?.(model);
    }
  });

  useEffect(() => {
    if (models?.length > 0) {
      getRecommendations();
    }
  }, [models, userContext]);

  const getRecommendations = async () => {
    if (!models) return;
    
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Act as an AI recommender system for model marketplace.
          
          User Context:
          - Blueprint: ${JSON.stringify(userContext?.blueprint)}
          - Past Activity: ${JSON.stringify(userContext?.pastActivity || [])}
          
          Available Models: ${JSON.stringify(models)}
          
          Marketplace Trends:
          - Most downloaded: optimization models
          - Rising: vision and anomaly detection
          - Common use cases: infrastructure monitoring, cost optimization
          
          Analyze and provide:
          1. TOP 3 RECOMMENDATIONS: Models best suited for user's blueprint and needs
          2. COMPATIBILITY SCORE: 0-100 for each model
          3. REASONING: Detailed explanation why each model fits
          4. TRENDING FLAG: If model matches current marketplace trends
          5. USE CASE ALIGNMENT: How model aligns with user's past activity
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  modelId: { type: 'string' },
                  compatibilityScore: { type: 'number' },
                  reasoning: { type: 'string' },
                  isTrending: { type: 'boolean' },
                  useCaseAlignment: { type: 'string' },
                  expectedBenefit: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setRecommendations(result.recommendations);
    } catch (error) {
      console.error('Recommendation failed:', error);
    }
  };

  const analyzeSuitability = async (model) => {
    setSelectedModel(model);
    setIsAnalyzing(true);
    setSuitabilityAnalysis(null);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Analyze model suitability for user's specific requirements.
          
          Model: ${JSON.stringify(model)}
          User Blueprint: ${JSON.stringify(userContext?.blueprint)}
          
          Perform deep analysis:
          1. COMPATIBILITY SCORE: 0-100 based on technical fit
          2. TECHNICAL ALIGNMENT: How model capabilities match blueprint requirements
          3. PERFORMANCE EXPECTATIONS: Predicted latency, throughput, accuracy
          4. INTEGRATION COMPLEXITY: Easy/Medium/Hard with reasoning
          5. COST IMPACT: Expected operational costs
          6. RISK ASSESSMENT: Potential issues or limitations
          7. RECOMMENDATION: Deploy as-is / Fine-tune first / Consider alternatives
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            compatibilityScore: { type: 'number' },
            technicalAlignment: {
              type: 'object',
              properties: {
                strengths: { type: 'array', items: { type: 'string' } },
                gaps: { type: 'array', items: { type: 'string' } }
              }
            },
            performanceExpectations: {
              type: 'object',
              properties: {
                latency: { type: 'string' },
                throughput: { type: 'string' },
                accuracy: { type: 'string' }
              }
            },
            integrationComplexity: { type: 'string' },
            costImpact: { type: 'string' },
            risks: { type: 'array', items: { type: 'string' } },
            recommendation: { type: 'string' },
            detailedReasoning: { type: 'string' }
          }
        }
      });

      setSuitabilityAnalysis(result);
      toast.success('Suitability analysis complete');
    } catch (error) {
      console.error('Suitability analysis failed:', error);
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const initializeFineTuning = async (model) => {
    setIsFineTuning(true);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Generate automated fine-tuning configuration for model adaptation.
          
          Model: ${JSON.stringify(model)}
          User Blueprint: ${JSON.stringify(userContext?.blueprint)}
          
          Create fine-tuning plan:
          1. DATASET RECOMMENDATIONS: What data to use for fine-tuning
          2. HYPERPARAMETERS: Optimal learning rate, batch size, epochs
          3. TRAINING STRATEGY: Full fine-tune vs LoRA vs adapter
          4. ESTIMATED TIME: Training duration
          5. EXPECTED IMPROVEMENTS: Performance gains after fine-tuning
          6. VALIDATION METRICS: How to measure success
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            datasetRecommendations: {
              type: 'array',
              items: { type: 'string' }
            },
            hyperparameters: {
              type: 'object',
              properties: {
                learningRate: { type: 'number' },
                batchSize: { type: 'number' },
                epochs: { type: 'number' }
              }
            },
            trainingStrategy: { type: 'string' },
            estimatedTime: { type: 'string' },
            expectedImprovements: { type: 'string' },
            validationMetrics: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setFineTuneConfig(result);
      toast.success('Fine-tuning configuration ready');
    } catch (error) {
      console.error('Fine-tuning initialization failed:', error);
      toast.error('Failed to initialize fine-tuning');
    } finally {
      setIsFineTuning(false);
    }
  };

  const startFineTuning = async () => {
    toast.info('Starting automated fine-tuning...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success('Fine-tuning pipeline initiated');
    setFineTuneConfig(null);
  };

  const scanModelGovernance = async (model) => {
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Comprehensive AI governance scan for marketplace model.
          
          Model: ${JSON.stringify(model)}
          
          Scan for:
          1. SECURITY VULNERABILITIES: Code injection, backdoors, malicious patterns
          2. LICENSE COMPLIANCE: Check against common licenses (MIT, Apache, GPL)
          3. ETHICAL IMPLICATIONS: Bias detection, fairness concerns
          4. PERFORMANCE MONITORING: Long-term degradation patterns
          5. UNINTENDED CONSEQUENCES: Edge cases, unexpected behaviors
          
          Provide:
          - Security score (0-100)
          - License compliance status
          - Bias/fairness analysis
          - Deployment recommendations
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            securityScore: { type: 'number' },
            vulnerabilities: { type: 'array', items: { type: 'string' } },
            licenseCompliance: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                detectedLicense: { type: 'string' },
                conflicts: { type: 'array', items: { type: 'string' } }
              }
            },
            ethicalAnalysis: {
              type: 'object',
              properties: {
                biasDetected: { type: 'boolean' },
                biasTypes: { type: 'array', items: { type: 'string' } },
                fairnessScore: { type: 'number' },
                recommendations: { type: 'array', items: { type: 'string' } }
              }
            },
            performanceMonitoring: {
              type: 'object',
              properties: {
                driftPrediction: { type: 'string' },
                longTermReliability: { type: 'number' }
              }
            },
            approved: { type: 'boolean' },
            reasoning: { type: 'string' }
          }
        }
      });

      setGovernanceReport(result);
      toast.success('Governance scan complete');
    } catch (error) {
      console.error('Governance scan failed:', error);
      toast.error('Scan failed');
    }
  };

  const performSemanticSearch = async (requirements) => {
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Advanced semantic model discovery for complex organizational needs.
          
          User Requirements: ${requirements}
          User Context: ${JSON.stringify(userContext)}
          Available Models: ${JSON.stringify(models)}
          
          Go beyond keyword matching:
          1. SEMANTIC UNDERSTANDING: Interpret intent and requirements
          2. CAPABILITY MATCHING: Match model capabilities to needs
          3. USE CASE ALIGNMENT: Industry-specific recommendations
          4. TEAM READINESS: Consider expertise level
          5. INTEGRATION COMPLEXITY: Match to organizational capabilities
          
          Recommend highly relevant models with detailed reasoning.
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            matches: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  modelId: { type: 'string' },
                  relevanceScore: { type: 'number' },
                  semanticReasoning: { type: 'string' },
                  capabilityMatch: { type: 'string' },
                  implementationPath: { type: 'string' }
                }
              }
            },
            alternativeSuggestions: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setSemanticSearch(result);
      toast.success('Semantic search complete');
    } catch (error) {
      console.error('Semantic search failed:', error);
    }
  };

  const filteredModels = models?.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         model.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || model.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            <Store className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">AI Model Marketplace</h2>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.length > 10) {
                performSemanticSearch(searchQuery);
              }
            }}
            placeholder="Describe your needs (e.g., 'detect fraud in financial transactions')..."
            className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40"
          />
          <button
            onClick={() => performSemanticSearch(searchQuery)}
            disabled={searchQuery.length < 10}
            className="px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            Semantic Search
          </button>
          <button
            onClick={getRecommendations}
            className="px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            AI Recommendations
          </button>
        </div>

        {/* Semantic Search Results */}
        {semanticSearch && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30">
            <h3 className="text-purple-400 font-semibold mb-3">🔍 Semantic Search Results</h3>
            <div className="space-y-2">
              {semanticSearch.matches?.map((match) => {
                const model = models?.find(m => m.id === match.modelId);
                if (!model) return null;
                return (
                  <div key={match.modelId} className="p-3 rounded bg-black/30">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-white font-medium mb-1">{model.name}</div>
                        <div className="text-purple-400 text-sm mb-1">{match.semanticReasoning}</div>
                        <div className="text-white/60 text-xs">{match.capabilityMatch}</div>
                      </div>
                      <div className="text-purple-400 font-bold text-lg">{match.relevanceScore}</div>
                    </div>
                    <div className="text-cyan-400 text-xs">Path: {match.implementationPath}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Recommendations Section */}
        {recommendations && recommendations.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-semibold">AI Recommended For You</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {recommendations.map((rec) => {
                const model = models?.find(m => m.id === rec.modelId);
                if (!model) return null;
                
                return (
                  <div key={rec.modelId} className="p-3 rounded-lg bg-black/30 border border-purple-500/20">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm mb-1">{model.name}</div>
                        {rec.isTrending && (
                          <span className="px-2 py-0.5 rounded text-xs bg-pink-500/20 text-pink-400">
                            🔥 Trending
                          </span>
                        )}
                      </div>
                      <div className="text-purple-400 font-bold text-lg">{rec.compatibilityScore}</div>
                    </div>
                    <div className="text-white/60 text-xs mb-2">{rec.reasoning}</div>
                    <div className="text-cyan-400 text-xs mb-2">{rec.expectedBenefit}</div>
                    <button
                      onClick={() => analyzeSuitability(model)}
                      className="w-full py-1.5 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-xs"
                    >
                      Analyze Suitability
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6">
          {['all', 'vision', 'detection', 'optimization'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-500/20 border border-purple-500/40 text-purple-400'
                  : 'bg-white/5 border border-white/10 text-white/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filteredModels?.map((model) => (
            <div key={model.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">{model.name}</h3>
                  <p className="text-white/60 text-sm mb-2">{model.description}</p>
                  <div className="flex items-center gap-3 text-xs text-white/50">
                    <span>by {model.author}</span>
                    <span>v{model.version}</span>
                    <span>{model.license}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-white text-sm">{model.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/60 text-sm">
                    <Download className="w-4 h-4" />
                    {model.downloads}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400">
                  {model.category}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => scanModelGovernance(model)}
                  className="flex-1 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-sm"
                >
                  🛡️ Scan
                </button>
                <button
                  onClick={() => analyzeSuitability(model)}
                  className="flex-1 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm"
                >
                  Check Fit
                </button>
                <button
                  onClick={() => deployMutation.mutate(model)}
                  disabled={deployMutation.isPending}
                  className="flex-1 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm disabled:opacity-50"
                >
                  Deploy
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Suitability Analysis Modal */}
        <AnimatePresence>
          {selectedModel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10 flex items-center justify-center bg-black/60"
              onClick={() => setSelectedModel(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-black/95 border border-white/20 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold text-xl">Model Suitability Analysis</h3>
                  <button onClick={() => setSelectedModel(null)} className="text-white/60 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="text-white font-medium mb-2">{selectedModel.name}</div>
                  <div className="text-white/60 text-sm">{selectedModel.description}</div>
                </div>

                {isAnalyzing ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <div className="text-white/70">Analyzing model suitability...</div>
                    </div>
                  </div>
                ) : suitabilityAnalysis ? (
                  <div className="space-y-4">
                    {/* Compatibility Score */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">Compatibility Score</span>
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-bold text-green-400">{suitabilityAnalysis.compatibilityScore}</span>
                          <span className="text-white/60">/100</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-cyan-500"
                          style={{ width: `${suitabilityAnalysis.compatibilityScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Technical Alignment */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <h4 className="text-white font-semibold mb-3">Technical Alignment</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-green-400 text-sm font-medium mb-2">✓ Strengths</div>
                          {suitabilityAnalysis.technicalAlignment?.strengths?.map((strength, i) => (
                            <div key={i} className="text-white/70 text-xs mb-1">• {strength}</div>
                          ))}
                        </div>
                        <div>
                          <div className="text-yellow-400 text-sm font-medium mb-2">⚠ Gaps</div>
                          {suitabilityAnalysis.technicalAlignment?.gaps?.map((gap, i) => (
                            <div key={i} className="text-white/70 text-xs mb-1">• {gap}</div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Performance Expectations */}
                    <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                      <h4 className="text-cyan-400 font-semibold mb-3">Performance Expectations</h4>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <div className="text-white/50 mb-1">Latency</div>
                          <div className="text-white">{suitabilityAnalysis.performanceExpectations?.latency}</div>
                        </div>
                        <div>
                          <div className="text-white/50 mb-1">Throughput</div>
                          <div className="text-white">{suitabilityAnalysis.performanceExpectations?.throughput}</div>
                        </div>
                        <div>
                          <div className="text-white/50 mb-1">Accuracy</div>
                          <div className="text-white">{suitabilityAnalysis.performanceExpectations?.accuracy}</div>
                        </div>
                      </div>
                    </div>

                    {/* Integration & Cost */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-white/5">
                        <div className="text-white/60 text-xs mb-1">Integration Complexity</div>
                        <div className="text-white font-medium">{suitabilityAnalysis.integrationComplexity}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5">
                        <div className="text-white/60 text-xs mb-1">Cost Impact</div>
                        <div className="text-white font-medium">{suitabilityAnalysis.costImpact}</div>
                      </div>
                    </div>

                    {/* Risks */}
                    {suitabilityAnalysis.risks?.length > 0 && (
                      <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
                        <h4 className="text-orange-400 font-semibold mb-2">Risk Assessment</h4>
                        {suitabilityAnalysis.risks.map((risk, i) => (
                          <div key={i} className="text-white/70 text-sm mb-1">⚠ {risk}</div>
                        ))}
                      </div>
                    )}

                    {/* Recommendation */}
                    <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                      <h4 className="text-purple-400 font-semibold mb-2">AI Recommendation</h4>
                      <div className="text-white/80 text-sm mb-2">{suitabilityAnalysis.recommendation}</div>
                      <div className="text-white/60 text-xs">{suitabilityAnalysis.detailedReasoning}</div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => deployMutation.mutate(selectedModel)}
                        className="flex-1 py-3 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 font-medium flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Deploy Model
                      </button>
                      <button
                        onClick={() => {
                          initializeFineTuning(selectedModel);
                          setSelectedModel(null);
                        }}
                        className="px-6 py-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-medium"
                      >
                        Fine-tune First
                      </button>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fine-tuning Configuration Modal */}
        <AnimatePresence>
          {fineTuneConfig && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10 flex items-center justify-center bg-black/60"
              onClick={() => setFineTuneConfig(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-black/95 border border-white/20 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-white font-semibold text-xl">Automated Fine-tuning Configuration</h3>
                  </div>
                  <button onClick={() => setFineTuneConfig(null)} className="text-white/60 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Dataset */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <h4 className="text-white font-semibold mb-2">Recommended Datasets</h4>
                    {fineTuneConfig.datasetRecommendations?.map((dataset, i) => (
                      <div key={i} className="text-white/70 text-sm mb-1">• {dataset}</div>
                    ))}
                  </div>

                  {/* Hyperparameters */}
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                    <h4 className="text-cyan-400 font-semibold mb-3">Optimal Hyperparameters</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <div className="text-white/50 text-xs mb-1">Learning Rate</div>
                        <div className="text-white font-mono">{fineTuneConfig.hyperparameters?.learningRate}</div>
                      </div>
                      <div>
                        <div className="text-white/50 text-xs mb-1">Batch Size</div>
                        <div className="text-white font-mono">{fineTuneConfig.hyperparameters?.batchSize}</div>
                      </div>
                      <div>
                        <div className="text-white/50 text-xs mb-1">Epochs</div>
                        <div className="text-white font-mono">{fineTuneConfig.hyperparameters?.epochs}</div>
                      </div>
                    </div>
                  </div>

                  {/* Strategy & Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-white/5">
                      <div className="text-white/60 text-xs mb-1">Training Strategy</div>
                      <div className="text-white font-medium">{fineTuneConfig.trainingStrategy}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5">
                      <div className="text-white/60 text-xs mb-1">Estimated Time</div>
                      <div className="text-white font-medium">{fineTuneConfig.estimatedTime}</div>
                    </div>
                  </div>

                  {/* Expected Improvements */}
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                    <h4 className="text-green-400 font-semibold mb-2">Expected Improvements</h4>
                    <div className="text-white/80 text-sm">{fineTuneConfig.expectedImprovements}</div>
                  </div>

                  {/* Validation Metrics */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <h4 className="text-white font-semibold mb-2">Validation Metrics</h4>
                    {fineTuneConfig.validationMetrics?.map((metric, i) => (
                      <div key={i} className="text-white/70 text-sm mb-1">✓ {metric}</div>
                    ))}
                  </div>

                  <button
                    onClick={startFineTuning}
                    disabled={isFineTuning}
                    className="w-full py-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-medium disabled:opacity-50"
                  >
                    {isFineTuning ? 'Initializing...' : 'Start Automated Fine-tuning'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}