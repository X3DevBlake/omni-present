import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Line, Trail } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import * as THREE from 'three';

function SimulationAgent({ agent, position, velocity }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.x += velocity[0] * 0.01;
      meshRef.current.position.z += velocity[2] * 0.01;
      
      // Boundary wrapping
      if (Math.abs(meshRef.current.position.x) > 10) {
        meshRef.current.position.x *= -1;
      }
      if (Math.abs(meshRef.current.position.z) > 10) {
        meshRef.current.position.z *= -1;
      }
    }
  });

  return (
    <Trail
      width={2}
      length={10}
      color="#00f5ff"
      attenuation={(t) => t * t}
    >
      <Sphere ref={meshRef} args={[0.3, 32, 32]} position={position}>
        <meshStandardMaterial
          color="#00f5ff"
          emissive="#00f5ff"
          emissiveIntensity={0.5}
        />
      </Sphere>
    </Trail>
  );
}

function EnvironmentGrid() {
  return (
    <gridHelper args={[20, 20, '#ffffff30', '#ffffff10']} />
  );
}

export default function MultiAgentSimulation3D({ simulationId }) {
  const { data: simulationAgents = [] } = useQuery({
    queryKey: ['simulation-agents', simulationId],
    queryFn: () => base44.entities.SimulationAgent.filter({ simulation_id: simulationId }),
    enabled: !!simulationId,
    refetchInterval: 1000, // Real-time updates
  });

  const agentPositions = React.useMemo(() => {
    return simulationAgents.map(() => [
      (Math.random() - 0.5) * 10,
      0.5,
      (Math.random() - 0.5) * 10,
    ]);
  }, [simulationAgents.length]);

  const agentVelocities = React.useMemo(() => {
    return simulationAgents.map(() => [
      (Math.random() - 0.5) * 2,
      0,
      (Math.random() - 0.5) * 2,
    ]);
  }, [simulationAgents.length]);

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden bg-black/20">
      <Canvas camera={{ position: [0, 10, 15], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, 10, -10]} intensity={1} color="#a855f7" />

        <EnvironmentGrid />

        {simulationAgents.map((agent, index) => (
          <SimulationAgent
            key={agent.id}
            agent={agent}
            position={agentPositions[index]}
            velocity={agentVelocities[index]}
          />
        ))}

        {/* Central goal marker */}
        <Sphere args={[0.5, 32, 32]} position={[0, 0.5, 0]}>
          <meshStandardMaterial
            color="#ffcc00"
            emissive="#ffcc00"
            emissiveIntensity={1}
            transparent
            opacity={0.6}
          />
        </Sphere>

        <OrbitControls enableZoom={true} />
      </Canvas>

      {simulationAgents.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/60">No active simulation agents</p>
        </div>
      )}
    </div>
  );
}