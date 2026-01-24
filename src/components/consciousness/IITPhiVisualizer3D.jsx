import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Html } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { Brain, Zap } from 'lucide-react';

const MechanismNode = ({ position, state, isPartitioned, phi }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      const scale = phi > 0.5 ? 1.3 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial
          color={isPartitioned ? '#ef4444' : '#3b82f6'}
          emissive={isPartitioned ? '#ef4444' : '#3b82f6'}
          emissiveIntensity={phi}
          wireframe={isPartitioned}
        />
      </Sphere>
      <Text position={[0, -0.5, 0]} fontSize={0.12} color="white" anchorX="center">
        {state}
      </Text>
    </group>
  );
};

const CausalConnection = ({ start, end, strength }) => {
  return (
    <Line
      points={[new THREE.Vector3(...start), new THREE.Vector3(...end)]}
      color="#10b981"
      lineWidth={strength * 5}
      transparent
      opacity={strength}
    />
  );
};

export default function IITPhiVisualizer3D() {
  const [integration, setIntegration] = useState(0.8);
  const [partitioned, setPartitioned] = useState(false);

  const mechanisms = [
    { id: 0, state: 'S0', pos: [-2, 2, 0] },
    { id: 1, state: 'S1', pos: [2, 2, 0] },
    { id: 2, state: 'S2', pos: [-2, -2, 0] },
    { id: 3, state: 'S3', pos: [2, -2, 0] }
  ];

  const connections = [
    { from: 0, to: 1, strength: integration },
    { from: 0, to: 2, strength: integration * 0.8 },
    { from: 1, to: 3, strength: integration * 0.8 },
    { from: 2, to: 3, strength: integration }
  ];

  const phiValue = partitioned ? 0.1 : integration * 0.9;

  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          Integrated Information Theory (IIT) 4.0 - Phi (Φ) Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] bg-black rounded-lg overflow-hidden mb-4">
          <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />

            {/* Mechanism nodes */}
            {mechanisms.map((mech) => (
              <MechanismNode
                key={mech.id}
                position={mech.pos}
                state={mech.state}
                isPartitioned={partitioned && mech.id >= 2}
                phi={phiValue}
              />
            ))}

            {/* Causal connections */}
            {connections.map((conn, idx) => {
              const shouldShow = !partitioned || (conn.from < 2 && conn.to < 2) || (conn.from >= 2 && conn.to >= 2);
              if (shouldShow) {
                return (
                  <CausalConnection
                    key={idx}
                    start={mechanisms[conn.from].pos}
                    end={mechanisms[conn.to].pos}
                    strength={conn.strength}
                  />
                );
              }
              return null;
            })}

            {/* Partition plane */}
            {partitioned && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <planeGeometry args={[6, 0.1]} />
                <meshStandardMaterial
                  color="#ef4444"
                  transparent
                  opacity={0.3}
                />
              </mesh>
            )}

            {/* Central Phi visualization */}
            <group position={[0, 0, 0]}>
              <Sphere args={[phiValue * 1.5, 64, 64]}>
                <meshStandardMaterial
                  color="#8b5cf6"
                  emissive="#8b5cf6"}
                  emissiveIntensity={phiValue}
                  transparent
                  opacity={0.2}
                />
              </Sphere>
              <Html center>
                <div className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-xl">
                  Φ = {phiValue.toFixed(2)}
                </div>
              </Html>
            </group>

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        <div className="bg-black/40 rounded-lg p-4 space-y-4">
          <div>
            <label className="text-white text-sm mb-2 block">
              Integration Level: {integration.toFixed(2)}
            </label>
            <Slider
              value={[integration]}
              onValueChange={(v) => setIntegration(v[0])}
              min={0}
              max={1}
              step={0.05}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setPartitioned(!partitioned)}
              className={partitioned ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
            >
              <Zap className="w-4 h-4 mr-2" />
              {partitioned ? 'Restore Integration' : 'Apply Partition'}
            </Button>
          </div>

          <div className="text-xs text-gray-400 font-mono bg-black/60 rounded p-3">
            Φ(M) = min_P EMD(cause-effect repertoire(M), ∏ cause-effect parts)
            <br />
            <span className="text-purple-400">
              Current Φ: {phiValue.toFixed(3)} {phiValue > 0.5 ? '(High consciousness)' : '(Low consciousness)'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2">
              <div className="text-xs text-gray-400">Intrinsic Info</div>
              <div className="text-white font-bold">{(phiValue * 100).toFixed(0)}%</div>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded p-2">
              <div className="text-xs text-gray-400">Irreducibility</div>
              <div className="text-white font-bold">{partitioned ? 'Broken' : 'Intact'}</div>
            </div>
          </div>

          <p className="text-sm text-gray-300">
            IIT 4.0 quantifies consciousness as Φ (Phi). When partitioned, the system loses integration 
            and Φ drops. For OPO, maximize Φ across the human-machine interface for true synthetic telepathy.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}