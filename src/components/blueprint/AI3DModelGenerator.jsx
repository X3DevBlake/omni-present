import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Wand2, Loader, Box, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AI3DModelGenerator({ show, onClose, onModelGenerated }) {
  const [generationMode, setGenerationMode] = useState('text'); // 'text', 'image'
  const [textDescription, setTextDescription] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedModel, setGeneratedModel] = useState(null);

  const handleTextGeneration = async () => {
    if (!textDescription.trim()) {
      toast.error('Enter a description');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a detailed 3D model specification for: "${textDescription}"
        
        Create comprehensive specifications including:
        1. Geometric structure (primitives: box, sphere, cylinder, cone, torus)
        2. Precise dimensions and proportions
        3. Material properties (color, opacity, metalness, roughness)
        4. Positioning and hierarchy
        5. Animation parameters
        6. Interaction points
        7. Physics properties (mass, friction, bounciness)
        
        Format as a hierarchical structure that can be rendered with Three.js`,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            type: { type: "string" },
            parts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  geometry: { type: "string" },
                  dimensions: { type: "array", items: { type: "number" } },
                  position: { type: "array", items: { type: "number" } },
                  rotation: { type: "array", items: { type: "number" } },
                  material: {
                    type: "object",
                    properties: {
                      color: { type: "string" },
                      opacity: { type: "number" },
                      metalness: { type: "number" },
                      roughness: { type: "number" }
                    }
                  },
                  physics: {
                    type: "object",
                    properties: {
                      mass: { type: "number" },
                      friction: { type: "number" },
                      restitution: { type: "number" }
                    }
                  }
                }
              }
            },
            scale: { type: "number" },
            interactionPoints: { type: "array", items: { type: "object" } }
          }
        }
      });

      setGeneratedModel(result);
      toast.success('3D model generated!');
    } catch (error) {
      toast.error('Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageGeneration = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsGenerating(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      }
      setUploadedImages(uploadedUrls);

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze these images and generate a 3D model specification that captures the object's:
        - Shape and geometry
        - Proportions and dimensions
        - Colors and materials
        - Key features and details
        
        Output as a Three.js-compatible structure with primitives`,
        file_urls: uploadedUrls,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            type: { type: "string" },
            parts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  geometry: { type: "string" },
                  dimensions: { type: "array", items: { type: "number" } },
                  position: { type: "array", items: { type: "number" } },
                  material: { type: "object" },
                  physics: { type: "object" }
                }
              }
            },
            scale: { type: "number" }
          }
        }
      });

      setGeneratedModel(result);
      toast.success('3D model generated from images!');
    } catch (error) {
      toast.error('Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseModel = () => {
    if (generatedModel) {
      onModelGenerated(generatedModel);
      toast.success('Model added to environment!');
      onClose();
    }
  };

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
          className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10">
            <X className="w-5 h-5 text-white/70" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <Box className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">AI 3D Model Generator</h3>
              <p className="text-white/60">Create custom 3D assets with AI</p>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setGenerationMode('text')}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 ${
                generationMode === 'text' ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300' : 'bg-white/5 border border-white/10 text-white/60'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              Text Description
            </button>
            <button
              onClick={() => setGenerationMode('image')}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 ${
                generationMode === 'image' ? 'bg-pink-500/30 border border-pink-500/50 text-pink-300' : 'bg-white/5 border border-white/10 text-white/60'
              }`}
            >
              <Upload className="w-4 h-4" />
              Image Upload
            </button>
          </div>

          {generationMode === 'text' && (
            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Describe the 3D model</label>
                <textarea
                  value={textDescription}
                  onChange={(e) => setTextDescription(e.target.value)}
                  placeholder="E.g., A modern office chair with wheels, adjustable height, ergonomic backrest..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 h-32"
                />
              </div>
              <button
                onClick={handleTextGeneration}
                disabled={isGenerating}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? <><Loader className="w-5 h-5 animate-spin" />Generating...</> : <><Wand2 className="w-5 h-5" />Generate 3D Model</>}
              </button>
            </div>
          )}

          {generationMode === 'image' && (
            <div className="space-y-4">
              <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4">
                <p className="text-pink-300 text-sm mb-3">Upload images of the object (max 5)</p>
                <label className="block">
                  <input type="file" accept="image/*" multiple onChange={handleImageGeneration} className="hidden" disabled={isGenerating} />
                  <div className="w-full py-3 bg-pink-500/20 border border-pink-500/40 text-pink-300 rounded-xl hover:bg-pink-500/30 cursor-pointer text-center font-medium">
                    {isGenerating ? 'Processing...' : 'Choose Images'}
                  </div>
                </label>
              </div>
            </div>
          )}

          {generatedModel && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-2">Generated Model: {generatedModel.name}</h4>
                <p className="text-white/60 text-sm mb-3">{generatedModel.parts?.length} parts • Type: {generatedModel.type}</p>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {generatedModel.parts?.slice(0, 4).map((part, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-2">
                      <div className="text-xs text-purple-400">{part.geometry}</div>
                      <div className="text-xs text-white/60">{part.id}</div>
                    </div>
                  ))}
                </div>

                <button onClick={handleUseModel} className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:opacity-90 flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Add to Environment
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}