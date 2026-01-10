import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function LearningTerrain() {
  const geometry = useMemo(() => {
    const width = 50;
    const height = 50;
    const geo = new THREE.PlaneGeometry(10, 10, width - 1, height - 1);
    const vertices = geo.attributes.position.array;

    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      const distance = Math.sqrt(x * x + y * y);
      vertices[i + 2] = Math.sin(distance * 2) * (1 - distance / 5) + Math.random() * 0.2;
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial
        color="#00f5ff"
        wireframe
        emissive="#00f5ff"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

export default function AILearningCurve3DTerrain() {
  return (
    <div className="bg-black/40 rounded-xl border border-white/10 h-96 overflow-hidden">
      <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <LearningTerrain />
        <OrbitControls enableZoom />
        <fog attach="fog" args={['#000000', 5, 15]} />
      </Canvas>
    </div>
  );
}