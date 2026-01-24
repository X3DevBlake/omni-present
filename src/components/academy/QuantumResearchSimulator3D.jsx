import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Torus, Line, Text } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Atom, Play, Pause, RotateCcw } from 'lucide-react';
import * as THREE from 'three';

const QuantumState = ({ position, amplitude, phase, isEntangled }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + phase) * amplitude * 0.3;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.5, 32, 32]}>
        <meshStandardMaterial
          color={isEntangled ? '#8b5cf6' : '#3b82f6'}
          emissive={isEntangled ? '#8b5cf6' : '#3b82f6'}
          emissiveIntensity={amplitude}
          transparent
          opacity={0.8}
        />
      </Sphere>
      <Torus args={[0.8, 0.05, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          color="#10b981"
          transparent
          opacity={0.3}
        />
      </Torus>
    </group>
  );
};

export default function QuantumResearchSimulator3D() {
  const [isRunning, setIsRunning] = useState(false);
  const [coherence, setCoherence] = useState(0.7);
  const [entanglementStrength, setEntanglementStrength] = useState(0.5);

  const quantumStates = [
    { position: [-3, 0, 0], amplitude: coherence, phase: 0, entangled: true },
    { position: [3, 0, 0], amplitude: coherence, phase: Math.PI, entangled: true },
    { position: [0, 3, 0], amplitude: coherence * 0.7, phase: Math.PI / 2, entangled: false }
  ];

  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Atom className="w-6 h-6 text-purple-400" />
          Quantum Research Simulator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-black/40 rounded-lg h-96 mb-4">
          <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            {quantumStates.map((state, idx) => (
              <QuantumState
                key={idx}
                position={state.position}
                amplitude={state.amplitude}
                phase={state.phase}
                isEntangled={state.entangled}
              />
            ))}

            {/* Entanglement connections */}
            {entanglementStrength > 0.3 && (
              <>
                <Line
                  points={[
                    new THREE.Vector3(...quantumStates[0].position),
                    new THREE.Vector3(...quantumStates[1].position)
                  ]}
                  color="#8b5cf6"
                  lineWidth={2}
                  transparent
                  opacity={entanglementStrength}
                />
              </>
            )}

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Quantum Coherence</span>
              <Badge className="bg-blue-500">{(coherence * 100).toFixed(0)}%</Badge>
            </div>
            <Slider
              value={[coherence * 100]}
              onValueChange={(val) => setCoherence(val[0] / 100)}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Entanglement Strength</span>
              <Badge className="bg-purple-500">{(entanglementStrength * 100).toFixed(0)}%</Badge>
            </div>
            <Slider
              value={[entanglementStrength * 100]}
              onValueChange={(val) => setEntanglementStrength(val[0] / 100)}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setIsRunning(!isRunning)}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isRunning ? 'Pause' : 'Run'} Simulation
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCoherence(0.7);
                setEntanglementStrength(0.5);
              }}
              className="border-white/20 text-white"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}