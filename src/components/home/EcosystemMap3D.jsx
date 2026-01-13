import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, Text, Sparkles, PerspectiveCamera, PositionalAudio, Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

function PulsingEnergyField({ position, color, intensity = 1 }) {
  const meshRef = useRef();
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = Math.sin(clock.getElapsedTime() * 2) * 0.3 + 0.7;
      meshRef.current.scale.setScalar(pulse * intensity);
      meshRef.current.material.opacity = pulse * 0.3;
    }
  });
  
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[3, 32, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.2} side={THREE.BackSide} />
    </mesh>
  );
}

function HubNode({ position, label, color, onClick, metrics, isActive, performance, onWorkflowCreate, onUpgrade }) {
  const meshRef = useRef();
  const outerRingRef = useRef();
  const sparklesRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.003;
      meshRef.current.rotation.y += 0.005;
      
      const scale = clicked ? 1.5 : hovered ? 1.3 : isActive ? 1.15 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
      meshRef.current.material.emissiveIntensity = hovered || isActive ? 0.8 : 0.4;
    }
    
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = clock.getElapsedTime() * 0.5;
    }
  });

  const perfColor = performance > 80 ? '#10b981' : performance > 50 ? '#fbbf24' : '#ef4444';

  return (
    <group position={position}>
      {/* Pulsing energy field */}
      <PulsingEnergyField position={[0, 0, 0]} color={color} intensity={isActive ? 1.5 : 1} />
      
      {/* Sparkles effect */}
      {(hovered || isActive) && (
        <Sparkles
          count={50}
          scale={4}
          size={2}
          speed={0.3}
          color={color}
          opacity={0.6}
        />
      )}

      {/* Main hub node */}
      <mesh
        ref={meshRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          setClicked(true);
          setTimeout(() => setClicked(false), 300);
          onClick();
        }}
      >
        <icosahedronGeometry args={[1.2, 4]} />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          metalness={0.9}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.1}
          thickness={0.5}
        />
      </mesh>

      {/* Multiple orbit rings */}
      <mesh>
        <torusGeometry args={[1.5, 0.08, 16, 100]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={hovered || isActive ? 0.6 : 0.2}
        />
      </mesh>

      <mesh ref={outerRingRef} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2, 0.05, 16, 100]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={hovered || isActive ? 0.4 : 0.1}
        />
      </mesh>

      {/* Performance indicator ring */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.7, 1.9, 32]} />
        <meshBasicMaterial color={perfColor} transparent opacity={0.6} />
      </mesh>

      {/* Floating metrics with improved visibility */}
      {metrics && (hovered || isActive) && (
        <group>
          <Text
            position={[0, 2.8, 0]}
            fontSize={0.45}
            color="#ffffff"
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.05}
            outlineColor="#000000"
          >
            {label}
          </Text>
          <Text
            position={[0, 2.3, 0]}
            fontSize={0.35}
            color={color}
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.03}
            outlineColor="#000000"
          >
            {metrics} active
          </Text>
          <Text
            position={[0, 1.9, 0]}
            fontSize={0.3}
            color={perfColor}
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.03}
            outlineColor="#000000"
          >
            {performance}% perf
          </Text>
        </group>
      )}

      {/* Action buttons on hover */}
      {hovered && (
        <group position={[0, -2.5, 0]}>
          <mesh 
            onClick={(e) => {
              e.stopPropagation();
              onWorkflowCreate();
            }}
          >
            <planeGeometry args={[2.2, 0.6]} />
            <meshBasicMaterial color="#a855f7" transparent opacity={0.9} />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.25}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            Create Workflow
          </Text>
          
          {onUpgrade && (
            <>
              <mesh 
                position={[0, -0.8, 0]}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpgrade();
                }}
              >
                <planeGeometry args={[2.2, 0.6]} />
                <meshBasicMaterial color="#10b981" transparent opacity={0.9} />
              </mesh>
              <Text
                position={[0, -0.8, 0.01]}
                fontSize={0.25}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                Upgrade Hub
              </Text>
            </>
          )}
        </group>
      )}
    </group>
  );
}

