import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { Users, MessageCircle } from 'lucide-react';

function CollaboratingAgent({ position, name, active, messages = 0 }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current && active) {
      ref.current.rotation.y += 0.02;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      ref.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={position} ref={ref}>
      <Sphere args={[0.5, 32, 32]}>
        <meshPhongMaterial
          color={active ? '#10b981' : '#6b7280'}
          emissive={active ? '#10b981' : '#374151'}
          emissiveIntensity={0.8}
        />
      </Sphere>
      <Text
        position={[0, -1, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
      {messages > 0 && (
        <Text
          position={[0, 1, 0]}
          fontSize={0.2}
          color="#60a5fa"
          anchorX="center"
          anchorY="middle"
        >
          {messages} msg
        </Text>
      )}
      <pointLight intensity={active ? 3 : 1} color={active ? '#10b981' : '#6b7280'} distance={5} />
    </group>
  );
}

function CommunicationLine({ start, end }) {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  
  return (
    <Line
      points={points}
      color="#06b6d4"
      lineWidth={2}
      dashed
      dashScale={2}
      dashSize={0.5}
      gapSize={0.5}
    />
  );
}

export default function AgentCollaborationSpace3D({ agents = [], communications = [] }) {
  const activeAgents = agents.filter(a => a.status === 'active');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          <h3 className="text-white font-bold">Collaborative Space</h3>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full">
          <MessageCircle className="w-3 h-3 text-green-400" />
          <span className="text-xs text-white/70">{communications.length} messages</span>
        </div>
      </div>

      <div className="relative h-[500px] bg-gradient-to-br from-black/40 to-black/20 border border-white/10 rounded-xl overflow-hidden">
        <Canvas>
          <ambientLight intensity={0.3} />
          
          {agents.map((agent, idx) => {
            const angle = (idx / agents.length) * Math.PI * 2;
            const radius = 5;
            const position = [
              Math.cos(angle) * radius,
              (Math.random() - 0.5) * 3,
              Math.sin(angle) * radius
            ];

            const agentMessages = communications.filter(
              c => c.sender_agent_id === agent.id
            ).length;

            return (
              <CollaboratingAgent
                key={agent.id}
                position={position}
                name={agent.name}
                active={agent.status === 'active'}
                messages={agentMessages}
              />
            );
          })}

          {communications.slice(-5).map((comm, idx) => {
            const senderIdx = agents.findIndex(a => a.id === comm.sender_agent_id);
            const recipientIdx = agents.findIndex(a => a.id === comm.recipient_agent_id);
            
            if (senderIdx === -1 || recipientIdx === -1) return null;

            const angle1 = (senderIdx / agents.length) * Math.PI * 2;
            const angle2 = (recipientIdx / agents.length) * Math.PI * 2;
            const radius = 5;

            return (
              <CommunicationLine
                key={idx}
                start={[Math.cos(angle1) * radius, 0, Math.sin(angle1) * radius]}
                end={[Math.cos(angle2) * radius, 0, Math.sin(angle2) * radius]}
              />
            );
          })}

          <OrbitControls autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-green-500/10 border border-green-500/20 rounded p-2">
          <p className="text-green-400 font-bold">{activeAgents.length}</p>
          <p className="text-white/60">Active</p>
        </div>
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded p-2">
          <p className="text-cyan-400 font-bold">{communications.length}</p>
          <p className="text-white/60">Messages</p>
        </div>
      </div>
    </motion.div>
  );
}