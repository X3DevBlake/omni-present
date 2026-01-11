import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { Share2 } from 'lucide-react';

function DataFlowParticle({ start, end, speed = 1 }) {
  const ref = useRef();
  const [progress, setProgress] = React.useState(0);

  useFrame(() => {
    setProgress(prev => {
      const next = prev + 0.01 * speed;
      return next > 1 ? 0 : next;
    });
  });

  const position = [
    start[0] + (end[0] - start[0]) * progress,
    start[1] + (end[1] - start[1]) * progress,
    start[2] + (end[2] - start[2]) * progress
  ];

  return (
    <Sphere ref={ref} args={[0.1, 16, 16]} position={position}>
      <meshBasicMaterial color="#06b6d4" />
    </Sphere>
  );
}

function DecisionNode({ position, decision, active }) {
  const ref = useRef();

  useFrame(() => {
    if (ref.current && active) {
      ref.current.rotation.y += 0.05;
    }
  });

  return (
    <group position={position} ref={ref}>
      <Sphere args={[0.4, 32, 32]}>
        <meshPhongMaterial
          color={active ? '#a855f7' : '#6b7280'}
          emissive={active ? '#a855f7' : '#374151'}
          emissiveIntensity={active ? 0.8 : 0.3}
        />
      </Sphere>
      <pointLight intensity={active ? 2 : 0.5} color="#a855f7" distance={4} />
    </group>
  );
}

export default function AgentDataFlowVisualizer3D({ agents = [], communications = [] }) {
  const agentPositions = agents.map((_, idx) => {
    const angle = (idx / agents.length) * Math.PI * 2;
    const radius = 6;
    return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="w-5 h-5 text-purple-400" />
        <h3 className="text-white font-bold">Data Flow & Decision Network</h3>
      </div>

      <div className="relative h-[500px] bg-gradient-to-br from-purple-900/20 to-black/40 border border-purple-500/20 rounded-xl overflow-hidden">
        <Canvas>
          <ambientLight intensity={0.3} />

          {/* Agent nodes */}
          {agents.map((agent, idx) => (
            <DecisionNode
              key={agent.id}
              position={agentPositions[idx]}
              decision={agent.lastDecision}
              active={agent.status === 'active'}
            />
          ))}

          {/* Data flow particles */}
          {communications.slice(-10).map((comm, idx) => {
            const senderIdx = agents.findIndex(a => a.id === comm.sender_agent_id);
            const recipientIdx = agents.findIndex(a => a.id === comm.recipient_agent_id);
            
            if (senderIdx === -1 || recipientIdx === -1) return null;

            return (
              <DataFlowParticle
                key={idx}
                start={agentPositions[senderIdx]}
                end={agentPositions[recipientIdx]}
                speed={comm.priority === 'urgent' ? 2 : 1}
              />
            );
          })}

          {/* Connection lines */}
          {communications.slice(-5).map((comm, idx) => {
            const senderIdx = agents.findIndex(a => a.id === comm.sender_agent_id);
            const recipientIdx = agents.findIndex(a => a.id === comm.recipient_agent_id);
            
            if (senderIdx === -1 || recipientIdx === -1) return null;

            return (
              <Line
                key={idx}
                points={[agentPositions[senderIdx], agentPositions[recipientIdx]]}
                color="#8b5cf6"
                lineWidth={1}
                opacity={0.4}
              />
            );
          })}

          <OrbitControls autoRotate autoRotateSpeed={0.3} />
        </Canvas>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-xs">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-white/60">Data Flows</p>
            <p className="text-purple-400 font-bold">{communications.length}</p>
          </div>
          <div>
            <p className="text-white/60">Active Nodes</p>
            <p className="text-green-400 font-bold">{agents.filter(a => a.status === 'active').length}</p>
          </div>
          <div>
            <p className="text-white/60">Decisions/min</p>
            <p className="text-cyan-400 font-bold">{Math.floor(communications.length / 5)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}