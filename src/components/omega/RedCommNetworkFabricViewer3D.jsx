import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Html } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { Radio, Satellite, Waves } from 'lucide-react';
import { motion } from 'framer-motion';

const NetworkNode = ({ position, node, onClick }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });
  
  const nodeColors = {
    tactical_edge: '#3b82f6',
    sovereign_pod: '#8b5cf6',
    deepblue_underwater: '#06b6d4',
    deepsky_satellite: '#f59e0b',
    nexus_singapore: '#10b981'
  };
  
  const color = nodeColors[node.type] || '#6b7280';
  
  return (
    <group position={position} onClick={onClick}>
      <Sphere ref={meshRef} args={[0.2, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={node.status === 'online' ? 0.8 : 0.2}
        />
      </Sphere>
      <Text position={[0, 0.4, 0]} fontSize={0.15} color="white" anchorX="center">
        {node.name}
      </Text>
      {node.status === 'online' && (
        <Sphere args={[0.35, 16, 16]}>
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.1}
            wireframe
          />
        </Sphere>
      )}
    </group>
  );
};

const THzLink = ({ from, to, bandwidth, latency }) => {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });
  
  const points = [
    new THREE.Vector3(...from),
    new THREE.Vector3(...to)
  ];
  
  const quality = bandwidth / 100; // Normalize
  const color = latency < 50 ? '#10b981' : latency < 100 ? '#f59e0b' : '#ef4444';
  
  return (
    <Line
      ref={lineRef}
      points={points}
      color={color}
      lineWidth={2 + quality * 2}
      transparent
      opacity={0.6}
    />
  );
};

const DataPacket = ({ path, speed }) => {
  const meshRef = useRef();
  const [progress, setProgress] = useState(0);
  
  useFrame(() => {
    if (meshRef.current) {
      setProgress(p => (p + speed) % 1);
      
      const start = new THREE.Vector3(...path.from);
      const end = new THREE.Vector3(...path.to);
      meshRef.current.position.lerpVectors(start, end, progress);
    }
  });
  
  return (
    <Sphere ref={meshRef} args={[0.05, 16, 16]}>
      <meshStandardMaterial
        color="#fbbf24"
        emissive="#fbbf24"
        emissiveIntensity={1.5}
      />
    </Sphere>
  );
};

export default function RedCommNetworkFabricViewer3D() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [showDataFlow, setShowDataFlow] = useState(false);

  // Mock network topology
  const nodes = [
    { id: 'node_1', name: 'Edge-LA', type: 'tactical_edge', position: [-3, 0, 0], status: 'online' },
    { id: 'node_2', name: 'Pod-AZ', type: 'sovereign_pod', position: [0, 2, 0], status: 'online' },
    { id: 'node_3', name: 'DeepBlue-1', type: 'deepblue_underwater', position: [3, -1, 0], status: 'online' },
    { id: 'node_4', name: 'Starshield-42', type: 'deepsky_satellite', position: [0, 4, 2], status: 'online' },
    { id: 'node_5', name: 'Nexus-SG', type: 'nexus_singapore', position: [2, 0, -2], status: 'syncing' },
    { id: 'node_6', name: 'Edge-NYC', type: 'tactical_edge', position: [-2, -1, 2], status: 'online' }
  ];

  const links = [
    { from: nodes[0].position, to: nodes[1].position, bandwidth: 100, latency: 15 },
    { from: nodes[1].position, to: nodes[2].position, bandwidth: 120, latency: 10 },
    { from: nodes[1].position, to: nodes[3].position, bandwidth: 80, latency: 45 },
    { from: nodes[3].position, to: nodes[4].position, bandwidth: 90, latency: 30 },
    { from: nodes[4].position, to: nodes[2].position, bandwidth: 110, latency: 20 },
    { from: nodes[0].position, to: nodes[5].position, bandwidth: 95, latency: 25 }
  ];

  const dataPackets = showDataFlow ? [
    { from: nodes[0].position, to: nodes[1].position, speed: 0.02 },
    { from: nodes[1].position, to: nodes[3].position, speed: 0.015 },
    { from: nodes[4].position, to: nodes[2].position, speed: 0.025 }
  ] : [];

  return (
    <Card className="bg-gradient-to-br from-cyan-950/90 via-blue-950/90 to-indigo-950/90 backdrop-blur-xl border-cyan-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Radio className="w-7 h-7 text-cyan-400" />
          RedComm XG Network Fabric
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          6G THz backhaul with SCION path-aware routing
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[550px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-cyan-500/20">
          <Canvas camera={{ position: [6, 6, 6], fov: 60 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.8} color="#06b6d4" />

            {/* Network nodes */}
            {nodes.map((node) => (
              <NetworkNode
                key={node.id}
                position={node.position}
                node={node}
                onClick={() => setSelectedNode(node)}
              />
            ))}

            {/* THz links */}
            {links.map((link, idx) => (
              <THzLink
                key={`link_${idx}`}
                from={link.from}
                to={link.to}
                bandwidth={link.bandwidth}
                latency={link.latency}
              />
            ))}

            {/* Data packets */}
            {dataPackets.map((packet, idx) => (
              <DataPacket
                key={`packet_${idx}`}
                path={packet}
                speed={packet.speed}
              />
            ))}

            {/* SCION ISD boundary */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
              <torusGeometry args={[4, 0.02, 16, 64]} />
              <meshStandardMaterial
                color="#8b5cf6"
                emissive="#8b5cf6"
                emissiveIntensity={0.5}
                transparent
                opacity={0.3}
              />
            </mesh>

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-black/60 rounded-lg p-3 border border-cyan-500/30">
            <div className="text-cyan-400 text-xs mb-1">Active Nodes</div>
            <div className="text-white text-2xl font-bold">
              {nodes.filter(n => n.status === 'online').length}
            </div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-green-500/30">
            <div className="text-green-400 text-xs mb-1">Avg Bandwidth</div>
            <div className="text-white text-2xl font-bold">
              {Math.round(links.reduce((sum, l) => sum + l.bandwidth, 0) / links.length)} Gbps
            </div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-amber-500/30">
            <div className="text-amber-400 text-xs mb-1">Avg Latency</div>
            <div className="text-white text-2xl font-bold">
              {Math.round(links.reduce((sum, l) => sum + l.latency, 0) / links.length)}ms
            </div>
          </div>
        </div>

        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/60 rounded-lg p-4 border border-cyan-500/30 mb-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-cyan-400 font-bold">{selectedNode.name}</div>
              <Badge className="bg-green-600">{selectedNode.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-gray-400">Type:</div>
                <div className="text-white">{selectedNode.type}</div>
              </div>
              <div>
                <div className="text-gray-400">Protocol:</div>
                <div className="text-white">SCION</div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={() => setShowDataFlow(!showDataFlow)}
            className="flex-1 bg-cyan-600 hover:bg-cyan-700"
          >
            <Waves className="w-4 h-4 mr-2" />
            {showDataFlow ? 'Hide' : 'Show'} Data Flow
          </Button>
          
          <Button
            variant="outline"
            className="border-cyan-500/50 text-cyan-300"
          >
            <Satellite className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}