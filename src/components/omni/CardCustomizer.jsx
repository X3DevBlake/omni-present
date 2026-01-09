import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Sparkles, Layers } from 'lucide-react';

export default function CardCustomizer({ currentDesign, onDesignChange, unlockedSlots = 25 }) {
  const [activeTab, setActiveTab] = useState('color');

  const colorOptions = [
    { name: 'Cyan', value: '#00f5ff' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Gold', value: '#fbbf24' },
    { name: 'Silver', value: '#c0c0c0' },
    { name: 'Black', value: '#0a0a0f' },
    { name: 'White', value: '#ffffff' },
    { name: 'Green', value: '#10b981' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Red', value: '#ef4444' },
  ];

  const materialOptions = [
    { name: 'Standard', value: 'standard', unlockLevel: 0 },
    { name: 'Metallic', value: 'metallic', unlockLevel: 25 },
    { name: 'Holographic', value: 'holographic', unlockLevel: 50 },
    { name: 'Matte', value: 'matte', unlockLevel: 25 },
  ];

  const effectOptions = [
    { name: 'None', value: null, unlockLevel: 0 },
    { name: 'Glow', value: 'glow', unlockLevel: 25 },
    { name: 'Shimmer', value: 'shimmer', unlockLevel: 50 },
    { name: 'Gradient', value: 'gradient', unlockLevel: 75 },
    { name: 'Animated', value: 'animated', unlockLevel: 100 },
  ];

  const isUnlocked = (unlockLevel) => unlockedSlots >= unlockLevel;

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-bold text-xl mb-4">Customize Your Card</h3>
      
      <div className="flex gap-2 mb-6 border-b border-white/10">
        <button
          onClick={() => setActiveTab('color')}
          className={`px-4 py-2 flex items-center gap-2 ${
            activeTab === 'color'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Palette className="w-4 h-4" />
          Colors
        </button>
        <button
          onClick={() => setActiveTab('material')}
          className={`px-4 py-2 flex items-center gap-2 ${
            activeTab === 'material'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          Materials
        </button>
        <button
          onClick={() => setActiveTab('effects')}
          className={`px-4 py-2 flex items-center gap-2 ${
            activeTab === 'effects'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Effects
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'color' && (
          <div className="grid grid-cols-5 gap-3">
            {colorOptions.map(color => (
              <motion.button
                key={color.value}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDesignChange({ ...currentDesign, color: color.value })}
                className={`w-full aspect-square rounded-xl border-2 ${
                  currentDesign?.color === color.value
                    ? 'border-cyan-400 ring-2 ring-cyan-400/50'
                    : 'border-white/20 hover:border-white/40'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        )}

        {activeTab === 'material' && (
          <div className="grid grid-cols-2 gap-3">
            {materialOptions.map(material => {
              const locked = !isUnlocked(material.unlockLevel);
              return (
                <motion.button
                  key={material.value}
                  whileHover={!locked ? { scale: 1.02 } : {}}
                  whileTap={!locked ? { scale: 0.98 } : {}}
                  onClick={() => !locked && onDesignChange({ ...currentDesign, material: material.value })}
                  disabled={locked}
                  className={`p-4 rounded-xl border ${
                    currentDesign?.material === material.value
                      ? 'border-cyan-400 bg-cyan-500/10'
                      : locked
                      ? 'border-white/10 bg-white/5 opacity-50 cursor-not-allowed'
                      : 'border-white/20 hover:border-white/40 bg-white/5'
                  }`}
                >
                  <div className="text-white font-medium">{material.name}</div>
                  {locked && (
                    <div className="text-yellow-400 text-xs mt-1">
                      🔒 Unlock at {material.unlockLevel} slots
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="grid grid-cols-2 gap-3">
            {effectOptions.map(effect => {
              const locked = !isUnlocked(effect.unlockLevel);
              return (
                <motion.button
                  key={effect.value || 'none'}
                  whileHover={!locked ? { scale: 1.02 } : {}}
                  whileTap={!locked ? { scale: 0.98 } : {}}
                  onClick={() => !locked && onDesignChange({ ...currentDesign, effect: effect.value })}
                  disabled={locked}
                  className={`p-4 rounded-xl border ${
                    currentDesign?.effect === effect.value
                      ? 'border-cyan-400 bg-cyan-500/10'
                      : locked
                      ? 'border-white/10 bg-white/5 opacity-50 cursor-not-allowed'
                      : 'border-white/20 hover:border-white/40 bg-white/5'
                  }`}
                >
                  <div className="text-white font-medium">{effect.name}</div>
                  {locked && (
                    <div className="text-yellow-400 text-xs mt-1">
                      🔒 Unlock at {effect.unlockLevel} slots
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3">
        <div className="text-cyan-400 text-sm font-medium">
          Unlocked Customizations: {unlockedSlots}/100+
        </div>
        <div className="mt-2 bg-black/40 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
            style={{ width: `${Math.min((unlockedSlots / 100) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}