function DataStream({ from, to, active, dataType = 'general' }) {
  const particlesRef = useRef([]);
  const lineRef = useRef();
  const numParticles = active ? 5 : 1;

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    particlesRef.current.forEach((particle, idx) => {
      if (particle) {
        const offset = idx / numParticles;
        const t = ((time * 0.3 + offset) % 1);
        const pos = new THREE.Vector3().lerpVectors(
          new THREE.Vector3(...from),
          new THREE.Vector3(...to),
          t
        );
        particle.position.copy(pos);
        
        // Pulse effect
        const scale = 1 + Math.sin(time * 3 + idx) * 0.3;
        particle.scale.setScalar(scale);
      }
    });
  });

  const curve = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
    mid.y += 2; // Add arc
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [from, to]);

  const tubeGeometry = useMemo(() => 
    new THREE.TubeGeometry(curve, 40, active ? 0.08 : 0.05, 8, false),
    [curve, active]
  );

  const streamColor = {
    general: '#a855f7',
    agent: '#00f5ff',
    data: '#10b981',
    workflow: '#fbbf24'
  }[dataType] || '#a855f7';

  return (
    <group>
      <mesh geometry={tubeGeometry} ref={lineRef}>
        <meshStandardMaterial
          color={active ? streamColor : '#a855f7'}
          transparent
          opacity={active ? 0.8 : 0.3}
          emissive={active ? streamColor : '#a855f7'}
          emissiveIntensity={active ? 0.6 : 0.1}
        />
      </mesh>
      
      {/* Multiple moving particles */}
      {Array.from({ length: numParticles }).map((_, idx) => (
        <mesh 
          key={idx}
          ref={el => particlesRef.current[idx] = el}
        >
          <sphereGeometry args={[active ? 0.12 : 0.08, 16, 16]} />
          <meshStandardMaterial
            color={streamColor}
            emissive={streamColor}
            emissiveIntensity={active ? 1.5 : 0.5}
          />
        </mesh>
      ))}
      
      {/* Data packet representation */}
      {active && (
        <Float speed={2} rotationIntensity={0.5}>
          <Text
            position={[(from[0] + to[0]) / 2, (from[1] + to[1]) / 2 + 1, (from[2] + to[2]) / 2]}
            fontSize={0.2}
            color={streamColor}
            anchorX="center"
          >
            {dataType}
          </Text>
        </Float>
      )}
    </group>
  );
}

