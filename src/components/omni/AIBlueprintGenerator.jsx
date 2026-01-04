import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AIBlueprintGenerator({ onBlueprintGenerated }) {
  const [description, setDescription] = useState('');
  const [workloadType, setWorkloadType] = useState('training');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    setIsGenerating(true);

    try {
      const prompt = `
        Generate an optimal AI infrastructure blueprint configuration based on these requirements:
        
        Description: ${description}
        Workload Type: ${workloadType}
        
        Analyze the requirements and provide:
        1. Component selection (GPUs, CPUs, memory, storage, networking)
        2. Specific hardware models and quantities
        3. Configuration parameters for each component
        4. Estimated performance and cost
        5. Reasoning for each choice
        
        Return a structured blueprint configuration with all technical specifications.
      `;

      const blueprint = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            components: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  model: { type: 'string' },
                  quantity: { type: 'number' },
                  specs: { type: 'object' },
                  reasoning: { type: 'string' }
                }
              }
            },
            configuration: {
              type: 'object',
              properties: {
                gpuCount: { type: 'number' },
                memoryGB: { type: 'number' },
                storageGB: { type: 'number' },
                networkBandwidth: { type: 'string' }
              }
            },
            estimatedPerformance: { type: 'number' },
            estimatedCost: { type: 'number' },
            workloadOptimizations: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      });

      toast.success('Blueprint generated successfully');
      onBlueprintGenerated?.({
        ...blueprint,
        workloadType,
        generatedFrom: description
      });
      setDescription('');
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error('Failed to generate blueprint');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold">AI Blueprint Generator</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-white/70 text-sm mb-2 block">Workload Type</label>
            <select
              value={workloadType}
              onChange={(e) => setWorkloadType(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="training">Deep Learning Training</option>
              <option value="inference">Real-time Inference</option>
              <option value="data-processing">Data Processing Pipeline</option>
              <option value="multi-model">Multi-Model Serving</option>
              <option value="research">Research & Experimentation</option>
            </select>
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Describe Your Requirements</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., I need infrastructure for training large language models with 70B parameters, handling 1000 requests per second, with 99.9% uptime..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 min-h-[100px] resize-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !description.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Blueprint...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Generate Blueprint
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}