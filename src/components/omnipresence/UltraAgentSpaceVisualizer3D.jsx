import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Cylinder, Line, Html, Float, Trail, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Badge } from '@/components/ui/badge';

// Emotional aura around agents
function EmotionalAura({ emotion, intensity = 1 }) {
  const auraRef = useRef();

  const emotionColors = {
    happy: '#10b981',
    focused: '#3b82f6',
    alert: '#ef4444',
    excited: '#f59e0b',
    calm: '#a855f7',
    stressed: '#dc2626',
    neutral: '#64748b'
  };

  const color = emotionColors[emotion] || emotionColors.neutral;

  useFrame((state) => {
    if (auraRef.current) {
      const time = state.clock.elapsedTime;
      auraRef.current.scale.setScalar(1 + Math.sin(time * 3) * 0.1 * intensity);
      auraRef.current.material.opacity = 0.15 + Math.sin(time * 2) * 0.05 * intensity;
    }
  });

  return (
    <Sphere ref={auraRef} args={[0.5, 32, 32]}>
      <meshBasicMaterial color={color} transparent opacity={0.2} side={THREE.BackSide} />
    </Sphere>
  );
}

// Learning feedback visualization
function LearningFeedbackBurst({ type, position }) {
  const particlesRef = useRef();
  const [particles] = useState(() => {
    const arr = [];
    for (let i = 0; i < 20; i++) {
      arr.push({
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          Math.random() * 2,
          (Math.random() - 0.5) * 2
        ),
        life: Math.random()
      });
    }
    return arr;
  });

  useFrame((state, delta) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array;
      particles.forEach((p, i) => {
        p.life -= delta * 0.5;
        if (p.life > 0) {
          positions[i * 3] += p.velocity.x * delta;
          positions[i * 3 + 1] += p.velocity.y * delta;
          positions[i * 3 + 2] += p.velocity.z * delta;
        }
      });
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const color = type === 'success' ? '#10b981' : type === 'failure' ? '#ef4444' : '#f59e0b';

  return (
    <points ref={particlesRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={20}
          array={new Float32Array(60)}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color={color} transparent opacity={0.8} />
    </points>
  );
}

// Knowledge transfer beam between agents
function KnowledgeTransferBeam({ from, to, knowledgeType, active }) {
  const beamRef = useRef();
  const progressRef = useRef();

  const typeColors = {
    skill: '#3b82f6',
    strategy: '#10b981',
    pattern: '#f59e0b',
    insight: '#a855f7',
    model: '#ec4899'
  };

  const color = typeColors[knowledgeType] || '#00f5ff';

  useFrame((state) => {
    if (progressRef.current && active) {
      const t = (Math.sin(state.clock.elapsedTime * 3) + 1) / 2;
      progressRef.current.position.lerpVectors(
        new THREE.Vector3(from.x, from.y, from.z),
        new THREE.Vector3(to.x, to.y, to.z),
        t
      );
    }
  });

  if (!active) return null;

  return (
    <group>
      <Line
        points={[new THREE.Vector3(from.x, from.y, from.z), new THREE.Vector3(to.x, to.y, to.z)]}
        color={color}
        lineWidth={2}
        transparent
        opacity={0.5}
        dashed
        dashScale={5}
      />
      <Sphere ref={progressRef} args={[0.06, 12, 12]} position={[from.x, from.y, from.z]}>
        <meshBasicMaterial color={color} />
      </Sphere>
    </group>
  );
}

// Goal visualization above agent
function GoalIndicator({ goal, position }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 2;
      ref.current.position.y = position[1] + 0.8 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
    }
  });

  const goalColors = {
    assist: '#10b981',
    patrol: '#3b82f6',
    monitor: '#f59e0b',
    collaborate: '#a855f7',
    learn: '#ec4899'
  };

  const color = goalColors[goal?.type] || '#00f5ff';

  return (
    <group ref={ref} position={position}>
      <mesh>
        <octahedronGeometry args={[0.1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

// Battery/energy indicator
function EnergyIndicator({ level, position }) {
  const color = level > 60 ? '#10b981' : level > 30 ? '#f59e0b' : '#ef4444';

  return (
    <group position={[position[0] + 0.4, position[1], position[2]]}>
      <Box args={[0.08, 0.2, 0.04]}>
        <meshBasicMaterial color="#1e293b" />
      </Box>
      <Box args={[0.06, 0.18 * (level / 100), 0.03]} position={[0, -0.09 + (0.09 * level / 100), 0]}>
        <meshBasicMaterial color={color} />
      </Box>
    </group>
  );
}

// Ultra enhanced agent with all features
function UltraAgent({ 
  agent, 
  emotion, 
  currentGoal, 
  learningFeedback, 
  batteryLevel = 100,
  isSelected,
  onSelect 
}) {
  const groupRef = useRef();
  const bodyRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  const pos = agent.current_location || { x: 0, y: 0, z: 0 };
  const status = agent.projection_status || 'idle';

  const statusColors = {
    active: '#00f5ff',
    idle: '#64748b',
    transitioning: '#f59e0b',
    offline: '#ef4444'
  };

  const color = statusColors[status] || statusColors.idle;

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (groupRef.current) {
      // Floating animation
      groupRef.current.position.y = 0.5 + Math.sin(time * 2) * 0.05;
    }
    if (bodyRef.current) {
      // Subtle rotation when active
      if (status === 'active') {
        bodyRef.current.rotation.y = Math.sin(time * 0.5) * 0.2;
      }
    }
  });

  return (
    <group
      ref={groupRef}
      position={[pos.x, 0.5, pos.z]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onSelect && onSelect(agent)}
    >
      {/* Emotional aura */}
      <EmotionalAura emotion={emotion?.primary_emotion || 'neutral'} intensity={emotion?.intensity || 0.5} />

      {/* Agent body with trail */}
      <Trail width={0.5} length={8} color={color} attenuation={(t) => t * t}>
        <group ref={bodyRef}>
          {/* Head */}
          <Sphere args={[0.15, 32, 32]} position={[0, 0.35, 0]}>
            <MeshDistortMaterial
              color={color}
              emissive={color}
              emissiveIntensity={status === 'active' ? 0.8 : 0.3}
              distort={status === 'active' ? 0.2 : 0.1}
              speed={3}
              metalness={0.5}
              roughness={0.2}
            />
          </Sphere>

          {/* Body */}
          <Cylinder args={[0.08, 0.12, 0.3, 16]} position={[0, 0.1, 0]}>
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} metalness={0.7} roughness={0.3} />
          </Cylinder>

          {/* Core glow */}
          <Sphere args={[0.06, 16, 16]} position={[0, 0.15, 0]}>
            <meshBasicMaterial color="#ffffff" />
          </Sphere>
        </group>
      </Trail>

      {/* Status ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <ringGeometry args={[0.25, 0.3, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>

      {/* Goal indicator */}
      {currentGoal && (
        <GoalIndicator goal={currentGoal} position={[0, 0.3, 0]} />
      )}

      {/* Battery indicator */}
      <EnergyIndicator level={batteryLevel} position={[0, 0, 0]} />

      {/* Learning feedback burst */}
      {learningFeedback && (
        <LearningFeedbackBurst type={learningFeedback} position={[0, 0.5, 0]} />
      )}

      {/* Selection indicator */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.15, 0]}>
          <ringGeometry args={[0.35, 0.4, 32]} />
          <meshBasicMaterial color="#00f5ff" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Info panel on hover */}
      {hovered && (
        <Html position={[0, 0.9, 0]} center>
          <div className="bg-black/95 text-white px-4 py-3 rounded-lg text-xs min-w-52 shadow-xl border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm">{agent.agent_id?.slice(0, 12) || 'Agent'}</span>
              <Badge className={`text-xs ${status === 'active' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700'}`}>
                {status}
              </Badge>
            </div>
            
            {emotion && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-slate-400">Emotion:</span>
                <span style={{ color: emotion.primary_emotion === 'happy' ? '#10b981' : '#64748b' }}>
                  {emotion.primary_emotion || 'neutral'}
                </span>
              </div>
            )}
            
            {currentGoal && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-slate-400">Goal:</span>
                <span className="text-purple-400">{currentGoal.type || currentGoal.description?.slice(0, 20)}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Activity:</span>
              <span className="text-cyan-400">{agent.current_activity || 'idle'}</span>
            </div>
            
            <div className="mt-2 flex items-center gap-1">
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div 
                  className="h-1.5 rounded-full" 
                  style={{ 
                    width: `${batteryLevel}%`, 
                    backgroundColor: batteryLevel > 60 ? '#10b981' : batteryLevel > 30 ? '#f59e0b' : '#ef4444' 
                  }} 
                />
              </div>
              <span className="text-xs text-slate-400">{batteryLevel}%</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Collaboration zone visualization
function CollaborationZone({ task, agents }) {
  const zoneRef = useRef();

  useFrame((state) => {
    if (zoneRef.current) {
      zoneRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      zoneRef.current.material.opacity = 0.1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  if (!task?.physical_workspace?.coordination_zones) return null;

  return (
    <group>
      {task.physical_workspace.coordination_zones.map((zone, i) => (
        <mesh key={i} ref={i === 0 ? zoneRef : null} rotation={[Math.PI / 2, 0, 0]} position={[zone.boundaries?.x || 5, 0.02, zone.boundaries?.z || 5]}>
          <circleGeometry args={[2, 32]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// Smart environment with ambient particles
function SmartEnvironment() {
  const particlesRef = useRef();
  const particleCount = 200;

  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <group>
      {/* Floor */}
      <Box args={[20, 0.05, 16]} position={[6, 0, 5]}>
        <meshStandardMaterial color="#050510" />
      </Box>
      <gridHelper args={[20, 40, '#0a1a3a', '#050a15']} position={[6, 0.03, 5]} />

      {/* Ambient particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particleCount} array={particles} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.02} color="#00f5ff" transparent opacity={0.4} />
      </points>

      {/* Subtle walls */}
      <Box args={[0.05, 3, 16]} position={[-2, 1.5, 5]}>
        <meshBasicMaterial color="#0a1525" transparent opacity={0.3} />
      </Box>
      <Box args={[20, 3, 0.05]} position={[6, 1.5, -3]}>
        <meshBasicMaterial color="#0a1525" transparent opacity={0.3} />
      </Box>
    </group>
  );
}

// Main scene
function UltraAgentScene({ 
  agents, 
  emotions, 
  goals, 
  knowledgeTransfers,
  collaborativeTask,
  selectedAgent,
  onAgentSelect 
}) {
  // Map emotions and goals to agents
  const getAgentEmotion = (agentId) => emotions.find(e => e.agent_id === agentId);
  const getAgentGoal = (agentId) => goals.find(g => g.agent_id === agentId);

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 12, 10]} intensity={1} color="#00f5ff" />
      <pointLight position={[-5, 8, -5]} intensity={0.6} color="#a855f7" />
      <pointLight position={[15, 5, 10]} intensity={0.4} color="#ec4899" />
      <spotLight position={[6, 15, 5]} intensity={0.5} angle={0.5} penumbra={0.5} />

      <SmartEnvironment />

      {/* Collaboration zone */}
      <CollaborationZone task={collaborativeTask} agents={agents} />

      {/* Knowledge transfer beams */}
      {knowledgeTransfers.filter(kt => kt.transfer_status === 'in_progress').map((kt, i) => {
        const fromAgent = agents.find(a => a.agent_id === kt.source_agent_id);
        const toAgent = agents.find(a => kt.target_agents?.includes(a.agent_id));
        if (!fromAgent || !toAgent) return null;
        
        return (
          <KnowledgeTransferBeam
            key={i}
            from={fromAgent.current_location || { x: 0, y: 0.5, z: 0 }}
            to={toAgent.current_location || { x: 2, y: 0.5, z: 2 }}
            knowledgeType={kt.knowledge_type}
            active={true}
          />
        );
      })}

      {/* Agents */}
      {agents.map((agent, idx) => (
        <UltraAgent
          key={agent.id || idx}
          agent={agent}
          emotion={getAgentEmotion(agent.agent_id)}
          currentGoal={getAgentGoal(agent.agent_id)}
          batteryLevel={agent.battery_level || 85}
          isSelected={selectedAgent?.id === agent.id}
          onSelect={onAgentSelect}
        />
      ))}

      <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 2.1} />
    </>
  );
}

export default function UltraAgentSpaceVisualizer3D({ 
  agents = [], 
  emotions = [], 
  goals = [],
  knowledgeTransfers = [],
  collaborativeTask,
  onAgentSelect
}) {
  const [selectedAgent, setSelectedAgent] = useState(null);

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    onAgentSelect && onAgentSelect(agent);
  };

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [12, 8, 12], fov: 55 }}>
        <UltraAgentScene
          agents={agents}
          emotions={emotions}
          goals={goals}
          knowledgeTransfers={knowledgeTransfers}
          collaborativeTask={collaborativeTask}
          selectedAgent={selectedAgent}
          onAgentSelect={handleAgentSelect}
        />
      </Canvas>
    </div>
  );
}