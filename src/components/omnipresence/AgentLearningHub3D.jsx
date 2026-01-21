import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Html, Float, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Brain, TrendingUp, Award, Book, Zap, Target, Loader2 } from 'lucide-react';

// Thought progression graph (causal links)
function ThoughtGraphNode3D({ thought, position, isConnected }) {
  const nodeRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (nodeRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.08;
      nodeRef.current.scale.setScalar(pulse * (hovered ? 1.2 : 1));
    }
  });

  const typeColors = {
    reasoning: '#3b82f6',
    planning: '#a855f7',
    decision: '#10b981',
    observation: '#f59e0b',
    learning: '#ec4899'
  };

  const color = typeColors[thought.type] || '#00f5ff';
  const size = 0.08 + (thought.confidence || 0.5) * 0.08;

  return (
    <group
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Sphere ref={nodeRef} args={[size, 24, 24]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
      </Sphere>

      {hovered && (
        <Html position={[0, 0.3, 0]} center>
          <div className="bg-black/95 text-white px-3 py-2 rounded-lg text-xs max-w-48" style={{ borderColor: color, borderWidth: 1, borderStyle: 'solid' }}>
            <p className="font-bold mb-1">{thought.type}</p>
            <p className="text-slate-300">{thought.content?.slice(0, 60)}...</p>
            <p className="text-cyan-400 mt-1">Confidence: {((thought.confidence || 0) * 100).toFixed(0)}%</p>
          </div>
        </Html>
      )}
    </group>
  );
}

