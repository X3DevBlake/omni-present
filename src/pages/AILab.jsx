import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Code, Zap, Settings, Play } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial } from '@react-three/drei';
import AuroraBackground from '../components/omni/AuroraBackground';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

function FloatingBrain() {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
      <mesh>
        <icosahedronGeometry args={[3, 4]} />
        <MeshDistortMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={0.6}
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

export default function AILab() {
  const [modelConfig, setModelConfig] = useState({
    temperature: 0.7,
    maxTokens: 2000,
    topP: 0.9
  });
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runExperiment = async () => {
    if (!prompt.trim()) {
      toast.error('Enter a prompt');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true
      });
      setResult(response);
      toast.success('Experiment complete!');
    } catch (err) {
      toast.error('Experiment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            AI <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Laboratory</span>
          </h1>
          <p className="text-white/60 text-lg">Experiment with cutting-edge AI models and algorithms</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-400" />
                Model Configuration
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Temperature: {modelConfig.temperature}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={modelConfig.temperature}
                    onChange={(e) => setModelConfig({ ...modelConfig, temperature: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Max Tokens: {modelConfig.maxTokens}</label>
                  <input
                    type="range"
                    min="100"
                    max="4000"
                    step="100"
                    value={modelConfig.maxTokens}
                    onChange={(e) => setModelConfig({ ...modelConfig, maxTokens: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">Experiment Prompt</h3>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your AI experiment prompt..."
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 h-40 mb-4"
              />
              <button
                onClick={runExperiment}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Running...' : <><Play className="w-5 h-5" /> Run Experiment</>}
              </button>
            </div>

            {result && (
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6">
                <h3 className="text-green-400 font-bold mb-3">Result</h3>
                <div className="text-white/80 text-sm whitespace-pre-wrap">{result}</div>
              </div>
            )}
          </div>

          <div className="h-[600px] bg-black/20 rounded-2xl overflow-hidden border border-white/10">
            <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
              <ambientLight intensity={0.3} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <FloatingBrain />
              <OrbitControls enableZoom autoRotate autoRotateSpeed={1} />
            </Canvas>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}