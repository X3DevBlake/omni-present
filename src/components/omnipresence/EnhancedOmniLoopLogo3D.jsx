import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Trail, Sphere, Torus, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Energy particles flowing through the loop
function EnergyParticles({ count = 200, systemActivity = 0.5, color = '#00f5ff' }) {
  const particles = useRef();
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 1.8 + Math.random() * 0.3;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, [count]);

  const speeds = useMemo(() => {
    return new Float32Array(count).map(() => 0.5 + Math.random() * 1.5);
  }, [count]);

  useFrame((state) => {
    if (particles.current) {
      const posArray = particles.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        const speed = speeds[i] * (0.5 + systemActivity);
        const angle = (i / count) * Math.PI * 2 + state.clock.elapsedTime * speed;
        const radius = 1.8 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.2;
        posArray[i * 3] = Math.cos(angle) * radius;
        posArray[i * 3 + 1] = Math.sin(state.clock.elapsedTime * 3 + i * 0.1) * 0.15;
        posArray[i * 3 + 2] = Math.sin(angle) * radius;
      }
      particles.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04 + systemActivity * 0.03} color={color} transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

// Reactive pulsing core
function EnergyCore({ systemActivity = 0.5, eventPulse = false }) {
  const coreRef = useRef();
  const glowRef = useRef();
  const pulseRef = useRef(0);

  useFrame((state) => {
    if (coreRef.current) {
      const basePulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      const activityBoost = systemActivity * 0.3;
      coreRef.current.scale.setScalar(basePulse + activityBoost);
      
      // Event pulse effect
      if (eventPulse) {
        pulseRef.current = 1;
      }
      if (pulseRef.current > 0) {
        pulseRef.current -= 0.02;
        coreRef.current.scale.setScalar(basePulse + activityBoost + pulseRef.current * 0.5);
      }
      
      coreRef.current.material.emissiveIntensity = 0.8 + systemActivity * 0.5 + pulseRef.current;
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.15 + systemActivity * 0.15 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
    }
  });

  const coreColor = useMemo(() => {
    if (systemActivity > 0.8) return '#ff4444';
    if (systemActivity > 0.5) return '#f59e0b';
    return '#00f5ff';
  }, [systemActivity]);

  return (
    <group>
      <Sphere ref={coreRef} args={[0.4, 32, 32]}>
        <meshStandardMaterial color={coreColor} emissive={coreColor} emissiveIntensity={0.8} metalness={0.9} roughness={0.1} />
      </Sphere>
      <Sphere ref={glowRef} args={[0.6, 32, 32]}>
        <meshBasicMaterial color={coreColor} transparent opacity={0.15} />
      </Sphere>
    </group>
  );
}

// Dynamic rotating rings
function DynamicRings({ systemActivity = 0.5, dataTransfers = 0 }) {
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();

  useFrame((state) => {
    const speed = 0.3 + systemActivity * 0.5;
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = state.clock.elapsedTime * speed;
      ring1Ref.current.rotation.y = state.clock.elapsedTime * speed * 0.7;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -state.clock.elapsedTime * speed * 0.8;
      ring2Ref.current.rotation.z = state.clock.elapsedTime * speed * 0.5;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = state.clock.elapsedTime * speed * 0.6;
      ring3Ref.current.rotation.z = -state.clock.elapsedTime * speed * 0.4;
    }
  });

  const ringColor = dataTransfers > 5 ? '#a855f7' : '#00f5ff';

  return (
    <group>
      <Torus ref={ring1Ref} args={[1.2, 0.02, 16, 100]}>
        <meshStandardMaterial color={ringColor} emissive={ringColor} emissiveIntensity={0.6} transparent opacity={0.9} />
      </Torus>
      <Torus ref={ring2Ref} args={[1.5, 0.015, 16, 100]} rotation={[Math.PI / 3, 0, 0]}>
        <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.5} transparent opacity={0.8} />
      </Torus>
      <Torus ref={ring3Ref} args={[1.8, 0.01, 16, 100]} rotation={[Math.PI / 6, Math.PI / 4, 0]}>
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.4} transparent opacity={0.7} />
      </Torus>
    </group>
  );
}

