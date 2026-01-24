import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radio, Globe, Zap, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

function NetworkNode({ node, position, active }) {
  const [pulse, setPulse] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => (p === 1 ? 1.15 : 1));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <group position={position}>
      <Sphere args={[0.3 * pulse, 32, 32]}>
        <meshStandardMaterial 
          color={active ? '#22c55e' : '#6b7280'}
          emissive={active ? '#22c55e' : '#ef4444'}
          emissiveIntensity={active ? 0.6 : 0.3}
          metalness={0.7}
        />
      </Sphere>
      <Text position={[0, 0.5, 0]} fontSize={0.12} color="white">
        {node.node_name?.slice(0, 6)}
      </Text>
    </group>
  );
}

function DataPacket({ from, to, active }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setProgress(p => (p + 0.02) % 1);
    }, 50);
    return () => clearInterval(interval);
  }, [active]);

  const position = [
    from[0] + (to[0] - from[0]) * progress,
    from[1] + (to[1] - from[1]) * progress,
    from[2] + (to[2] - from[2]) * progress
  ];

  return active ? (
    <Sphere args={[0.1, 16, 16]} position={position}>
      <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} />
    </Sphere>
  ) : null;
}

export default function EnhancedRedCommVisualizer3D() {
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
    <Card className="bg-black/40 backdrop-blur-xl border-blue-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Radio className="w-6 h-6 text-blue-400" />
          RedComm Network Fabric
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] rounded-lg bg-black/60 mb-4">
          <Canvas camera={{ position: [0, 8, 10], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} />
            
            {/* Global Mesh */}
            {nodePositions.map(({ node, position }) => (
              <NetworkNode
                key={node.node_id || node.id}
                node={node}
                position={position}
                active={node.status === 'online'}
              />
            ))}

            {/* Network Links */}
            {nodePositions.map(({ node, position: pos1 }, idx1) => 
              nodePositions.slice(idx1 + 1).map(({ position: pos2 }, idx2) => (
                <React.Fragment key={`${idx1}-${idx2}`}>
                  <Line
                    points={[pos1, pos2]}
                    color={node.status === 'online' ? '#3b82f6' : '#374151'}
                    lineWidth={1}
                    opacity={0.3}
                  />
                  <DataPacket from={pos1} to={pos2} active={node.status === 'online'} />
                </React.Fragment>
              ))
            )}
            
            <OrbitControls enableDamping dampingFactor={0.05} autoRotate autoRotateSpeed={1} />
          </Canvas>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Online</span>
            </div>
            <div className="text-2xl font-bold text-white">{activeNodes.length}</div>
          </div>

          <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Total</span>
            </div>
            <div className="text-2xl font-bold text-white">{nodes.length}</div>
          </div>

          <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Resilience</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {nodes.length > 0 ? Math.round((activeNodes.length / nodes.length) * 100) : 0}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}