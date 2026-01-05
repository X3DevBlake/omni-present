import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Star, Download, Upload, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function AIModelMarketplace({ userContext, onModelSelected, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
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

  const getRecommendations = async () => {
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Recommend AI models for user context:
          
          Context: ${JSON.stringify(userContext)}
          Available models: ${JSON.stringify(models)}
          
          Provide:
          1. TOP RECOMMENDATIONS: Best matching models
          2. REASONING: Why each model fits
          3. INTEGRATION NOTES: How to integrate with blueprints
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
                  score: { type: 'number' },
                  reasoning: { type: 'string' }
                }
              }
            }
          }
        }
      });

      toast.success('AI recommendations generated');
      return result.recommendations;
    } catch (error) {
      console.error('Recommendation failed:', error);
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
            placeholder="Search models..."
            className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40"
          />
          <button
            onClick={getRecommendations}
            className="px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400"
          >
            Get AI Recommendations
          </button>
        </div>

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
                  onClick={() => deployMutation.mutate(model)}
                  disabled={deployMutation.isPending}
                  className="flex-1 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm disabled:opacity-50"
                >
                  Deploy
                </button>
                <button className="px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-sm">
                  Fine-tune
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}