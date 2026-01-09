import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save } from 'lucide-react';

export default function TrainingParameterConfig({ onConfigChange }) {
  const [config, setConfig] = useState({
    epochs: 50,
    batchSize: 32,
    learningRate: 0.001,
    optimizer: 'adam',
    lossFunction: 'crossentropy',
    validationSplit: 0.2,
    earlyStopping: true,
    patience: 5
  });

  const handleChange = (field, value) => {
    const updated = { ...config, [field]: value };
    setConfig(updated);
    onConfigChange?.(updated);
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
      <h3 className="text-white font-bold mb-6 flex items-center gap-2">
        <Settings className="w-5 h-5 text-purple-400" />
        Training Parameters
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Epochs */}
        <div>
          <label className="text-white/70 text-sm block mb-2">Epochs: <span className="text-cyan-400 font-bold">{config.epochs}</span></label>
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={config.epochs}
            onChange={(e) => handleChange('epochs', parseInt(e.target.value))}
            className="w-full"
          />
          <p className="text-white/40 text-xs mt-1">Number of complete passes through training data</p>
        </div>

        {/* Batch Size */}
        <div>
          <label className="text-white/70 text-sm block mb-2">Batch Size: <span className="text-cyan-400 font-bold">{config.batchSize}</span></label>
          <select
            value={config.batchSize}
            onChange={(e) => handleChange('batchSize', parseInt(e.target.value))}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
          >
            {[16, 32, 64, 128, 256].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <p className="text-white/40 text-xs mt-1">Samples per gradient update</p>
        </div>

        {/* Learning Rate */}
        <div>
          <label className="text-white/70 text-sm block mb-2">Learning Rate: <span className="text-cyan-400 font-bold">{config.learningRate}</span></label>
          <input
            type="number"
            step="0.0001"
            min="0.00001"
            max="0.1"
            value={config.learningRate}
            onChange={(e) => handleChange('learningRate', parseFloat(e.target.value))}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
          />
          <p className="text-white/40 text-xs mt-1">Controls training speed</p>
        </div>

        {/* Optimizer */}
        <div>
          <label className="text-white/70 text-sm block mb-2">Optimizer</label>
          <select
            value={config.optimizer}
            onChange={(e) => handleChange('optimizer', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="adam">Adam</option>
            <option value="sgd">SGD</option>
            <option value="rmsprop">RMSprop</option>
            <option value="adagrad">AdaGrad</option>
          </select>
        </div>

        {/* Loss Function */}
        <div>
          <label className="text-white/70 text-sm block mb-2">Loss Function</label>
          <select
            value={config.lossFunction}
            onChange={(e) => handleChange('lossFunction', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="crossentropy">Cross Entropy</option>
            <option value="mse">MSE</option>
            <option value="mae">MAE</option>
            <option value="binary">Binary</option>
          </select>
        </div>

        {/* Validation Split */}
        <div>
          <label className="text-white/70 text-sm block mb-2">Validation Split: <span className="text-cyan-400 font-bold">{(config.validationSplit * 100).toFixed(0)}%</span></label>
          <input
            type="range"
            min="0.1"
            max="0.5"
            step="0.05"
            value={config.validationSplit}
            onChange={(e) => handleChange('validationSplit', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Early Stopping */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.earlyStopping}
              onChange={(e) => handleChange('earlyStopping', e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-white/70 text-sm">Enable Early Stopping</span>
          </label>
          {config.earlyStopping && (
            <div className="mt-3 ml-7">
              <label className="text-white/70 text-sm block mb-2">Patience: <span className="text-cyan-400 font-bold">{config.patience}</span></label>
              <input
                type="range"
                min="2"
                max="20"
                step="1"
                value={config.patience}
                onChange={(e) => handleChange('patience', parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-white/40 text-xs mt-1">Epochs to wait before stopping</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Presets */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <p className="text-white/70 text-sm mb-3">Quick Presets:</p>
        <div className="flex gap-2 flex-wrap">
          {[
            { name: 'Fast', epochs: 10, lr: 0.01, batch: 128 },
            { name: 'Balanced', epochs: 50, lr: 0.001, batch: 32 },
            { name: 'Thorough', epochs: 200, lr: 0.0001, batch: 16 }
          ].map(preset => (
            <motion.button
              key={preset.name}
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                handleChange('epochs', preset.epochs);
                handleChange('learningRate', preset.lr);
                handleChange('batchSize', preset.batch);
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-xs font-semibold transition-all"
            >
              {preset.name}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}