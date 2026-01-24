import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Html } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as THREE from 'three';
import { Radio, Activity, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const NetworkAgent = ({ position, agentId, activeConnections, latency }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const activity = Math.sin(state.clock.elapsedTime * (3 + activeConnections)) * 0.1;
      meshRef.current.scale.setScalar(0.3 + activeConnections * 0.05 + activity);
      meshRef.current.material.emissiveIntensity = 0.6 + activeConnections * 0.2;
    }
  });
  
  const latencyColor = latency < 20 ? '#10b981' : latency < 50 ? '#f59e0b' : '#ef4444';
  
  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.25, 32, 32]}>
        <meshStandardMaterial
          color={latencyColor}
          emissive={latencyColor}
          emissiveIntensity={0.8}
        />
      </Sphere>
      <Text position={[0, 0.5, 0]} fontSize={0.1} color="white" anchorX="center">
        A{agentId}
      </Text>
      <Html position={[0, -0.4, 0]} center distanceFactor={8}>
        <div className="bg-black/80 rounded px-2 py-1 text-xs text-white whitespace-nowrap">
          {latency}ms
        </div>
      </Html>
    </group>
  );
};

const DataFlowLink = ({ from, to, bandwidth, protocol }) => {
  const lineRef = useRef();
  const particleRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.3 + bandwidth * 0.4;
    }
    
    if (particleRef.current) {
      const t = (state.clock.elapsedTime % 2) / 2;
      const fromVec = new THREE.Vector3(...from);
      const toVec = new THREE.Vector3(...to);
      particleRef.current.position.lerpVectors(fromVec, toVec, t);
    }
  });
  
  const protocolColors = {
    direct: '#3b82f6',
    broadcast: '#8b5cf6',
    gossip: '#10b981'
  };
  
  return (
    <>
      <Line
        ref={lineRef}
        points={[new THREE.Vector3(...from), new THREE.Vector3(...to)]}
        color={protocolColors[protocol]}
        lineWidth={1 + bandwidth * 2}
        transparent
        opacity={0.5}
      />
      <Sphere ref={particleRef} args={[0.05, 8, 8]} position={from}>
        <meshStandardMaterial
          color={protocolColors[protocol]}
          emissive={protocolColors[protocol]}
          emissiveIntensity={1.5}
        />
      </Sphere>
    </>
  );
};

export default function CommunicationTopology3D() {
  const [topology, setTopology] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [viewMode, setViewMode] = useState('topology');

  const startSimulation = () => {
    setIsSimulating(true);
    
    const agents = [
      { id: 1, pos: [0, 2, 0], connections: 3, latency: 15 },
      { id: 2, pos: [-2, 0, 0], connections: 2, latency: 25 },
      { id: 3, pos: [2, 0, 0], connections: 2, latency: 18 },
      { id: 4, pos: [0, -2, 0], connections: 2, latency: 45 },
      { id: 5, pos: [-1.5, -1, 1], connections: 1, latency: 12 }
    ];
    
    const links = [
      { from: agents[0].pos, to: agents[1].pos, bandwidth: 0.8, protocol: 'direct' },
      { from: agents[0].pos, to: agents[2].pos, bandwidth: 0.9, protocol: 'direct' },
      { from: agents[1].pos, to: agents[3].pos, bandwidth: 0.6, protocol: 'gossip' },
      { from: agents[2].pos, to: agents[4].pos, bandwidth: 0.7, protocol: 'broadcast' }
    ];
    
    setTopology({ agents, links });
  };

  const avgLatency = topology ? 
    topology.agents.reduce((sum, a) => sum + a.latency, 0) / topology.agents.length : 0;

  return (
    <Card className="bg-gradient-to-br from-blue-950/90 via-indigo-950/90 to-violet-950/90 backdrop-blur-xl border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Radio className="w-7 h-7 text-blue-400" />
          Communication Network Topology
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          Real-time agent network visualization with latency and protocol analysis
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={viewMode} onValueChange={setViewMode} className="mb-4">
          <TabsList className="grid w-full grid-cols-3 bg-black/60">
            <TabsTrigger value="topology">Topology</TabsTrigger>
            <TabsTrigger value="latency">Latency Map</TabsTrigger>
            <TabsTrigger value="protocols">Protocols</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="h-[450px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-blue-500/20">
          <Canvas camera={{ position: [0, 0, 7], fov: 60 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.9} color="#3b82f6" />

            {topology?.agents.map((agent) => (
              <NetworkAgent
                key={agent.id}
                position={agent.pos}
                agentId={agent.id}
                activeConnections={agent.connections}
                latency={agent.latency}
              />
            ))}

            {topology?.links.map((link, idx) => (
              <DataFlowLink
                key={idx}
                from={link.from}
                to={link.to}
                bandwidth={link.bandwidth}
                protocol={link.protocol}
              />
            ))}

            <OrbitControls enableZoom enablePan />
          </Canvas>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-black/60 rounded-lg p-3 border border-blue-500/30">
            <div className="text-blue-400 text-xs mb-1">Agents</div>
            <div className="text-white text-xl font-bold">{topology?.agents.length || 0}</div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-purple-500/30">
            <div className="text-purple-400 text-xs mb-1">Links</div>
            <div className="text-white text-xl font-bold">{topology?.links.length || 0}</div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-green-500/30">
            <div className="text-green-400 text-xs mb-1">Avg Latency</div>
            <div className="text-white text-xl font-bold">{avgLatency.toFixed(0)}ms</div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-amber-500/30">
            <div className="text-amber-400 text-xs mb-1">Throughput</div>
            <div className="text-white text-xl font-bold">
              {topology ? '1.2GB/s' : '0'}
            </div>
          </div>
        </div>

        <Button
          onClick={startSimulation}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Activity className="w-4 h-4 mr-2" />
          {isSimulating ? 'Simulation Active' : 'Start Network Simulation'}
        </Button>
      </CardContent>
    </Card>
  );
}