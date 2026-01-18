import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function NetworkScene() {
  const nodesRef = useRef([]);
  const connectionsRef = useRef([]);

  useEffect(() => {
    // Create neural network layers
    const layers = [
      { neurons: 8, color: '#00f5ff' },   // Input layer
      { neurons: 16, color: '#ff00ff' },  // Hidden layer 1
      { neurons: 12, color: '#ffff00' },  // Hidden layer 2
      { neurons: 4, color: '#00ff00' },   // Output layer
    ];

    layers.forEach((layer, layerIdx) => {
      const ySpacing = 10 / layer.neurons;
      for (let i = 0; i < layer.neurons; i++) {
        const geometry = new THREE.SphereGeometry(0.3, 16, 16);
        const material = new THREE.MeshPhongMaterial({
          color: layer.color,
          emissive: layer.color,
          emissiveIntensity: 0.3,
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(layerIdx * 5 - 7.5, i * ySpacing - 5, Math.random() * 2 - 1);
        sphere.userData = { layer: layerIdx, neuron: i, activation: Math.random() };
        nodesRef.current.push(sphere);
      }
    });

    // Create connections between layers
    for (let l = 0; l < layers.length - 1; l++) {
      const currentLayer = nodesRef.current.filter((n) => n.userData.layer === l);
      const nextLayer = nodesRef.current.filter((n) => n.userData.layer === l + 1);

      currentLayer.forEach((current) => {
        nextLayer.forEach((next) => {
          if (Math.random() > 0.4) {
            const points = [current.position, next.position];
            const line = new THREE.Line(
              new THREE.BufferGeometry().setFromPoints(points),
              new THREE.LineBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.3,
              })
            );
            connectionsRef.current.push(line);
          }
        });
      });
    }
  }, []);

  useFrame(() => {
    nodesRef.current.forEach((node) => {
      node.scale.set(
        1 + Math.sin(Date.now() * 0.003 + node.userData.neuron) * 0.15,
        1 + Math.sin(Date.now() * 0.003 + node.userData.neuron) * 0.15,
        1 + Math.sin(Date.now() * 0.003 + node.userData.neuron) * 0.15
      );
    });
  });

  return (
    <>
      <OrbitControls autoRotate autoRotateSpeed={2} />
      <ambientLight intensity={0.5} />
      <pointLight position={[20, 20, 20]} intensity={1.5} />

      {nodesRef.current.map((node, idx) => (
        <primitive key={idx} object={node} />
      ))}
      {connectionsRef.current.map((line, idx) => (
        <primitive key={idx} object={line} />
      ))}
    </>
  );
}

export default function NeuralNetwork3DExplorer() {
  return (
    <Canvas camera={{ position: [0, 0, 20], fov: 45 }}>
      <NetworkScene />
    </Canvas>
  );
}