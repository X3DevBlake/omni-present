import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Search, Star, Download, Upload, X, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function BlueprintMarketplace({ onSelectTemplate, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const queryClient = useQueryClient();

  const { data: templates } = useQuery({
    queryKey: ['marketplace-templates', selectedCategory],
    queryFn: async () => {
      const allBlueprints = await base44.entities.Blueprint.list('-created_date');
      return allBlueprints.filter(b => b.shared_with?.includes('marketplace'));
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (blueprint) => {
      return base44.entities.Blueprint.update(blueprint.id, {
        ...blueprint,
        shared_with: [...(blueprint.shared_with || []), 'marketplace']
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-templates'] });
      toast.success('Blueprint published to marketplace');
    },
  });

  const mockTemplates = [
    {
      id: 'template-1',
      name: 'LLM Training Cluster',
      description: 'Optimized for training large language models up to 175B parameters',
      author: 'Alice Chen',
      rating: 4.8,
      downloads: 1247,
      category: 'training',
      tags: ['llm', 'training', 'high-performance'],
      estimatedCost: 15000,
      performance: 2500
    },
    {
      id: 'template-2',
      name: 'Real-time Inference Pipeline',
      description: 'Low-latency inference for production serving',
      author: 'Bob Martinez',
      rating: 4.9,
      downloads: 2103,
      category: 'inference',
      tags: ['inference', 'low-latency', 'production'],
      estimatedCost: 5000,
      performance: 1800
    },
    {
      id: 'template-3',
      name: 'Multi-Model Serving Hub',
      description: 'Efficient serving of multiple models simultaneously',
      author: 'Carol Lee',
      rating: 4.7,
      downloads: 856,
      category: 'serving',
      tags: ['multi-model', 'serving', 'scalable'],
      estimatedCost: 8000,
      performance: 2000
    }
  ];

  const filteredTemplates = mockTemplates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
        className="w-full max-w-6xl h-[90vh] bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Store className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Blueprint Marketplace</h2>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="training">Training</option>
              <option value="inference">Inference</option>
              <option value="serving">Serving</option>
              <option value="research">Research</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <motion.div
                key={template.id}
                whileHover={{ scale: 1.02 }}
                className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 cursor-pointer transition-all"
                onClick={() => {
                  onSelectTemplate?.(template);
                  toast.success(`Loaded template: ${template.name}`);
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{template.name}</h3>
                    <p className="text-white/60 text-sm mb-2">{template.description}</p>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm">{template.rating}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-white/50 text-xs">by {template.author}</span>
                  <span className="text-white/30">•</span>
                  <div className="flex items-center gap-1 text-white/50 text-xs">
                    <Download className="w-3 h-3" />
                    {template.downloads}
                  </div>
                </div>

                <div className="flex gap-2 mb-3">
                  {template.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div className="text-xs">
                    <span className="text-white/50">Cost:</span>
                    <span className="text-white ml-1">${template.estimatedCost}/mo</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-white/50">Performance:</span>
                    <span className="text-white ml-1">{template.performance} TFLOPS</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}