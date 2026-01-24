import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Html } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';

const TokenNode = ({ position, token, role, attention, onClick, isActive }) => {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      const scale = isActive ? 1.3 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  const colors = {
    query: '#3b82f6',
    key: '#10b981',
    value: '#f59e0b'
  };

  return (
    <group position={position} onClick={onClick}>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial
          color={colors[role]}
          emissive={colors[role]}
          emissiveIntensity={isActive ? 0.9 : 0.5}
        />
      </Sphere>
      {isActive && (
        <Html distanceFactor={6}>
          <div className="bg-black/90 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap">
            <div className="font-bold">{token}</div>
            <div className="text-gray-400">Attention: {(attention * 100).toFixed(1)}%</div>
          </div>
        </Html>
      )}
      <Text position={[0, -0.5, 0]} fontSize={0.15} color="white" anchorX="center">
        {token}
      </Text>
    </group>
  );
};

export default function AttentionMechanismVisualizer3D() {
  const [selectedToken, setSelectedToken] = useState(0);
  const [showConnections, setShowConnections] = useState(true);

  const tokens = [
    { text: 'The', role: 'query', pos: [-4, 2, 0] },
    { text: 'cat', role: 'key', pos: [-2, 0, 0] },
    { text: 'sat', role: 'key', pos: [0, 0, 0] },
    { text: 'on', role: 'key', pos: [2, 0, 0] },
    { text: 'mat', role: 'value', pos: [4, -2, 0] }
  ];

  // Simulate attention scores
  const attentionScores = [
    [0.1, 0.7, 0.15, 0.05], // "The" attends to other tokens
    [0.2, 0.1, 0.6, 0.1],
    [0.15, 0.15, 0.1, 0.6],
    [0.3, 0.3, 0.2, 0.2]
  ];

  return (
    <div className="space-y-4">
      <div className="h-[400px] bg-black rounded-lg overflow-hidden">
        <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />

          {/* Token nodes */}
          {tokens.map((token, idx) => (
            <TokenNode
              key={idx}
              position={token.pos}
              token={token.text}
              role={token.role}
              attention={attentionScores[selectedToken]?.[idx] || 0}
              onClick={() => setSelectedToken(idx)}
              isActive={idx === selectedToken}
            />
          ))}

          {/* Attention connections */}
          {showConnections && tokens.slice(1).map((token, idx) => {
            const score = attentionScores[selectedToken]?.[idx] || 0;
            if (score > 0.1) {
              return (
                <Line
                  key={`conn-${idx}`}
                  points={[tokens[selectedToken].pos, token.pos]}
                  color="#3b82f6"
                  lineWidth={score * 5}
                  transparent
                  opacity={score}
                />
              );
            }
            return null;
          })}

          {/* Multi-head representation */}
          <group position={[0, 4, 0]}>
            {[0, 1, 2].map((head) => (
              <Sphere key={head} args={[0.2, 16, 16]} position={[(head - 1) * 0.8, 0, 0]}>
                <meshStandardMaterial
                  color="#8b5cf6"
                  emissive="#8b5cf6"
                  emissiveIntensity={0.6}
                />
              </Sphere>
            ))}
            <Text position={[0, 0.6, 0]} fontSize={0.2} color="white" anchorX="center">
              Multi-Head
            </Text>
          </group>

          <OrbitControls enableZoom />
        </Canvas>
      </div>

      <div className="bg-black/40 rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowConnections(!showConnections)}
            variant="outline"
            className="border-white/20 text-white"
          >
            {showConnections ? 'Hide' : 'Show'} Attention
          </Button>
          <Badge className="bg-blue-500">
            Token: {tokens[selectedToken].text}
          </Badge>
        </div>

        <div className="text-xs text-gray-400 font-mono bg-black/60 rounded p-3">
          Attention(Q, K, V) = softmax(QK^T / √d_k) V
          <br />
          <span className="text-blue-400">Q</span> (Query) • 
          <span className="text-green-400"> K</span> (Key) • 
          <span className="text-amber-400"> V</span> (Value)
        </div>

        <div className="flex gap-2">
          {tokens[selectedToken] && tokens.slice(1).map((token, idx) => {
            const score = attentionScores[selectedToken]?.[idx] || 0;
            return (
              <div key={idx} className="text-xs">
                <div className="text-gray-400">{token.text}</div>
                <div className="text-white font-bold">{(score * 100).toFixed(0)}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}