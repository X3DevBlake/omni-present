import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader, Zap, DollarSign, Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const objectives = [
  { id: 'web-cluster', label: 'Scalable Web Server', icon: Zap, description: 'High-availability web serving' },
  { id: 'ml-training', label: 'ML Training Pipeline', icon: Target, description: 'GPU-optimized AI training' },
  { id: 'data-processing', label: 'Data Processing', icon: Sparkles, description: 'ETL and batch processing' },
  { id: 'cost-optimized', label: 'Cost Optimized', icon: DollarSign, description: 'Minimal resource usage' },
];

export default function AutomatedBlueprintGenerator({ show, onClose, onGenerated }) {
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [scale, setScale] = useState('medium');
  const [priority, setPriority] = useState('balanced');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBlueprint, setGeneratedBlueprint] = useState(null);

  const generateBlueprint = async () => {
    if (!selectedObjective) {
      toast.error('Select an objective first');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate an AI infrastructure blueprint for: ${selectedObjective.label}.
        
        Requirements:
        - Scale: ${scale}
        - Priority: ${priority}
        - Description: ${selectedObjective.description}
        
        Provide a complete blueprint with:
        1. Component list (use indices 0-6: Neural Core, GPU1, GPU2, Memory, Storage, Network, I/O)
        2. Optimal positions in 3D space
        3. Performance estimates
        4. Cost estimate
        5. Configuration details`,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            components: { type: "array", items: { type: "integer" } },
            positions: { type: "array", items: { type: "array", items: { type: "number" } } },
            performance: { type: "string" },
            cost: { type: "string" },
            configs: { type: "array", items: { type: "string" } },
            explanation: { type: "string" }
          }
        }
      });

      setGeneratedBlueprint(result);
      toast.success('Blueprint generated!');
    } catch (error) {
      toast.error('Failed to generate blueprint');
    } finally {
      setIsGenerating(false);
    }
  };

  const applyBlueprint = () => {
    if (generatedBlueprint) {
      onGenerated(generatedBlueprint);
      onClose();
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

          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-3xl">
              🤖
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Automated Blueprint Generation</h3>
              <p className="text-white/60">Define objectives and let AI design your infrastructure</p>
            </div>
          </div>

          {!generatedBlueprint ? (
            <>
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3">Select Objective</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {objectives.map((obj) => {
                    const Icon = obj.icon;
                    return (
                      <button
                        key={obj.id}
                        onClick={() => setSelectedObjective(obj)}
                        className={`p-4 rounded-xl border transition-all text-left ${
                          selectedObjective?.id === obj.id
                            ? 'bg-cyan-500/20 border-cyan-500/50'
                            : 'bg-white/5 border-white/10 hover:border-cyan-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className="w-5 h-5 text-cyan-400" />
                          <span className="text-white font-medium">{obj.label}</span>
                        </div>
                        <p className="text-white/60 text-sm">{obj.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-white font-semibold mb-2 text-sm">Scale</h4>
                  <div className="flex gap-2">
                    {['small', 'medium', 'large'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setScale(s)}
                        className={`flex-1 py-2 rounded-lg text-sm capitalize ${
                          scale === s
                            ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-300'
                            : 'bg-white/5 border border-white/10 text-white/60'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-2 text-sm">Priority</h4>
                  <div className="flex gap-2">
                    {['cost', 'balanced', 'performance'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setPriority(p)}
                        className={`flex-1 py-2 rounded-lg text-sm capitalize ${
                          priority === p
                            ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300'
                            : 'bg-white/5 border border-white/10 text-white/60'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={generateBlueprint}
                disabled={isGenerating || !selectedObjective}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Blueprint
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-2">{generatedBlueprint.name}</h4>
                  <p className="text-white/70 text-sm">{generatedBlueprint.explanation}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <h5 className="text-green-400 font-semibold mb-1 text-sm">Performance</h5>
                    <p className="text-white/80 text-sm">{generatedBlueprint.performance}</p>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <h5 className="text-blue-400 font-semibold mb-1 text-sm">Estimated Cost</h5>
                    <p className="text-white/80 text-sm">{generatedBlueprint.cost}</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h5 className="text-cyan-400 font-semibold mb-2 text-sm">Components ({generatedBlueprint.components.length})</h5>
                  <div className="flex flex-wrap gap-2">
                    {generatedBlueprint.components.map((idx, i) => {
                      const labels = ['Neural Core', 'GPU 1', 'GPU 2', 'Memory', 'Storage', 'Network', 'I/O'];
                      return (
                        <div key={i} className="px-3 py-1 bg-white/10 rounded-full text-white text-xs">
                          {labels[idx]}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h5 className="text-purple-400 font-semibold mb-2 text-sm">Configuration</h5>
                  <ul className="space-y-1">
                    {generatedBlueprint.configs.map((cfg, i) => (
                      <li key={i} className="text-white/70 text-xs">• {cfg}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setGeneratedBlueprint(null)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10"
                >
                  Regenerate
                </button>
                <button
                  onClick={applyBlueprint}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium rounded-xl hover:opacity-90"
                >
                  Apply Blueprint
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}