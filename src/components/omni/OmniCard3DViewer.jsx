import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Text, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

function Card3D({ card }) {
  const cardRef = useRef();
  
  useFrame((state) => {
    if (cardRef.current) {
      cardRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  const design = card?.card_design || {};
  const bgColor = design.background_color || '#1e293b';
  const accentColor = design.accent_color || '#6366f1';

  return (
    <group ref={cardRef}>
      {/* Card Body */}
      <RoundedBox args={[3.5, 2.2, 0.1]} radius={0.1} smoothness={4}>
        <meshStandardMaterial
          color={bgColor}
          metalness={design.material === 'metallic' ? 0.8 : 0.2}
          roughness={design.material === 'glossy' ? 0.1 : 0.5}
        />
      </RoundedBox>

      {/* Holographic Overlay */}
      {design.material === 'holographic' && (
        <RoundedBox args={[3.5, 2.2, 0.11]} radius={0.1} smoothness={4} position={[0, 0, 0.01]}>
          <meshBasicMaterial
            color={accentColor}
            transparent
            opacity={0.3}
          />
        </RoundedBox>
      )}

      {/* Accent Stripe */}
      <RoundedBox args={[3.5, 0.3, 0.11]} radius={0.05} smoothness={4} position={[0, 0.8, 0.06]}>
        <meshStandardMaterial color={accentColor} metalness={0.9} roughness={0.1} />
      </RoundedBox>

      {/* OMNI Logo */}
      <Text
        position={[-1.3, 0.7, 0.07]}
        fontSize={0.3}
        color="white"
        anchorX="left"
        font="/fonts/bold.woff"
      >
        OMNI
      </Text>

      {/* Card Type */}
      <Text
        position={[1.3, 0.7, 0.07]}
        fontSize={0.15}
        color={accentColor}
        anchorX="right"
        font="/fonts/regular.woff"
      >
        {card?.card_type?.toUpperCase()}
      </Text>

      {/* Chip Simulation */}
      <RoundedBox args={[0.4, 0.3, 0.08]} radius={0.05} smoothness={4} position={[-1.2, 0.1, 0.06]}>
        <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
      </RoundedBox>

      {/* Card Number Placeholder */}
      <Text
        position={[0, -0.5, 0.07]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        font="/fonts/mono.woff"
      >
        •••• •••• •••• ••••
      </Text>

      {/* Contactless Symbol */}
      <group position={[1.4, 0.2, 0.07]}>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <torusGeometry args={[0.08, 0.015, 16, 32, Math.PI]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 4]} position={[-0.05, 0.05, 0]}>
          <torusGeometry args={[0.12, 0.015, 16, 32, Math.PI]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 4]} position={[-0.1, 0.1, 0]}>
          <torusGeometry args={[0.16, 0.015, 16, 32, Math.PI]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </group>
    </group>
  );
}

export default function OmniCard3DViewer({ card }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <Card3D card={card} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Suspense>
    </Canvas>
  );
}