import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars } from '@react-three/drei';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Atom, Dna, Brain, Cpu, Globe } from 'lucide-react';
import QuantumResearchSimulator3D from './QuantumResearchSimulator3D';
import NeuralNetworkDesigner3D from './NeuralNetworkDesigner3D';

const EnvironmentSelector = ({ courseCategory, onSelect }) => {
  const environments = [
    { id: 'quantum', name: 'Quantum Lab', icon: Atom, color: '#8b5cf6' },
    { id: 'neural', name: 'Neural Studio', icon: Brain, color: '#3b82f6' },
    { id: 'spatial', name: 'Spatial Arena', icon: Globe, color: '#10b981' },
    { id: 'blockchain', name: 'Crypto Space', icon: Cpu, color: '#f59e0b' }
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {environments.map((env) => {
        const Icon = env.icon;
        return (
          <Button
            key={env.id}
            size="sm"
            variant="outline"
            onClick={() => onSelect(env.id)}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Icon className="w-4 h-4 mr-2" />
            {env.name}
          </Button>
        );
      })}
    </div>
  );
};

const QuantumEnvironment = () => {
  const particlesRef = useRef();

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.001;
    }
  });

  const particles = [];
  for (let i = 0; i < 200; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const radius = 10 + Math.random() * 5;
    particles.push([
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi)
    ]);
  }

  return (
    <group ref={particlesRef}>
      {particles.map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
};

const NeuralEnvironment = () => {
  return (
    <group>
      <gridHelper args={[30, 30, '#3b82f6', '#1e3a8a']} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </group>
  );
};

export default function DynamicCourseEnvironment3D({ courseCategory, moduleId }) {
  const [environment, setEnvironment] = useState('quantum');
  const [showControls, setShowControls] = useState(true);

  return (
    <div className="w-full h-screen relative bg-black">
      {/* Environment Selector */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 left-6 right-6 z-10"
      >
        <Card className="bg-black/60 backdrop-blur-xl border-white/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white mb-2">Holographic Learning Environment</h3>
              <EnvironmentSelector
                courseCategory={courseCategory}
                onSelect={setEnvironment}
              />
            </div>
            <Badge className="bg-blue-500">
              {environment} mode
            </Badge>
          </div>
        </Card>
      </motion.div>

      {/* 3D Environment */}
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />

          {environment === 'quantum' && <QuantumEnvironment />}
          {environment === 'neural' && <NeuralEnvironment />}
          {environment === 'spatial' && (
            <>
              <gridHelper args={[20, 20]} />
              <Stars radius={100} depth={50} count={3000} factor={4} />
            </>
          )}

          <OrbitControls enableZoom enablePan />
        </Suspense>
      </Canvas>

      {/* Embedded Interactive Components */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute bottom-6 right-6 w-[500px] z-10"
      >
        {environment === 'quantum' && <QuantumResearchSimulator3D />}
        {environment === 'neural' && <NeuralNetworkDesigner3D />}
      </motion.div>
    </div>
  );
}