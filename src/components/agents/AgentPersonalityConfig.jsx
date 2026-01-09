import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Save } from 'lucide-react';

export default function AgentPersonalityConfig({ agent, onSave }) {
  const [personality, setPersonality] = useState(agent?.personality || {
    curiosity: 50,
    risk_aversion: 50,
    frugality: 50,
    ambition: 50,
    sociability: 50,
  });

  const traits = [
    { key: 'curiosity', label: 'Curiosity', description: 'How eager to explore and learn', color: 'cyan' },
    { key: 'risk_aversion', label: 'Risk Aversion', description: 'How cautious with decisions', color: 'yellow' },
    { key: 'frugality', label: 'Frugality', description: 'How careful with spending', color: 'green' },
    { key: 'ambition', label: 'Ambition', description: 'Drive to achieve goals', color: 'purple' },
    { key: 'sociability', label: 'Sociability', description: 'How interactive with others', color: 'pink' },
  ];

  const updateTrait = (key, value) => {
    setPersonality({ ...personality, [key]: value });
  };

  const getColorClass = (color) => {
    const colors = {
      cyan: 'from-cyan-500 to-blue-500',
      yellow: 'from-yellow-500 to-orange-500',
      green: 'from-green-500 to-emerald-500',
      purple: 'from-purple-500 to-pink-500',
      pink: 'from-pink-500 to-rose-500',
    };
    return colors[color] || colors.cyan;
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Personality Traits</h3>
            <div className="text-white/60 text-sm">Configure agent behavior</div>
          </div>
        </div>
      </div>

      <div className="space-y-6 mb-6">
        {traits.map((trait, index) => (
          <motion.div
            key={trait.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-white font-medium text-sm">{trait.label}</div>
                <div className="text-white/60 text-xs">{trait.description}</div>
              </div>
              <div className="text-white font-bold text-lg">{personality[trait.key]}</div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={personality[trait.key]}
              onChange={(e) => updateTrait(trait.key, parseInt(e.target.value))}
              className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, rgb(var(--${trait.color})) 0%, rgb(var(--${trait.color})) ${personality[trait.key]}%, rgba(255,255,255,0.1) ${personality[trait.key]}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
          </motion.div>
        ))}
      </div>

      <button
        onClick={() => onSave(personality)}
        className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
      >
        <Save className="w-5 h-5" />
        Save Personality
      </button>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0,245,255,0.5);
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(0,245,255,0.5);
        }
      `}</style>
    </div>
  );
}