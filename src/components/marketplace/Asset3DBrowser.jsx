import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text3D, MeshDistortMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Eye, Download } from 'lucide-react';
import * as THREE from 'three';

function Asset3DCard({ asset, position, onClick, isSelected }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      if (isSelected || hovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <group position={position}>
        <mesh
          ref={meshRef}
          onClick={onClick}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          <boxGeometry args={[1.5, 2, 0.3]} />
          <meshStandardMaterial
            color={asset.color || '#a855f7'}
            emissive={asset.color || '#a855f7'}
            emissiveIntensity={isSelected ? 0.6 : hovered ? 0.4 : 0.2}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {(hovered || isSelected) && (
          <>
            <Text
              position={[0, 1.5, 0.2]}
              fontSize={0.15}
              color="white"
              anchorX="center"
              maxWidth={2}
            >
              {asset.name}
            </Text>
            <Text
              position={[0, 1.2, 0.2]}
              fontSize={0.1}
              color="#00f5ff"
              anchorX="center"
            >
              ${asset.price}
            </Text>
          </>
        )}

        {isSelected && (
          <mesh position={[0, 0, 0]}>
            <torusGeometry args={[1.2, 0.05, 16, 100]} />
            <meshBasicMaterial color="#00f5ff" />
          </mesh>
        )}
      </group>
    </Float>
  );
}

export default function Asset3DBrowser({ assets, onAssetSelect, selectedAsset }) {
  const [hoveredAsset, setHoveredAsset] = useState(null);

  return (
    <div className="w-full h-[600px] bg-black/20 rounded-2xl overflow-hidden border border-white/10">
      <Canvas camera={{ position: [0, 3, 10], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />

        {assets.map((asset, i) => {
          const angle = (i / assets.length) * Math.PI * 2;
          const radius = 5;
          const position = [
            Math.cos(angle) * radius,
            Math.sin(i * 0.5) * 2,
            Math.sin(angle) * radius
          ];

          return (
            <Asset3DCard
              key={asset.id}
              asset={asset}
              position={position}
              onClick={() => onAssetSelect(asset)}
              isSelected={selectedAsset?.id === asset.id}
            />
          );
        })}

        <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
      </Canvas>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl px-6 py-3">
        <p className="text-white/60 text-sm">Click to select • Scroll to zoom • Drag to rotate</p>
      </div>
    </div>
  );
}