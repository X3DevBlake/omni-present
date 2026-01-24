import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Text, Html } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { Shuffle, TrendingUp } from 'lucide-react';

const Robot = ({ position, inSimulation, randomization }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      if (inSimulation) {
        const wobble = randomization * 0.3 * Math.sin(state.clock.elapsedTime * 4);
        meshRef.current.position.x = position[0] + wobble;
      }
    }
  });

  return (
    <group position={position}>
      <Box ref={meshRef} args={[0.5, 0.8, 0.5]}>
        <meshStandardMaterial
          color={inSimulation ? '#3b82f6' : '#10b981'}
          emissive={inSimulation ? '#3b82f6' : '#10b981'}
          emissiveIntensity={0.5}
          wireframe={inSimulation}
        />
      </Box>
      <Sphere args={[0.15, 16, 16]} position={[0, 0.6, 0]}>
        <meshStandardMaterial
          color={inSimulation ? '#60a5fa' : '#34d399'}
        />
      </Sphere>
      <Text position={[0, -0.8, 0]} fontSize={0.2} color="white" anchorX="center">
        {inSimulation ? 'Sim' : 'Real'}
      </Text>
    </group>
  );
};

const DomainParameter = ({ position, param, value }) => {
  return (
    <group position={position}>
      <Box args={[1.5, 0.3, 0.3]}>
        <meshStandardMaterial color="#8b5cf6" />
      </Box>
      <Box args={[value * 1.5, 0.3, 0.3]} position={[-(1.5 - value * 1.5) / 2, 0, 0]}>
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.5} />
      </Box>
      <Text position={[0, 0.4, 0]} fontSize={0.15} color="white" anchorX="center">
        {param}
      </Text>
    </group>
  );
};

export default function Sim2RealVisualizer3D() {
  const [randomization, setRandomization] = useState(0.5);
  const [transferQuality, setTransferQuality] = useState(0.3);

  const handleTrain = () => {
    const quality = 0.3 + randomization * 0.7;
    setTransferQuality(quality);
  };

  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          Sim2Real Transfer: Domain Randomization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] bg-black rounded-lg overflow-hidden mb-4">
          <Canvas camera={{ position: [0, 2, 10], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />

            {/* Simulation environment */}
            <Robot position={[-4, 0, 0]} inSimulation={true} randomization={randomization} />
            
            {/* Real world environment */}
            <Robot position={[4, 0, 0]} inSimulation={false} randomization={0} />

            {/* Domain parameters visualization */}
            <DomainParameter position={[-4, -2, 0]} param="Mass" value={randomization} />
            <DomainParameter position={[-4, -2.8, 0]} param="Friction" value={randomization * 0.8} />
            <DomainParameter position={[-4, -3.6, 0]} param="Laser" value={randomization * 1.2} />

            {/* Transfer arrow */}
            <Cone args={[0.3, 1.5, 32]} position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <meshStandardMaterial
                color="#fbbf24"
                emissive="#f59e0b"
                emissiveIntensity={transferQuality}
              />
            </Cone>
            <Text position={[0, 1, 0]} fontSize={0.25} color="white" anchorX="center">
              Transfer
            </Text>

            {/* Quality indicator */}
            {transferQuality > 0.3 && (
              <Html position={[0, -1, 0]} center>
                <Badge className="bg-green-500">
                  Quality: {(transferQuality * 100).toFixed(0)}%
                </Badge>
              </Html>
            )}

            <gridHelper args={[10, 10]} />
            <OrbitControls enableZoom />
          </Canvas>
        </div>

        <div className="bg-black/40 rounded-lg p-4 space-y-4">
          <div>
            <label className="text-white text-sm mb-2 block">
              Domain Randomization: {randomization.toFixed(2)}
            </label>
            <Slider
              value={[randomization]}
              onValueChange={(v) => setRandomization(v[0])}
              min={0}
              max={1}
              step={0.05}
            />
          </div>

          <Button
            onClick={handleTrain}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Train with Randomization
          </Button>

          <div className="text-xs text-gray-400 font-mono bg-black/60 rounded p-3">
            θ* = arg max E_ξ~P_sim[R(τ; ξ)]
            <br />
            <span className="text-green-400">
              Transfer Quality: {(transferQuality * 100).toFixed(0)}%
            </span>
          </div>

          <p className="text-sm text-gray-300">
            Domain Randomization trains agents across varied physics parameters (±20% variation),
            making policies robust to real-world uncertainty. Higher randomization = better transfer!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}