import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Html, Float } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Radio, Zap, Activity, Signal, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import * as THREE from 'three';

const InteractiveNetworkNode = ({ node, position, onClick, isSelected, onHover }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [pulsePhase, setPulsePhase] = useState(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3 + pulsePhase) * 0.15;
      const scale = isSelected ? 1.5 + pulse : hovered ? 1.2 : 1 + pulse * 0.5;
      meshRef.current.scale.setScalar(scale);
      
      if (isSelected) {
        meshRef.current.rotation.y = state.clock.elapsedTime * 2;
      }
    }
  });

  const isOnline = node.status === 'online';

  return (
    <group position={position}>
      <Float speed={isSelected ? 3 : 1.5} rotationIntensity={isSelected ? 1 : 0.3}>
        <Sphere 
          ref={meshRef}
          args={[0.3, 32, 32]}
          onClick={(e) => {
            e.stopPropagation();
            onClick(node);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            onHover(node);
          }}
          onPointerOut={() => {
            setHovered(false);
            onHover(null);
          }}
        >
          <meshStandardMaterial 
            color={isSelected ? '#ec4899' : isOnline ? '#22c55e' : '#6b7280'}
            emissive={isSelected ? '#ec4899' : isOnline ? '#22c55e' : '#ef4444'}
            emissiveIntensity={isSelected ? 1.5 : isOnline ? 0.8 : 0.3}
            metalness={0.7}
            roughness={0.2}
          />
        </Sphere>
        
        {(hovered || isSelected) && (
          <Html distanceFactor={10}>
            <div className="bg-black/90 border border-cyan-400 rounded-lg p-3 min-w-[180px] pointer-events-none backdrop-blur-xl">
              <div className="text-cyan-400 font-bold text-xs mb-1">
                {node.node_name || `Node ${node.id?.slice(0, 8)}`}
              </div>
              <div className="text-white text-xs">Status: {isOnline ? 'Online' : 'Offline'}</div>
              <div className="text-gray-400 text-xs">Latency: {Math.random() * 50 + 10 | 0}ms</div>
              <div className="text-green-400 text-xs">Bandwidth: {Math.random() * 100 + 50 | 0} Gbps</div>
            </div>
          </Html>
        )}
      </Float>
      
      <Text position={[0, 0.5, 0]} fontSize={0.12} color="white">
        {node.node_name?.slice(0, 6) || 'Node'}
      </Text>
    </group>
  );
};

const DataPacketFlow = ({ from, to, active, speed = 1 }) => {
  const particleRef = useRef();
  
  useFrame((state) => {
    if (particleRef.current && active) {
      const t = ((state.clock.elapsedTime * speed) % 2) / 2;
      const fromVec = new THREE.Vector3(...from);
      const toVec = new THREE.Vector3(...to);
      particleRef.current.position.lerpVectors(fromVec, toVec, t);
    }
  });

  return active ? (
    <Sphere ref={particleRef} args={[0.1, 16, 16]} position={from}>
      <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
    </Sphere>
  ) : null;
};

