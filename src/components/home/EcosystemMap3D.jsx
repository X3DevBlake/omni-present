import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

function HubNode({ position, label, color, onClick, metrics, isActive }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.003;
      meshRef.current.rotation.y += 0.005;
      meshRef.current.scale.set(
        hovered ? 1.3 : isActive ? 1.15 : 1,
        hovered ? 1.3 : isActive ? 1.15 : 1,
        hovered ? 1.3 : isActive ? 1.15 : 1
      );
      meshRef.current.material.emissiveIntensity = hovered || isActive ? 0.8 : 0.4;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={onClick}
      >
        <icosahedronGeometry args={[1.2, 4]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.2}
          wireframe={false}
        />
      </mesh>

      {/* Orbit rings */}
      <mesh>
        <torusGeometry args={[1.5, 0.08, 16, 100]} />
        <meshStandardMaterial
          color={color}
          transparent={true}
          opacity={hovered || isActive ? 0.6 : 0.2}
        />
      </mesh>

      {/* Floating metrics */}
      {metrics && (hovered || isActive) && (
        <Text
          position={[0, 2.5, 0]}
          fontSize={0.4}
          color={color}
          anchorX="center"
          anchorY="bottom"
        >
          {label}: {metrics}
        </Text>
      )}
    </group>
  );
}

function DataStream({ from, to, active }) {
  const points = [
    new THREE.Vector3(...from),
    new THREE.Vector3(...to),
  ];
  const lineRef = useRef();
  const particleRef = useRef();
  const [progress, setProgress] = useState(0);

  useFrame(({ clock }) => {
    if (lineRef.current) {
      lineRef.current.material.dashOffset = -clock.getElapsedTime() * 0.5;
    }
    
    // Animate particle along path
    const t = (clock.getElapsedTime() * 0.2) % 1;
    setProgress(t);
    
    if (particleRef.current) {
      const pos = new THREE.Vector3().lerpVectors(points[0], points[1], t);
      particleRef.current.position.copy(pos);
    }
  });

  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.05, 8, false);

  return (
    <group>
      <mesh geometry={tubeGeometry}>
        <meshStandardMaterial
          color={active ? "#00f5ff" : "#a855f7"}
          transparent={true}
          opacity={active ? 0.8 : 0.3}
          emissive={active ? "#00f5ff" : "#a855f7"}
          emissiveIntensity={active ? 0.5 : 0.1}
        />
      </mesh>
      
      {/* Moving particle */}
      {active && (
        <mesh ref={particleRef}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial
            color="#00f5ff"
            emissive="#00f5ff"
            emissiveIntensity={1}
          />
        </mesh>
      )}
    </group>
  );
}

function AgentMarker({ position, agentName, activity }) {
  const markerRef = useRef();
  
  useFrame(({ clock }) => {
    if (markerRef.current) {
      markerRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 2) * 0.2;
    }
  });
  
  return (
    <group position={position} ref={markerRef}>
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={1}
        />
      </mesh>
      {activity && (
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.2}
          color="#fbbf24"
          anchorX="center"
        >
          {agentName}
        </Text>
      )}
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
      page: 'AgentManagementHub'
    },
    { 
      id: 'simulation', 
      label: 'Simulation Labs', 
      position: [6, 0, -4], 
      color: '#a855f7', 
      metrics: '5',
      page: 'SimulationLabs'
    },
    { 
      id: 'knowledge', 
      label: 'Knowledge Graph', 
      position: [0, 6, 0], 
      color: '#ec4899', 
      metrics: '1.2K',
      page: 'KnowledgeBase'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      position: [-6, 0, 4], 
      color: '#3b82f6', 
      metrics: userActivity?.length || '0',
      page: 'AIAnalyticsHub'
    },
    { 
      id: 'sandbox', 
      label: 'Sandbox', 
      position: [6, 0, 4], 
      color: '#10b981', 
      metrics: '12',
      page: 'SandboxHub'
    },
  ];

  const handleHubClick = (hub) => {
    navigate(createPageUrl(hub.page || 'Home'));
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
    <div className="w-full h-screen relative bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950">
      <Canvas camera={{ position: [0, 8, 12], fov: 60 }}>
        <color attach="background" args={['#0a0a0f']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#00f5ff" />
        <pointLight position={[-10, -10, -10]} intensity={1.5} color="#a855f7" />

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
            onClick={() => handleHubClick(hub)}
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
          />
        ))}

        {/* Data streams between hubs - with real-time activity */}
        <DataStream from={hubs[0].position} to={hubs[1].position} active={activeStreams.has('0-1')} />
        <DataStream from={hubs[0].position} to={hubs[2].position} active={activeStreams.has('0-2')} />
        <DataStream from={hubs[1].position} to={hubs[2].position} active={activeStreams.has('1-2')} />
        <DataStream from={hubs[1].position} to={hubs[3].position} active={activeStreams.has('1-3')} />
        <DataStream from={hubs[3].position} to={hubs[4].position} active={activeStreams.has('3-4')} />

        <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
      </Canvas>

      {/* Enhanced Interactive Legend with Live Stats */}
      <div className="absolute bottom-6 left-6 bg-black/70 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-4 max-w-xs">
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
      <div className="absolute top-6 right-6 bg-black/50 backdrop-blur-xl border border-cyan-500/20 rounded-lg p-3">
        <p className="text-xs text-white/70">Click nodes to navigate • Drag to rotate</p>
      </div>
    </div>
  );
}