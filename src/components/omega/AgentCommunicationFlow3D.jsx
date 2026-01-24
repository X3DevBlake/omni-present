import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';
import { MessageSquare, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

const CommunicatingAgent = ({ position, agentId, isSending }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(0.4 + (isSending ? Math.sin(state.clock.elapsedTime * 5) * 0.2 : 0));
      meshRef.current.material.emissiveIntensity = isSending ? 
        1.2 + Math.sin(state.clock.elapsedTime * 4) * 0.3 : 0.6;
    }
  });
  
  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.25, 32, 32]}>
        <meshStandardMaterial
          color={isSending ? '#10b981' : '#3b82f6'}
          emissive={isSending ? '#10b981' : '#3b82f6'}
          emissiveIntensity={0.8}
        />
      </Sphere>
      <Text position={[0, 0.5, 0]} fontSize={0.12} color="white" anchorX="center">
        A{agentId}
      </Text>
    </group>
  );
};

const MessagePacket = ({ from, to, messageType }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const t = (state.clock.elapsedTime % 2) / 2;
      const fromVec = new THREE.Vector3(...from);
      const toVec = new THREE.Vector3(...to);
      meshRef.current.position.lerpVectors(fromVec, toVec, t);
    }
  });
  
  const typeColors = {
    broadcast: '#8b5cf6',
    direct: '#3b82f6',
    negotiation: '#f59e0b'
  };
  
  return (
    <Sphere ref={meshRef} args={[0.08, 16, 16]} position={from}>
      <meshStandardMaterial
        color={typeColors[messageType]}
        emissive={typeColors[messageType]}
        emissiveIntensity={1.5}
      />
    </Sphere>
  );
};

export default function AgentCommunicationFlow3D() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [messages, setMessages] = useState([]);

  const agents = [
    { id: 1, pos: [0, 2, 0] },
    { id: 2, pos: [-2, 0, 0] },
    { id: 3, pos: [2, 0, 0] },
    { id: 4, pos: [0, -2, 0] }
  ];

  const startSimulation = () => {
    setIsSimulating(true);
    
    const newMessages = [
      { from: agents[0].pos, to: agents[1].pos, type: 'direct' },
      { from: agents[1].pos, to: agents[2].pos, type: 'negotiation' },
      { from: agents[0].pos, to: agents[3].pos, type: 'broadcast' }
    ];
    
    setMessages(newMessages);
  };

  return (
    <Card className="bg-gradient-to-br from-blue-950/90 via-indigo-950/90 to-violet-950/90 backdrop-blur-xl border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <MessageSquare className="w-7 h-7 text-blue-400" />
          Agent Communication Patterns
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          Real-time visualization of inter-agent message flow
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[450px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-blue-500/20">
          <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.8} color="#3b82f6" />

            {agents.map((agent) => (
              <CommunicatingAgent
                key={agent.id}
                position={agent.pos}
                agentId={agent.id}
                isSending={isSimulating && messages.some(m => 
                  m.from[0] === agent.pos[0] && m.from[1] === agent.pos[1]
                )}
              />
            ))}

            {isSimulating && messages.map((msg, idx) => (
              <MessagePacket
                key={idx}
                from={msg.from}
                to={msg.to}
                messageType={msg.type}
              />
            ))}

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-black/60 rounded-lg p-3 border border-blue-500/30">
            <div className="text-blue-400 text-xs mb-1">Active Agents</div>
            <div className="text-white text-2xl font-bold">{agents.length}</div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-purple-500/30">
            <div className="text-purple-400 text-xs mb-1">Messages</div>
            <div className="text-white text-2xl font-bold">{messages.length}</div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-green-500/30">
            <div className="text-green-400 text-xs mb-1">Throughput</div>
            <div className="text-white text-2xl font-bold">
              {isSimulating ? '150/s' : '0/s'}
            </div>
          </div>
        </div>

        <Button
          onClick={startSimulation}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Radio className="w-4 h-4 mr-2" />
          {isSimulating ? 'Simulation Active' : 'Start Communication Simulation'}
        </Button>
      </CardContent>
    </Card>
  );
}