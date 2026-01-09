import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function NeuralNetwork({ progress }) {
  const groupRef = useRef();
  const layers = [4, 6, 6, 3]; // Network architecture
  const spacing = 2;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  const nodes = useMemo(() => {
    const allNodes = [];
    layers.forEach((nodeCount, layerIndex) => {
      const x = (layerIndex - layers.length / 2) * spacing;
      for (let i = 0; i < nodeCount; i++) {
        const y = (i - nodeCount / 2) * 0.8;
        allNodes.push({ position: [x, y, 0], layer: layerIndex });
      }
    });
    return allNodes;
  }, []);

  const connections = useMemo(() => {
    const conns = [];
    layers.forEach((nodeCount, layerIndex) => {
      if (layerIndex < layers.length - 1) {
        const currentLayerStart = layers.slice(0, layerIndex).reduce((a, b) => a + b, 0);
        const nextLayerStart = layers.slice(0, layerIndex + 1).reduce((a, b) => a + b, 0);
        
        for (let i = 0; i < nodeCount; i++) {
          for (let j = 0; j < layers[layerIndex + 1]; j++) {
            conns.push({
              start: nodes[currentLayerStart + i].position,
              end: nodes[nextLayerStart + j].position
            });
          }
        }
      }
    });
    return conns;
  }, [nodes]);

  return (
    <group ref={groupRef}>
      {/* Connections */}
      {connections.map((conn, i) => (
        <Line
          key={`conn-${i}`}
          points={[conn.start, conn.end]}
          color={progress > (i / connections.length) * 100 ? '#00f5ff' : '#333333'}
          lineWidth={1}
          opacity={0.3}
        />
      ))}

      {/* Nodes */}
      {nodes.map((node, i) => {
        const isActive = progress > (i / nodes.length) * 100;
        return (
          <Float key={i} speed={1 + Math.random()} rotationIntensity={0.1} floatIntensity={0.2}>
            <Sphere args={[0.15, 16, 16]} position={node.position}>
              <meshStandardMaterial
                color={isActive ? '#00f5ff' : '#666666'}
                emissive={isActive ? '#00f5ff' : '#000000'}
                emissiveIntensity={isActive ? 0.5 : 0}
                metalness={0.8}
                roughness={0.2}
              />
            </Sphere>
          </Float>
        );
      })}

      {/* Data pulse effect */}
      {progress > 0 && (
        <Float speed={3} rotationIntensity={0} floatIntensity={1}>
          <mesh position={[nodes[0].position[0], 0, 0]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial
              color="#a855f7"
              transparent
              opacity={0.3}
              emissive="#a855f7"
              emissiveIntensity={1}
            />
          </mesh>
        </Float>
      )}
    </group>
  );
}

export default function ModelTraining3D({ progress = 0, accuracy = 0 }) {
  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
      <div className="h-80 relative">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#00f5ff" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
          <NeuralNetwork progress={progress} />
        </Canvas>

        <div className="absolute top-4 left-4 space-y-2">
          <div className="bg-black/80 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20">
            <div className="text-white/60 text-xs">Training Progress</div>
            <div className="text-white font-bold text-lg">{progress.toFixed(1)}%</div>
          </div>
          <div className="bg-black/80 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20">
            <div className="text-white/60 text-xs">Accuracy</div>
            <div className="text-green-400 font-bold text-lg">{accuracy.toFixed(1)}%</div>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-black/80 backdrop-blur-md rounded-lg p-2 border border-white/20">
            <div className="flex justify-between text-xs text-white/60 mb-1">
              <span>Neural Network Learning</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}