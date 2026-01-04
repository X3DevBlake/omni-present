import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Cpu, HardDrive, Zap, X } from 'lucide-react';
import GlassCard from './GlassCard';

export default function GenerativeInput({ onGenerate, isGenerating }) {
  const [isOpen, setIsOpen] = useState(false);
  const [constraints, setConstraints] = useState({
    budget: 'medium',
    workload: 'ai-training',
    scale: 'medium',
    priority: 'performance',
  });

  const handleGenerate = () => {
    onGenerate(constraints);
    setIsOpen(false);
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-lg shadow-purple-500/30 flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Sparkles className="w-5 h-5" />
        Generate Custom Blueprint
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg"
            >
              <GlassCard className="p-6 sm:p-8" glow glowColor="purple">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Custom Blueprint Generator
                    </h2>
                    <p className="text-white/50 text-sm">
                      AI-powered infrastructure design tailored to your needs
                    </p>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg hover:bg-white/10">
                    <X className="w-5 h-5 text-white/70" />
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Budget */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">Budget Range</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['low', 'medium', 'high'].map((level) => (
                        <button
                          key={level}
                          onClick={() => setConstraints({ ...constraints, budget: level })}
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                            constraints.budget === level
                              ? 'bg-purple-500/30 border-2 border-purple-500 text-purple-300'
                              : 'bg-white/5 border border-white/10 text-white/50'
                          }`}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Workload Type */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">Workload Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'ai-training', label: 'AI Training', icon: Cpu },
                        { value: 'inference', label: 'Inference', icon: Zap },
                        { value: 'data-processing', label: 'Data Processing', icon: HardDrive },
                        { value: 'mixed', label: 'Mixed', icon: Sparkles },
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => setConstraints({ ...constraints, workload: value })}
                          className={`py-3 px-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                            constraints.workload === value
                              ? 'bg-cyan-500/30 border-2 border-cyan-500 text-cyan-300'
                              : 'bg-white/5 border border-white/10 text-white/50'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scale */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      Scale: {constraints.scale}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      value={['small', 'medium', 'large'].indexOf(constraints.scale)}
                      onChange={(e) => {
                        const scales = ['small', 'medium', 'large'];
                        setConstraints({ ...constraints, scale: scales[e.target.value] });
                      }}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between text-xs text-white/40 mt-2">
                      <span>Small</span>
                      <span>Medium</span>
                      <span>Enterprise</span>
                    </div>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">Priority</label>
                    <select
                      value={constraints.priority}
                      onChange={(e) => setConstraints({ ...constraints, priority: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="performance">Maximum Performance</option>
                      <option value="cost">Cost Optimization</option>
                      <option value="efficiency">Energy Efficiency</option>
                      <option value="reliability">Reliability & Redundancy</option>
                    </select>
                  </div>
                </div>

                <motion.button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={!isGenerating ? { scale: 1.02 } : {}}
                  whileTap={!isGenerating ? { scale: 0.98 } : {}}
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5 animate-spin" />
                      Generating Blueprint...
                    </span>
                  ) : (
                    'Generate Custom Blueprint'
                  )}
                </motion.button>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}