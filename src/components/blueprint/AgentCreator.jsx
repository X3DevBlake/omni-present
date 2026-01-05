import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Wand2, Video, Image as ImageIcon, Loader, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AgentCreator({ show, onClose, onAgentCreated }) {
  const [creationMode, setCreationMode] = useState('ai'); // 'ai', 'video', 'images'
  const [aiPrompt, setAiPrompt] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [agentColor, setAgentColor] = useState('#00f5ff');
  const [agentPersonality, setAgentPersonality] = useState('CURIOUS');
  const [agentBehaviors, setAgentBehaviors] = useState([]);
  const [customBehavior, setCustomBehavior] = useState('');
  const [generate3DModel, setGenerate3DModel] = useState(false);

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim() || !agentName.trim()) {
      toast.error('Enter agent name and description');
      return;
    }

    setIsGenerating(true);
    try {
      let result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a holographic AI agent based on: "${aiPrompt}". 
        
        Personality: ${agentPersonality}
        Custom Behaviors: ${agentBehaviors.join(', ')}
        
        Generate:
        1. Detailed personality traits matching ${agentPersonality} style
        2. Specific interaction behaviors
        3. Visual characteristics and appearance
        4. Core capabilities and skills
        5. Communication style and patterns
        6. Autonomous task preferences`,
        response_json_schema: {
          type: "object",
          properties: {
            personality: { type: "string" },
            behaviors: { type: "array", items: { type: "string" } },
            appearance: { type: "string" },
            capabilities: { type: "array", items: { type: "string" } },
            style: { type: "string" },
            preferredTasks: { type: "array", items: { type: "string" } }
          }
        }
      });

      // Generate 3D model description if requested
      let modelData = null;
      if (generate3DModel) {
        modelData = await base44.integrations.Core.InvokeLLM({
          prompt: `Based on this agent description: "${aiPrompt}" and appearance: "${result.appearance}", generate a detailed 3D model specification including:
          - Body proportions and dimensions
          - Color scheme and materials
          - Animation keyframes
          - Holographic effects`,
          response_json_schema: {
            type: "object",
            properties: {
              dimensions: { type: "object" },
              materials: { type: "array", items: { type: "string" } },
              animations: { type: "array", items: { type: "string" } },
              effects: { type: "array", items: { type: "string" } }
            }
          }
        });
      }

      const agent = {
        id: Date.now().toString(),
        name: agentName,
        color: agentColor,
        personality: agentPersonality,
        behaviors: agentBehaviors,
        type: 'ai-generated',
        data: result,
        model3D: modelData,
        created_at: new Date().toISOString()
      };

      onAgentCreated(agent);
      toast.success('AI Agent created!');
      onClose();
    } catch (error) {
      toast.error('Failed to generate agent');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    
    if (type === 'video' && files.length > 1) {
      toast.error('Upload only 1 video');
      return;
    }
    
    if (type === 'images' && files.length > 10) {
      toast.error('Maximum 10 images');
      return;
    }

    setIsGenerating(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      }

      setUploadedFiles(uploadedUrls);
      
      // Extract features from media
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the uploaded ${type} to create a holographic AI agent. Extract:
        1. Visual appearance details
        2. Movement patterns
        3. Personality indicators
        4. Interaction style`,
        file_urls: uploadedUrls,
        response_json_schema: {
          type: "object",
          properties: {
            appearance: { type: "string" },
            movements: { type: "array", items: { type: "string" } },
            personality: { type: "string" },
            interactions: { type: "array", items: { type: "string" } }
          }
        }
      });

      const agent = {
        id: Date.now().toString(),
        name: agentName || `Agent-${Date.now()}`,
        color: agentColor,
        type: type,
        media: uploadedUrls,
        data: result,
        created_at: new Date().toISOString()
      };

      onAgentCreated(agent);
      toast.success(`Agent created from ${type}!`);
      onClose();
    } catch (error) {
      toast.error('Failed to process media');
    } finally {
      setIsGenerating(false);
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
          className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
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

          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-3xl">
              🤖
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Create Holographic Agent</h3>
              <p className="text-white/60">Generate AI agents or upload media</p>
            </div>
          </div>

          <div className="mb-6 space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Agent Name</label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="e.g., Assistant Alpha"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Color Theme</label>
              <div className="flex gap-2">
                {['#00f5ff', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setAgentColor(color)}
                    className={`w-10 h-10 rounded-lg transition-all ${
                      agentColor === color ? 'ring-2 ring-white scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setCreationMode('ai')}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                creationMode === 'ai'
                  ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-300'
                  : 'bg-white/5 border border-white/10 text-white/60'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              AI Generate
            </button>
            <button
              onClick={() => setCreationMode('video')}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                creationMode === 'video'
                  ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300'
                  : 'bg-white/5 border border-white/10 text-white/60'
              }`}
            >
              <Video className="w-4 h-4" />
              Upload Video
            </button>
            <button
              onClick={() => setCreationMode('images')}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                creationMode === 'images'
                  ? 'bg-pink-500/30 border border-pink-500/50 text-pink-300'
                  : 'bg-white/5 border border-white/10 text-white/60'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Upload Images
            </button>
          </div>

          {creationMode === 'ai' && (
            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Describe Your Agent</label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="E.g., A friendly assistant with expertise in infrastructure design, speaks professionally..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 h-32"
                />
              </div>
              <button
                onClick={handleAIGenerate}
                disabled={isGenerating}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Agent
                  </>
                )}
              </button>
            </div>
          )}

          {creationMode === 'video' && (
            <div className="space-y-4">
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                <p className="text-purple-300 text-sm mb-2">📹 Video Upload</p>
                <p className="text-white/60 text-xs mb-3">Upload video up to 60 minutes to train your holographic agent</p>
                <label className="block">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileUpload(e, 'video')}
                    className="hidden"
                    disabled={isGenerating}
                  />
                  <div className="w-full py-3 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-xl hover:bg-purple-500/30 cursor-pointer text-center font-medium">
                    {isGenerating ? 'Processing...' : 'Choose Video File'}
                  </div>
                </label>
              </div>
            </div>
          )}

          {creationMode === 'images' && (
            <div className="space-y-4">
              <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4">
                <p className="text-pink-300 text-sm mb-2">🖼️ Image Upload</p>
                <p className="text-white/60 text-xs mb-3">Upload up to 10 images to create your holographic agent</p>
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload(e, 'images')}
                    className="hidden"
                    disabled={isGenerating}
                  />
                  <div className="w-full py-3 bg-pink-500/20 border border-pink-500/40 text-pink-300 rounded-xl hover:bg-pink-500/30 cursor-pointer text-center font-medium">
                    {isGenerating ? 'Processing...' : 'Choose Images (Max 10)'}
                  </div>
                </label>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}