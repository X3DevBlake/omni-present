import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Code, Zap, Settings, Play, Database } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial } from '@react-three/drei';
import AuroraBackground from '../components/omni/AuroraBackground';
import MistralChatAssistant from '../components/ai/MistralChatAssistant';
import AutonomousNavigator from '../components/agents/AutonomousNavigator';
import EnhancedCard from '../components/ui/EnhancedCard';
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
import ImmersiveWorldSimulation from '../components/simulation/ImmersiveWorldSimulation';
import AdvancedMarketSimulation from '../components/simulation/AdvancedMarketSimulation';
import AgentCustomizationStudio from '../components/agents/AgentCustomizationStudio';
import KnowledgeBaseHub from '../components/knowledge/KnowledgeBaseHub';
import AgentLearningManager from '../components/ai/AgentLearningManager';
import AgentCollaborationManager from '../components/ai/AgentCollaborationManager';
import AgentAnalyticsDashboard from '../components/ai/AgentAnalyticsDashboard';
import BackButton from '../components/navigation/BackButton';
import EnhancedKnowledgeGraph3D from '../components/knowledge/EnhancedKnowledgeGraph3D';
import RealTimeAgentCollaboration from '../components/collaboration/RealTimeAgentCollaboration';
import ComprehensiveAgentAnalytics from '../components/analytics/ComprehensiveAgentAnalytics';
import AdaptiveTrainingModule from '../components/training/AdaptiveTrainingModule';
import AgentFineTuner from '../components/training/AgentFineTuner';
import AgentFeedbackSystem from '../components/training/AgentFeedbackSystem';
import BehaviorTreeEditor from '../components/agents/BehaviorTreeEditor';
import CustomMemoryDesigner from '../components/agents/CustomMemoryDesigner';
import DynamicSkillLearner from '../components/agents/DynamicSkillLearner';
import RealTimeSimulationMonitor from '../components/simulation/RealTimeSimulationMonitor';
import AgentNegotiationSimulator from '../components/agents/AgentNegotiationSimulator';
import ProceduralEnvironmentGenerator from '../components/simulation/ProceduralEnvironmentGenerator';
import AIScenarioIdeator from '../components/ai/AIScenarioIdeator';
import KnowledgeGraphEditor from '../components/knowledge/KnowledgeGraphEditor';
import EthicalDilemmaSimulator from '../components/simulation/EthicalDilemmaSimulator';
import RewardFunctionDesigner from '../components/training/RewardFunctionDesigner';
import SyntheticDatasetGenerator from '../components/training/SyntheticDatasetGenerator';
import Interactive3DAgentBehaviorTree from '../components/3d/Interactive3DAgentBehaviorTree';
import Memory3DNetwork from '../components/3d/Memory3DNetwork';
import SkillProgression3DTree from '../components/3d/SkillProgression3DTree';
import NeuralNetwork3DWalkthrough from '../components/3d/NeuralNetwork3DWalkthrough';
import KnowledgeGraph3DNebula from '../components/3d/KnowledgeGraph3DNebula';
import LiveSimulationDashboard from '../components/analytics/LiveSimulationDashboard';
import VoiceCommandInterface from '../components/ai/VoiceCommandInterface';
import GamifiedTrainingChallenges from '../components/gamification/GamifiedTrainingChallenges';
import CompetitiveArenaManager from '../components/training/CompetitiveArenaManager';
import ModelArchitectureDesigner from '../components/ai/ModelArchitectureDesigner';
import AgentSentimentAnalyzer from '../components/analytics/AgentSentimentAnalyzer';
import DataFlowCyberspace3D from '../components/3d/DataFlowCyberspace3D';
import ResourceAllocation3DHeatmap from '../components/3d/ResourceAllocation3DHeatmap';
import AILearningCurve3DTerrain from '../components/3d/AILearningCurve3DTerrain';
import AgentEmotionalAura3D from '../components/3d/AgentEmotionalAura3D';
import HyperparameterOptimization3D from '../components/3d/HyperparameterOptimization3D';
import AIWorldEvolution3D from '../components/simulation/AIWorldEvolution3D';
import PromptEngineeringStudio from '../components/ai/PromptEngineeringStudio';
import AnomalyDetectionVisualizer from '../components/analytics/AnomalyDetectionVisualizer';
import AIResearchAssistant from '../components/ai/AIResearchAssistant';
import OneClickDeployment from '../components/deployment/OneClickDeployment';
import SimulationEventStream3D from '../components/3d/SimulationEventStream3D';
import AgentDecisionTree3D from '../components/3d/AgentDecisionTree3D';
import CodeGenerationMatrix3D from '../components/3d/CodeGenerationMatrix3D';
import EthicsViolationAlarm3D from '../components/3d/EthicsViolationAlarm3D';
import TrainingProgressTunnel3D from '../components/3d/TrainingProgressTunnel3D';
import InterAgentRelationship3DWeb from '../components/3d/InterAgentRelationship3DWeb';
import ModelMarketplace from '../components/marketplace/ModelMarketplace';
import RealtimeCollaborationPanel from '../components/collaboration/RealtimeCollaborationPanel';
import AIKnowledgeEnhancements from '../components/knowledge/AIKnowledgeEnhancements';
import VisualWorkflowBuilder from '../components/workflow/VisualWorkflowBuilder';
import AgentMonitoringDashboard from '../components/monitoring/AgentMonitoringDashboard';
import SimulatedEnvironments from '../components/training/SimulatedEnvironments';
import AgentOrchestrationLayer from '../components/orchestration/AgentOrchestrationLayer';
import AgentCustomizationDeep from '../components/customization/AgentCustomizationDeep';
import ProactiveInsightsEngine from '../components/insights/ProactiveInsightsEngine';
import AIWorkflowOptimizer from '../components/workflow/AIWorkflowOptimizer';
import ContextAwareKnowledgeHub from '../components/knowledge/ContextAwareKnowledgeHub';
import AgentBehaviorProfiler from '../components/agents/AgentBehaviorProfiler';
import ContextKnowledgeRetrieval from '../components/knowledge/ContextKnowledgeRetrieval';
import AIAgentDebugger from '../components/debugging/AIAgentDebugger';
import AgentEthicsModule from '../components/ethics/AgentEthicsModule';
import AICollaborationVisualizer from '../components/collaboration/AICollaborationVisualizer';
import AIScenarioGenerator from '../components/simulation/AIScenarioGenerator';
import AICommunicationHub from '../components/communication/AICommunicationHub';
import EnhancedAgentOrchestration from '../components/orchestration/EnhancedAgentOrchestration';
import AutonomousAgentCreator from '../components/ai/AutonomousAgentCreator';
import SnowflakeQueryPanel from '../components/integrations/SnowflakeQueryPanel';
import AutonomousSnowflakeAgent from '../components/integrations/AutonomousSnowflakeAgent';
import ZapierConfigPanel from '../components/integrations/ZapierConfigPanel';
import ComprehensiveAgentMonitoring from '../components/monitoring/ComprehensiveAgentMonitoring';
import EnhancedAgentMarketplace from '../components/marketplace/EnhancedAgentMarketplace';
import ComprehensiveAgentDebugger from '../components/debugging/ComprehensiveAgentDebugger';
import InterAgentCollaboration from '../components/collaboration/InterAgentCollaboration';
import AdvancedAgentAnalytics from '../components/analytics/AdvancedAgentAnalytics';

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
  const [mockAgent, setMockAgent] = useState({ id: 1, name: 'Test Agent' });
  const [userEmail, setUserEmail] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

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
        <div className="mb-6">
          <BackButton />
        </div>

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
            { id: 'agent-creator', label: '✨ Agent Creator', icon: 'Creator' },
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
            { id: 'agent-grid', label: '🌌 Agent Grid', icon: 'AgentGrid' },
            { id: 'world-sim', label: '🌍 World Sim', icon: 'WorldSim' },
            { id: 'market-sim', label: '📊 Market Sim', icon: 'MarketSim' },
            { id: 'agent-studio', label: '✨ Agent Studio', icon: 'Studio' },
            { id: 'knowledge-base', label: '📚 Knowledge Base', icon: 'KB' },
            { id: 'enhanced-knowledge', label: '🧠 Enhanced Knowledge', icon: 'EKB' },
            { id: 'ai-kb-tools', label: '✨ AI KB Tools', icon: 'AIKB' },
            { id: 'adaptive-training', label: '🎯 Adaptive Training', icon: 'AdTrain' },
            { id: 'sim-environments', label: '🌐 Sim Environments', icon: 'SimEnv' },
            { id: 'orchestration', label: '🎭 Orchestration', icon: 'Orch' },
            { id: 'enhanced-orch', label: '⚡ Enhanced Orch', icon: 'EnhOrch' },
            { id: 'deep-custom', label: '🎨 Deep Customization', icon: 'DeepCustom' },
            { id: 'insights-engine', label: '💡 Insights Engine', icon: 'Insights' },
            { id: 'monitoring', label: '📡 Monitoring', icon: 'Monitor' },
            { id: 'workflow-optimizer', label: '⚡ Workflow Optimizer', icon: 'WFOptim' },
            { id: 'context-knowledge', label: '🧠 Context Knowledge', icon: 'CtxKB' },
            { id: 'behavior-profiler', label: '📊 Behavior Profiler', icon: 'BehProfile' },
            { id: 'debugger', label: '🐛 AI Debugger', icon: 'Debugger' },
            { id: 'ethics', label: '🛡️ Ethics & Safety', icon: 'Ethics' },
            { id: 'workflow-builder', label: '🔄 Workflow Builder', icon: 'Workflow' },
            { id: 'learning', label: '🎓 Learning', icon: 'Learning' },
            { id: 'collab-rt', label: '💬 Real-Time Collab', icon: 'RTCollab' },
            { id: 'ai-collab-viz', label: '🤝 AI Collaboration', icon: 'AICollab' },
            { id: 'ai-scenarios', label: '✨ AI Scenarios', icon: 'AIScenarios' },
            { id: 'ai-comm-hub', label: '📡 AI Comm Hub', icon: 'AIComm' },
            { id: 'analytics', label: '📈 Analytics', icon: 'Analytics' },
            { id: 'behavior-tree', label: '🌳 Behavior Tree', icon: 'BehaviorTree' },
            { id: 'memory-designer', label: '🧠 Memory Designer', icon: 'MemDesigner' },
            { id: 'skill-learner', label: '⚡ Skill Learner', icon: 'SkillLearn' },
            { id: 'sim-monitor', label: '📊 Sim Monitor', icon: 'SimMon' },
            { id: 'negotiation', label: '🤝 Negotiation', icon: 'Negotiation' },
            { id: 'proc-env', label: '🗺️ Proc Env', icon: 'ProcEnv' },
            { id: 'scenario-ai', label: '💡 Scenario AI', icon: 'ScenarioAI' },
            { id: 'kg-editor', label: '🕸️ KG Editor', icon: 'KGEditor' },
            { id: 'ethics-sim', label: '⚖️ Ethics Sim', icon: 'EthicsSim' },
            { id: 'reward-fn', label: '🎯 Reward Fn', icon: 'RewardFn' },
            { id: 'syn-data', label: '📊 Syn Data', icon: 'SynData' },
            { id: '3d-behavior', label: '🎨 3D Behavior', icon: '3DBehavior' },
            { id: '3d-memory', label: '🧠 3D Memory', icon: '3DMemory' },
            { id: '3d-skills', label: '🌲 3D Skills', icon: '3DSkills' },
            { id: '3d-neural', label: '🔬 3D Neural', icon: '3DNeural' },
            { id: '3d-knowledge', label: '🌌 3D Knowledge', icon: '3DKnowledge' },
            { id: 'live-dash', label: '📡 Live Dash', icon: 'LiveDash' },
            { id: 'voice', label: '🎤 Voice', icon: 'Voice' },
            { id: 'gamified', label: '🏆 Gamified', icon: 'Gamified' },
            { id: 'arena', label: '⚔️ Arena', icon: 'Arena' },
            { id: 'architecture', label: '🏗️ Architecture', icon: 'Architecture' },
            { id: 'sentiment', label: '💭 Sentiment', icon: 'Sentiment' },
            { id: 'cyberspace', label: '🌐 Cyberspace', icon: 'Cyberspace' },
            { id: 'resource-heat', label: '🔥 Resource Heat', icon: 'ResourceHeat' },
            { id: 'learning-terrain', label: '⛰️ Learning Terrain', icon: 'LearnTerrain' },
            { id: 'emotional-aura', label: '✨ Emotional Aura', icon: 'EmotionalAura' },
            { id: 'hyperparameter', label: '🎯 Hyperparameter', icon: 'Hyperparameter' },
            { id: 'world-evolution', label: '🌍 World Evolution', icon: 'WorldEvolution' },
            { id: 'prompt-studio', label: '✍️ Prompt Studio', icon: 'PromptStudio' },
            { id: 'anomaly-viz', label: '⚠️ Anomaly Viz', icon: 'AnomalyViz' },
            { id: 'research', label: '📚 Research', icon: 'Research' },
            { id: 'deploy', label: '🚀 Deploy', icon: 'Deploy' },
            { id: 'event-stream', label: '🌊 Event Stream', icon: 'EventStream' },
            { id: 'decision-tree-3d', label: '🌳 Decision 3D', icon: 'Decision3D' },
            { id: 'code-matrix', label: '💻 Code Matrix', icon: 'CodeMatrix' },
            { id: 'ethics-alarm', label: '🚨 Ethics Alarm', icon: 'EthicsAlarm' },
            { id: 'training-tunnel', label: '🛤️ Training Tunnel', icon: 'TrainTunnel' },
            { id: 'relationship-web', label: '🕸️ Relationship Web', icon: 'RelWeb' },
            { id: 'marketplace', label: '🛒 Marketplace', icon: 'Marketplace' },
            { id: 'collab-panel', label: '👥 RT Collab', icon: 'RTCollab' },
            { id: 'monitoring-dash', label: '📊 Monitoring', icon: 'Monitor' },
            { id: 'marketplace-enhanced', label: '🛍️ Marketplace', icon: 'Market' },
            { id: 'debugger-tool', label: '🐛 Debugger', icon: 'Debug' },
            { id: 'agent-collab', label: '🤝 Agent Collab', icon: 'Collab' },
            { id: 'advanced-analytics', label: '📈 Advanced Analytics', icon: 'Analytics' }
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
            <div className="grid md:grid-cols-2 gap-6">
              <AgentFineTuner
                agent={mockAgent}
                simulationData={[]}
                onFineTune={(updated) => setMockAgent(updated)}
              />
              <AgentFeedbackSystem
                agent={mockAgent}
                onFeedback={(feedback) => console.log('Feedback:', feedback)}
              />
            </div>
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

          {/* World Simulation Tab */}
          {activeTab === 'world-sim' && (
          <div className="space-y-6">
           <ImmersiveWorldSimulation />
          </div>
          )}

          {/* Market Simulation Tab */}
          {activeTab === 'market-sim' && (
          <div className="space-y-6">
           <AdvancedMarketSimulation />
          </div>
          )}

          {/* Agent Customization Studio Tab */}
          {activeTab === 'agent-studio' && (
          <div className="space-y-6">
           <AgentCustomizationStudio />
          </div>
          )}

          {/* Knowledge Base Tab */}
          {activeTab === 'knowledge-base' && (
          <div className="space-y-6">
           <KnowledgeBaseHub />
          </div>
          )}

          {/* Learning Manager Tab */}
          {activeTab === 'learning' && (
          <div className="space-y-6">
           <AgentLearningManager />
          </div>
          )}

          {/* Collaboration Tab */}
          {activeTab === 'collaboration' && (
          <div className="space-y-6">
           <AgentCollaborationManager />
          </div>
          )}

          {/* Enhanced Knowledge Graph Tab */}
          {activeTab === 'enhanced-knowledge' && (
          <div className="space-y-6">
           <EnhancedKnowledgeGraph3D />
          </div>
          )}

          {/* AI Knowledge Base Tools Tab */}
          {activeTab === 'ai-kb-tools' && (
          <div className="space-y-6">
           <AIKnowledgeEnhancements />
          </div>
          )}

          {/* Adaptive Training Tab */}
          {activeTab === 'adaptive-training' && (
          <div className="space-y-6">
           <AdaptiveTrainingModule />
          </div>
          )}

          {/* Simulated Environments Tab */}
          {activeTab === 'sim-environments' && (
          <div className="space-y-6">
           <SimulatedEnvironments />
           <ContextKnowledgeRetrieval context="AI agent training scenarios and simulated environments" />
          </div>
          )}

          {/* Orchestration Tab */}
          {activeTab === 'orchestration' && (
          <div className="space-y-6">
           <AgentOrchestrationLayer />
          </div>
          )}

          {/* Enhanced Orchestration Tab */}
          {activeTab === 'enhanced-orch' && (
          <div className="space-y-6">
           <EnhancedAgentOrchestration />
          </div>
          )}

          {/* Deep Customization Tab */}
          {activeTab === 'deep-custom' && (
          <div className="space-y-6">
           <AgentCustomizationDeep />
          </div>
          )}

          {/* Insights Engine Tab */}
          {activeTab === 'insights-engine' && (
          <div className="space-y-6">
           <ProactiveInsightsEngine />
          </div>
          )}

          {/* Monitoring Dashboard Tab */}
          {activeTab === 'monitoring' && (
          <div className="space-y-6">
           <AgentMonitoringDashboard />
           <ContextKnowledgeRetrieval context="Agent performance monitoring and KPI analysis" />
          </div>
          )}

          {/* Workflow Optimizer Tab */}
          {activeTab === 'workflow-optimizer' && (
          <div className="space-y-6">
           <AIWorkflowOptimizer />
          </div>
          )}

          {/* Context-Aware Knowledge Tab */}
          {activeTab === 'context-knowledge' && (
          <div className="space-y-6">
           <ContextAwareKnowledgeHub />
          </div>
          )}

          {/* Behavior Profiler Tab */}
          {activeTab === 'behavior-profiler' && (
          <div className="space-y-6">
           <AgentBehaviorProfiler />
          </div>
          )}

          {/* AI Debugger Tab */}
          {activeTab === 'debugger' && (
          <div className="space-y-6">
           <AIAgentDebugger />
          </div>
          )}

          {/* Ethics & Safety Tab */}
          {activeTab === 'ethics' && (
          <div className="space-y-6">
           <AgentEthicsModule />
          </div>
          )}

          {/* Workflow Builder Tab */}
          {activeTab === 'workflow-builder' && (
          <div className="space-y-6">
           <VisualWorkflowBuilder />
          </div>
          )}

          {/* Real-Time Collaboration Tab */}
          {activeTab === 'collab-rt' && (
          <div className="space-y-6">
           <RealTimeAgentCollaboration />
          </div>
          )}

          {/* AI Collaboration Visualizer Tab */}
          {activeTab === 'ai-collab-viz' && (
          <div className="space-y-6">
           <AICollaborationVisualizer />
          </div>
          )}

          {/* AI Scenario Generator Tab */}
          {activeTab === 'ai-scenarios' && (
          <div className="space-y-6">
           <AIScenarioGenerator />
          </div>
          )}

          {/* AI Communication Hub Tab */}
          {activeTab === 'ai-comm-hub' && (
          <div className="space-y-6">
           <AICommunicationHub />
          </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
          <div className="space-y-6">
           <ComprehensiveAgentAnalytics />
          </div>
          )}

          {/* Behavior Tree Editor Tab */}
          {activeTab === 'behavior-tree' && (
          <div className="space-y-6">
           <BehaviorTreeEditor agent={mockAgent} onSave={(tree) => console.log('Tree saved:', tree)} />
          </div>
          )}

          {/* Memory Designer Tab */}
          {activeTab === 'memory-designer' && (
          <div className="space-y-6">
           <CustomMemoryDesigner agent={mockAgent} onSave={(config) => console.log('Memory config:', config)} />
          </div>
          )}

          {/* Skill Learner Tab */}
          {activeTab === 'skill-learner' && (
          <div className="space-y-6">
           <DynamicSkillLearner 
             agent={mockAgent}
             taskRequirements={[
               { name: 'Complex Analysis', requiredSkills: ['data_analysis', 'pattern_recognition'] },
               { name: 'Team Coordination', requiredSkills: ['communication', 'leadership'] },
             ]}
           />
          </div>
          )}

          {/* Simulation Monitor Tab */}
          {activeTab === 'sim-monitor' && (
          <div className="space-y-6">
           <RealTimeSimulationMonitor simulation={{}} />
          </div>
          )}

          {/* Negotiation Tab */}
          {activeTab === 'negotiation' && (
          <div className="space-y-6">
           <AgentNegotiationSimulator />
          </div>
          )}

          {/* Procedural Environment Tab */}
          {activeTab === 'proc-env' && (
          <div className="space-y-6">
           <ProceduralEnvironmentGenerator />
          </div>
          )}

          {/* AI Scenario Ideator Tab */}
          {activeTab === 'scenario-ai' && (
          <div className="space-y-6">
           <AIScenarioIdeator />
          </div>
          )}

          {/* Knowledge Graph Editor Tab */}
          {activeTab === 'kg-editor' && (
          <div className="space-y-6">
           <KnowledgeGraphEditor />
          </div>
          )}

          {/* Ethical Dilemma Simulator Tab */}
          {activeTab === 'ethics-sim' && (
          <div className="space-y-6">
           <EthicalDilemmaSimulator />
          </div>
          )}

          {/* Reward Function Designer Tab */}
          {activeTab === 'reward-fn' && (
          <div className="space-y-6">
           <RewardFunctionDesigner />
          </div>
          )}

          {/* Synthetic Dataset Generator Tab */}
          {activeTab === 'syn-data' && (
          <div className="space-y-6">
           <SyntheticDatasetGenerator />
          </div>
          )}

          {/* 3D Behavior Tree Tab */}
          {activeTab === '3d-behavior' && (
          <div className="space-y-6">
           <h3 className="text-white text-xl font-bold">Interactive 3D Behavior Tree</h3>
           <Interactive3DAgentBehaviorTree />
          </div>
          )}

          {/* 3D Memory Network Tab */}
          {activeTab === '3d-memory' && (
          <div className="space-y-6">
           <h3 className="text-white text-xl font-bold">3D Memory Network</h3>
           <Memory3DNetwork />
          </div>
          )}

          {/* 3D Skills Tab */}
          {activeTab === '3d-skills' && (
          <div className="space-y-6">
           <h3 className="text-white text-xl font-bold">Skill Progression 3D Tree</h3>
           <SkillProgression3DTree />
          </div>
          )}

          {/* 3D Neural Network Tab */}
          {activeTab === '3d-neural' && (
          <div className="space-y-6">
           <h3 className="text-white text-xl font-bold">Neural Network 3D Walkthrough</h3>
           <NeuralNetwork3DWalkthrough />
          </div>
          )}

          {/* 3D Knowledge Graph Tab */}
          {activeTab === '3d-knowledge' && (
          <div className="space-y-6">
           <h3 className="text-white text-xl font-bold">Knowledge Graph 3D Nebula</h3>
           <KnowledgeGraph3DNebula />
          </div>
          )}

          {/* Live Dashboard Tab */}
          {activeTab === 'live-dash' && (
          <div className="space-y-6">
           <LiveSimulationDashboard />
          </div>
          )}

          {/* Voice Interface Tab */}
          {activeTab === 'voice' && (
          <div className="space-y-6">
           <VoiceCommandInterface onCommand={(cmd) => console.log('Voice command:', cmd)} />
          </div>
          )}

          {/* Gamified Challenges Tab */}
          {activeTab === 'gamified' && (
          <div className="space-y-6">
           <GamifiedTrainingChallenges />
          </div>
          )}

          {/* Competitive Arena Tab */}
          {activeTab === 'arena' && (
          <div className="space-y-6">
           <CompetitiveArenaManager />
          </div>
          )}

          {/* Model Architecture Tab */}
          {activeTab === 'architecture' && (
          <div className="space-y-6">
           <ModelArchitectureDesigner />
          </div>
          )}

          {/* Sentiment Analysis Tab */}
          {activeTab === 'sentiment' && (
          <div className="space-y-6">
           <AgentSentimentAnalyzer />
          </div>
          )}

          {/* Data Flow Cyberspace Tab */}
          {activeTab === 'cyberspace' && (
          <div className="space-y-6">
           <h3 className="text-white text-xl font-bold">Data Flow Cyberspace</h3>
           <DataFlowCyberspace3D />
          </div>
          )}

          {/* Resource Heat Tab */}
          {activeTab === 'resource-heat' && (
          <div className="space-y-6">
           <h3 className="text-white text-xl font-bold">Resource Allocation Heatmap</h3>
           <ResourceAllocation3DHeatmap />
          </div>
          )}

          {/* Learning Terrain Tab */}
          {activeTab === 'learning-terrain' && (
          <div className="space-y-6">
           <h3 className="text-white text-xl font-bold">AI Learning Curve Terrain</h3>
           <AILearningCurve3DTerrain />
          </div>
          )}

          {/* Emotional Aura Tab */}
          {activeTab === 'emotional-aura' && (
          <div className="space-y-6">
           <h3 className="text-white text-xl font-bold">Agent Emotional Aura</h3>
           <AgentEmotionalAura3D emotion="happy" />
          </div>
          )}

          {/* Hyperparameter Tab */}
          {activeTab === 'hyperparameter' && (
          <div className="space-y-6">
           <h3 className="text-white text-xl font-bold">Hyperparameter Optimization Space</h3>
           <HyperparameterOptimization3D />
          </div>
          )}

          {/* World Evolution Tab */}
          {activeTab === 'world-evolution' && (
          <div className="space-y-6">
           <h3 className="text-white text-xl font-bold">AI-Generated World Evolution</h3>
           <AIWorldEvolution3D />
          </div>
          )}

          {/* Prompt Studio Tab */}
          {activeTab === 'prompt-studio' && (
          <div className="space-y-6">
           <PromptEngineeringStudio />
          </div>
          )}

          {/* Anomaly Visualizer Tab */}
          {activeTab === 'anomaly-viz' && (
          <div className="space-y-6">
           <AnomalyDetectionVisualizer />
          </div>
          )}

          {/* Research Assistant Tab */}
          {activeTab === 'research' && (
          <div className="space-y-6">
           <AIResearchAssistant />
          </div>
          )}

          {/* Deployment Tab */}
          {activeTab === 'deploy' && (
          <div className="space-y-6">
           <OneClickDeployment />
          </div>
          )}

          {/* Event Stream 3D Tab */}
          {activeTab === 'event-stream' && (
          <div className="space-y-6">
           <h3 className="text-white text-xl font-bold">Simulation Event Stream 3D</h3>
           <SimulationEventStream3D />
          </div>
          )}

          {/* Decision Tree 3D Tab */}
          {activeTab === 'decision-tree-3d' && (
          <div className="space-y-6">
           <h3 className="text-white text-xl font-bold">Agent Decision Tree 3D</h3>
           <AgentDecisionTree3D />
          </div>
          )}

          {/* Code Matrix Tab */}
          {activeTab === 'code-matrix' && (
          <div className="space-y-6">
           <h3 className="text-white text-xl font-bold">Code Generation Matrix</h3>
           <CodeGenerationMatrix3D />
          </div>
          )}

          {/* Ethics Alarm Tab */}
          {activeTab === 'ethics-alarm' && (
          <div className="space-y-6">
           <h3 className="text-white text-xl font-bold">Ethics Violation Alarm 3D</h3>
           <EthicsViolationAlarm3D />
          </div>
          )}

          {/* Training Tunnel Tab */}
          {activeTab === 'training-tunnel' && (
          <div className="space-y-6">
           <h3 className="text-white text-xl font-bold">Training Progress Tunnel</h3>
           <TrainingProgressTunnel3D />
          </div>
          )}

          {/* Relationship Web Tab */}
          {activeTab === 'relationship-web' && (
          <div className="space-y-6">
           <h3 className="text-white text-xl font-bold">Inter-Agent Relationship Web</h3>
           <InterAgentRelationship3DWeb />
          </div>
          )}

          {/* Marketplace Tab */}
          {activeTab === 'marketplace' && (
          <div className="space-y-6">
           <ModelMarketplace />
          </div>
          )}

          {/* RT Collaboration Panel Tab */}
          {activeTab === 'collab-panel' && (
          <div className="space-y-6">
           <RealtimeCollaborationPanel />
          </div>
          )}

          {/* Comprehensive Monitoring Tab */}
          {activeTab === 'monitoring-dash' && userEmail && (
          <div className="space-y-6">
           <ComprehensiveAgentMonitoring userEmail={userEmail} />
          </div>
          )}

          {/* Enhanced Marketplace Tab */}
          {activeTab === 'marketplace-enhanced' && userEmail && (
          <div className="space-y-6">
           <EnhancedAgentMarketplace userEmail={userEmail} />
          </div>
          )}

          {/* Comprehensive Debugger Tab */}
          {activeTab === 'debugger-tool' && userEmail && (
          <div className="space-y-6">
           <ComprehensiveAgentDebugger userEmail={userEmail} />
          </div>
          )}

          {/* Agent Collaboration Tab */}
          {activeTab === 'agent-collab' && userEmail && (
          <div className="space-y-6">
           <InterAgentCollaboration userEmail={userEmail} />
          </div>
          )}

          {/* Advanced Analytics Tab */}
          {activeTab === 'advanced-analytics' && userEmail && (
          <div className="space-y-6">
           <AdvancedAgentAnalytics userEmail={userEmail} />
          </div>
          )}

          {/* Autonomous Agent Creator Tab */}
          {activeTab === 'agent-creator' && (
          <div className="space-y-6">
           {userEmail ? (
             <AutonomousAgentCreator userEmail={userEmail} />
           ) : (
             <div className="text-center py-12 text-white/60">
               Please log in to create agents
             </div>
           )}
          </div>
          )}

          {/* Snowflake Integration Tab */}
          {activeTab === 'snowflake' && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <SnowflakeQueryPanel />
              {userEmail && <AutonomousSnowflakeAgent userEmail={userEmail} />}
            </div>
            <ZapierConfigPanel />
          </div>
          )}
          </div>
          </AuroraBackground>
          );
          }