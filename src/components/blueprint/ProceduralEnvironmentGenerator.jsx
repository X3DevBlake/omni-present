import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wand2, Mountain, Building2, Trees, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ProceduralEnvironmentGenerator({ show, onClose, onEnvironmentGenerated }) {
  const [description, setDescription] = useState('');
  const [environmentType, setEnvironmentType] = useState('forest');
  const [styleReference, setStyleReference] = useState('realistic');
  const [complexity, setComplexity] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState(null);

  const environmentTypes = [
    { id: 'forest', label: 'Forest', icon: Trees, color: '#10b981' },
    { id: 'city', label: 'City', icon: Building2, color: '#3b82f6' },
    { id: 'futuristic', label: 'Futuristic', icon: Sparkles, color: '#a855f7' },
    { id: 'mountain', label: 'Mountain', icon: Mountain, color: '#64748b' }
  ];

  const generateEnvironment = async () => {
    if (!description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a complete procedural 3D environment specification:
        
        Description: ${description}
        Type: ${environmentType}
        Style: ${styleReference}
        Complexity: ${complexity}%
        
        Create detailed specifications for:
        1. TERRAIN: Heightmap data, texture layers, biomes
        2. FOLIAGE: Tree/plant types, density maps, distribution patterns
        3. BUILDINGS/STRUCTURES: Architectural elements, placement, scale
        4. INTERACTIVE ELEMENTS: Doors, switches, objects, waypoints
        5. LIGHTING: Sun position, ambient color, shadows, fog
        6. WEATHER: Climate effects, particle systems
        7. PROCEDURAL RULES: Generation algorithms, randomization seeds
        8. PHYSICS ZONES: Collision areas, trigger volumes
        
        Generate coordinates, scales, rotations, materials, and interaction properties.`,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            terrain: {
              type: "object",
              properties: {
                size: { type: "array", items: { type: "number" } },
                heightmap: { type: "array", items: { type: "number" } },
                textures: { type: "array", items: { type: "string" } }
              }
            },
            foliage: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  positions: { type: "array" },
                  scale: { type: "array" }
                }
              }
            },
            structures: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  position: { type: "array" },
                  rotation: { type: "array" },
                  scale: { type: "array" },
                  interactive: { type: "boolean" }
                }
              }
            },
            interactiveElements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  type: { type: "string" },
                  position: { type: "array" },
                  action: { type: "string" },
                  state: { type: "string" }
                }
              }
            },
            lighting: {
              type: "object",
              properties: {
                sunPosition: { type: "array" },
                ambient: { type: "string" },
                intensity: { type: "number" }
              }
            },
            metadata: {
              type: "object",
              properties: {
                style: { type: "string" },
                complexity: { type: "number" },
                seed: { type: "number" }
              }
            }
          }
        }
      });

      setGeneratedPreview(result);
      toast.success('Environment generated!');
    } catch (error) {
      toast.error('Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const applyEnvironment = () => {
    if (generatedPreview) {
      onEnvironmentGenerated(generatedPreview);
      onClose();
      toast.success('Environment applied!');
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10">
            <X className="w-5 h-5 text-white/70" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <Wand2 className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Procedural Environment Generator</h3>
              <p className="text-white/60">Generate complete 3D worlds with AI</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Environment Type</label>
              <div className="grid grid-cols-4 gap-2">
                {environmentTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <button key={type.id} onClick={() => setEnvironmentType(type.id)} className={`p-3 rounded-xl border transition-all ${environmentType === type.id ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/10'}`}>
                      <Icon className="w-6 h-6 mx-auto mb-1" style={{ color: type.color }} />
                      <div className="text-white text-xs">{type.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="E.g., A mystical forest with ancient ruins, glowing mushrooms, and a crystal-clear lake..." className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 h-32" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Style Reference</label>
                <select value={styleReference} onChange={(e) => setStyleReference(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white">
                  <option value="realistic">Realistic</option>
                  <option value="stylized">Stylized</option>
                  <option value="low-poly">Low Poly</option>
                  <option value="cyberpunk">Cyberpunk</option>
                  <option value="fantasy">Fantasy</option>
                  <option value="sci-fi">Sci-Fi</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-white/70 text-sm">Complexity</label>
                  <span className="text-cyan-400 text-sm">{complexity}%</span>
                </div>
                <input type="range" min="10" max="100" value={complexity} onChange={(e) => setComplexity(Number(e.target.value))} className="w-full" />
              </div>
            </div>

            {generatedPreview && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl p-4">
                <h4 className="text-green-400 font-semibold mb-3">Generated: {generatedPreview.name}</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-white/60 text-xs">Terrain Size</div>
                    <div className="text-white">{generatedPreview.terrain?.size?.join('x')}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-white/60 text-xs">Foliage Elements</div>
                    <div className="text-white">{generatedPreview.foliage?.length || 0}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-white/60 text-xs">Structures</div>
                    <div className="text-white">{generatedPreview.structures?.length || 0}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-white/60 text-xs">Interactive</div>
                    <div className="text-white">{generatedPreview.interactiveElements?.length || 0}</div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex gap-3">
              <button onClick={generateEnvironment} disabled={isGenerating} className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50">
                {isGenerating ? 'Generating...' : 'Generate Environment'}
              </button>
              {generatedPreview && (
                <button onClick={applyEnvironment} className="px-6 py-3 bg-green-500/20 border border-green-500/40 text-green-300 rounded-xl hover:bg-green-500/30">
                  Apply
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}