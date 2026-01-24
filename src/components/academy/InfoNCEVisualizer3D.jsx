import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere, Html } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import * as THREE from 'three';

const VectorNode = ({ position, label, color, isPositive }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      const scale = isPositive ? 1.2 : 0.9;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isPositive ? 0.8 : 0.3}
        />
      </Sphere>
      <Text position={[0, -0.6, 0]} fontSize={0.15} color="white" anchorX="center">
        {label}
      </Text>
    </group>
  );
};

export default function InfoNCEVisualizer3D() {
  const [temperature, setTemperature] = useState(0.5);
  const [step, setStep] = useState(0);

  // Simulate neural signal and semantic vectors
  const neuralSignals = [
    { pos: [-4, 2, 0], label: 'Neural X^A', color: '#3b82f6' },
    { pos: [-4, 0, 0], label: 'Signal 2', color: '#6b7280' },
    { pos: [-4, -2, 0], label: 'Signal 3', color: '#6b7280' }
  ];

  const semanticVectors = [
    { pos: [4, 2, 0], label: 'Target X^B', color: '#10b981', isPositive: true },
    { pos: [4, 0, 0], label: 'Negative 1', color: '#ef4444', isPositive: false },
    { pos: [4, -2, 0], label: 'Negative 2', color: '#ef4444', isPositive: false }
  ];

  return (
    <div className="space-y-4">
      <div className="h-[400px] bg-black rounded-lg overflow-hidden">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />

          {/* Neural signals */}
          {neuralSignals.map((signal, idx) => (
            <VectorNode
              key={`neural-${idx}`}
              position={signal.pos}
              label={signal.label}
              color={signal.color}
              isPositive={idx === 0}
            />
          ))}

          {/* Semantic vectors */}
          {semanticVectors.map((vec, idx) => (
            <VectorNode
              key={`semantic-${idx}`}
              position={vec.pos}
              label={vec.label}
              color={vec.color}
              isPositive={vec.isPositive}
            />
          ))}

          {/* Connection lines showing similarity */}
          <Line
            points={[neuralSignals[0].pos, semanticVectors[0].pos]}
            color="#10b981"
            lineWidth={3}
            transparent
            opacity={0.8}
          />
          <Line
            points={[neuralSignals[0].pos, semanticVectors[1].pos]}
            color="#ef4444"
            lineWidth={1}
            dashed
            transparent
            opacity={0.3}
          />

          {/* Central loss function representation */}
          <group position={[0, 0, 0]}>
            <Sphere args={[0.5, 64, 64]}>
              <meshStandardMaterial
                color="#8b5cf6"
                emissive="#8b5cf6"
                emissiveIntensity={0.5}
                transparent
                opacity={0.3}
              />
            </Sphere>
            <Text fontSize={0.3} color="white" anchorX="center">
              InfoNCE
            </Text>
          </group>

          <OrbitControls enableZoom />
        </Canvas>
      </div>

      <div className="bg-black/40 rounded-lg p-4 space-y-4">
        <div>
          <label className="text-white text-sm mb-2 block">
            Temperature (τ): {temperature.toFixed(2)}
          </label>
          <Slider
            value={[temperature]}
            onValueChange={(v) => setTemperature(v[0])}
            min={0.1}
            max={1.0}
            step={0.05}
            className="w-full"
          />
        </div>
        <div className="text-xs text-gray-400 font-mono bg-black/60 rounded p-3">
          Loss = -log( exp(sim(X^A, X^B) / τ) / Σ exp(sim(X^A, X^neg) / τ) )
        </div>
        <p className="text-sm text-gray-300">
          InfoNCE maximizes mutual information between neural signals and target semantics
          by pulling positive pairs together (green) and pushing negatives apart (red).
        </p>
      </div>
    </div>
  );
}