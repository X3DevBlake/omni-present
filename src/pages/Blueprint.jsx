import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Database, HardDrive, Wifi, ChevronRight, X, Info, Layers, Plus, MessageCircle, Send, Users, History, Share2, Save, FolderOpen, Wand2, Gauge, Bot, Map } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import Blueprint3DViewer from '../components/blueprint/Blueprint3DViewer';
import AutomatedBlueprintGenerator from '../components/blueprint/AutomatedBlueprintGenerator';
import BlueprintControlPanel from '../components/blueprint/BlueprintControlPanel';
import AgentCreator from '../components/blueprint/AgentCreator';
import EnvironmentCreator from '../components/blueprint/EnvironmentCreator';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import HolographicAIAgent from '../components/blueprint/HolographicAIAgent';
import Environment3DScene from '../components/blueprint/Environment3DScene';

const componentsData = [
  { 
    position: [0, 0, 0], 
    size: [0.8, 0.8, 0.8], 
    color: '#00f5ff', 
    label: 'Neural Core',
    description: 'Central AI processor',
    stats: '2.5 PetaFLOPS',
    connections: [1, 2],
    details: {
      specs: 'Custom tensor core array',
      power: '450W TDP',
      cooling: 'Liquid cooling',
      performance: 'INT8: 5 PFLOPS'
    }
  },
  { 
    position: [1.5, 0, 0], 
    size: [0.5, 0.5, 0.5], 
    color: '#a855f7', 
    label: 'GPU Array 1',
    description: 'NVIDIA HGX 8-GPU',
    stats: '640GB HBM3',
    connections: [0, 5],
    details: { specs: 'NVIDIA HGX H100', cores: '142,336 CUDA cores' }
  },
  { 
    position: [-1.5, 0, 0], 
    size: [0.5, 0.5, 0.5], 
    color: '#a855f7', 
    label: 'GPU Array 2',
    description: 'NVIDIA HGX 8-GPU',
    stats: '640GB HBM3',
    connections: [0, 5],
    details: { specs: 'Redundant HGX H100', cores: '142,336 CUDA cores' }
  },
  { 
    position: [0, 1.2, 0], 
    size: [0.4, 0.3, 0.6], 
    color: '#ec4899', 
    label: 'Memory Pool',
    description: 'DDR5 System RAM',
    stats: '2TB Capacity',
    connections: [0, 4],
    details: { specs: 'DDR5-5600', bandwidth: '358 GB/s' }
  },
  { 
    position: [0, -1.2, 0], 
    size: [0.4, 0.3, 0.6], 
    color: '#ec4899', 
    label: 'Storage Layer',
    description: 'NVMe SSD Array',
    stats: '50TB Storage',
    connections: [0, 3],
    details: { specs: 'PCIe Gen5 NVMe', speed: '14,000 MB/s' }
  },
  { 
    position: [0, 0, 1.2], 
    size: [0.3, 0.3, 0.3], 
    color: '#3b82f6', 
    label: 'Network Hub',
    description: '400Gbps InfiniBand',
    stats: 'Low-latency mesh',
    connections: [1, 2, 6],
    details: { specs: 'InfiniBand HDR', bandwidth: '400 Gbps' }
  },
  { 
    position: [0, 0, -1.2], 
    size: [0.3, 0.3, 0.3], 
    color: '#3b82f6', 
    label: 'I/O Controller',
    description: 'PCIe Gen5 Interface',
    stats: '128 GT/s',
    connections: [5],
    details: { specs: 'PCIe 5.0 x64', bandwidth: '128 GT/s' }
  },
];

const blueprintLayers = [
  { icon: Cpu, label: 'Hardware Layer', tech: 'NVIDIA Architectures', feature: 'Exploded GPU view' },
  { icon: Database, label: 'Data Layer', tech: 'Vertex AI Streams', feature: 'Data flow pulse' },
  { icon: HardDrive, label: 'Logic Layer', tech: 'Generative AI Design', feature: 'Real-time updates' },
  { icon: Wifi, label: 'UI/UX Layer', tech: '@react-three/drei', feature: 'Live annotations' },
];

