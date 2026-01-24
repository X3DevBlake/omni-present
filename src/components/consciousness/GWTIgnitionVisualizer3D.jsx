import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { Flame, Brain } from 'lucide-react';

const ModuleAgent = ({ position, agent, isIgnited, isBroadcasting }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      if (isBroadcasting) {
        const pulse = 1.5 + Math.sin(state.clock.elapsedTime * 5) * 0.3;
        meshRef.current.scale.setScalar(pulse);
      } else if (isIgnited) {
        meshRef.current.scale.setScalar(1.2);
      } else {
        meshRef.current.scale.setScalar(0.8);
      }
    }
  });

  const color = isBroadcasting ? '#fbbf24' : isIgnited ? '#3b82f6' : '#6b7280';

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isBroadcasting ? 1 : isIgnited ? 0.7 : 0.2}
        />
      </Sphere>
      <Text position={[0, -0.5, 0]} fontSize={0.12} color="white" anchorX="center">
        {agent.name}
      </Text>
    </group>
  );
};

const BroadcastWave = ({ origin, radius }) => {
  const ringRef = useRef();

  useFrame((state) => {
    if (ringRef.current) {
      const scale = 1 + (state.clock.elapsedTime % 2);
      ringRef.current.scale.set(scale, scale, 1);
      ringRef.current.material.opacity = 1 - ((state.clock.elapsedTime % 2) / 2);
    }
  });

  return (
    <mesh ref={ringRef} position={origin} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.5, 0.6, 32]} />
      <meshBasicMaterial color="#fbbf24" transparent opacity={0.5} side={THREE.DoubleSide} />
    </mesh>
  );
};

export default function GWTIgnitionVisualizer3D() {
  const [emotionalIntensity, setEmotionalIntensity] = useState(0.7);
  const [cognitiveEffort, setCognitiveEffort] = useState(0.5);
  const [broadcastActive, setBroadcastActive] = useState(false);

  const sustainability = emotionalIntensity / cognitiveEffort;
  const isIgnited = sustainability > 1.2;

  const agents = [
    { id: 0, name: 'Vision', pos: [-3, 2, 0] },
    { id: 1, name: 'Logic', pos: [3, 2, 0] },
    { id: 2, name: 'Motor', pos: [0, 2, 0] },
    { id: 3, name: 'Memory', pos: [-3, -2, 0] },
    { id: 4, name: 'Safety', pos: [3, -2, 0] }
  ];

  const winningAgent = isIgnited ? 2 : -1;

  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400" />
          Global Workspace Theory - Ignition Mechanism
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] bg-black rounded-lg overflow-hidden mb-4">
          <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />

            {/* Global workspace (central hub) */}
            <Sphere args={[0.8, 64, 64]} position={[0, 0, 0]}>
              <meshStandardMaterial
                color="#8b5cf6"
                emissive="#8b5cf6"
                emissiveIntensity={isIgnited ? 0.9 : 0.3}
                transparent
                opacity={0.3}
              />
            </Sphere>
            <Text position={[0, 0, 0]} fontSize={0.2} color="white" anchorX="center">
              Workspace
            </Text>

            {/* Specialized modules */}
            {agents.map((agent) => (
              <React.Fragment key={agent.id}>
                <ModuleAgent
                  position={agent.pos}
                  agent={agent}
                  isIgnited={isIgnited && agent.id === winningAgent}
                  isBroadcasting={broadcastActive && agent.id === winningAgent}
                />
                {/* Connections to workspace */}
                <Line
                  points={[agent.pos, [0, 0, 0]]}
                  color={agent.id === winningAgent && isIgnited ? '#10b981' : '#4b5563'}
                  lineWidth={agent.id === winningAgent && isIgnited ? 3 : 1}
                  transparent
                  opacity={agent.id === winningAgent && isIgnited ? 0.8 : 0.2}
                />
              </React.Fragment>
            ))}

            {/* Broadcast wave */}
            {broadcastActive && <BroadcastWave origin={[0, 0, 0]} radius={3} />}

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        <div className="bg-black/40 rounded-lg p-4 space-y-4">
          <div>
            <label className="text-white text-sm mb-2 block">
              Emotional Intensity (E): {emotionalIntensity.toFixed(2)}
            </label>
            <Slider
              value={[emotionalIntensity]}
              onValueChange={(v) => setEmotionalIntensity(v[0])}
              min={0}
              max={1}
              step={0.05}
            />
          </div>

          <div>
            <label className="text-white text-sm mb-2 block">
              Cognitive Effort (C): {cognitiveEffort.toFixed(2)}
            </label>
            <Slider
              value={[cognitiveEffort]}
              onValueChange={(v) => setCognitiveEffort(v[0])}
              min={0.1}
              max={1}
              step={0.05}
            />
          </div>

          <Button
            onClick={() => setBroadcastActive(!broadcastActive)}
            disabled={!isIgnited}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            <Flame className="w-4 h-4 mr-2" />
            {broadcastActive ? 'Stop Broadcast' : 'Trigger Broadcast'}
          </Button>

          <div className="text-xs text-gray-400 font-mono bg-black/60 rounded p-3">
            Sustainability = E / C = {sustainability.toFixed(2)}
            <br />
            <span className={isIgnited ? 'text-amber-400' : 'text-gray-500'}>
              Ignition Threshold: 1.2 | Status: {isIgnited ? 'IGNITED ✓' : 'Subliminal'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Badge className={`justify-center ${isIgnited ? 'bg-green-500' : 'bg-gray-600'}`}>
              {isIgnited ? 'Conscious' : 'Automated'}
            </Badge>
            <Badge className={`justify-center ${broadcastActive ? 'bg-amber-500' : 'bg-gray-600'}`}>
              {broadcastActive ? 'Broadcasting' : 'Competing'}
            </Badge>
          </div>

          <p className="text-sm text-gray-300">
            GWT: Specialized modules compete for workspace access. High E/C ratio triggers "ignition" - 
            content becomes globally broadcast and consciously accessible to all agents.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}