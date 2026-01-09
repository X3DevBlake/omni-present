import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function Neuron({ position, layer, color, isActive }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.x = 1 + (isActive ? Math.sin(state.clock.elapsedTime * 3) * 0.2 : 0);
      meshRef.current.scale.y = 1 + (isActive ? Math.sin(state.clock.elapsedTime * 3) * 0.2 : 0);
      meshRef.current.scale.z = 1 + (isActive ? Math.sin(state.clock.elapsedTime * 3) * 0.2 : 0);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.4, 16, 16]} />
      <meshPhongMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isActive ? 0.8 : 0.3}
        wireframe={!isActive}
      />
    </mesh>
  );
}

export default function NeuralNetworkVisualizer3D() {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  // Create network layers
  const layers = [
    { neurons: 5, x: -8, color: '#00f5ff' },    // Input
    { neurons: 8, x: -4, color: '#a855f7' },    // Hidden 1
    { neurons: 6, x: 0, color: '#ec4899' },     // Hidden 2
    { neurons: 4, x: 4, color: '#10b981' },     // Output
  ];

  const neurons = [];
  layers.forEach((layer, layerIdx) => {
    for (let i = 0; i < layer.neurons; i++) {
      const y = (i - (layer.neurons - 1) / 2) * 2;
      neurons.push({
        position: [layer.x, y, 0],
        color: layer.color,
        isActive: Math.random() > 0.4,
        layer: layerIdx
      });
    }
  });

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden bg-black/40 border border-purple-500/30">
      <Canvas camera={{ position: [0, 0, 16], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#a855f7" />
        <pointLight position={[-10, -10, 10]} intensity={1} color="#00f5ff" />

        <group ref={groupRef}>
          {/* Neurons */}
          {neurons.map((neuron, idx) => (
            <Neuron key={idx} {...neuron} />
          ))}

          {/* Connection lines between layers */}
          {neurons.map((neuron1, i) =>
            neurons.map((neuron2, j) => {
              if (neuron1.layer + 1 === neuron2.layer && Math.random() > 0.5) {
                return (
                  <lineSegments key={`${i}-${j}`}>
                    <bufferGeometry>
                      <bufferAttribute
                        attach="attributes-position"
                        count={2}
                        array={new Float32Array([
                          ...neuron1.position,
                          ...neuron2.position
                        ])}
                        itemSize={3}
                      />
                    </bufferGeometry>
                    <lineBasicMaterial
                      color={neuron1.isActive ? '#00f5ff' : '#ffffff'}
                      transparent
                      opacity={neuron1.isActive ? 0.6 : 0.2}
                      linewidth={neuron1.isActive ? 2 : 1}
                    />
                  </lineSegments>
                );
              }
              return null;
            })
          )}

          {/* Layer labels as planes */}
          {['Input', 'Hidden 1', 'Hidden 2', 'Output'].map((label, idx) => (
            <group key={label} position={[layers[idx].x, -6, 0]}>
              <mesh>
                <planeGeometry args={[2, 0.8]} />
                <meshBasicMaterial color={layers[idx].color} transparent opacity={0.3} />
              </mesh>
            </group>
          ))}
        </group>

        <OrbitControls enableZoom />
      </Canvas>
    </div>
  );
}