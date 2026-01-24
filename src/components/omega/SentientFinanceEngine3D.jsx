import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Html } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { DollarSign, TrendingUp, Zap, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const WealthNode = ({ position, value, type }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1;
      meshRef.current.scale.setScalar(0.5 + (value / 100000) + pulse);
    }
  });
  
  const typeColors = {
    trading: '#10b981',
    grid: '#8b5cf6',
    project: '#f59e0b',
    autonomous: '#3b82f6'
  };
  
  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial
          color={typeColors[type]}
          emissive={typeColors[type]}
          emissiveIntensity={0.8}
        />
      </Sphere>
      <Text position={[0, 0.5, 0]} fontSize={0.12} color="white" anchorX="center">
        ${(value / 1000).toFixed(0)}K
      </Text>
    </group>
  );
};

const ValueFlow = ({ from, to, amount }) => {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
    }
  });
  
  return (
    <Line
      ref={lineRef}
      points={[new THREE.Vector3(...from), new THREE.Vector3(...to)]}
      color="#fbbf24"
      lineWidth={2 + (amount / 50000)}
      transparent
      opacity={0.7}
    />
  );
};

export default function SentientFinanceEngine3D() {
  const [activeInference, setActiveInference] = useState(false);
  const [capitalManaged, setCapitalManaged] = useState(0);
  const [revenueStreams, setRevenueStreams] = useState([]);

  const activateInference = () => {
    setActiveInference(true);
    
    // Simulate wealth generation
    const streams = [
      { type: 'trading', name: 'Algorithmic Trading', value: 45000, growth: 15 },
      { type: 'grid', name: 'GRID Emissions', value: 32000, growth: 25 },
      { type: 'project', name: 'Project Financing', value: 78000, growth: 8 },
      { type: 'autonomous', name: 'Autonomous Networks', value: 56000, growth: 18 }
    ];
    
    setRevenueStreams(streams);
    setCapitalManaged(streams.reduce((sum, s) => sum + s.value, 0));
  };

  const wealthNodes = [
    { position: [-2, 1, 0], value: 45000, type: 'trading' },
    { position: [2, 1, 0], value: 32000, type: 'grid' },
    { position: [-2, -1, 0], value: 78000, type: 'project' },
    { position: [2, -1, 0], value: 56000, type: 'autonomous' }
  ];

  return (
    <Card className="bg-gradient-to-br from-emerald-950/90 via-green-950/90 to-teal-950/90 backdrop-blur-xl border-emerald-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <DollarSign className="w-7 h-7 text-emerald-400" />
          Sentient Financial Infrastructure
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          OML framework with Active Inference for unlimited capital generation
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-emerald-500/20">
          <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.8} color="#10b981" />

            {/* Central OML core */}
            <group position={[0, 0, 0]}>
              <Sphere args={[0.4, 32, 32]}>
                <meshStandardMaterial
                  color="#fbbf24"
                  emissive="#fbbf24"
                  emissiveIntensity={activeInference ? 1.2 : 0.5}
                />
              </Sphere>
              <Text position={[0, 0.7, 0]} fontSize={0.15} color="#fbbf24" anchorX="center">
                OML Core
              </Text>
            </group>

            {/* Wealth generation nodes */}
            {activeInference && wealthNodes.map((node, idx) => (
              <React.Fragment key={idx}>
                <WealthNode
                  position={node.position}
                  value={node.value}
                  type={node.type}
                />
                <ValueFlow
                  from={[0, 0, 0]}
                  to={node.position}
                  amount={node.value}
                />
              </React.Fragment>
            ))}

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-black/60 rounded-lg p-3 border border-emerald-500/30">
            <div className="text-emerald-400 text-xs mb-1">Total Capital</div>
            <div className="text-white text-xl font-bold">
              ${(capitalManaged / 1000).toFixed(0)}K
            </div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-purple-500/30">
            <div className="text-purple-400 text-xs mb-1">Revenue Streams</div>
            <div className="text-white text-xl font-bold">{revenueStreams.length}</div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-blue-500/30">
            <div className="text-blue-400 text-xs mb-1">Growth Rate</div>
            <div className="text-white text-xl font-bold">
              {activeInference ? '16.5%' : '0%'}
            </div>
          </div>
        </div>

        {activeInference && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 mb-4"
          >
            <div className="bg-black/60 rounded-lg p-4 border border-green-500/30">
              <div className="text-green-400 text-sm font-bold mb-3">Active Revenue Streams</div>
              <div className="space-y-2">
                {revenueStreams.map((stream, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-${stream.type === 'trading' ? 'green' : stream.type === 'grid' ? 'purple' : stream.type === 'project' ? 'amber' : 'blue'}-500`} />
                      <span className="text-gray-300 text-xs">{stream.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-mono">${(stream.value / 1000).toFixed(0)}K</span>
                      <Badge className="bg-green-600/50 text-[10px] h-4">+{stream.growth}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black/60 rounded-lg p-4 border border-purple-500/30">
              <div className="text-purple-400 text-sm font-bold mb-2">OML Framework Status</div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-gray-300">Open</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-gray-300">Monetizable</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-3 h-3 text-green-500" />
                  <span className="text-gray-300">Loyal</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <Button
          onClick={activateInference}
          disabled={activeInference}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          {activeInference ? 'Active Inference Running' : 'Activate Financial Agent'}
        </Button>
      </CardContent>
    </Card>
  );
}