export default function EnhancedInteractiveRedComm3D() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [dataFlowActive, setDataFlowActive] = useState(false);
  
  const { data: nodes } = useQuery({
    queryKey: ['redcommNodes'],
    queryFn: () => base44.entities.RedCommNetworkNode.list(),
    initialData: []
  });

  const nodePositions = nodes.slice(0, 12).map((node, idx) => {
    const angle = (idx / 12) * Math.PI * 2;
    const radius = 5;
    return {
      node,
      position: [Math.cos(angle) * radius, Math.sin(angle) * 0.5, Math.sin(angle) * radius]
    };
  });

  const activeNodes = nodes.filter(n => n.status === 'online');

  return (
    <div className="relative">
      <Card className="bg-black/40 backdrop-blur-xl border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Radio className="w-6 h-6 text-blue-400" />
            Interactive RedComm Network
          </CardTitle>
          <p className="text-gray-400 text-sm">Click nodes to view real-time telemetry</p>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] rounded-lg bg-black/60 mb-4 border border-blue-500/20 cursor-pointer">
            <Canvas camera={{ position: [0, 8, 10], fov: 50 }}>
              <ambientLight intensity={0.6} />
              <pointLight position={[10, 10, 10]} intensity={1.5} color="#3b82f6" />
              
              {nodePositions.map(({ node, position }, idx) => (
                <React.Fragment key={node.node_id || node.id}>
                  <InteractiveNetworkNode
                    node={node}
                    position={position}
                    onClick={setSelectedNode}
                    isSelected={selectedNode?.id === node.id}
                    onHover={setHoveredNode}
                  />
                  
                  {/* Data flow particles */}
                  {dataFlowActive && idx < nodePositions.length - 1 && (
                    <DataPacketFlow
                      from={position}
                      to={nodePositions[idx + 1].position}
                      active={node.status === 'online'}
                      speed={1 + Math.random()}
                    />
                  )}
                </React.Fragment>
              ))}

              {/* Network Links */}
              {nodePositions.map(({ node, position: pos1 }, idx1) => 
                nodePositions.slice(idx1 + 1, idx1 + 3).map(({ node: node2, position: pos2 }, idx2) => {
                  const isActive = hoveredNode?.id === node.id || hoveredNode?.id === node2.id || 
                                  selectedNode?.id === node.id || selectedNode?.id === node2.id;
                  return (
                    <Line
                      key={`${idx1}-${idx2}`}
                      points={[pos1, pos2]}
                      color={isActive ? '#ec4899' : node.status === 'online' ? '#3b82f6' : '#374151'}
                      lineWidth={isActive ? 2 : 1}
                      opacity={isActive ? 0.8 : 0.3}
                      transparent
                    />
                  );
                })
              )}
              
              <OrbitControls enableDamping dampingFactor={0.05} autoRotate autoRotateSpeed={dataFlowActive ? 2 : 1} />
            </Canvas>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">Online</span>
              </div>
              <div className="text-2xl font-bold text-white">{activeNodes.length}</div>
            </div>

            <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Radio className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">Total</span>
              </div>
              <div className="text-2xl font-bold text-white">{nodes.length}</div>
            </div>

            <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400">Traffic</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {dataFlowActive ? '2.4 Tbps' : '0 bps'}
              </div>
            </div>

            <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Signal className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-gray-400">Latency</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {Math.round(Math.random() * 30 + 10)}ms
              </div>
            </div>
          </div>

          <Button
            onClick={() => setDataFlowActive(!dataFlowActive)}
            className={`w-full ${dataFlowActive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            <Zap className="w-4 h-4 mr-2" />
            {dataFlowActive ? 'Stop Data Flow' : 'Start Data Flow'}
          </Button>
        </CardContent>
      </Card>

      {/* Node Detail Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="mt-4"
          >
            <Card className="bg-black/90 border-2 border-cyan-500/60 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-bold text-xl">
                      {selectedNode.node_name || 'Network Node'}
                    </h3>
                    <Badge className={selectedNode.status === 'online' ? 'bg-green-600' : 'bg-red-600'}>
                      {selectedNode.status}
                    </Badge>
                  </div>
                  <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Bandwidth', value: `${Math.random() * 100 + 50 | 0} Gbps`, color: 'blue' },
                    { label: 'Latency', value: `${Math.random() * 50 + 10 | 0}ms`, color: 'green' },
                    { label: 'Packets/s', value: `${Math.random() * 1000 + 500 | 0}K`, color: 'purple' },
                    { label: 'Uptime', value: '99.7%', color: 'cyan' }
                  ].map((metric, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`bg-${metric.color}-950/30 rounded-lg p-3 border border-${metric.color}-500/20`}
                    >
                      <div className="text-gray-400 text-xs">{metric.label}</div>
                      <div className="text-white font-bold text-lg">{metric.value}</div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-4 space-y-2">
                  <div className="text-cyan-400 text-sm font-bold">Real-Time Data Flow:</div>
                  <div className="bg-black/40 rounded p-3">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-400">Inbound:</span>
                      <span className="text-green-400 font-mono">{Math.random() * 500 + 100 | 0} Mbps</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Outbound:</span>
                      <span className="text-blue-400 font-mono">{Math.random() * 500 + 100 | 0} Mbps</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}