// Skill acquisition timeline
function SkillTimeline3D({ skills }) {
  const timelineRef = useRef();

  useFrame((state) => {
    if (timelineRef.current) {
      timelineRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group ref={timelineRef}>
      {skills.map((skill, idx) => {
        const x = -3 + (idx / Math.max(1, skills.length - 1)) * 6;
        const y = (skill.current_level || 1) * 0.3;
        
        return (
          <group key={idx} position={[x, y, 0]}>
            <Sphere args={[0.1, 16, 16]}>
              <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.6} />
            </Sphere>
            <Html position={[0, 0.3, 0]} center>
              <div className="bg-black/90 px-2 py-1 rounded text-xs text-center">
                <p className="text-green-400 font-bold">{skill.skill_name}</p>
                <p className="text-slate-400">Lv {skill.current_level || 1}</p>
              </div>
            </Html>
          </group>
        );
      })}
      
      {/* Timeline path */}
      {skills.length > 1 && (
        <Line
          points={skills.map((skill, idx) => [
            -3 + (idx / Math.max(1, skills.length - 1)) * 6,
            (skill.current_level || 1) * 0.3,
            0
          ])}
          color="#10b981"
          lineWidth={2}
          transparent
          opacity={0.4}
        />
      )}
    </group>
  );
}

// Confidence progression chart
function ConfidenceProgression3D({ confidenceData }) {
  const chartRef = useRef();

  useFrame((state) => {
    if (chartRef.current) {
      chartRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  if (!confidenceData || confidenceData.length === 0) return null;

  return (
    <group ref={chartRef}>
      {confidenceData.map((point, idx) => {
        const x = -3 + (idx / Math.max(1, confidenceData.length - 1)) * 6;
        const y = point.confidence * 2;
        
        return (
          <Sphere key={idx} args={[0.06, 12, 12]} position={[x, y, 0]}>
            <meshBasicMaterial color="#00f5ff" />
          </Sphere>
        );
      })}
      
      <Line
        points={confidenceData.map((point, idx) => [
          -3 + (idx / Math.max(1, confidenceData.length - 1)) * 6,
          point.confidence * 2,
          0
        ])}
        color="#00f5ff"
        lineWidth={3}
        transparent
        opacity={0.6}
      />
    </group>
  );
}

// Learning scene
function LearningScene({ thoughtGraph, skillTimeline, confidenceProgression }) {
  // Layout thought graph nodes in 3D space
  const nodePositions = useMemo(() => {
    return thoughtGraph.nodes?.map((_, idx) => {
      const angle = (idx / (thoughtGraph.nodes.length || 1)) * Math.PI * 2;
      const radius = 2;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(idx * 0.5) * 0.5,
        z: Math.sin(angle) * radius
      };
    }) || [];
  }, [thoughtGraph]);

  return (
    <group>
      {/* Thought graph */}
      {thoughtGraph.nodes?.map((node, idx) => (
        <ThoughtGraphNode3D
          key={node.id || idx}
          thought={node}
          position={[nodePositions[idx].x, nodePositions[idx].y, nodePositions[idx].z]}
          isConnected={thoughtGraph.edges?.some(e => e.from === node.id || e.to === node.id)}
        />
      ))}

      {/* Causal links */}
      {thoughtGraph.edges?.map((edge, idx) => {
        const fromIdx = thoughtGraph.nodes.findIndex(n => n.id === edge.from);
        const toIdx = thoughtGraph.nodes.findIndex(n => n.id === edge.to);
        if (fromIdx < 0 || toIdx < 0) return null;
        
        const fromPos = nodePositions[fromIdx];
        const toPos = nodePositions[toIdx];
        
        return (
          <Line
            key={idx}
            points={[[fromPos.x, fromPos.y, fromPos.z], [toPos.x, toPos.y, toPos.z]]}
            color="#a855f7"
            lineWidth={1.5}
            transparent
            opacity={0.3}
          />
        );
      })}

      {/* Skill timeline below */}
      {skillTimeline && skillTimeline.length > 0 && (
        <group position={[0, -1.5, 0]}>
          <SkillTimeline3D skills={skillTimeline} />
        </group>
      )}

      {/* Confidence chart above */}
      {confidenceProgression && confidenceProgression.length > 0 && (
        <group position={[0, 2, 3]}>
          <ConfidenceProgression3D confidenceData={confidenceProgression} />
        </group>
      )}
    </group>
  );
}

export default function AgentLearningHub3D() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [learningData, setLearningData] = useState(null);

  const { data: agents = [] } = useQuery({
    queryKey: ['learning-agents'],
    queryFn: () => base44.entities.AgentPhysicalPresence.list('-created_date', 20),
    initialData: []
  });

  const analyticsMutation = useMutation({
    mutationFn: async (agentId) => {
      const response = await base44.functions.invoke('agent-learning-analytics', {
        agent_id: agentId,
        analysis_type: 'comprehensive'
      });
      return response.data;
    },
    onSuccess: (data) => {
      setLearningData(data);
      toast.success('Learning analytics loaded');
      // Auto-trigger AI trend analysis
      trendAnalysisMutation.mutate(selectedAgent.agent_id);
    }
  });

  const trendAnalysisMutation = useMutation({
    mutationFn: async (agentId) => {
      const response = await base44.functions.invoke('ai-learning-trend-analyzer', {
        agent_id: agentId,
        analysis_window_days: 7
      });
      return response.data;
    },
    onSuccess: (data) => {
      setLearningData(prev => ({ ...prev, ai_trends: data.trends }));
    }
  });

  const pathOptimizerMutation = useMutation({
    mutationFn: async (agentId) => {
      const response = await base44.functions.invoke('omega-learning-path-optimizer', {
        agent_id: agentId
      });
      return response.data;
    },
    onSuccess: (data) => {
      setLearningData(prev => ({ ...prev, optimized_path: data.optimization }));
      toast.success('Omega learning path generated');
    }
  });

  const scenarioMutation = useMutation({
    mutationFn: async (agentId) => {
      const response = await base44.functions.invoke('hypothetical-capability-predictor', {
        agent_id: agentId,
        scenario_count: 5,
        time_horizon_days: 30
      });
      return response.data;
    },
    onSuccess: (data) => {
      setLearningData(prev => ({ ...prev, scenarios: data.scenarios }));
      toast.success('Hypothetical scenarios generated');
    }
  });

  const handleSelectAgent = (agent) => {
    setSelectedAgent(agent);
    analyticsMutation.mutate(agent.agent_id);
  };

  const handleOptimizePath = () => {
    if (selectedAgent) {
      pathOptimizerMutation.mutate(selectedAgent.agent_id);
    }
  };

  const handleGenerateScenarios = () => {
    if (selectedAgent) {
      scenarioMutation.mutate(selectedAgent.agent_id);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400" />
            Agent Learning Hub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {agents.slice(0, 8).map(agent => (
              <Button
                key={agent.id}
                size="sm"
                variant={selectedAgent?.id === agent.id ? 'default' : 'outline'}
                onClick={() => handleSelectAgent(agent)}
                disabled={analyticsMutation.isPending}
              >
                Agent {agent.agent_id?.slice(0, 6)}
              </Button>
            ))}
          </div>

          {selectedAgent && (
            <div className="flex gap-2 mb-4">
              <Button
                size="sm"
                onClick={handleOptimizePath}
                disabled={pathOptimizerMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {pathOptimizerMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Zap className="w-3 h-3 mr-1" />}
                Optimize Path
              </Button>
              <Button
                size="sm"
                onClick={handleGenerateScenarios}
                disabled={scenarioMutation.isPending}
                className="bg-gradient-to-r from-cyan-600 to-blue-600"
              >
                {scenarioMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Brain className="w-3 h-3 mr-1" />}
                Predict Scenarios
              </Button>
            </div>
          )}

          {learningData && (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <TrendingUp className="w-5 h-5 text-green-400 mb-1" />
                <p className="text-white text-lg font-bold">{(learningData.learning_metrics.success_rate * 100).toFixed(0)}%</p>
                <p className="text-slate-400 text-xs">Success</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <Brain className="w-5 h-5 text-purple-400 mb-1" />
                <p className="text-white text-lg font-bold">{learningData.learning_metrics.patterns_learned}</p>
                <p className="text-slate-400 text-xs">Patterns</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <Award className="w-5 h-5 text-amber-400 mb-1" />
                <p className="text-white text-lg font-bold">{learningData.learning_metrics.active_skills}</p>
                <p className="text-slate-400 text-xs">Skills</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <Book className="w-5 h-5 text-cyan-400 mb-1" />
                <p className="text-white text-lg font-bold">{learningData.learning_metrics.knowledge_items}</p>
                <p className="text-slate-400 text-xs">Knowledge</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <Zap className="w-5 h-5 text-yellow-400 mb-1" />
                <p className="text-white text-lg font-bold">{learningData.learning_metrics.behavioral_adjustments}</p>
                <p className="text-slate-400 text-xs">Adjustments</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <Target className="w-5 h-5 text-pink-400 mb-1" />
                <p className="text-white text-lg font-bold">{(learningData.learning_efficiency.avg_confidence * 100).toFixed(0)}%</p>
                <p className="text-slate-400 text-xs">Avg Confidence</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {learningData && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">3D Learning Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[500px]">
              <Canvas camera={{ position: [0, 3, 6], fov: 50 }}>
                <ambientLight intensity={0.3} />
                <pointLight position={[5, 5, 5]} intensity={0.8} />
                <pointLight position={[-5, 5, -5]} intensity={0.5} color="#a855f7" />

                <LearningScene
                  thoughtGraph={learningData.thought_graph}
                  skillTimeline={learningData.skill_timeline}
                  confidenceProgression={learningData.confidence_progression}
                />

                <OrbitControls enableZoom={true} />
              </Canvas>
            </div>
          </CardContent>
        </Card>
      )}

      {learningData?.optimized_path && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              AI-Optimized Learning Path
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {learningData.optimized_path?.optimized_path?.map((path, idx) => (
                <div key={idx} className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-bold">{path.skill_name}</p>
                    <Badge className="bg-purple-500/30">Priority: {path.priority}</Badge>
                  </div>
                  <p className="text-slate-300 text-sm mb-2">Method: {path.learning_method}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{path.estimated_hours}h</span>
                    <span className="text-cyan-400">Dependencies: {path.dependencies?.length || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {learningData?.scenarios && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Hypothetical Capability Scenarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {learningData.scenarios.map((scenario, idx) => (
                <div key={idx} className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-bold">{scenario.scenario_name}</p>
                    <Badge className="bg-green-500/30">{(scenario.success_probability * 100).toFixed(0)}% Success</Badge>
                  </div>
                  <p className="text-slate-300 text-sm mb-3">{scenario.scenario_description}</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Predicted Capabilities:</p>
                      <div className="flex flex-wrap gap-1">
                        {scenario.predicted_capabilities?.slice(0, 4).map((cap, i) => (
                          <Badge key={i} className="bg-purple-500/20 text-purple-300 text-xs">{cap}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Timeline: {scenario.timeline_days} days</span>
                      <span className="text-orange-400">Impact: {scenario.transformative_impact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {learningData?.recent_thoughts && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Thoughts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {learningData.recent_thoughts.map((thought, idx) => (
                <div key={idx} className="bg-slate-800/50 rounded-lg p-3 border border-slate-600">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="text-xs">{thought.type}</Badge>
                    <div className="flex-1 h-1 bg-slate-700 rounded overflow-hidden">
                      <div className="h-full bg-cyan-400" style={{ width: `${(thought.confidence || 0) * 100}%` }} />
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm">{thought.content}</p>
                  <p className="text-xs text-slate-500 mt-1">{new Date(thought.timestamp).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}