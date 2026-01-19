import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function AgentNode({ agent, position, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = React.useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.2;
      
      // Scale on hover
      const targetScale = hovered ? 1.3 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });
  
  // Size based on reputation/performance
  const size = 0.3 + (agent.performance_summary?.success_rate || 50) / 200;
  
  // Color based on availability and rating
  const color = agent.is_available 
    ? new THREE.Color().setHSL(0.3 + (agent.performance_summary?.avg_rating || 3) / 15, 0.8, 0.6)
    : new THREE.Color(0.3, 0.3, 0.3);
  
  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[size, 32, 32]}
        onClick={() => onClick(agent)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>
      
      {/* Agent name */}
      <Text
        position={[0, size + 0.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {agent.display_name}
      </Text>
      
      {/* Rating indicator */}
      {agent.performance_summary?.avg_rating && (
        <Text
          position={[0, -size - 0.3, 0]}
          fontSize={0.15}
          color="#ffd700"
          anchorX="center"
          anchorY="middle"
        >
          ★ {agent.performance_summary.avg_rating.toFixed(1)}
        </Text>
      )}
      
      {/* Availability indicator */}
      {!agent.is_available && (
        <Sphere args={[0.1, 16, 16]} position={[size, 0, 0]}>
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
        </Sphere>
      )}
    </group>
  );
}

function CollaborationLines({ agents, collaborations }) {
  return collaborations.map((collab, idx) => {
    const agent1 = agents.find(a => a.agent_id === collab.from);
    const agent2 = agents.find(a => a.agent_id === collab.to);
    
    if (!agent1 || !agent2) return null;
    
    const idx1 = agents.indexOf(agent1);
    const idx2 = agents.indexOf(agent2);
    
    // Calculate positions
    const angle1 = (idx1 / agents.length) * Math.PI * 2;
    const angle2 = (idx2 / agents.length) * Math.PI * 2;
    const radius = 5;
    
    const pos1 = [
      Math.cos(angle1) * radius,
      Math.sin(idx1 * 0.5) * 2,
      Math.sin(angle1) * radius
    ];
    
    const pos2 = [
      Math.cos(angle2) * radius,
      Math.sin(idx2 * 0.5) * 2,
      Math.sin(angle2) * radius
    ];
    
    return (
      <Line
        key={idx}
        points={[pos1, pos2]}
        color="#00f5ff"
        lineWidth={1}
        opacity={0.3}
        transparent
      />
    );
  });
}

export default function Enhanced3DAgentConstellation({ agents, onAgentClick }) {
  // Generate positions in a 3D spiral constellation
  const positions = useMemo(() => {
    return agents.map((_, idx) => {
      const angle = (idx / agents.length) * Math.PI * 2;
      const radius = 5 + Math.sin(idx * 0.3) * 2;
      const height = Math.sin(idx * 0.5) * 2;
      
      return [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ];
    });
  }, [agents]);
  
  // Mock collaboration data (would come from backend)
  const collaborations = useMemo(() => {
    const collabs = [];
    for (let i = 0; i < agents.length; i++) {
      if (Math.random() > 0.7 && i < agents.length - 1) {
        collabs.push({
          from: agents[i].agent_id,
          to: agents[i + 1].agent_id
        });
      }
    }
    return collabs;
  }, [agents]);
  
  if (!agents || agents.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <p>No agents available</p>
      </div>
    );
  }
  
  return (
    <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f5ff" />
      
      {/* Central core */}
      <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={0.5}
          wireframe
        />
      </Sphere>
      
      {/* Agent nodes */}
      {agents.map((agent, idx) => (
        <AgentNode
          key={agent.agent_id || idx}
          agent={agent}
          position={positions[idx]}
          onClick={onAgentClick}
        />
      ))}
      
      {/* Collaboration lines */}
      <CollaborationLines agents={agents} collaborations={collaborations} />
      
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        minDistance={5}
        maxDistance={30}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}