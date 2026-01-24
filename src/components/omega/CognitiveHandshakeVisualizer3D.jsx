import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Torus } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Users, Brain, Cpu, Handshake } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const HumanNode = ({ position, intentStrength }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(0.8 + intentStrength * 0.4);
      meshRef.current.material.emissiveIntensity = 0.6 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
    }
  });
  
  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.5, 32, 32]}>
        <meshStandardMaterial
          color="#ec4899"
          emissive="#ec4899"
          emissiveIntensity={0.8}
        />
      </Sphere>
      <Text position={[0, 0.8, 0]} fontSize={0.15} color="#ec4899" anchorX="center">
        Human Intent
      </Text>
    </group>
  );
};

const AINode = ({ position, executionStrength }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime;
      meshRef.current.scale.setScalar(0.8 + executionStrength * 0.4);
      meshRef.current.material.emissiveIntensity = 0.6 + Math.sin(state.clock.elapsedTime * 2 + Math.PI) * 0.3;
    }
  });
  
  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.5, 32, 32]}>
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={0.8}
        />
      </Sphere>
      <Text position={[0, 0.8, 0]} fontSize={0.15} color="#3b82f6" anchorX="center">
        AI Execution
      </Text>
    </group>
  );
};

const HandshakeBeam = ({ active, alignment }) => {
  const lineRef = useRef();
  const particlesRef = useRef([]);
  
  useFrame((state) => {
    if (lineRef.current && active) {
      lineRef.current.material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
    }
    
    particlesRef.current.forEach((particle, idx) => {
      if (particle && active) {
        const t = (state.clock.elapsedTime * 0.5 + idx * 0.2) % 1;
        particle.position.x = -2 + t * 4;
        particle.position.y = Math.sin(t * Math.PI) * 0.3;
      }
    });
  });
  
  return (
    <group>
      <Line
        ref={lineRef}
        points={[new THREE.Vector3(-2, 0, 0), new THREE.Vector3(2, 0, 0)]}
        color={alignment > 0.7 ? '#10b981' : alignment > 0.4 ? '#f59e0b' : '#ef4444'}
        lineWidth={3 + alignment * 2}
        transparent
        opacity={0.6}
      />
      
      {active && Array(8).fill(0).map((_, idx) => (
        <Sphere
          key={idx}
          ref={(el) => (particlesRef.current[idx] = el)}
          args={[0.08, 16, 16]}
          position={[-2, 0, 0]}
        >
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={1.5}
          />
        </Sphere>
      ))}
      
      {/* Handshake ring at center */}
      {active && alignment > 0.6 && (
        <Torus args={[0.3, 0.05, 16, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={1.2}
          />
        </Torus>
      )}
    </group>
  );
};

export default function CognitiveHandshakeVisualizer3D() {
  const [humanIntent, setHumanIntent] = useState(0.5);
  const [aiExecution, setAiExecution] = useState(0.5);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [alignment, setAlignment] = useState(0);
  const [sharedObjectives, setSharedObjectives] = useState([]);

  const initiateHandshake = async () => {
    setIsCollaborating(true);
    
    // Calculate alignment based on intent-execution match
    const alignmentScore = 1 - Math.abs(humanIntent - aiExecution);
    setAlignment(alignmentScore);
    
    // Generate shared objectives
    const objectives = [
      { type: 'neural_alignment', human: humanIntent * 100, ai: aiExecution * 100, synergy: alignmentScore },
      { type: 'market_strategy', human: Math.random() * 100, ai: Math.random() * 100, synergy: Math.random() },
      { type: 'autonomous_control', human: Math.random() * 100, ai: Math.random() * 100, synergy: Math.random() }
    ];
    
    setSharedObjectives(objectives);
  };

  return (
    <Card className="bg-gradient-to-br from-purple-950/90 via-pink-950/90 to-fuchsia-950/90 backdrop-blur-xl border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Handshake className="w-7 h-7 text-purple-400" />
          Cognitive Handshake Interface
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          Seamless human-AI collaboration with shared intentionality
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-purple-500/20">
          <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.8} color="#ec4899" />
            <pointLight position={[-10, -10, -10]} intensity={0.6} color="#8b5cf6" />

            <HumanNode position={[-2, 0, 0]} intentStrength={humanIntent} />
            <AINode position={[2, 0, 0]} executionStrength={aiExecution} />
            <HandshakeBeam active={isCollaborating} alignment={alignment} />

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-white text-sm mb-2 block">
              Human Intent Strength: {(humanIntent * 100).toFixed(0)}%
            </label>
            <Slider
              value={[humanIntent]}
              onValueChange={(val) => setHumanIntent(val[0])}
              min={0}
              max={1}
              step={0.05}
            />
          </div>

          <div>
            <label className="text-white text-sm mb-2 block">
              AI Execution Capacity: {(aiExecution * 100).toFixed(0)}%
            </label>
            <Slider
              value={[aiExecution]}
              onValueChange={(val) => setAiExecution(val[0])}
              min={0}
              max={1}
              step={0.05}
            />
          </div>
        </div>

        {isCollaborating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="bg-black/60 rounded-lg p-4 border border-green-500/30 mb-3">
              <div className="text-green-400 text-sm font-bold mb-2">Collaboration Alignment</div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-800 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${alignment * 100}%` }}
                    className="h-full bg-gradient-to-r from-purple-600 to-green-500"
                  />
                </div>
                <span className="text-white font-mono text-sm">{(alignment * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div className="bg-black/60 rounded-lg p-4 border border-purple-500/30">
              <div className="text-purple-400 text-sm font-bold mb-3">Shared Objectives</div>
              <div className="space-y-2">
                {sharedObjectives.map((obj, idx) => (
                  <div key={idx} className="bg-black/40 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white text-xs capitalize">{obj.type.replace(/_/g, ' ')}</span>
                      <Badge className={obj.synergy > 0.7 ? 'bg-green-600' : 'bg-amber-600'}>
                        {(obj.synergy * 100).toFixed(0)}% synergy
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-pink-400">Human: </span>
                        <span className="text-white">{obj.human.toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className="text-blue-400">AI: </span>
                        <span className="text-white">{obj.ai.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <Button
          onClick={initiateHandshake}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          <Handshake className="w-4 h-4 mr-2" />
          {isCollaborating ? 'Collaboration Active' : 'Initiate Cognitive Handshake'}
        </Button>
      </CardContent>
    </Card>
  );
}