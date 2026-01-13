import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Text, Sphere } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import * as THREE from 'three';

function AgentNode({ position, agentId, interactionCount, onClick }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  const size = Math.min(0.3 + interactionCount * 0.05, 1.5);

  return (
    <group position={position} onClick={onClick}>
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshStandardMaterial
          color="#00f5ff"
          emissive="#00f5ff"
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </Sphere>
      <pointLight color="#00f5ff" intensity={2} distance={5} />
      <Text
        position={[0, size + 0.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {agentId.substring(0, 8)}
      </Text>
      <Text
        position={[0, size + 1, 0]}
        fontSize={0.2}
        color="#00f5ff"
        anchorX="center"
        anchorY="middle"
      >
        {interactionCount} interactions
      </Text>
    </group>
  );
}

function InteractionFlow({ from, to, success }) {
  const [progress, setProgress] = React.useState(0);
  
  useFrame(() => {
    setProgress((prev) => (prev + 0.02) % 1);
  });

  const points = [
    new THREE.Vector3(...from),
    new THREE.Vector3(...to)
  ];

  const particlePosition = new THREE.Vector3().lerpVectors(
    points[0],
    points[1],
    progress
  );

  return (
    <>
      <Line
        points={points}
        color={success ? "#10b981" : "#ef4444"}
        lineWidth={2}
        transparent
        opacity={0.6}
      />
      <Sphere args={[0.1, 16, 16]} position={particlePosition}>
        <meshBasicMaterial color={success ? "#10b981" : "#ef4444"} />
      </Sphere>
    </>
  );
}

function Scene({ logs, onAgentClick }) {
  const agentPositions = useMemo(() => {
    const agents = [...new Set(logs?.map(l => l.agent_id) || [])];
    const positions = {};
    const radius = 5;
    
    agents.forEach((agentId, idx) => {
      const angle = (idx / agents.length) * Math.PI * 2;
      positions[agentId] = [
        Math.cos(angle) * radius,
        Math.sin(idx * 0.5) * 2,
        Math.sin(angle) * radius
      ];
    });
    
    return positions;
  }, [logs]);

  const agentInteractionCounts = useMemo(() => {
    const counts = {};
    logs?.forEach(log => {
      counts[log.agent_id] = (counts[log.agent_id] || 0) + 1;
    });
    return counts;
  }, [logs]);

  const recentInteractions = logs?.slice(0, 20) || [];

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      {/* Agent Nodes */}
      {Object.entries(agentPositions).map(([agentId, position]) => (
        <AgentNode
          key={agentId}
          position={position}
          agentId={agentId}
          interactionCount={agentInteractionCounts[agentId] || 0}
          onClick={() => onAgentClick(agentId)}
        />
      ))}
      
      {/* Interaction Flows */}
      {recentInteractions
        .filter(log => log.target_agent_id && agentPositions[log.target_agent_id])
        .map((log, idx) => (
          <InteractionFlow
            key={idx}
            from={agentPositions[log.agent_id]}
            to={agentPositions[log.target_agent_id]}
            success={log.success}
          />
        ))}
      
      <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

export default function AgentInteractionFlow3D({ height = "600px" }) {
  const [selectedAgent, setSelectedAgent] = React.useState(null);

  const { data: logs } = useQuery({
    queryKey: ['interaction-logs-3d'],
    queryFn: () => base44.entities.AgentInteractionLog.list('-created_date', 100),
    refetchInterval: 5000
  });

  return (
    <div className="relative">
      <Canvas
        camera={{ position: [0, 5, 15], fov: 60 }}
        style={{ height }}
        className="bg-gradient-to-b from-gray-900 to-black"
      >
        <Scene logs={logs} onAgentClick={setSelectedAgent} />
      </Canvas>
      
      {selectedAgent && (
        <div className="absolute bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg border border-cyan-500">
          <p className="font-semibold mb-2">Agent: {selectedAgent}</p>
          <p className="text-sm text-gray-300">
            Interactions: {logs?.filter(l => l.agent_id === selectedAgent).length}
          </p>
          <button
            onClick={() => setSelectedAgent(null)}
            className="mt-2 text-xs text-cyan-400 hover:text-cyan-300"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}