// Data ripple effect
function DataRipple({ active = false }) {
  const rippleRef = useRef();
  const [ripples, setRipples] = useState([]);

  useFrame((state) => {
    if (active && Math.random() < 0.02) {
      setRipples(prev => [...prev.slice(-5), { id: Date.now(), scale: 0.5 }]);
    }
    
    setRipples(prev => prev.map(r => ({ ...r, scale: r.scale + 0.05 })).filter(r => r.scale < 3));
  });

  return (
    <group>
      {ripples.map(ripple => (
        <mesh key={ripple.id} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[ripple.scale, ripple.scale + 0.05, 64]} />
          <meshBasicMaterial color="#00f5ff" transparent opacity={Math.max(0, 1 - ripple.scale / 3)} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// Orbital data nodes
function OrbitalDataNodes({ agents = [], dataTransfers = [] }) {
  const nodesRef = useRef([]);
  const nodeCount = Math.min(agents.length, 8);

  useFrame((state) => {
    nodesRef.current.forEach((node, i) => {
      if (node) {
        const angle = (i / nodeCount) * Math.PI * 2 + state.clock.elapsedTime * 0.3;
        const radius = 2.2;
        node.position.x = Math.cos(angle) * radius;
        node.position.z = Math.sin(angle) * radius;
        node.position.y = Math.sin(state.clock.elapsedTime * 2 + i) * 0.2;
        node.rotation.y += 0.02;
      }
    });
  });

  const statusColors = {
    active: '#10b981',
    idle: '#64748b',
    transitioning: '#f59e0b'
  };

  return (
    <group>
      {agents.slice(0, 8).map((agent, i) => (
        <group key={agent.id || i} ref={el => nodesRef.current[i] = el}>
          <Trail width={0.15} length={6} color={statusColors[agent.projection_status] || '#00f5ff'} attenuation={(t) => t * t}>
            <Sphere args={[0.08, 16, 16]}>
              <meshStandardMaterial 
                color={statusColors[agent.projection_status] || '#00f5ff'} 
                emissive={statusColors[agent.projection_status] || '#00f5ff'} 
                emissiveIntensity={0.8} 
              />
            </Sphere>
          </Trail>
        </group>
      ))}
    </group>
  );
}

// Holographic outer shell
function HolographicShell({ userInteracting = false }) {
  const shellRef = useRef();

  useFrame((state) => {
    if (shellRef.current) {
      shellRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      shellRef.current.material.opacity = userInteracting ? 0.15 : 0.05 + Math.sin(state.clock.elapsedTime) * 0.02;
    }
  });

  return (
    <Sphere ref={shellRef} args={[2.5, 64, 64]}>
      <meshBasicMaterial color="#00f5ff" transparent opacity={0.05} wireframe />
    </Sphere>
  );
}

// Main logo scene
function LogoScene({ systemMetrics, agents, dataTransfers, userInteracting }) {
  const groupRef = useRef();
  const systemActivity = systemMetrics?.activity_level || 0.5;
  const hasDataTransfers = dataTransfers.length > 0;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <EnergyCore systemActivity={systemActivity} eventPulse={hasDataTransfers} />
      <DynamicRings systemActivity={systemActivity} dataTransfers={dataTransfers.length} />
      <EnergyParticles count={250} systemActivity={systemActivity} />
      <OrbitalDataNodes agents={agents} dataTransfers={dataTransfers} />
      <DataRipple active={hasDataTransfers} />
      <HolographicShell userInteracting={userInteracting} />
    </group>
  );
}

export default function EnhancedOmniLoopLogo3D({ compact = false }) {
  const [userInteracting, setUserInteracting] = useState(false);

  const { data: agents = [] } = useQuery({
    queryKey: ['logo-agents'],
    queryFn: () => base44.entities.AgentPhysicalPresence.list('-created_date', 10),
    initialData: [],
    refetchInterval: 5000
  });

  const { data: dataTransfers = [] } = useQuery({
    queryKey: ['logo-transfers'],
    queryFn: () => base44.entities.KnowledgeTransfer.filter({ transfer_status: 'in_progress' }),
    initialData: [],
    refetchInterval: 3000
  });

  const { data: systemMetrics = {} } = useQuery({
    queryKey: ['logo-metrics'],
    queryFn: async () => {
      const activeAgents = agents.filter(a => a.projection_status === 'active').length;
      return {
        activity_level: Math.min(1, activeAgents / 5 + dataTransfers.length / 10),
        active_agents: activeAgents,
        data_flow: dataTransfers.length
      };
    },
    initialData: { activity_level: 0.5 }
  });

  return (
    <div 
      className={`${compact ? 'h-32 w-32' : 'h-[400px] w-full'}`}
      onMouseEnter={() => setUserInteracting(true)}
      onMouseLeave={() => setUserInteracting(false)}
    >
      <Canvas camera={{ position: compact ? [4, 2, 4] : [5, 3, 5], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#00f5ff" />
        <pointLight position={[-5, 3, -5]} intensity={0.5} color="#a855f7" />
        <pointLight position={[0, -3, 0]} intensity={0.3} color="#ec4899" />

        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
          <LogoScene 
            systemMetrics={systemMetrics} 
            agents={agents} 
            dataTransfers={dataTransfers}
            userInteracting={userInteracting}
          />
        </Float>

        {!compact && <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />}
      </Canvas>

      {!compact && (
        <div className="absolute bottom-4 left-4 text-xs text-slate-400">
          <div className="flex gap-4">
            <span className="text-cyan-400">● {agents.filter(a => a.projection_status === 'active').length} Active</span>
            <span className="text-purple-400">● {dataTransfers.length} Transfers</span>
          </div>
        </div>
      )}
    </div>
  );
}