import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Line, Html, Float, Trail, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { User, Brain, Heart, Zap, Target, MessageSquare, Sparkles } from 'lucide-react';

// Emotional aura effect
function EmotionalAura({ emotion, intensity = 0.5 }) {
  const auraRef = useRef();
  
  const emotionColors = {
    happy: '#10b981',
    excited: '#f59e0b',
    calm: '#3b82f6',
    focused: '#8b5cf6',
    stressed: '#ef4444',
    confused: '#ec4899',
    neutral: '#64748b'
  };

  const color = emotionColors[emotion] || '#00f5ff';

  useFrame((state) => {
    if (auraRef.current) {
      auraRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.15 * intensity);
      auraRef.current.material.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 3) * 0.05 * intensity;
      auraRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Sphere ref={auraRef} args={[0.5, 32, 32]}>
      <meshBasicMaterial color={color} transparent opacity={0.15} />
    </Sphere>
  );
}

// Learning feedback visualization
function LearningIndicator({ feedbackData, position }) {
  const [particles, setParticles] = useState([]);
  const groupRef = useRef();

  useEffect(() => {
    if (feedbackData?.outcome_data?.success) {
      // Spawn success particles
      const newParticles = Array.from({ length: 15 }, (_, i) => ({
        id: Date.now() + i,
        angle: (i / 15) * Math.PI * 2,
        speed: 0.5 + Math.random() * 0.5,
        life: 1
      }));
      setParticles(newParticles);
    }
  }, [feedbackData]);

  useFrame((state, delta) => {
    setParticles(prev => 
      prev.map(p => ({ ...p, life: p.life - delta * 0.5 }))
          .filter(p => p.life > 0)
    );
  });

  const successColor = feedbackData?.outcome_data?.success ? '#10b981' : '#ef4444';

  return (
    <group ref={groupRef} position={position}>
      {particles.map(particle => (
        <Sphere
          key={particle.id}
          args={[0.03, 8, 8]}
          position={[
            Math.cos(particle.angle) * (1 - particle.life) * 0.5,
            (1 - particle.life) * 0.8,
            Math.sin(particle.angle) * (1 - particle.life) * 0.5
          ]}
        >
          <meshBasicMaterial color={successColor} transparent opacity={particle.life} />
        </Sphere>
      ))}

      {feedbackData?.learned_patterns?.length > 0 && (
        <Html position={[0, 0.8, 0]} center>
          <div className="bg-emerald-500/20 border border-emerald-500/50 px-2 py-1 rounded text-xs text-emerald-300 animate-pulse">
            +{feedbackData.learned_patterns.length} patterns
          </div>
        </Html>
      )}
    </group>
  );
}

