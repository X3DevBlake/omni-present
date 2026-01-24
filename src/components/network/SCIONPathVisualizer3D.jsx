import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Html } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { Shield, Route } from 'lucide-react';

const ASNode = ({ position, as, isd, isSecure, onClick }) => {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.015;
    }
  });

  return (
    <group position={position} onClick={onClick}>
      <Sphere ref={meshRef} args={[0.4, 32, 32]}>
        <meshStandardMaterial
          color={isSecure ? '#10b981' : '#6b7280'}
          emissive={isSecure ? '#10b981' : '#000000'}
          emissiveIntensity={isSecure ? 0.7 : 0.2}
        />
      </Sphere>
      {isSecure && (
        <Html distanceFactor={6}>
          <Shield className="w-4 h-4 text-green-400" />
        </Html>
      )}
      <Text position={[0, -0.7, 0]} fontSize={0.15} color="white" anchorX="center">
        AS{as}
      </Text>
      <Text position={[0, -0.95, 0]} fontSize={0.1} color="#6b7280" anchorX="center">
        ISD {isd}
      </Text>
    </group>
  );
};

const PathSegment = ({ start, end, isSelected, isSecure }) => {
  const lineRef = useRef();

  useFrame((state) => {
    if (lineRef.current && isSelected) {
      const flow = (state.clock.elapsedTime % 1);
      lineRef.current.material.opacity = 0.5 + flow * 0.5;
    }
  });

  return (
    <Line
      ref={lineRef}
      points={[new THREE.Vector3(...start), new THREE.Vector3(...end)]}
      color={isSecure ? '#10b981' : isSelected ? '#3b82f6' : '#6b7280'}
      lineWidth={isSelected ? 4 : 2}
      transparent
      opacity={isSecure ? 0.9 : 0.3}
      dashed={!isSecure}
      dashScale={10}
    />
  );
};

export default function SCIONPathVisualizer3D() {
  const [selectedPath, setSelectedPath] = useState('secure');

  // Autonomous Systems in different ISDs
  const autonomousSystems = [
    { as: 1, isd: 1, pos: [-5, 2, 0], secure: true },
    { as: 2, isd: 1, pos: [-2, 2, 0], secure: true },
    { as: 3, isd: 2, pos: [0, 0, 0], secure: false },
    { as: 4, isd: 3, pos: [2, 2, 0], secure: true },
    { as: 5, isd: 3, pos: [5, 2, 0], secure: true }
  ];

  const paths = {
    secure: [0, 1, 3, 4], // AS1 -> AS2 -> AS4 -> AS5 (avoid untrusted AS3)
    standard: [0, 2, 4], // AS1 -> AS3 -> AS5 (shorter but through untrusted)
    sovereign: [0, 1, 3, 4] // Same as secure for sovereignty
  };

  const currentPath = paths[selectedPath];

  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Route className="w-5 h-5 text-blue-400" />
          SCION Path-Aware Routing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] bg-black rounded-lg overflow-hidden mb-4">
          <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />

            {/* Autonomous Systems */}
            {autonomousSystems.map((as, idx) => (
              <ASNode
                key={idx}
                position={as.pos}
                as={as.as}
                isd={as.isd}
                isSecure={as.secure}
              />
            ))}

            {/* Path segments */}
            {currentPath.slice(0, -1).map((nodeIdx, i) => {
              const nextIdx = currentPath[i + 1];
              const fromNode = autonomousSystems[nodeIdx];
              const toNode = autonomousSystems[nextIdx];
              const isSecure = fromNode.secure && toNode.secure;

              return (
                <PathSegment
                  key={i}
                  start={fromNode.pos}
                  end={toNode.pos}
                  isSelected={true}
                  isSecure={isSecure}
                />
              );
            })}

            {/* All possible links (background) */}
            {autonomousSystems.slice(0, -1).map((as, idx) => {
              const nextAs = autonomousSystems[idx + 1];
              const isInPath = currentPath.includes(idx) && currentPath.includes(idx + 1);
              if (!isInPath) {
                return (
                  <PathSegment
                    key={`bg-${idx}`}
                    start={as.pos}
                    end={nextAs.pos}
                    isSelected={false}
                    isSecure={false}
                  />
                );
              }
              return null;
            })}

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        <div className="bg-black/40 rounded-lg p-4 space-y-4">
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => setSelectedPath('secure')}
              className={selectedPath === 'secure' ? 'bg-green-600' : 'bg-gray-700'}
            >
              <Shield className="w-3 h-3 mr-2" />
              Secure Path
            </Button>
            <Button
              size="sm"
              onClick={() => setSelectedPath('standard')}
              className={selectedPath === 'standard' ? 'bg-blue-600' : 'bg-gray-700'}
            >
              Standard Route
            </Button>
            <Button
              size="sm"
              onClick={() => setSelectedPath('sovereign')}
              className={selectedPath === 'sovereign' ? 'bg-purple-600' : 'bg-gray-700'}
            >
              Sovereign Shard
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-green-500/10 border border-green-500/30 rounded p-2">
              <div className="text-xs text-gray-400">Path Length</div>
              <div className="text-white font-bold">{currentPath.length} hops</div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2">
              <div className="text-xs text-gray-400">Security</div>
              <div className="text-white font-bold">
                {selectedPath === 'secure' ? 'High' : 'Standard'}
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400 font-mono bg-black/60 rounded p-3">
            SCION ISD Architecture:
            <br />- Packet-Carried Forwarding State (PCFS)
            <br />- Cryptographic path selection
            <br />- Sovereign isolation domains
          </div>

          <p className="text-sm text-gray-300">
            SCION allows explicit path selection avoiding untrusted regions. Critical for 
            maintaining sovereignty and preventing surveillance of OPO neural data.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}