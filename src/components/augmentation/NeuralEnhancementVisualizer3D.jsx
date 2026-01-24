import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Cpu, Zap, Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

function NeuralNode({ position, active, intensity }) {
  const [pulse, setPulse] = useState(1);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setPulse(p => (p === 1 ? 1 + intensity : 1));
    }, 800);
    return () => clearInterval(interval);
  }, [active, intensity]);

  return (
    <Sphere args={[0.15 * pulse, 32, 32]} position={position}>
      <meshStandardMaterial 
        color={active ? '#8b5cf6' : '#374151'}
        emissive={active ? '#8b5cf6' : '#000'}
        emissiveIntensity={active ? intensity : 0}
      />
    </Sphere>
  );
}

function SynapticConnection({ from, to, strength, active }) {
  return (
    <Line
      points={[from, to]}
      color={active ? '#a78bfa' : '#4b5563'}
      lineWidth={strength * 2}
      opacity={active ? 0.6 : 0.2}
    />
  );
}

export default function NeuralEnhancementVisualizer3D() {
  const { data: pathways } = useQuery({
    queryKey: ['neuralPathways'],
    queryFn: () => base44.entities.NeuralPathwayMap.list(),
    initialData: []
  });

  const { data: augmentations } = useQuery({
    queryKey: ['augmentations'],
    queryFn: () => base44.entities.PhysicalBodyAugmentation.list(),
    initialData: []
  });

  // Create neural network topology
  const layers = 5;
  const nodesPerLayer = 6;
  const neuralNodes = [];

  for (let layer = 0; layer < layers; layer++) {
    for (let node = 0; node < nodesPerLayer; node++) {
      const angle = (node / nodesPerLayer) * Math.PI * 2;
      const radius = 2;
      neuralNodes.push({
        position: [
          Math.cos(angle) * radius,
          (layer - 2) * 1.5,
          Math.sin(angle) * radius
        ],
        active: Math.random() > 0.3,
        intensity: 0.3 + Math.random() * 0.5
      });
    }
  }

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Brain className="w-6 h-6 text-purple-400" />
          Neural Enhancement Network
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] rounded-lg bg-black/60 mb-4">
          <Canvas camera={{ position: [6, 4, 6], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            
            {/* Neural Nodes */}
            {neuralNodes.map((node, idx) => (
              <NeuralNode
                key={idx}
                position={node.position}
                active={node.active}
                intensity={node.intensity}
              />
            ))}

            {/* Synaptic Connections */}
            {neuralNodes.map((node1, idx1) => 
              neuralNodes.slice(idx1 + 1, idx1 + 4).map((node2, idx2) => (
                <SynapticConnection
                  key={`${idx1}-${idx2}`}
                  from={node1.position}
                  to={node2.position}
                  strength={0.5 + Math.random() * 0.5}
                  active={node1.active && node2.active}
                />
              ))
            )}
            
            <OrbitControls enableDamping dampingFactor={0.05} autoRotate autoRotateSpeed={0.5} />
          </Canvas>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Pathways</span>
            </div>
            <div className="text-2xl font-bold text-white">{pathways.length}</div>
          </div>

          <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-gray-400">Active</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {neuralNodes.filter(n => n.active).length}
            </div>
          </div>

          <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Enhancements</span>
            </div>
            <div className="text-2xl font-bold text-white">{augmentations.length}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}