// Knowledge transfer beam
function KnowledgeTransferBeam({ from, to, transferType, progress }) {
  const beamRef = useRef();
  const particleRef = useRef();
  
  const transferColors = {
    insight: '#10b981',
    skill: '#3b82f6',
    strategy: '#a855f7',
    experience: '#f59e0b'
  };

  const color = transferColors[transferType] || '#00f5ff';

  // Calculate bezier curve for the beam
  const curve = useMemo(() => {
    const start = new THREE.Vector3(from.x, from.y + 0.3, from.z);
    const end = new THREE.Vector3(to.x, to.y + 0.3, to.z);
    const mid = new THREE.Vector3(
      (from.x + to.x) / 2,
      Math.max(from.y, to.y) + 1.5,
      (from.z + to.z) / 2
    );
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [from, to]);

  const points = curve.getPoints(30);

  useFrame((state) => {
    if (particleRef.current) {
      const t = (state.clock.elapsedTime * 0.5 * (progress || 1)) % 1;
      const pos = curve.getPoint(t);
      particleRef.current.position.copy(pos);
    }
  });

  return (
    <group>
      <Line points={points} color={color} lineWidth={2} transparent opacity={0.4} />
      
      {/* Traveling particle */}
      <Sphere ref={particleRef} args={[0.06, 16, 16]}>
        <meshBasicMaterial color={color} />
      </Sphere>
    </group>
  );
}

// Goal visualization
function GoalIndicator({ goal, position }) {
  const goalRef = useRef();
  
  const priorityColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981'
  };

  const color = priorityColors[goal?.priority] || '#00f5ff';

  useFrame((state) => {
    if (goalRef.current) {
      goalRef.current.rotation.y = state.clock.elapsedTime;
      goalRef.current.position.y = 0.6 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  if (!goal) return null;

  return (
    <group position={position}>
      <mesh ref={goalRef}>
        <octahedronGeometry args={[0.08, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

// Thought bubble visualization
function ThoughtBubble3D({ thought, position }) {
  const bubbleRef = useRef();

  useFrame((state) => {
    if (bubbleRef.current) {
      bubbleRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  const colorSchemes = {
    blue: '#00f5ff',
    green: '#10b981',
    orange: '#f59e0b',
    red: '#ef4444',
    purple: '#a855f7'
  };

  const color = colorSchemes[thought.visualization_data?.color_scheme] || '#00f5ff';

  return (
    <group ref={bubbleRef} position={position}>
      <Sphere args={[0.2, 16, 16]}>
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </Sphere>
      
      <Html position={[0, 0, 0]} center>
        <div 
          className="bg-black/90 text-white px-3 py-2 rounded-xl text-xs max-w-48"
          style={{ borderColor: color, borderWidth: 1, borderStyle: 'solid' }}
        >
          <p className="font-bold mb-1">{thought.thought_content?.main_thought}</p>
          {thought.thought_content?.sub_thoughts?.slice(0, 2).map((st, i) => (
            <p key={i} className="text-slate-400 text-xs">• {st}</p>
          ))}
          {thought.confidence_level && (
            <div className="flex items-center gap-1 mt-2">
              <div className="w-full h-1 bg-slate-700 rounded overflow-hidden">
                <div className="h-full bg-cyan-400" style={{ width: `${thought.confidence_level * 100}%` }} />
              </div>
              <span className="text-xs text-slate-500">{(thought.confidence_level * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

// Task progress indicator
function TaskProgressIndicator3D({ taskPlan, position }) {
  const progressRef = useRef();

  useFrame((state) => {
    if (progressRef.current) {
      progressRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
  });

  const progress = taskPlan?.overall_progress || 0;
  const activeTasks = taskPlan?.sub_tasks?.filter(t => t.status === 'in_progress').length || 0;

  return (
    <group position={position}>
      <mesh ref={progressRef} rotation={[0, 0, 0]}>
        <ringGeometry args={[0.25, 0.28, 32, 1, 0, (progress / 100) * Math.PI * 2]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>

      <Html position={[0, 0, 0]} center>
        <div className="bg-emerald-500/20 border border-emerald-500/50 px-2 py-1 rounded text-xs text-emerald-300">
          {progress.toFixed(0)}% • {activeTasks} active
        </div>
      </Html>
    </group>
  );
}

// Advanced agent with all features
function AdvancedAgent3D({ 
  agent, 
  emotion, 
  learningFeedback, 
  currentGoal,
  thoughts,
  taskPlan,
  onSelect,
  isSelected 
}) {
  const agentRef = useRef();
  const bodyRef = useRef();
  const [hovered, setHovered] = useState(false);

  const pos = agent.current_location || { x: 0, y: 0, z: 0 };
  const statusColors = {
    active: '#00f5ff',
    idle: '#64748b',
    transitioning: '#f59e0b',
    offline: '#ef4444'
  };
  const color = statusColors[agent.projection_status] || '#00f5ff';

  useFrame((state) => {
    if (agentRef.current) {
      // Breathing animation
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
      agentRef.current.scale.setScalar(breathe);

      // Selected pulsing
      if (isSelected) {
        agentRef.current.scale.setScalar(breathe * (1 + Math.sin(state.clock.elapsedTime * 4) * 0.05));
      }
    }

    if (bodyRef.current) {
      // Subtle idle animation
      bodyRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const emotionIntensity = emotion?.emotion_intensity || 0.5;

  return (
    <group
      position={[pos.x, 0, pos.z]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onSelect && onSelect(agent)}
    >
      <Trail width={0.2} length={10} color={color} attenuation={(t) => t * t}>
        <group ref={agentRef}>
          {/* Emotional aura */}
          <EmotionalAura emotion={emotion?.primary_emotion} intensity={emotionIntensity} />

          {/* Agent body */}
          <group ref={bodyRef}>
            {/* Head */}
            <Sphere args={[0.15, 32, 32]} position={[0, 0.55, 0]}>
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} metalness={0.8} roughness={0.2} />
            </Sphere>

            {/* Torso */}
            <Cylinder args={[0.12, 0.15, 0.3, 16]} position={[0, 0.3, 0]}>
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} metalness={0.7} roughness={0.3} />
            </Cylinder>

            {/* Core energy */}
            <Sphere args={[0.08, 16, 16]} position={[0, 0.35, 0]}>
              <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
            </Sphere>
          </group>

          {/* Goal indicator */}
          <GoalIndicator goal={currentGoal} position={[0, 0, 0]} />

          {/* Learning feedback */}
          {learningFeedback && (
            <LearningIndicator feedbackData={learningFeedback} position={[0, 0, 0]} />
          )}

          {/* Thought bubbles */}
          {thoughts?.slice(0, 2).map((thought, idx) => (
            <ThoughtBubble3D key={thought.thought_id} thought={thought} position={[0.4 + idx * 0.3, 0.8 + idx * 0.2, 0]} />
          ))}

          {/* Task progress */}
          {taskPlan && (
            <TaskProgressIndicator3D taskPlan={taskPlan} position={[-0.4, 0.7, 0]} />
          )}
        </group>
      </Trail>

      {/* Interaction zone */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[agent.interaction_zone_radius || 1, (agent.interaction_zone_radius || 1) + 0.1, 32]} />
        <meshBasicMaterial color={color} transparent opacity={isSelected ? 0.3 : 0.1} side={THREE.DoubleSide} />
      </mesh>

      {/* Status and info panel */}
      {(hovered || isSelected) && (
        <Html position={[0, 1, 0]} center>
          <div className="bg-black/95 text-white px-4 py-3 rounded-lg text-xs min-w-48 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="font-bold">Agent {agent.agent_id?.slice(0, 8)}</span>
            </div>
            
            <div className="space-y-1 text-slate-300">
              <p className="flex items-center gap-1">
                <span className="text-slate-500">Status:</span>
                <span style={{ color }}>{agent.projection_status}</span>
              </p>
              
              {emotion && (
                <p className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-pink-400" />
                  <span className="capitalize">{emotion.primary_emotion}</span>
                  <span className="text-slate-500">({(emotionIntensity * 100).toFixed(0)}%)</span>
                </p>
              )}
              
              {currentGoal && (
                <p className="flex items-center gap-1">
                  <Target className="w-3 h-3 text-cyan-400" />
                  <span className="truncate max-w-32">{currentGoal.goal_description?.slice(0, 25) || 'Active goal'}</span>
                </p>
              )}
              
              {agent.current_activity && (
                <p className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span>{agent.current_activity}</span>
                </p>
              )}
              
              {agent.battery_level !== undefined && (
                <p className="flex items-center gap-1">
                  <span className="text-slate-500">Battery:</span>
                  <span className={agent.battery_level > 20 ? 'text-green-400' : 'text-red-400'}>
                    {agent.battery_level}%
                  </span>
                </p>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Main scene
function AgentScene({ 
  agents, 
  emotions, 
  feedbacks, 
  goals,
  knowledgeTransfers,
  thoughts,
  taskPlans,
  selectedAgent,
  onSelectAgent
}) {
  // Match emotions and goals to agents
  const getAgentEmotion = (agentId) => emotions.find(e => e.agent_id === agentId);
  const getAgentFeedback = (agentId) => feedbacks.find(f => f.agent_id === agentId);
  const getAgentGoal = (agentId) => goals.find(g => g.agent_id === agentId);
  const getAgentThoughts = (agentId) => thoughts.filter(t => t.agent_id === agentId && 
    Date.now() - new Date(t.timestamp).getTime() < (t.visualization_data?.display_duration_seconds || 5) * 1000);
  const getAgentTaskPlan = (agentId) => taskPlans.find(tp => tp.agent_id === agentId);

  return (
    <group>
      {/* Floor */}
      <Box args={[16, 0.05, 14]} position={[6, 0, 5]}>
        <meshStandardMaterial color="#050510" />
      </Box>
      <gridHelper args={[16, 32, '#102030', '#080818']} position={[6, 0.03, 5]} />

      {/* Agents */}
      {agents.map((agent, idx) => (
        <AdvancedAgent3D
          key={agent.id || idx}
          agent={agent}
          emotion={getAgentEmotion(agent.agent_id)}
          learningFeedback={getAgentFeedback(agent.agent_id)}
          currentGoal={getAgentGoal(agent.agent_id)}
          thoughts={getAgentThoughts(agent.agent_id)}
          taskPlan={getAgentTaskPlan(agent.agent_id)}
          isSelected={selectedAgent?.id === agent.id}
          onSelect={onSelectAgent}
        />
      ))}

      {/* Knowledge transfer beams */}
      {knowledgeTransfers.filter(kt => kt.transfer_status === 'in_progress').map((transfer, idx) => {
        const sourceAgent = agents.find(a => a.agent_id === transfer.source_agent_id);
        const targetAgent = agents.find(a => transfer.target_agents?.includes(a.agent_id));
        
        if (!sourceAgent || !targetAgent) return null;
        
        return (
          <KnowledgeTransferBeam
            key={transfer.id || idx}
            from={sourceAgent.current_location || { x: 0, y: 0, z: 0 }}
            to={targetAgent.current_location || { x: 2, y: 0, z: 2 }}
            transferType={transfer.knowledge_type}
            progress={1}
          />
        );
      })}
    </group>
  );
}

export default function AdvancedAgentPresence3D() {
  const [selectedAgent, setSelectedAgent] = useState(null);

  const { data: agents = [] } = useQuery({
    queryKey: ['presence-agents'],
    queryFn: () => base44.entities.AgentPhysicalPresence.list('-created_date', 20),
    initialData: [],
    refetchInterval: 3000
  });

  const { data: emotions = [] } = useQuery({
    queryKey: ['presence-emotions'],
    queryFn: () => base44.entities.AgentEmotion.list('-created_date', 20),
    initialData: [],
    refetchInterval: 5000
  });

  const { data: feedbacks = [] } = useQuery({
    queryKey: ['presence-feedbacks'],
    queryFn: () => base44.entities.AgentLearningFeedback.list('-created_date', 10),
    initialData: []
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['presence-goals'],
    queryFn: () => base44.entities.AgentGoal.filter({ status: 'active' }),
    initialData: []
  });

  const { data: knowledgeTransfers = [] } = useQuery({
    queryKey: ['presence-transfers'],
    queryFn: () => base44.entities.KnowledgeTransfer.list('-created_date', 10),
    initialData: []
  });

  const { data: thoughts = [] } = useQuery({
    queryKey: ['presence-thoughts'],
    queryFn: () => base44.entities.AgentThoughtProcess.list('-timestamp', 30),
    initialData: [],
    refetchInterval: 2000
  });

  const { data: taskPlans = [] } = useQuery({
    queryKey: ['presence-task-plans'],
    queryFn: () => base44.entities.AutonomousTaskPlan.filter({ plan_status: 'executing' }),
    initialData: [],
    refetchInterval: 3000
  });

  const activeAgents = agents.filter(a => a.projection_status === 'active');
  const emotionalAgents = emotions.filter(e => e.emotion_intensity > 0.5);
  const activeTransfers = knowledgeTransfers.filter(kt => kt.transfer_status === 'in_progress');

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            Advanced Agent Presence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs flex items-center gap-1"><User className="w-3 h-3" /> Active</p>
              <p className="text-white text-xl font-bold">{activeAgents.length}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs flex items-center gap-1"><Heart className="w-3 h-3" /> Emotional</p>
              <p className="text-white text-xl font-bold">{emotionalAgents.length}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs flex items-center gap-1"><Brain className="w-3 h-3" /> Learning</p>
              <p className="text-white text-xl font-bold">{feedbacks.length}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs flex items-center gap-1"><Sparkles className="w-3 h-3" /> Transfers</p>
              <p className="text-white text-xl font-bold">{activeTransfers.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardContent className="p-0">
          <div className="h-[550px]">
            <Canvas camera={{ position: [10, 8, 10], fov: 50 }}>
              <ambientLight intensity={0.2} />
              <pointLight position={[10, 12, 10]} intensity={1} />
              <pointLight position={[-5, 8, -5]} intensity={0.5} color="#a855f7" />
              <pointLight position={[5, 5, 5]} intensity={0.3} color="#ec4899" />

              <AgentScene
                agents={agents}
                emotions={emotions}
                feedbacks={feedbacks}
                goals={goals}
                knowledgeTransfers={knowledgeTransfers}
                thoughts={thoughts}
                taskPlans={taskPlans}
                selectedAgent={selectedAgent}
                onSelectAgent={setSelectedAgent}
              />

              <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 2.1} />
            </Canvas>
          </div>
        </CardContent>
      </Card>

      {selectedAgent && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              Agent Details
              <Badge>{selectedAgent.projection_status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-slate-400 text-sm">ID</p>
                <p className="text-white font-mono">{selectedAgent.agent_id?.slice(0, 12)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Activity</p>
                <p className="text-white">{selectedAgent.current_activity || 'Idle'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Interaction Zone</p>
                <p className="text-white">{selectedAgent.interaction_zone_radius || 2}m</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}