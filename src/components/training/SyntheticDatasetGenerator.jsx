import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Wand2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function SyntheticDatasetGenerator() {
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({
    type: 'agent_interactions',
    samples: 100,
    complexity: 'medium'
  });

  const generateDataset = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a synthetic dataset for ${params.type} with ${params.samples} samples at ${params.complexity} complexity. Include varied scenarios, agent behaviors, and outcomes.`,
        response_json_schema: {
          type: "object",
          properties: {
            dataset_name: { type: "string" },
            samples: { type: "number" },
            features: { type: "array", items: { type: "string" } },
            sample_data: { type: "array" }
          }
        }
      });
      setDataset(response);
    } catch (err) {
      console.error('Failed to generate dataset:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Database className="w-6 h-6 text-indigo-400" />
        Synthetic Dataset Generator
      </h3>

      <div className="space-y-3 mb-6">
        <select
          value={params.type}
          onChange={(e) => setParams({...params, type: e.target.value})}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
        >
          <option value="agent_interactions">Agent Interactions</option>
          <option value="decision_making">Decision Making</option>
          <option value="resource_management">Resource Management</option>
          <option value="negotiation">Negotiation</option>
        </select>
      </div>

      <Button 
        onClick={generateDataset} 
        disabled={loading}
        className="w-full mb-6 bg-gradient-to-r from-indigo-500 to-purple-500"
      >
        <Wand2 className="w-4 h-4 mr-2" />
        {loading ? 'Generating...' : 'Generate Dataset'}
      </Button>

      {dataset && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/20 rounded-lg p-4"
        >
          <h4 className="text-white font-bold mb-3">{dataset.dataset_name}</h4>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <div className="text-white/60 text-sm">Samples</div>
              <div className="text-white font-semibold">{dataset.samples}</div>
            </div>
            <div>
              <div className="text-white/60 text-sm">Features</div>
              <div className="text-white font-semibold">{dataset.features?.length || 0}</div>
            </div>
          </div>
          <Button size="sm" className="w-full bg-green-500/20 hover:bg-green-500/30">
            <Download className="w-4 h-4 mr-2" />
            Export Dataset
          </Button>
        </motion.div>
      )}
    </div>
  );
}