const defaultTemplates = [
  { id: 'ml-training', name: 'ML Training', description: 'High-performance setup for AI training', components: [0, 1, 2, 3, 5] },
  { id: 'web-serving', name: 'Web Serving', description: 'Optimized for web applications', components: [0, 3, 4, 5, 6] },
  { id: 'data-processing', name: 'Data Processing', description: 'ETL and batch processing', components: [0, 3, 4, 5] },
  { id: 'inference', name: 'Inference', description: 'Real-time AI inference', components: [0, 1, 3, 5, 6] },
];

export default function Blueprint() {
  const [exploded, setExploded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [buildMode, setBuildMode] = useState(false);
  const [buildComponents, setBuildComponents] = useState([]);
  const [showConnections, setShowConnections] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [isProcessingPrompt, setIsProcessingPrompt] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [versionHistory, setVersionHistory] = useState([]);
  const [blueprintName, setBlueprintName] = useState('Untitled Blueprint');
  const [shareEmail, setShareEmail] = useState('');
  const [showPerformance, setShowPerformance] = useState(false);
  const [lightingPreset, setLightingPreset] = useState('default');
  const [showAIOptimizer, setShowAIOptimizer] = useState(false);
  const [optimizationMode, setOptimizationMode] = useState('balanced');
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showAutoGenerator, setShowAutoGenerator] = useState(false);
  const [showControlPanel, setShowControlPanel] = useState(false);
  const [showAgentCreator, setShowAgentCreator] = useState(false);
  const [showEnvironmentCreator, setShowEnvironmentCreator] = useState(false);
  const [holographicAgents, setHolographicAgents] = useState([]);
  const [currentEnvironment, setCurrentEnvironment] = useState('office');
  const [agentMovementTargets, setAgentMovementTargets] = useState({});
  const sectionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const progress = Math.max(0, Math.min(1, 1 - (rect.top / viewportHeight)));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simulate collaborators with moving cursors
  useEffect(() => {
    const mockCollaborators = [
      { name: 'Alice', color: '#ff6b6b', email: 'alice@example.com', position: [1, 0.5, 0] },
      { name: 'Bob', color: '#4ecdc4', email: 'bob@example.com', position: [-1, 0.5, 0] }
    ];
    setCollaborators(mockCollaborators);

    // Simulate cursor movement
    const interval = setInterval(() => {
      setCollaborators(prev => prev.map(c => ({
        ...c,
        position: [
          (Math.random() - 0.5) * 3,
          Math.random() * 2,
          (Math.random() - 0.5) * 3
        ]
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const addComponentToBuild = (componentType) => {
    const baseComponent = componentsData[componentType];
    const newComponent = {
      ...baseComponent,
      id: `${Date.now()}-${Math.random()}`,
      position: [(Math.random() - 0.5) * 3, 2, (Math.random() - 0.5) * 3],
    };
    setBuildComponents([...buildComponents, newComponent]);
    saveVersion('Added component: ' + baseComponent.label);
  };

  const removeComponentFromBuild = (index) => {
    const removed = buildComponents[index];
    setBuildComponents(buildComponents.filter((_, i) => i !== index));
    if (removed) saveVersion('Removed component: ' + removed.label);
  };

  const saveVersion = (action) => {
    const version = {
      id: Date.now(),
      timestamp: new Date(),
      action,
      components: [...buildComponents],
      name: blueprintName
    };
    setVersionHistory([version, ...versionHistory.slice(0, 9)]);
  };

  const revertToVersion = (version) => {
    setBuildComponents(version.components);
    setBlueprintName(version.name);
    setShowVersionHistory(false);
    toast.success('Reverted to version from ' + new Date(version.timestamp).toLocaleString());
  };

  const saveAsTemplate = async () => {
    try {
      const user = await base44.auth.me();
      const template = {
        id: Date.now().toString(),
        name: blueprintName,
        description: `Custom template with ${buildComponents.length} components`,
        components: buildComponents.map((c, idx) => componentsData.findIndex(comp => comp.label === c.label)),
        thumbnail: '🎨',
        created_by: user.email,
        created_at: new Date().toISOString()
      };
      
      await base44.auth.updateMe({
        blueprint_templates: [...(user.blueprint_templates || []), template]
      });
      
      toast.success('Template saved to your library!');
      setShowTemplates(true);
    } catch (error) {
      toast.error('Failed to save template');
    }
  };

  const deleteTemplate = async (templateId) => {
    try {
      const user = await base44.auth.me();
      const updated = (user.blueprint_templates || []).filter(t => t.id !== templateId);
      await base44.auth.updateMe({ blueprint_templates: updated });
      toast.success('Template deleted');
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  const loadTemplate = (template) => {
    const components = template.components.map(idx => {
      const base = componentsData[idx];
      return {
        ...base,
        id: `${Date.now()}-${Math.random()}-${idx}`,
        position: [(Math.random() - 0.5) * 3, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 3]
      };
    });
    setBuildComponents(components);
    setBlueprintName(template.name);
    setShowTemplates(false);
    saveVersion('Loaded template: ' + template.name);
    toast.success('Template loaded!');
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = { 
        user: 'You', 
        text: newMessage, 
        time: new Date(),
        color: '#00f5ff',
        component: selectedComponent !== null ? componentsData[selectedComponent]?.label : null
      };
      setChatMessages([...chatMessages, message]);
      setNewMessage('');
    }
  };

  const handleAIPrompt = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsProcessingPrompt(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on: "${aiPrompt}", suggest component indices (0-6) to add. Available: 0=Neural Core, 1=GPU1, 2=GPU2, 3=Memory, 4=Storage, 5=Network, 6=I/O. Return JSON array like [1,2,5]`,
        response_json_schema: {
          type: "object",
          properties: {
            components: { type: "array", items: { type: "integer" } },
            explanation: { type: "string" }
          }
        }
      });

      if (result.components) {
        result.components.forEach(idx => {
          if (idx >= 0 && idx < componentsData.length) {
            addComponentToBuild(idx);
          }
        });
        toast.success(result.explanation || 'Components added!');
      }
    } catch (error) {
      toast.error('Failed to process prompt');
    } finally {
      setIsProcessingPrompt(false);
      setAiPrompt('');
    }
  };

  const shareBlueprint = async () => {
    if (!shareEmail.trim()) return;
    
    try {
      await base44.integrations.Core.SendEmail({
        to: shareEmail,
        subject: `Blueprint shared: ${blueprintName}`,
        body: `You've been invited to collaborate on "${blueprintName}". It contains ${buildComponents.length} components.`
      });
      toast.success('Blueprint shared with ' + shareEmail);
      setShareEmail('');
      setShowShareDialog(false);
    } catch (error) {
      toast.error('Failed to share blueprint');
    }
  };

  const analyzeBlueprint = async () => {
    if (buildComponents.length === 0) {
      toast.error('Add components first');
      return;
    }

    setIsOptimizing(true);
    setShowAIOptimizer(true);

    try {
      const componentLoads = buildComponents.map(c => ({ label: c.label, load: c.load || 0 }));
      const avgLoad = componentLoads.reduce((sum, c) => sum + c.load, 0) / componentLoads.length;
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Proactively analyze AI infrastructure with ${buildComponents.length} components and ${avgLoad.toFixed(0)}% avg load.
        
        Components: ${buildComponents.map(c => `${c.label} (${c.load || 0}% load)`).join(', ')}
        Optimization: ${optimizationMode}
        
        Analyze:
        1. Usage patterns and load distribution
        2. Performance bottlenecks (focus on >80% load)
        3. Redundant/underutilized components (<30% load)
        4. Optimal placements based on dependencies
        5. Config adjustments for ${optimizationMode}
        6. Efficiency score (0-100)`,
        response_json_schema: {
          type: "object",
          properties: {
            score: { type: "number" },
            bottlenecks: { type: "array", items: { type: "string" } },
            redundancies: { type: "array", items: { type: "string" } },
            placements: { type: "array", items: { type: "string" } },
            configurations: { type: "array", items: { type: "string" } },
            summary: { type: "string" }
          }
        }
      });

      setAiSuggestions(result);
      toast.success('Proactive analysis complete!');
    } catch (error) {
      toast.error('Failed to analyze blueprint');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleAutoGenerated = (blueprint) => {
    const componentsData = [
      { position: [0, 0, 0], size: [0.8, 0.8, 0.8], color: '#00f5ff', label: 'Neural Core', load: 85 },
      { position: [1.5, 0, 0], size: [0.5, 0.5, 0.5], color: '#a855f7', label: 'GPU Array 1', load: 92 },
      { position: [-1.5, 0, 0], size: [0.5, 0.5, 0.5], color: '#a855f7', label: 'GPU Array 2', load: 78 },
      { position: [0, 1.2, 0], size: [0.4, 0.3, 0.6], color: '#ec4899', label: 'Memory Pool', load: 65 },
      { position: [0, -1.2, 0], size: [0.4, 0.3, 0.6], color: '#ec4899', label: 'Storage Layer', load: 45 },
      { position: [0, 0, 1.2], size: [0.3, 0.3, 0.3], color: '#3b82f6', label: 'Network Hub', load: 88 },
      { position: [0, 0, -1.2], size: [0.3, 0.3, 0.3], color: '#3b82f6', label: 'I/O Controller', load: 55 },
    ];

    const components = blueprint.components.map((idx, i) => {
      const base = componentsData[idx];
      const pos = blueprint.positions?.[i] || [(Math.random() - 0.5) * 3, 0, (Math.random() - 0.5) * 3];
      return {
        ...base,
        id: `${Date.now()}-${i}`,
        position: pos
      };
    });

    setBuildComponents(components);
    setBlueprintName(blueprint.name);
    setBuildMode(true);
    saveVersion('Generated: ' + blueprint.name);
  };

  const applyAIOptimization = () => {
    toast.success('Optimization applied! Components repositioned for better performance.');
    setShowAIOptimizer(false);
  };

  const handleAgentCreated = (agent) => {
    setHolographicAgents([...holographicAgents, agent]);
    toast.success(`Agent "${agent.name}" created!`);
  };

  const deleteAgent = (agentId) => {
    setHolographicAgents(holographicAgents.filter(a => a.id !== agentId));
    toast.success('Agent removed');
  };

  const handleEnvironmentClick = (event) => {
    if (holographicAgents.length > 0 && event.point) {
      const randomAgent = holographicAgents[Math.floor(Math.random() * holographicAgents.length)];
      setAgentMovementTargets({
        ...agentMovementTargets,
        [randomAgent.id]: [event.point.x, event.point.y, event.point.z]
      });
    }
  };

  const selectedComponentData = componentsData[selectedComponent];

  return (
    <AuroraBackground className="min-h-screen">
      <section ref={sectionRef} className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-8 lg:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Technical
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Blueprint</span>
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto text-base sm:text-lg px-4">
              {buildMode ? blueprintName : 'Explore the architecture powering omnipresent intelligence'}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative order-2 lg:order-1"
            >
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 aspect-square relative overflow-hidden">
                <Blueprint3DViewer
                  exploded={exploded}
                  scrollProgress={scrollProgress}
                  selectedComponent={selectedComponent}
                  onComponentClick={setSelectedComponent}
                  buildMode={buildMode}
                  buildComponents={buildComponents}
                  onBuildComponentClick={removeComponentFromBuild}
                  showConnections={showConnections}
                  collaborators={collaborators}
                  showPerformance={showPerformance}
                  lightingPreset={lightingPreset}
                  onComponentPositionUpdate={(index, newPos) => {
                    setBuildComponents(prev => prev.map((comp, i) => 
                      i === index ? { ...comp, position: newPos } : comp
                    ));
                  }}
                />
                
                <div className="absolute bottom-4 left-4 right-4 flex gap-2 flex-wrap">
                  {!buildMode && (
                    <button
                      onClick={() => setExploded(!exploded)}
                      className={`flex-1 py-2 rounded-xl font-medium transition-all text-xs sm:text-sm ${
                        exploded 
                          ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300' 
                          : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                      }`}
                    >
                      {exploded ? 'Collapse' : 'Explode'}
                    </button>
                  )}
                  
                  <button
                    onClick={() => setShowConnections(!showConnections)}
                    className={`px-3 py-2 rounded-xl font-medium transition-all text-xs sm:text-sm ${
                      showConnections
                        ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300'
                        : 'bg-white/5 border border-white/10 text-white/60'
                    }`}
                  >
                    Links
                  </button>

                  <button
                    onClick={() => setShowPerformance(!showPerformance)}
                    className={`px-3 py-2 rounded-xl font-medium transition-all text-xs sm:text-sm ${
                      showPerformance
                        ? 'bg-green-500/20 border border-green-500/40 text-green-300'
                        : 'bg-white/5 border border-white/10 text-white/60'
                    }`}
                  >
                    Perf
                  </button>
                  
                  <button
                    onClick={() => {
                      setBuildMode(!buildMode);
                      setSelectedComponent(null);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all text-xs sm:text-sm ${
                      buildMode
                        ? 'bg-pink-500/20 border border-pink-500/40 text-pink-300'
                        : 'bg-green-500/20 border border-green-500/40 text-green-300'
                    }`}
                  >
                    <Layers className="w-3 h-3" />
                    {buildMode ? 'Exit' : 'Build'}
                  </button>
                </div>

                {collaborators.length > 0 && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-black/80 backdrop-blur-sm border border-white/20">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span className="text-white text-xs">{collaborators.length}</span>
                    <div className="flex -space-x-2">
                      {collaborators.map((c, i) => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: c.color }}>
                          {c.name[0]}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="absolute top-4 left-4 lg:hidden">
                  <div className="px-3 py-2 rounded-lg bg-black/80 backdrop-blur-sm border border-white/20">
                    <p className="text-white/60 text-xs">Pinch zoom • Drag rotate</p>
                  </div>
                </div>
              </div>

              {buildMode && (
                <div className="mt-4 space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setShowVersionHistory(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded-xl text-sm hover:bg-blue-500/30"
                    >
                      <History className="w-4 h-4" />
                      History
                    </button>
                    <button
                      onClick={() => setShowShareDialog(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-xl text-sm hover:bg-purple-500/30"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                    <button
                      onClick={saveAsTemplate}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/40 text-green-300 rounded-xl text-sm hover:bg-green-500/30"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => setShowTemplates(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/40 text-orange-300 rounded-xl text-sm hover:bg-orange-500/30"
                    >
                      <FolderOpen className="w-4 h-4" />
                      Templates
                    </button>
                    <button
                      onClick={() => setShowAutoGenerator(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 text-cyan-300 rounded-xl text-sm hover:from-cyan-500/30 hover:to-purple-500/30"
                    >
                      <Wand2 className="w-4 h-4" />
                      Auto Generate
                    </button>
                    <button
                      onClick={() => setShowControlPanel(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 rounded-xl text-sm hover:bg-indigo-500/30"
                    >
                      <Gauge className="w-4 h-4" />
                      Control Panel
                    </button>
                    <button
                      onClick={() => setShowAgentCreator(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 text-green-300 rounded-xl text-sm hover:from-green-500/30 hover:to-emerald-500/30"
                    >
                      <Bot className="w-4 h-4" />
                      Create Agent
                    </button>
                    <button
                      onClick={() => setShowEnvironmentCreator(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/40 text-blue-300 rounded-xl text-sm hover:from-blue-500/30 hover:to-cyan-500/30"
                    >
                      <Map className="w-4 h-4" />
                      Environment
                    </button>
                    </div>

                  <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-3">
                    <h4 className="text-white text-xs font-semibold mb-2">Lighting</h4>
                    <div className="flex gap-2">
                      {['default', 'dramatic', 'soft', 'neon'].map(preset => (
                        <button
                          key={preset}
                          onClick={() => setLightingPreset(preset)}
                          className={`px-3 py-1 rounded-lg text-xs capitalize ${
                            lightingPreset === preset
                              ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-300'
                              : 'bg-white/5 border border-white/10 text-white/60'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-4">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <span className="text-lg">🤖</span>
                      AI Optimization
                    </h4>
                    <p className="text-white/60 text-xs mb-3">Let AI analyze and optimize your blueprint</p>
                    <div className="flex gap-2 mb-3">
                      {['cost', 'speed', 'balanced'].map(mode => (
                        <button
                          key={mode}
                          onClick={() => setOptimizationMode(mode)}
                          className={`px-3 py-1 rounded-lg text-xs capitalize ${
                            optimizationMode === mode
                              ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-300'
                              : 'bg-white/5 border border-white/10 text-white/60'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={analyzeBlueprint}
                      disabled={isOptimizing || buildComponents.length === 0}
                      className="w-full py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                      {isOptimizing ? 'Analyzing...' : 'Analyze Blueprint'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div
              className="order-1 lg:order-2 space-y-4"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {buildMode ? (
                <div className="space-y-3">
                  <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                    <input
                      type="text"
                      value={blueprintName}
                      onChange={(e) => setBlueprintName(e.target.value)}
                      className="w-full bg-transparent border-none text-white font-semibold text-lg outline-none"
                      placeholder="Blueprint Name"
                    />
                  </div>

                  <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                    <h3 className="text-white font-semibold text-sm mb-2">AI Assistant</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAIPrompt()}
                        placeholder="Add GPUs for ML training..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/40"
                        disabled={isProcessingPrompt}
                      />
                      <button
                        onClick={handleAIPrompt}
                        disabled={isProcessingPrompt}
                        className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-lg text-sm hover:bg-cyan-500/30 disabled:opacity-50"
                      >
                        {isProcessingPrompt ? '...' : 'Build'}
                      </button>
                    </div>
                  </div>

                  <h3 className="text-white font-semibold text-sm">Add Components</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {componentsData.map((comp, index) => (
                      <button
                        key={index}
                        onClick={() => addComponentToBuild(index)}
                        className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-3 hover:border-cyan-500/30 transition-all group"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Plus className="w-3 h-3 text-cyan-400 group-hover:scale-110 transition-transform" />
                          <div className="w-5 h-5 rounded" style={{ backgroundColor: comp.color, opacity: 0.5 }} />
                        </div>
                        <div className="text-white text-xs font-medium text-left">{comp.label}</div>
                        <div className="text-white/40 text-[10px] text-left">{comp.stats}</div>
                      </button>
                    ))}
                  </div>
                  
                  {buildComponents.length > 0 && (
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-3">
                      <h4 className="text-white font-medium mb-1 text-xs">Your Build ({buildComponents.length})</h4>
                      <div className="text-white/60 text-[10px]">Click components to remove</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {blueprintLayers.map((layer, index) => {
                    const Icon = layer.icon;
                    return (
                      <div key={index} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:border-cyan-500/30 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-cyan-400" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <h3 className="text-white font-semibold mb-1 text-sm">{layer.label}</h3>
                            <p className="text-white/40 text-xs mb-1">{layer.tech}</p>
                            <div className="flex items-center gap-1 text-cyan-400/70 text-xs">
                              <ChevronRight className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{layer.feature}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Chat Button */}
      <motion.button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle className="w-6 h-6" />
        {chatMessages.length > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs">
            {chatMessages.length}
          </div>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            className="fixed bottom-24 right-6 w-80 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl z-40"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Team Chat</h3>
              <div className="flex items-center gap-2">
                {collaborators.map((c, i) => (
                  <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                ))}
                <span className="text-white/60 text-xs">{collaborators.length} online</span>
              </div>
            </div>
            <div className="space-y-2 mb-3 max-h-60 overflow-y-auto">
              {chatMessages.length === 0 ? (
                <p className="text-white/40 text-sm">No messages yet. Start collaborating!</p>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-2 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: msg.color || '#00f5ff' }} />
                      <div className="text-cyan-400 text-xs font-medium">{msg.user}</div>
                      <div className="text-white/40 text-xs ml-auto">{new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <div className="text-white text-sm">{msg.text}</div>
                    {msg.component && (
                      <div className="mt-1 px-2 py-1 bg-purple-500/20 rounded text-purple-300 text-xs">
                        📍 {msg.component}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/40"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-lg hover:bg-cyan-500/30"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            {selectedComponent !== null && (
              <div className="mt-2 text-xs text-white/60 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                Commenting on: {componentsData[selectedComponent]?.label}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Version History */}
      <AnimatePresence>
        {showVersionHistory && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowVersionHistory(false)} />
            <motion.div
              className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <button
                onClick={() => setShowVersionHistory(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>

              <h3 className="text-2xl font-bold text-white mb-4">Version History</h3>
              
              {versionHistory.length === 0 ? (
                <p className="text-white/50">No version history yet</p>
              ) : (
                <div className="space-y-2">
                  {versionHistory.map((version) => (
                    <div key={version.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-white font-medium">{version.action}</div>
                          <div className="text-white/50 text-sm">{new Date(version.timestamp).toLocaleString()}</div>
                        </div>
                        <button
                          onClick={() => revertToVersion(version)}
                          className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-lg text-sm hover:bg-cyan-500/30"
                        >
                          Revert
                        </button>
                      </div>
                      <div className="text-white/40 text-xs">{version.components.length} components</div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Dialog */}
      <AnimatePresence>
        {showShareDialog && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowShareDialog(false)} />
            <motion.div
              className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <button
                onClick={() => setShowShareDialog(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>

              <h3 className="text-2xl font-bold text-white mb-4">Share Blueprint</h3>
              
              <div className="mb-4">
                <label className="text-white/70 text-sm mb-2 block">Email address</label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && shareBlueprint()}
                  placeholder="colleague@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40"
                />
              </div>

              <div className="mb-4">
                <div className="text-white/70 text-sm mb-2">Currently collaborating</div>
                <div className="space-y-2">
                  {collaborators.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg p-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: c.color }}>
                        {c.name[0]}
                      </div>
                      <div>
                        <div className="text-white text-sm">{c.name}</div>
                        <div className="text-white/50 text-xs">{c.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={shareBlueprint}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium rounded-xl hover:opacity-90"
              >
                Send Invitation
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Templates Library */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowTemplates(false)} />
            <motion.div
              className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <button
                onClick={() => setShowTemplates(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>

              <h3 className="text-2xl font-bold text-white mb-4">Blueprint Templates</h3>

              <div className="mb-6">
                <h4 className="text-cyan-400 font-semibold mb-3 text-sm">📦 Built-in Templates</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {defaultTemplates.map((template) => (
                    <div key={template.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-2xl mb-1">🔧</div>
                        <div className="px-2 py-1 bg-blue-500/20 rounded text-blue-300 text-xs">Built-in</div>
                      </div>
                      <h4 className="text-white font-semibold mb-1">{template.name}</h4>
                      <p className="text-white/60 text-xs mb-3">{template.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-white/40 text-xs">{template.components.length} components</div>
                        <button
                          onClick={() => loadTemplate(template)}
                          className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs hover:bg-cyan-500/30"
                        >
                          Load
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-purple-400 font-semibold text-sm">✨ My Templates</h4>
                  <button
                    onClick={saveAsTemplate}
                    disabled={buildComponents.length === 0}
                    className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-lg text-xs hover:bg-purple-500/30 disabled:opacity-50"
                  >
                    Save Current as Template
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
                    <div className="text-4xl mb-2">➕</div>
                    <p className="text-white/60 text-xs">Save your custom blueprints as reusable templates</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Optimizer Panel */}
      <AnimatePresence>
        {showAIOptimizer && aiSuggestions && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAIOptimizer(false)} />
            <motion.div
              className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <button
                onClick={() => setShowAIOptimizer(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-3xl">
                  🤖
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">AI Analysis Complete</h3>
                  <p className="text-white/60">Blueprint efficiency: {aiSuggestions.score}/100</p>
                </div>
              </div>

              <div className="mb-4 p-4 bg-white/5 rounded-xl">
                <p className="text-white/80 text-sm">{aiSuggestions.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <h4 className="text-red-400 font-semibold mb-2 text-sm">⚠️ Bottlenecks</h4>
                  <ul className="space-y-1">
                    {aiSuggestions.bottlenecks.map((item, i) => (
                      <li key={i} className="text-white/70 text-xs">• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <h4 className="text-yellow-400 font-semibold mb-2 text-sm">♻️ Redundancies</h4>
                  <ul className="space-y-1">
                    {aiSuggestions.redundancies.map((item, i) => (
                      <li key={i} className="text-white/70 text-xs">• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <h4 className="text-blue-400 font-semibold mb-2 text-sm">📍 Placement Tips</h4>
                  <ul className="space-y-1">
                    {aiSuggestions.placements.map((item, i) => (
                      <li key={i} className="text-white/70 text-xs">• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <h4 className="text-green-400 font-semibold mb-2 text-sm">⚙️ Config Changes</h4>
                  <ul className="space-y-1">
                    {aiSuggestions.configurations.map((item, i) => (
                      <li key={i} className="text-white/70 text-xs">• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={applyAIOptimization}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium rounded-xl hover:opacity-90"
              >
                Apply Optimizations
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Automated Generator */}
      <AutomatedBlueprintGenerator
        show={showAutoGenerator}
        onClose={() => setShowAutoGenerator(false)}
        onGenerated={handleAutoGenerated}
      />

      {/* Control Panel */}
      <BlueprintControlPanel
        show={showControlPanel}
        onClose={() => setShowControlPanel(false)}
        blueprint={{ components: buildComponents, name: blueprintName }}
      />

      {/* Agent Creator */}
      <AgentCreator
        show={showAgentCreator}
        onClose={() => setShowAgentCreator(false)}
        onAgentCreated={handleAgentCreated}
      />

      {/* Environment Creator */}
      <EnvironmentCreator
        show={showEnvironmentCreator}
        onClose={() => setShowEnvironmentCreator(false)}
        onEnvironmentSelect={setCurrentEnvironment}
        currentEnvironment={currentEnvironment}
      />

      {/* Holographic Agents Section */}
      {holographicAgents.length > 0 && (
        <motion.div
          className="fixed bottom-6 left-6 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl z-40 max-w-sm"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Bot className="w-5 h-5 text-cyan-400" />
            Active Agents ({holographicAgents.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {holographicAgents.map((agent) => (
              <div key={agent.id} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: agent.color }} />
                    <span className="text-white text-sm font-medium">{agent.name}</span>
                  </div>
                  <button
                    onClick={() => deleteAgent(agent.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-white/60 text-xs">{agent.type}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 3D Holographic Agents Display with Environment */}
      <AnimatePresence>
        {holographicAgents.length > 0 && (
          <motion.div
            className="fixed top-1/2 right-6 -translate-y-1/2 w-96 h-96 bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden z-30"
            initial={{ opacity: 0, scale: 0.8, x: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 100 }}
          >
            <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
              <h4 className="text-white font-semibold text-sm">Environment: {currentEnvironment}</h4>
              <button
                onClick={() => setShowEnvironmentCreator(true)}
                className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded text-xs hover:bg-cyan-500/30"
              >
                Change
              </button>
            </div>
            <Canvas camera={{ position: [0, 5, 10], fov: 60 }} onClick={handleEnvironmentClick}>
              <Environment3DScene environmentType={currentEnvironment} />

              {holographicAgents.map((agent, i) => (
                <HolographicAIAgent
                  key={agent.id}
                  agent={agent}
                  position={[Math.sin(i * 1.5) * 3, 0, Math.cos(i * 1.5) * 3]}
                  scale={0.6}
                  isMoving={!!agentMovementTargets[agent.id]}
                  targetPosition={agentMovementTargets[agent.id]}
                />
              ))}

              <OrbitControls enableZoom={true} enablePan={true} maxPolarAngle={Math.PI / 2} />
            </Canvas>
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 rounded-lg p-2 text-white/70 text-xs">
              Click environment to move agents
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Component Detail Panel */}
      <AnimatePresence>
        {selectedComponent !== null && selectedComponentData && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedComponent(null)} />
            <motion.div
              className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <button
                onClick={() => setSelectedComponent(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>

              <div className="flex items-start gap-4 mb-6">
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: selectedComponentData.color, opacity: 0.2 }}
                >
                  <Info className="w-8 h-8" style={{ color: selectedComponentData.color }} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{selectedComponentData.label}</h3>
                  <p className="text-white/50">{selectedComponentData.description}</p>
                  <div className="mt-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-sm inline-block">
                    {selectedComponentData.stats}
                  </div>
                </div>
              </div>

              {selectedComponentData.connections && (
                <div className="mb-4 bg-white/5 rounded-xl p-4">
                  <div className="text-cyan-400 text-sm font-medium mb-2">Connected Components</div>
                  <div className="flex gap-2 flex-wrap">
                    {selectedComponentData.connections.map(idx => (
                      <div key={idx} className="px-3 py-1 rounded-full bg-white/10 text-white text-xs">
                        {componentsData[idx]?.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {Object.entries(selectedComponentData.details).map(([key, value]) => (
                  <div key={key} className="bg-white/5 rounded-xl p-3">
                    <div className="text-cyan-400 text-sm font-medium mb-1 capitalize">{key}</div>
                    <div className="text-white/80 text-sm">{value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuroraBackground>
  );
}