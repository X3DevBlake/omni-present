import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

function AgentParticipant({ position, agentId, messageCount, sentiment }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const scale = 1 + (messageCount / 50) * 0.5;
      meshRef.current.scale.setScalar(scale);
    }
  });

  const color = sentiment > 0 ? '#00ff88' : sentiment < 0 ? '#ff4444' : '#00f5ff';

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.5, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.7}
        />
      </Sphere>

      <Text
        position={[0, -1, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
      >
        {agentId.slice(0, 6)}
      </Text>

      {/* Message count indicator */}
      {messageCount > 0 && (
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.15}
          color="#ffcc00"
          anchorX="center"
        >
          {messageCount}
        </Text>
      )}
    </group>
  );
}

export default function CollaborationNetwork3D({ participants, messages }) {
  const positions = React.useMemo(() => {
    return participants.map((_, index) => {
      const angle = (index / participants.length) * Math.PI * 2;
      const radius = 4;
      return [
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius,
      ];
    });
  }, [participants]);

  const agentMessageCounts = React.useMemo(() => {
    const counts = {};
    messages.forEach(msg => {
      counts[msg.sender_agent_id] = (counts[msg.sender_agent_id] || 0) + 1;
    });
    return counts;
  }, [messages]);

  const agentSentiments = React.useMemo(() => {
    const sentiments = {};
    messages.forEach(msg => {
      if (!sentiments[msg.sender_agent_id]) {
        sentiments[msg.sender_agent_id] = [];
      }
      if (msg.sentiment !== undefined) {
        sentiments[msg.sender_agent_id].push(msg.sentiment);
      }
    });

    // Average sentiment per agent
    Object.keys(sentiments).forEach(agentId => {
      const avg = sentiments[agentId].reduce((a, b) => a + b, 0) / sentiments[agentId].length;
      sentiments[agentId] = avg;
    });

    return sentiments;
  }, [messages]);

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden bg-black/20">
      <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        {participants.map((agentId, index) => (
          <AgentParticipant
            key={agentId}
            position={positions[index]}
            agentId={agentId}
            messageCount={agentMessageCounts[agentId] || 0}
            sentiment={agentSentiments[agentId] || 0}
          />
        ))}

        {/* Draw connections between all participants */}
        {positions.map((pos1, i) => 
          positions.slice(i + 1).map((pos2, j) => (
            <Line
              key={`${i}-${j}`}
              points={[pos1, pos2]}
              color="#00f5ff"
              lineWidth={1}
              transparent
              opacity={0.2}
            />
          ))
        )}

        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={1} />
      </Canvas>
    </div>
  );
}