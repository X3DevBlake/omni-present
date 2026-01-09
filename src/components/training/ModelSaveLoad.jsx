import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Download, Trash2, Copy, Clock, FileUp } from 'lucide-react';

export default function ModelSaveLoad({ onSave, onLoad }) {
  const [models, setModels] = useState([
    { id: 1, name: 'Model-v1-baseline', accuracy: 91.2, timestamp: '2h ago', size: '45 MB', status: 'ready' },
    { id: 2, name: 'Model-v2-optimized', accuracy: 94.8, timestamp: '1h ago', size: '48 MB', status: 'ready' },
    { id: 3, name: 'Model-v3-final', accuracy: 96.3, timestamp: '15m ago', size: '50 MB', status: 'ready' }
  ]);
  const [modelName, setModelName] = useState('');
  const [copied, setCopied] = useState(null);

  const handleSaveModel = () => {
    if (!modelName.trim()) return;

    const newModel = {
      id: models.length + 1,
      name: modelName,
      accuracy: 92.5 + Math.random() * 5,
      timestamp: 'just now',
      size: `${(45 + Math.random() * 10).toFixed(0)} MB`,
      status: 'ready'
    };

    setModels(prev => [newModel, ...prev]);
    setModelName('');
    onSave?.(newModel);
  };

  const deleteModel = (id) => {
    setModels(prev => prev.filter(m => m.id !== id));
  };

  const copyModelId = (id, modelId) => {
    navigator.clipboard.writeText(modelId);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Save New Model */}
      <div className="bg-black/40 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Save className="w-5 h-5 text-green-400" />
          Save Trained Model
        </h3>

        <div className="flex gap-3">
          <input
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder="Enter model name (e.g., Trading-Agent-v2)..."
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-green-500/50"
            onKeyPress={(e) => e.key === 'Enter' && handleSaveModel()}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveModel}
            disabled={!modelName.trim()}
            className="px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg text-green-400 font-semibold disabled:opacity-50 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </motion.button>
        </div>
      </div>

      {/* Saved Models */}
      <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <FileUp className="w-5 h-5 text-cyan-400" />
          Saved Models ({models.length})
        </h3>

        <div className="space-y-3">
          <AnimatePresence>
            {models.map((model, idx) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold truncate">{model.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-white/50 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {model.timestamp}
                      </span>
                      <span>{model.size}</span>
                    </div>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <div className="text-sm font-bold text-cyan-400">{model.accuracy.toFixed(1)}%</div>
                    <div className="text-xs text-white/50">Accuracy</div>
                  </div>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => copyModelId(model.id, `model_${model.id}_${Date.now()}`)}
                    className="flex-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded text-blue-400 text-xs font-semibold transition-all flex items-center justify-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {copied === model.id ? 'Copied!' : 'Copy ID'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => onLoad?.(model)}
                    className="flex-1 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded text-cyan-400 text-xs font-semibold transition-all flex items-center justify-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Load
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => deleteModel(model.id)}
                    className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded text-red-400 text-xs font-semibold transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Model Info */}
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-4">
        <p className="text-white/70 text-sm">
          💡 <strong>Pro Tip:</strong> Save multiple versions of your models during training. Compare their performance metrics to find the best configuration for your agents.
        </p>
      </div>
    </div>
  );
}