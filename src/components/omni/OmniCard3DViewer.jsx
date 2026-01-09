import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Text, OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';

function Card3D({ design, cardData }) {
  const cardRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (cardRef.current && !hovered) {
      cardRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  const cardColor = design?.color || '#00f5ff';
  const material = design?.material || 'standard';

  const materialProps = {
    standard: { roughness: 0.3, metalness: 0.5 },
    metal: { roughness: 0.1, metalness: 0.9 },
    matte: { roughness: 0.9, metalness: 0.1 },
    glossy: { roughness: 0.05, metalness: 0.3 },
  };

  return (
    <group
      ref={cardRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <RoundedBox args={[4, 2.5, 0.1]} radius={0.1}>
        <meshStandardMaterial
          color={cardColor}
          {...materialProps[material]}
          envMapIntensity={1}
        />
      </RoundedBox>

      {/* Card details */}
      <Text
        position={[-1.5, 0.8, 0.06]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="left"
        fontWeight="bold"
      >
        OMNI CARD
      </Text>

      <Text
        position={[-1.5, 0.3, 0.06]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="left"
        fontWeight="bold"
        font="/fonts/courier-prime.woff"
      >
        {cardData?.number || '**** **** **** ****'}
      </Text>

      <Text
        position={[-1.5, -0.5, 0.06]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="left"
      >
        {cardData?.name || 'CARD HOLDER'}
      </Text>

      <Text
        position={[1.5, -0.5, 0.06]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="right"
      >
        {cardData?.expiry || '12/28'}
      </Text>

      {/* Chip */}
      <mesh position={[-1.2, 0, 0.06]}>
        <boxGeometry args={[0.4, 0.3, 0.02]} />
        <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Lighting */}
      <pointLight position={[2, 2, 3]} intensity={0.5} color={cardColor} />
    </group>
  );
}

export default function OmniCard3DViewer({ design, cardData }) {
  return (
    <div className="relative w-full h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-black/60 to-black/80 border border-white/10">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Card3D design={design} cardData={cardData} />
        <OrbitControls enableZoom={false} />
      </Canvas>

      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-2">
        <div className="text-white/60 text-xs">3D Preview</div>
      </div>
    </div>
  );
}