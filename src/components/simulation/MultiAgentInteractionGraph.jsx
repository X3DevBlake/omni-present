import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

function AgentNode({ position, agent, index }) {
  const nodeRef = useRef();
  const [hovered, setHovered] = React.useState(false);

  useFrame((state) => {
    if (nodeRef.current) {
      nodeRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + index) * 0.15;
      if (hovered) {
        nodeRef.current.scale.lerp(new THREE.Vector3(1.3, 1.3, 1.3), 0.1);
      } else {
        nodeRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  const statusColor = agent.status === 'active' ? '#10b981' :
                      agent.status === 'learning' ? '#f59e0b' :
                      agent.status === 'idle' ? '#6b7280' : '#3b82f6';

  return (
    <group position={position}>
      <Sphere
        ref={nodeRef}
        args={[0.3, 32, 32]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={hovered ? 0.8 : 0.4}
          metalness={0.7}
          roughness={0.3}
        />
      </Sphere>

      <Text
        position={[0, -0.6, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
      >
        {agent.agent_name?.substring(0, 15)}
      </Text>

      {hovered && (
        <Text
          position={[0, 0.6, 0]}
          fontSize={0.12}
          color="#22d3ee"
          anchorX="center"
        >
          {agent.agent_type}
        </Text>
      )}
    </group>
  );
}

function InteractionLine({ from, to, strength }) {
  const points = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...from),
      new THREE.Vector3(
        (from[0] + to[0]) / 2,
        Math.max(from[1], to[1]) + 0.5,
        (from[2] + to[2]) / 2
      ),
      new THREE.Vector3(...to)
    );
    return curve.getPoints(30);
  }, [from, to]);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#6366f1"
        opacity={strength}
        transparent
        linewidth={2}
      />
    </line>
  );
}

export default function MultiAgentInteractionGraph({ agents }) {
  // Arrange agents in a circular formation
  const agentPositions = useMemo(() => {
    return agents.map((_, idx) => {
      const angle = (idx / agents.length) * Math.PI * 2;
      const radius = 3 + (agents.length / 20);
      return [
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 1,
        Math.sin(angle) * radius
      ];
    });
  }, [agents]);

  // Generate interaction lines (connect nearby agents)
  const interactions = useMemo(() => {
    const lines = [];
    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < Math.min(i + 4, agents.length); j++) {
        lines.push({
          from: agentPositions[i],
          to: agentPositions[j],
          strength: 0.3 + Math.random() * 0.4
        });
      }
    }
    return lines;
  }, [agents, agentPositions]);

  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />

      {/* Central Knowledge Hub */}
      <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>

      {/* Agent Nodes */}
      {agents.map((agent, idx) => (
        <AgentNode
          key={agent.id}
          position={agentPositions[idx]}
          agent={agent}
          index={idx}
        />
      ))}

      {/* Interaction Lines */}
      {interactions.map((interaction, idx) => (
        <InteractionLine
          key={idx}
          from={interaction.from}
          to={interaction.to}
          strength={interaction.strength}
        />
      ))}

      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={20}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </Canvas>
  );
}