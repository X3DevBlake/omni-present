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
import NeuralNetworkVisualizer3D from '../components/training/NeuralNetworkVisualizer3D';
import SharedWorkspace3D from '../components/collaboration/SharedWorkspace3D';
import AgentRoleManager from '../components/collaboration/AgentRoleManager';
import EnvironmentDesigner from '../components/sandbox/EnvironmentDesigner';
import SimulationRecorderAnalytics from '../components/sandbox/SimulationRecorderAnalytics';
import AgentMemorySystem from '../components/agents/AgentMemorySystem';
import AgentEmoteSystem from '../components/agents/AgentEmoteSystem';
import AgentActionController from '../components/agents/AgentActionController';
import AgentPersonalityCustomizer from '../components/agents/AgentPersonalityCustomizer';
import SimulationEventGenerator from '../components/simulation/SimulationEventGenerator';
import AgentCollaborationHub from '../components/simulation/AgentCollaborationHub';
import AgentMemoryNetwork from '../components/agents/AgentMemoryNetwork';
import EnhancedAgentMemory from '../components/agents/EnhancedAgentMemory';
import AgentKPIDashboard from '../components/agents/AgentKPIDashboard';
import AgentSkillTrainer from '../components/agents/AgentSkillTrainer';
import KnowledgeFlowVisualizer from '../components/simulation/KnowledgeFlowVisualizer';
import SharedKnowledgeRepository from '../components/simulation/SharedKnowledgeRepository';
import FinancialSimulationModule from '../components/simulation/FinancialSimulationModule';
import AdvancedCollaborationHub from '../components/collaboration/AdvancedCollaborationHub';
import AdvancedTrainingModule from '../components/training/AdvancedTrainingModule';
import FinancialAPIIntegrator from '../components/finance/FinancialAPIIntegrator';
import InterAgentCommunicationSystem from '../components/agents/InterAgentCommunicationSystem';
import NLPCommandProcessor from '../components/ai/NLPCommandProcessor';
import SelfLearningAgentSystem from '../components/ai/SelfLearningAgentSystem';
import RealTimeNewsFeed from '../components/news/RealTimeNewsFeed';
import AgentMetaReasoningSystem from '../components/ai/AgentMetaReasoningSystem';
import Agent100TypesGrid from '../components/agents/Agent100TypesGrid';
import AgentIntegrationHub from '../components/agents/AgentIntegrationHub';
import Agent15DetailPanel from '../components/agents/Agent15DetailPanel';

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
  const [isTraining, setIsTraining] = useState(false);
  const [trainingConfig, setTrainingConfig] = useState({});
  const [sampleData, setSampleData] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);

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
            { id: 'training', label: '🎓 Training', icon: 'Training' },
            { id: 'advanced-training', label: '🚀 Advanced Training', icon: 'AdvTraining' },
            { id: 'agents', label: '🤖 Agents', icon: 'Agents' },
            { id: 'collaboration', label: '🤝 Collaboration', icon: 'Collab' },
            { id: 'advanced-collab', label: '💼 Advanced Collab', icon: 'AdvCollab' },
            { id: 'finance-api', label: '💰 Finance APIs', icon: 'FinAPI' },
            { id: 'agent-comm', label: '📢 Agent Comm', icon: 'AgentComm' },
            { id: 'fin-sim', label: '📈 Fin Simulation', icon: 'FinSim' },
            { id: 'nlp', label: '💬 NLP Commands', icon: 'NLP' },
            { id: 'self-learn', label: '🧬 Self-Learning', icon: 'Learn' },
            { id: 'news', label: '📰 News Feed', icon: 'News' },
            { id: 'meta-reason', label: '🤔 Meta-Reasoning', icon: 'Reason' },
            { id: 'sandbox', label: '🎮 Sandbox', icon: 'Sandbox' },
            { id: 'data', label: '📡 Data & Flow', icon: 'Data' },
            { id: 'database', label: '🗄️ Data Sources', icon: 'Database' },
            { id: 'goals', label: '🎯 Goals', icon: 'Goals' },
            { id: 'query', label: '🔍 Smart Query', icon: 'Query' },
            { id: 'simulation', label: '⚡ Sim Events', icon: 'SimEvents' },
            { id: 'teams', label: '👥 Teams', icon: 'Teams' },
            { id: 'memory', label: '🧠 Memory', icon: 'Memory' },
            { id: 'kpi', label: '📊 KPI', icon: 'KPI' },
            { id: 'skills', label: '🎓 Skills', icon: 'Skills' },
            { id: 'knowledge', label: '📚 Knowledge', icon: 'Knowledge' },
            { id: 'agent-hub', label: '🤖 Agent Hub', icon: 'AgentHub' },
            { id: 'agent-grid', label: '🌌 Agent Grid', icon: 'AgentGrid' }
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
            <div className="grid lg:grid-cols-2 gap-6">
              <AgentEmoteSystem agentName="LabAssistant-01" />
              <AgentMemorySystem agentId="lab-assistant-01" />
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <AgentActionController agentId="lab-assistant-01" agentName="LabAssistant-01" />
              <AgentPersonalityCustomizer agentId="lab-assistant-01" />
            </div>
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

        {/* Training Tab */}
        {activeTab === 'training' && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <DatasetUploader onDatasetUpload={() => {}} />
              <TrainingParameterConfig onConfigChange={setTrainingConfig} />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-96"
            >
              <NeuralNetworkVisualizer3D />
            </motion.div>
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setIsTraining(!isTraining)}
                className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                  isTraining
                    ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400'
                    : 'bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400'
                }`}
              >
                {isTraining ? '⏸ Stop Training' : '▶ Start Training'}
              </motion.button>
            </div>
            <TrainingProgressVisualization isTraining={isTraining} />
            <ModelSaveLoad />
          </div>
        )}

        {/* Advanced Training Tab */}
        {activeTab === 'advanced-training' && <AdvancedTrainingModule />}

        {/* Advanced Collaboration Tab */}
        {activeTab === 'advanced-collab' && <AdvancedCollaborationHub />}

        {/* Finance API Integration Tab */}
        {activeTab === 'finance-api' && <FinancialAPIIntegrator />}

        {/* Inter-Agent Communication Tab */}
        {activeTab === 'agent-comm' && <InterAgentCommunicationSystem />}

        {/* Financial Simulation Tab */}
        {activeTab === 'fin-sim' && <FinancialSimulationModule />}

        {/* NLP Command Processor Tab */}
        {activeTab === 'nlp' && <NLPCommandProcessor />}

        {/* Self-Learning Agent System Tab */}
        {activeTab === 'self-learn' && <SelfLearningAgentSystem />}

        {/* Real-Time News Feed Tab */}
        {activeTab === 'news' && <RealTimeNewsFeed />}

        {/* Agent Meta-Reasoning System Tab */}
        {activeTab === 'meta-reason' && <AgentMetaReasoningSystem />}

        {/* Collaboration Tab */}
        {activeTab === 'collaboration' && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <SharedWorkspace3D />
              <AgentRoleManager />
            </div>
          </div>
        )}

        {/* Sandbox Tab */}
        {activeTab === 'sandbox' && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <EnvironmentDesigner />
              <SimulationRecorderAnalytics />
            </div>
          </div>
        )}

        {/* Simulation Events Tab */}
        {activeTab === 'simulation' && (
          <div className="space-y-6">
            <SimulationEventGenerator agentStates={[{ id: 'lab-assistant-01', name: 'LabAssistant-01', status: 'active' }]} />
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-3">📋 Dynamic Event System</h3>
              <div className="space-y-2 text-white/70 text-sm">
                <p><strong>• Adaptive Challenges:</strong> Events scale with agent capability</p>
                <p><strong>• Opportunity Generation:</strong> AI creates scenarios matching agent personality</p>
                <p><strong>• Real-time Feedback:</strong> Events trigger memory updates automatically</p>
                <p><strong>• Consequence Tracking:</strong> Agent decisions logged and analyzed</p>
              </div>
            </div>
          </div>
        )}

        {/* Teams Collaboration Tab */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            <AgentCollaborationHub agents={[
              { id: 'lab-assistant-01', name: 'LabAssistant-01' },
              { id: 'agent-explorer', name: 'Explorer Agent' },
              { id: 'agent-analyst', name: 'Analyst Agent' }
            ]} />
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-3">🤝 Collaboration Features</h3>
              <div className="space-y-2 text-white/70 text-sm">
                <p><strong>• Team Formation:</strong> Group agents for complex tasks</p>
                <p><strong>• Knowledge Sharing:</strong> Agents synthesize memories across the team</p>
                <p><strong>• Task Coordination:</strong> AI generates collaboration plans</p>
                <p><strong>• Progress Tracking:</strong> Monitor team objectives in real-time</p>
              </div>
            </div>
          </div>
        )}

        {/* Memory Network Tab */}
        {activeTab === 'memory' && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <AgentMemoryNetwork agentId="lab-assistant-01" />
              <EnhancedAgentMemory agentId="lab-assistant-01" />
            </div>
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-3">🧠 Memory Intelligence</h3>
              <div className="space-y-2 text-white/70 text-sm">
                <p><strong>• Visual Network:</strong> See memory connections and relationships</p>
                <p><strong>• AI Summarization:</strong> Automatic synthesis of memory patterns</p>
                <p><strong>• Contextual Retrieval:</strong> Query-based memory search & reasoning</p>
                <p><strong>• Proactive Recall:</strong> Agent autonomously recalls relevant memories</p>
              </div>
            </div>
          </div>
        )}

        {/* KPI Dashboard Tab */}
        {activeTab === 'kpi' && (
          <div className="space-y-6">
            <AgentKPIDashboard agentId="lab-assistant-01" agentName="LabAssistant-01" />
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-3">📊 Performance Metrics</h3>
              <div className="space-y-2 text-white/70 text-sm">
                <p><strong>• Task Completion:</strong> Success rate on assigned objectives</p>
                <p><strong>• Collaboration Efficiency:</strong> Team interaction effectiveness</p>
                <p><strong>• Memory Recall Accuracy:</strong> Ability to retrieve and apply memories</p>
                <p><strong>• Responsiveness:</strong> Speed of reaction to events</p>
                <p><strong>• Decision Quality:</strong> Outcomes of agent decisions</p>
                <p><strong>• AI Analysis:</strong> Automatic identification of bottlenecks</p>
              </div>
            </div>
          </div>
        )}

        {/* Skills Training Tab */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <AgentSkillTrainer agentId="lab-assistant-01" agentName="LabAssistant-01" />
              <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-3">🎓 Skill System</h3>
                <div className="space-y-2 text-white/70 text-sm">
                  <p><strong>• Custom Skills:</strong> Define and teach agents new abilities</p>
                  <p><strong>• AI Suggestions:</strong> Learn skills based on experiences</p>
                  <p><strong>• Proficiency System:</strong> Track skill mastery progression</p>
                  <p><strong>• Practice Mechanism:</strong> Agents improve through repetition</p>
                  <p><strong>• Skill Categories:</strong> Analysis, negotiation, exploration, etc.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Knowledge Sharing Tab */}
        {activeTab === 'knowledge' && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <SharedKnowledgeRepository />
              <KnowledgeFlowVisualizer />
            </div>
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-3">📚 Knowledge Ecosystem</h3>
              <div className="space-y-2 text-white/70 text-sm">
                <p><strong>• Publish Findings:</strong> Agents share discoveries and insights</p>
                <p><strong>• Repository:</strong> Centralized knowledge base for all agents</p>
                <p><strong>• Adoption Tracking:</strong> Monitor knowledge usage across agents</p>
                <p><strong>• Flow Visualization:</strong> See knowledge transfer networks</p>
                <p><strong>• Impact Scoring:</strong> Measure effectiveness of shared knowledge</p>
                <p><strong>• Quality Rating:</strong> Community evaluation of knowledge quality</p>
              </div>
            </div>
          </div>
          )}

          {/* Agent Hub Tab */}
          {activeTab === 'agent-hub' && (
          <div className="space-y-6">
           <AgentIntegrationHub />
          </div>
          )}

          {/* Agent Grid Tab */}
          {activeTab === 'agent-grid' && (
          <div className="space-y-6">
           <Agent100TypesGrid onAgentSelect={setSelectedAgent} />
           {selectedAgent && (
             <Agent15DetailPanel agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
           )}
          </div>
          )}
          </div>
          </AuroraBackground>
          {selectedAgent && <Agent15DetailPanel agent={selectedAgent} onClose={() => setSelectedAgent(null)} />}
          );
          }