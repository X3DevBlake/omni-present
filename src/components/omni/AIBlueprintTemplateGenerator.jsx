import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileText, Cpu, CheckCircle, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AIBlueprintTemplateGenerator({ onTemplateGenerated, onClose }) {
  const [requirements, setRequirements] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTemplate, setGeneratedTemplate] = useState(null);

  const generateTemplate = async () => {
    if (!requirements.trim() && !problemStatement.trim()) {
      toast.error('Please provide requirements or a problem statement');
      return;
    }

    setIsGenerating(true);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Generate optimized AI infrastructure blueprint template:
          
          Requirements: ${requirements}
          Problem Statement: ${problemStatement}
          
          Provide:
          1. ARCHITECTURE: Complete blueprint architecture with components
          2. COMPONENT SELECTION: Optimal hardware/software components
          3. INITIAL CONFIGURATION: Ready-to-use settings
          4. COST ESTIMATION: Expected monthly costs
          5. PERFORMANCE PROJECTIONS: Expected throughput and latency
          6. SCALING STRATEGY: How to scale for growth
        `,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            architecture: {
              type: 'object',
              properties: {
                components: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      type: { type: 'string' },
                      specs: { type: 'string' },
                      configuration: { type: 'object' }
                    }
                  }
                },
                topology: { type: 'string' }
              }
            },
            costEstimate: {
              type: 'object',
              properties: {
                monthly: { type: 'number' },
                breakdown: { type: 'array', items: { 
                  type: 'object',
                  properties: {
                    component: { type: 'string' },
                    cost: { type: 'number' }
                  }
                }}
              }
            },
            performance: {
              type: 'object',
              properties: {
                throughput: { type: 'string' },
                latency: { type: 'string' },
                capacity: { type: 'string' }
              }
            },
            scalingStrategy: { type: 'array', items: { type: 'string' } },
            useCases: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setGeneratedTemplate(result);
      toast.success('Blueprint template generated');
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error('Failed to generate template');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveTemplate = async () => {
    await base44.entities.Blueprint.create({
      name: generatedTemplate.name,
      configuration: generatedTemplate.architecture,
      constraints: {
        budget: generatedTemplate.costEstimate.monthly,
        workload: 'ai-generated'
      },
      thumbnail: await generateThumbnail()
    });

    toast.success('Template saved to marketplace');
    onTemplateGenerated?.(generatedTemplate);
  };

  const generateThumbnail = async () => {
    const { url } = await base44.integrations.Core.GenerateImage({
      prompt: `Abstract tech visualization of ${generatedTemplate.name} infrastructure architecture`
    });
    return url;
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
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">AI Blueprint Template Generator</h2>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="text-white/70 text-sm mb-2 block flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Requirements
            </label>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="e.g., Need high-performance GPU cluster for LLM training with 100TB storage..."
              className="w-full h-32 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 resize-none"
            />
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Problem Statement</label>
            <textarea
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="e.g., Process 1M images per day for computer vision pipeline with <100ms latency..."
              className="w-full h-32 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 resize-none"
            />
          </div>
        </div>

        <button
          onClick={generateTemplate}
          disabled={isGenerating}
          className="w-full mb-6 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          {isGenerating ? 'Generating...' : 'Generate Blueprint Template'}
        </button>

        {generatedTemplate && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
              <h3 className="text-purple-400 font-semibold text-lg mb-2">{generatedTemplate.name}</h3>
              <p className="text-white/70 text-sm">{generatedTemplate.description}</p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                Components ({generatedTemplate.architecture.components.length})
              </h4>
              <div className="space-y-2">
                {generatedTemplate.architecture.components.map((comp, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium text-sm">{comp.name}</span>
                      <span className="text-cyan-400 text-xs">{comp.type}</span>
                    </div>
                    <div className="text-white/60 text-xs">{comp.specs}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                <div className="text-green-400 text-sm mb-1">Cost Estimate</div>
                <div className="text-white text-2xl font-bold mb-2">
                  ${generatedTemplate.costEstimate.monthly.toLocaleString()}/mo
                </div>
                {generatedTemplate.costEstimate.breakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-white/60">
                    <span>{item.component}</span>
                    <span>${item.cost}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <div className="text-cyan-400 text-sm mb-2">Performance</div>
                <div className="space-y-1 text-xs text-white/70">
                  <div>Throughput: {generatedTemplate.performance.throughput}</div>
                  <div>Latency: {generatedTemplate.performance.latency}</div>
                  <div>Capacity: {generatedTemplate.performance.capacity}</div>
                </div>
              </div>
            </div>

            {generatedTemplate.scalingStrategy?.length > 0 && (
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                <div className="text-yellow-400 text-sm mb-2">Scaling Strategy</div>
                {generatedTemplate.scalingStrategy.map((strategy, idx) => (
                  <div key={idx} className="text-white/70 text-xs mb-1">• {strategy}</div>
                ))}
              </div>
            )}

            <button
              onClick={saveTemplate}
              className="w-full py-3 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 font-medium flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Save to Marketplace
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}