import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';

export default function PersonalityBuilder({ show, onClose, onPersonalityCreate }) {
  const [personality, setPersonality] = useState({
    name: '',
    backstory: '',
    traits: {
      curiosity: 50,
      empathy: 50,
      assertiveness: 50,
      creativity: 50,
      analytical: 50,
    },
    values: [],
    quirks: '',
    speakingStyle: 'balanced',
  });

  const savePersonality = () => {
    onPersonalityCreate(personality);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-black/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg">
          <X className="w-5 h-5 text-white" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-400" />
          Personality Builder
        </h2>

        <div className="space-y-6">
          <div>
            <label className="text-white text-sm mb-2 block">Agent Name</label>
            <Input
              value={personality.name}
              onChange={(e) => setPersonality({...personality, name: e.target.value})}
              placeholder="e.g., Sage Navigator"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <label className="text-white text-sm mb-2 block">Backstory</label>
            <Textarea
              value={personality.backstory}
              onChange={(e) => setPersonality({...personality, backstory: e.target.value})}
              placeholder="Tell the agent's story..."
              className="bg-white/5 border-white/10 text-white min-h-[100px]"
            />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-4">Personality Traits</h3>
            {Object.entries(personality.traits).map(([trait, value]) => (
              <div key={trait} className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white capitalize">{trait}</span>
                  <span className="text-cyan-400 font-mono">{value}</span>
                </div>
                <Slider
                  value={[value]}
                  onValueChange={([v]) => setPersonality({
                    ...personality,
                    traits: {...personality.traits, [trait]: v}
                  })}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="text-white text-sm mb-2 block">Quirks & Mannerisms</label>
            <Textarea
              value={personality.quirks}
              onChange={(e) => setPersonality({...personality, quirks: e.target.value})}
              placeholder="Unique behaviors, catchphrases, habits..."
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <label className="text-white text-sm mb-2 block">Speaking Style</label>
            <div className="grid grid-cols-3 gap-2">
              {['formal', 'balanced', 'casual'].map(style => (
                <button
                  key={style}
                  onClick={() => setPersonality({...personality, speakingStyle: style})}
                  className={`p-3 rounded-lg capitalize ${
                    personality.speakingStyle === style
                      ? 'bg-purple-500/30 border-2 border-purple-500'
                      : 'bg-white/5 border border-white/10'
                  } text-white transition-all`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={onClose} variant="outline" className="border-white/20 text-white">
            Cancel
          </Button>
          <Button onClick={savePersonality} className="bg-gradient-to-r from-purple-500 to-pink-500">
            <Save className="w-4 h-4 mr-2" />
            Create Personality
          </Button>
        </div>
      </motion.div>
    </div>
  );
}