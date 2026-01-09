import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Sparkles } from 'lucide-react';

export default function CardCustomizer({ currentDesign, onDesignChange, unlockedSlots = 10 }) {
  const [design, setDesign] = useState(currentDesign || { color: '#00f5ff', material: 'standard' });

  const colors = [
    { name: 'Cyan', value: '#00f5ff', unlocked: true },
    { name: 'Purple', value: '#a855f7', unlocked: true },
    { name: 'Pink', value: '#ec4899', unlocked: true },
    { name: 'Green', value: '#10b981', unlocked: true },
    { name: 'Orange', value: '#f59e0b', unlocked: true },
    { name: 'Red', value: '#ef4444', unlocked: unlockedSlots >= 10 },
    { name: 'Blue', value: '#3b82f6', unlocked: unlockedSlots >= 10 },
    { name: 'Indigo', value: '#6366f1', unlocked: unlockedSlots >= 15 },
    { name: 'Teal', value: '#14b8a6', unlocked: unlockedSlots >= 15 },
    { name: 'Rose', value: '#f43f5e', unlocked: unlockedSlots >= 25 },
    { name: 'Gold', value: '#FFD700', unlocked: unlockedSlots >= 50 },
    { name: 'Silver', value: '#C0C0C0', unlocked: unlockedSlots >= 50 },
    { name: 'Black', value: '#000000', unlocked: unlockedSlots >= 100 },
    { name: 'White', value: '#FFFFFF', unlocked: unlockedSlots >= 100 },
  ];

  const materials = [
    { name: 'Standard', value: 'standard', unlocked: true },
    { name: 'Metal', value: 'metal', unlocked: unlockedSlots >= 25 },
    { name: 'Matte', value: 'matte', unlocked: unlockedSlots >= 25 },
    { name: 'Glossy', value: 'glossy', unlocked: unlockedSlots >= 50 },
  ];

  const handleColorChange = (color) => {
    if (color.unlocked) {
      const newDesign = { ...design, color: color.value };
      setDesign(newDesign);
      onDesignChange(newDesign);
    }
  };

  const handleMaterialChange = (material) => {
    if (material.unlocked) {
      const newDesign = { ...design, material: material.value };
      setDesign(newDesign);
      onDesignChange(newDesign);
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Palette className="w-6 h-6 text-cyan-400" />
        <h3 className="text-white font-bold text-xl">Customize Your Card</h3>
        <div className="ml-auto text-white/60 text-sm">
          {unlockedSlots} options unlocked
        </div>
      </div>

      {/* Colors */}
      <div className="mb-6">
        <label className="text-white/60 text-sm mb-3 block">Card Color</label>
        <div className="grid grid-cols-7 gap-3">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => handleColorChange(color)}
              disabled={!color.unlocked}
              className={`relative w-12 h-12 rounded-xl transition-all ${
                design.color === color.value
                  ? 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-black'
                  : ''
              } ${!color.unlocked ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110'}`}
              style={{ backgroundColor: color.value }}
            >
              {!color.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Materials */}
      <div>
        <label className="text-white/60 text-sm mb-3 block">Card Material</label>
        <div className="grid grid-cols-4 gap-3">
          {materials.map((material) => (
            <button
              key={material.value}
              onClick={() => handleMaterialChange(material)}
              disabled={!material.unlocked}
              className={`relative px-4 py-3 rounded-xl border transition-all ${
                design.material === material.value
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-white/10 bg-white/5'
              } ${!material.unlocked ? 'opacity-30 cursor-not-allowed' : 'hover:border-white/20'}`}
            >
              <div className="text-white text-sm font-medium">{material.name}</div>
              {!material.unlocked && (
                <Sparkles className="absolute top-2 right-2 w-4 h-4 text-yellow-400" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}