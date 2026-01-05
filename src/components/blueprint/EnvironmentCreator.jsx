import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building, Trees, Home, Mountain as MountainIcon, MapPin } from 'lucide-react';

const environments = [
  { id: 'office', name: 'Office', icon: Building, color: '#3b82f6', description: 'Modern office space' },
  { id: 'nature', name: 'Nature', icon: Trees, color: '#10b981', description: 'Forest with trees and lake' },
  { id: 'house', name: 'House', icon: Home, color: '#f59e0b', description: 'Cozy home interior' },
  { id: 'street', name: 'Street', icon: MapPin, color: '#6366f1', description: 'Urban street scene' },
  { id: 'mountain', name: 'Mountain', icon: MountainIcon, color: '#8b5cf6', description: 'Mountain landscape' },
];

export default function EnvironmentCreator({ show, onClose, onEnvironmentSelect, currentEnvironment }) {
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
          className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
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

          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">Select Environment</h3>
            <p className="text-white/60">Choose a 3D environment for your holographic agents</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {environments.map((env) => {
              const Icon = env.icon;
              const isSelected = currentEnvironment === env.id;
              
              return (
                <button
                  key={env.id}
                  onClick={() => {
                    onEnvironmentSelect(env.id);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border transition-all text-left ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-500/50 ring-2 ring-cyan-500/30'
                      : 'bg-white/5 border-white/10 hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: env.color + '30' }}
                    >
                      <Icon className="w-6 h-6" style={{ color: env.color }} />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{env.name}</h4>
                      {isSelected && (
                        <span className="text-cyan-400 text-xs">Active</span>
                      )}
                    </div>
                  </div>
                  <p className="text-white/60 text-sm">{env.description}</p>
                </button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}