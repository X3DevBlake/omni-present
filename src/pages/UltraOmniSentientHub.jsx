import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Brain, 
  Map, 
  Sparkles, 
  Code, 
  BookOpen, 
  Layers,
  Activity,
  Zap
} from 'lucide-react';

import SemanticSceneExplorer3D from '../components/spatial/SemanticSceneExplorer3D';
import QuantumReasoningVisualizer3D from '../components/cognition/QuantumReasoningVisualizer3D';
import PredictivePathVisualizer3D from '../components/spatial/PredictivePathVisualizer3D';
import ProactiveInsightPanel from '../components/assistant/ProactiveInsightPanel';
import AICodeGenerationStudio from '../components/developer/AICodeGenerationStudio';
import LivingDocumentationHub from '../components/documentation/LivingDocumentationHub';
import SpatialSDKDebugger3D from '../components/developer/SpatialSDKDebugger3D';
import BiometricAdaptiveUI from '../components/assistant/BiometricAdaptiveUI';
import MultiModalController from '../components/interaction/MultiModalController';
import AISkillMarketplace from '../components/marketplace/AISkillMarketplace';

export default function UltraOmniSentientHub() {
  const [refreshInterval, setRefreshInterval] = useState(5000);

  // Fetch all data streams
  const { data: semanticGraph = [] } = useQuery({
    queryKey: ['semantic-graph'],
    queryFn: () => base44.entities.EnvironmentSemanticGraph.list(),
    refetchInterval: refreshInterval
  });

  const { data: quantumStates = [] } = useQuery({
    queryKey: ['quantum-states'],
    queryFn: () => base44.entities.QuantumCognitionState.list(),
    refetchInterval: refreshInterval
  });

  const { data: obstacles = [] } = useQuery({
    queryKey: ['predictive-obstacles'],
    queryFn: () => base44.entities.PredictiveObstacle.list(),
    refetchInterval: refreshInterval
  });

  const { data: insights = [] } = useQuery({
    queryKey: ['proactive-insights'],
    queryFn: () => base44.entities.ProactiveInsightGeneration.filter({ user_response: 'pending' }),
    refetchInterval: refreshInterval
  });

  const { data: cognitiveModels = [] } = useQuery({
    queryKey: ['cognitive-models'],
    queryFn: () => base44.entities.SelfEvolvingCognitiveModel.list()
  });

  const { data: biometricEvents = [] } = useQuery({
    queryKey: ['biometric-events'],
    queryFn: () => base44.entities.BiometricAdaptationEvent.list()
  });

  const handleAcceptInsight = async (insight, action) => {
    await base44.entities.ProactiveInsightGeneration.update(insight.id, {
      user_response: 'accepted',
      effectiveness_score: 1.0
    });
    
    // Execute suggested action
    if (action) {
      await base44.functions.invoke('globalEventBus', {
        event_type: 'insight_action_executed',
        payload: action.action_payload,
        priority: 'high',
        target_services: [action.action_type]
      });
    }
  };

  const handleDismissInsight = async (insight) => {
    await base44.entities.ProactiveInsightGeneration.update(insight.id, {
      user_response: 'dismissed',
      effectiveness_score: 0
    });
  };

  // Calculate stats
  const stats = {
    spatialNodes: semanticGraph.length,
    activeAgents: semanticGraph.filter(n => n.node_type === 'agent').length,
    quantumPaths: quantumStates.reduce((sum, q) => sum + (q.parallel_reasoning_paths || 0), 0),
    highRiskObstacles: obstacles.filter(o => o.impact_score > 7).length,
    criticalInsights: insights.filter(i => i.urgency_level === 'critical').length,
    evolvingModels: cognitiveModels.filter(m => m.evolution_log?.length > 0).length,
    recentAdaptations: biometricEvents.length
  };

  return (
    <BiometricAdaptiveUI>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Brain className="w-10 h-10 text-indigo-400" />
                Ultra Omni-Sentient Platform
              </h1>
              <p className="text-slate-400">
                Quantum cognition • Spatial intelligence • Proactive assistance
              </p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <Card className="bg-slate-900/50 backdrop-blur border-slate-700">
              <CardContent className="pt-6 text-center">
                <Map className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.spatialNodes}</div>
                <div className="text-xs text-slate-400">Spatial Nodes</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 backdrop-blur border-slate-700">
              <CardContent className="pt-6 text-center">
                <Activity className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.activeAgents}</div>
                <div className="text-xs text-slate-400">Active Agents</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 backdrop-blur border-slate-700">
              <CardContent className="pt-6 text-center">
                <Layers className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.quantumPaths}</div>
                <div className="text-xs text-slate-400">Quantum Paths</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 backdrop-blur border-slate-700">
              <CardContent className="pt-6 text-center">
                <Zap className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.highRiskObstacles}</div>
                <div className="text-xs text-slate-400">High Risk</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 backdrop-blur border-slate-700">
              <CardContent className="pt-6 text-center">
                <Sparkles className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.criticalInsights}</div>
                <div className="text-xs text-slate-400">Insights</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 backdrop-blur border-slate-700">
              <CardContent className="pt-6 text-center">
                <Brain className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.evolvingModels}</div>
                <div className="text-xs text-slate-400">Evolving</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 backdrop-blur border-slate-700">
              <CardContent className="pt-6 text-center">
                <Activity className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.recentAdaptations}</div>
                <div className="text-xs text-slate-400">Adaptations</div>
              </CardContent>
            </Card>
          </div>

          {/* Multi-Modal Controller */}
          <MultiModalController onCommand={(cmd) => console.log('Command:', cmd)} />

          {/* Proactive Insights */}
          <ProactiveInsightPanel
            insights={insights}
            onAcceptInsight={handleAcceptInsight}
            onDismissInsight={handleDismissInsight}
          />

          {/* Main Content Tabs */}
          <Tabs defaultValue="spatial" className="space-y-6">
            <TabsList className="bg-slate-900 border border-slate-700 p-1">
              <TabsTrigger value="spatial" className="gap-2">
                <Map className="w-4 h-4" />
                Spatial Mapping
              </TabsTrigger>
              <TabsTrigger value="quantum" className="gap-2">
                <Layers className="w-4 h-4" />
                Quantum Reasoning
              </TabsTrigger>
              <TabsTrigger value="prediction" className="gap-2">
                <Zap className="w-4 h-4" />
                Predictive Analysis
              </TabsTrigger>
              <TabsTrigger value="developer" className="gap-2">
                <Code className="w-4 h-4" />
                Developer Tools
              </TabsTrigger>
              <TabsTrigger value="skills" className="gap-2">
                <Package className="w-4 h-4" />
                Skill Marketplace
              </TabsTrigger>
              <TabsTrigger value="docs" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Documentation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="spatial" className="space-y-6">
              <SemanticSceneExplorer3D 
                nodes={semanticGraph}
                title="Dynamic Semantic Scene Graph"
              />
            </TabsContent>

            <TabsContent value="quantum" className="space-y-6">
              {quantumStates.length === 0 ? (
                <Card className="bg-slate-900 border-slate-700">
                  <CardContent className="py-12 text-center">
                    <Layers className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No quantum reasoning states yet</p>
                  </CardContent>
                </Card>
              ) : (
                quantumStates.slice(0, 3).map(state => (
                  <QuantumReasoningVisualizer3D
                    key={state.id}
                    quantumState={state}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="prediction" className="space-y-6">
              <PredictivePathVisualizer3D obstacles={obstacles} />
            </TabsContent>

            <TabsContent value="developer" className="space-y-6">
              <AICodeGenerationStudio />
              <SpatialSDKDebugger3D />
            </TabsContent>

            <TabsContent value="skills" className="space-y-6">
              <AISkillMarketplace />
            </TabsContent>

            <TabsContent value="docs" className="space-y-6">
              <LivingDocumentationHub />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </BiometricAdaptiveUI>
  );
}