function AgentMarker({ position, agentName, activity, performance = 85 }) {
  const markerRef = useRef();
  const trailRef = useRef([]);
  const [path, setPath] = useState([]);
  
  useFrame(({ clock }) => {
    if (markerRef.current) {
      const yOffset = Math.sin(clock.getElapsedTime() * 2) * 0.2;
      const xOffset = Math.cos(clock.getElapsedTime() * 0.5) * 0.3;
      markerRef.current.position.set(position[0] + xOffset, position[1] + yOffset, position[2]);
      
      // Update trail
      if (clock.getElapsedTime() % 0.1 < 0.016) {
        setPath(prev => [...prev.slice(-20), markerRef.current.position.clone()]);
      }
    }
  });
  
  const perfColor = performance > 80 ? '#10b981' : performance > 60 ? '#fbbf24' : '#ef4444';
  
  return (
    <group>
      {/* Agent trail */}
      {path.length > 1 && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={path.length}
              array={new Float32Array(path.flatMap(p => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#fbbf24" opacity={0.3} transparent />
        </line>
      )}
      
      <group ref={markerRef}>
        {/* Main agent sphere */}
        <mesh>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshPhysicalMaterial
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={activity ? 1.5 : 0.8}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        
        {/* Performance ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.22, 0.28, 32]} />
          <meshBasicMaterial color={perfColor} transparent opacity={0.6} />
        </mesh>
        
        {/* Agent info */}
        {activity && (
          <group>
            <Text
              position={[0, 0.6, 0]}
              fontSize={0.22}
              color="#ffffff"
              anchorX="center"
              outlineWidth={0.02}
              outlineColor="#000000"
            >
              {agentName}
            </Text>
            <Text
              position={[0, 0.35, 0]}
              fontSize={0.15}
              color={perfColor}
              anchorX="center"
            >
              {performance}% eff
            </Text>
          </group>
        )}
        
        {/* Activity indicator sparkles */}
        {activity && (
          <Sparkles
            count={10}
            scale={0.5}
            size={1}
            speed={0.4}
            color="#fbbf24"
          />
        )}
      </group>
    </group>
  );
}

export default function EcosystemMap3D({ activeHubs = [] }) {
  const navigate = useNavigate();
  const [hoveredHub, setHoveredHub] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  // Real-time data queries
  const { data: agents } = useQuery({
    queryKey: ['agents-realtime'],
    queryFn: () => base44.entities.Agent.list('-updated_date', 10),
    refetchInterval: 5000
  });

  const { data: collaborations } = useQuery({
    queryKey: ['collaborations-realtime'],
    queryFn: () => base44.entities.AgentCollaboration.list('-created_date', 5),
    refetchInterval: 5000
  });

  const { data: userActivity } = useQuery({
    queryKey: ['user-activity', userEmail],
    queryFn: () => base44.entities.ActivityLog.filter({ user_email: userEmail }, '-created_date', 10),
    enabled: !!userEmail,
    refetchInterval: 10000
  });

  const hubs = [
    { 
      id: 'agents', 
      label: 'Agent Hub', 
      position: [-6, 0, -4], 
      color: '#00f5ff', 
      metrics: agents?.length || '0',
      page: 'AgentManagementHub',
      performance: 75
    },
    { 
      id: 'simulation', 
      label: 'Simulation Labs', 
      position: [6, 0, -4], 
      color: '#a855f7', 
      metrics: '5',
      page: 'SimulationLabs',
      performance: 80
    },
    { 
      id: 'knowledge', 
      label: 'Knowledge Graph', 
      position: [0, 6, 0], 
      color: '#ec4899', 
      metrics: '1.2K',
      page: 'KnowledgeBase',
      performance: 92
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      position: [-6, 0, 4], 
      color: '#3b82f6', 
      metrics: userActivity?.length || '0',
      page: 'AIAnalyticsHub',
      performance: 88
    },
    { 
      id: 'sandbox', 
      label: 'Sandbox', 
      position: [6, 0, 4], 
      color: '#10b981', 
      metrics: '12',
      page: 'SandboxHub',
      performance: 85
    },
  ];

  const handleHubClick = (hub) => {
    navigate(createPageUrl(hub.page || 'Home'));
  };

  const handleWorkflowCreate = (hub) => {
    navigate(createPageUrl('IntegrationHub') + `?workflowFrom=${hub.id}`);
  };

  const handleUpgrade = (hub) => {
    navigate(createPageUrl('Billing') + `?upgrade=${hub.id}`);
  };

  // Determine active data streams based on real-time activity
  const activeStreams = React.useMemo(() => {
    const streams = new Set();
    if (agents && agents.length > 0) streams.add('0-1');
    if (collaborations && collaborations.length > 0) streams.add('0-2');
    if (userActivity && userActivity.length > 0) streams.add('1-3');
    return streams;
  }, [agents, collaborations, userActivity]);

  // User-specific agent markers
  const userAgents = React.useMemo(() => {
    if (!agents || !userEmail) return [];
    return agents
      .filter(a => a.created_by === userEmail)
      .slice(0, 3)
      .map((agent, idx) => ({
        name: agent.agent_name,
        position: [-4 + idx * 2, 2, -2],
        activity: agent.status === 'active'
      }));
  }, [agents, userEmail]);

  return (
    <div className="w-full h-[60vh] md:h-screen relative bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950">
      <Canvas camera={{ position: [0, 8, 12], fov: window.innerWidth < 768 ? 75 : 60 }}>
        <color attach="background" args={['#0a0a0f']} />
        
        {/* Enhanced lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={2.5} color="#00f5ff" />
        <pointLight position={[-10, -10, -10]} intensity={2} color="#a855f7" />
        <pointLight position={[0, 15, 0]} intensity={1.5} color="#ec4899" />
        <spotLight position={[0, 20, 0]} angle={0.3} penumbra={1} intensity={1} color="#ffffff" />
        
        {/* Environment for better reflections */}
        <Environment preset="night" />
        
        {/* Fog for depth */}
        <fog attach="fog" args={['#0a0a0f', 10, 35]} />
        
        {/* Stars background */}
        <Stars radius={100} depth={50} count={7000} factor={5} fade speed={1} />

        {/* Central reference */}
        <Float speed={0.3} rotationIntensity={0.1} floatIntensity={0.1}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.8, 32, 32]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.3}
              transparent={true}
              opacity={0.2}
            />
          </mesh>
        </Float>

        {/* Hub nodes */}
        {hubs.map((hub) => (
          <HubNode
            key={hub.id}
            position={hub.position}
            label={hub.label}
            color={hub.color}
            metrics={hub.metrics}
            performance={hub.performance}
            onClick={() => handleHubClick(hub)}
            onWorkflowCreate={() => handleWorkflowCreate(hub)}
            onUpgrade={() => handleUpgrade(hub)}
            isActive={activeHubs.includes(hub.id) || (userActivity && userActivity.some(a => a.entity_type === hub.id))}
          />
        ))}

        {/* Real-time agent markers */}
        {userAgents.map((agent, idx) => (
          <AgentMarker
            key={idx}
            position={agent.position}
            agentName={agent.name}
            activity={agent.activity}
            performance={75 + Math.random() * 25}
          />
        ))}

        {/* Data streams between hubs - with real-time activity and types */}
        <DataStream from={hubs[0].position} to={hubs[1].position} active={activeStreams.has('0-1')} dataType="agent" />
        <DataStream from={hubs[0].position} to={hubs[2].position} active={activeStreams.has('0-2')} dataType="data" />
        <DataStream from={hubs[1].position} to={hubs[2].position} active={activeStreams.has('1-2')} dataType="workflow" />
        <DataStream from={hubs[1].position} to={hubs[3].position} active={activeStreams.has('1-3')} dataType="data" />
        <DataStream from={hubs[3].position} to={hubs[4].position} active={activeStreams.has('3-4')} dataType="general" />
        <DataStream from={hubs[2].position} to={hubs[4].position} active={activeStreams.has('2-4')} dataType="agent" />

        <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
      </Canvas>

      {/* Enhanced Interactive Legend with Live Stats */}
      <div className="absolute bottom-2 left-2 md:bottom-6 md:left-6 bg-black/70 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-2 md:p-4 max-w-[180px] md:max-w-xs text-xs md:text-sm">
        <h3 className="text-white font-bold text-sm mb-3 flex items-center justify-between">
          AI Ecosystem
          <span className="text-xs text-cyan-400 font-normal animate-pulse">● Live</span>
        </h3>
        <div className="space-y-2">
          {hubs.map((hub) => (
            <div 
              key={hub.id} 
              className="flex items-center gap-3 text-xs cursor-pointer hover:bg-white/10 p-2 rounded transition-all"
              onClick={() => handleHubClick(hub)}
            >
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: hub.color }}
              />
              <span className="text-white/70">{hub.label}</span>
              <span className="ml-auto text-cyan-400 font-semibold">{hub.metrics}</span>
            </div>
          ))}
        </div>
        
        {userEmail && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="text-xs text-white/50 mb-2">Your Activity</div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/70">Active Agents</span>
              <span className="text-yellow-400 font-semibold">{userAgents.filter(a => a.activity).length}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-white/70">Recent Actions</span>
              <span className="text-purple-400 font-semibold">{userActivity?.length || 0}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Interaction Hint */}
      <div className="absolute top-2 right-2 md:top-6 md:right-6 bg-black/50 backdrop-blur-xl border border-cyan-500/20 rounded-lg p-2 md:p-3">
        <p className="text-[10px] md:text-xs text-white/70">
          <span className="hidden md:inline">Click nodes to navigate • Drag to rotate • Hover for actions</span>
          <span className="md:hidden">Tap nodes • Drag</span>
        </p>
      </div>
      
      {/* Stripe Upgrade CTA */}
      <AnimatePresence>
        {userEmail && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="absolute top-20 right-2 md:right-6 bg-gradient-to-br from-purple-600/90 to-pink-600/90 backdrop-blur-xl border border-purple-400/30 rounded-lg p-3 md:p-4 max-w-[200px] md:max-w-xs"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Zap className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Unlock Premium</h4>
                <p className="text-white/80 text-xs mt-1">Advanced AI features & unlimited agents</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-3 text-xs text-white/90">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3" />
                <span>10x faster processing</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-3 h-3" />
                <span>Priority support</span>
              </div>
            </div>
            
            <Button 
              onClick={() => navigate(createPageUrl('Billing'))}
              className="w-full bg-white text-purple-600 hover:bg-white/90 text-sm"
            >
              Upgrade Now
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}