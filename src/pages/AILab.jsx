import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Code, Zap, Settings, Play, Database } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial } from '@react-three/drei';
import AuroraBackground from '../components/omni/AuroraBackground';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import Data3DVisualizer from '../components/3d/Data3DVisualizer';
import DataSourceConnector from '../components/database/DataSourceConnector';
import DataDiscoveryAgent from '../components/database/DataDiscoveryAgent';
import FinancialMarket3DCityscape from '../components/3d/FinancialMarket3DCityscape';
import MultiAgentWorld3D from '../components/3d/MultiAgentWorld3D';
import HolographicAgentProjection from '../components/ai/HolographicAgentProjection';
import DataFlowVisualizer from '../components/ai/DataFlowVisualizer';
import AgentMemoryGraph from '../components/ai/AgentMemoryGraph';
import AgentGoalBuilder from '../components/builder/AgentGoalBuilder';
import NaturalLanguageQueryInterface from '../components/ai/NaturalLanguageQueryInterface';
import ResourceUtilization3D from '../components/3d/ResourceUtilization3D';
import DatasetUploader from '../components/training/DatasetUploader';
import TrainingParameterConfig from '../components/training/TrainingParameterConfig';
import TrainingProgressVisualization from '../components/training/TrainingProgressVisualization';
import ModelSaveLoad from '../components/training/ModelSaveLoad';
import SharedWorkspace3D from '../components/collaboration/SharedWorkspace3D';
import AgentRoleManager from '../components/collaboration/AgentRoleManager';
import EnvironmentDesigner from '../components/sandbox/EnvironmentDesigner';
import SimulationRecorderAnalytics from '../components/sandbox/SimulationRecorderAnalytics';

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
  const [activeTab, setActiveTab] = useState('experiment');
  const [sampleData, setSampleData] = useState([]);

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
      // Generate sample 3D data from result
      const dataPoints = Array.from({ length: 20 }, (_, i) => ({
        x: (Math.random() - 0.5) * 20,
        y: Math.random() * 10,
        z: (Math.random() - 0.5) * 20,
        value: Math.random() * 100
      }));
      setSampleData(dataPoints);
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

        <div className="flex gap-4 mb-8 border-b border-white/10 overflow-x-auto pb-2">
          {[
            { id: 'experiment', label: '🧪 Experiment', icon: 'Experiment' },
            { id: 'visualize', label: '📊 3D Visualization', icon: 'Visualization' },
            { id: 'agents', label: '🤖 Agents', icon: 'Agents' },
            { id: 'data', label: '📡 Data & Flow', icon: 'Data' },
            { id: 'database', label: '🗄️ Data Sources', icon: 'Database' },
            { id: 'goals', label: '🎯 Goals', icon: 'Goals' },
            { id: 'query', label: '🔍 Smart Query', icon: 'Query' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-semibold text-sm border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Experiment Tab */}
        {activeTab === 'experiment' && (
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
                <div className="text-white/80 text-sm whitespace-pre-wrap">
                  {typeof result === 'string' 
                    ? result 
                    : result && typeof result === 'object'
                    ? JSON.stringify(result, null, 2)
                    : 'No result'}
                </div>
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
        )}

        {/* 3D Visualization Tab */}
        {activeTab === 'visualize' && (
          <div className="space-y-6">
            <Data3DVisualizer 
              data={sampleData.length > 0 ? sampleData : undefined}
              title="AI Experiment Results - 3D Landscape"
            />
            <div className="text-white/60 text-sm p-4 bg-black/30 rounded-lg">
              💡 Run an experiment first to visualize results in 3D. The landscape dynamically updates with simulation data from your AI models.
            </div>
          </div>
        )}

        {/* Agents Tab */}
        {activeTab === 'agents' && (
          <div className="space-y-6">
            <HolographicAgentProjection agentName="LabAssistant-01" />
            <MultiAgentWorld3D />
            <AgentMemoryGraph />
          </div>
        )}

        {/* Data & Flow Tab */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            <DataFlowVisualizer />
            <div className="grid lg:grid-cols-2 gap-6">
              <FinancialMarket3DCityscape />
              <ResourceUtilization3D />
            </div>
          </div>
        )}

        {/* Database Tab */}
        {activeTab === 'database' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <DataSourceConnector />
            <DataDiscoveryAgent />
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div>
            <AgentGoalBuilder />
          </div>
        )}

        {/* Smart Query Tab */}
        {activeTab === 'query' && (
          <div>
            <NaturalLanguageQueryInterface />
          </div>
        )}
      </div>
    </AuroraBackground>
  );
}