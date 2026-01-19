import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text } from '@react-three/drei';

function AgentProfileNode({ profile, position, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const scale = 1 + Math.sin(state.clock.elapsedTime + index) * 0.1;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  const price = profile.pricing_model?.current_price || 0;
  const availability = profile.availability_score || 0;
  
  const size = 0.3 + (price / 1000) * 0.5;
  const color = availability > 70 ? '#00ff88' : availability > 40 ? '#ffaa00' : '#ff4444';

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
        />
      </Sphere>

      <Text
        position={[0, size + 0.8, 0]}
        fontSize={0.18}
        color="white"
        anchorX="center"
      >
        ${price.toFixed(0)}
      </Text>

      <Text
        position={[0, -size - 0.8, 0]}
        fontSize={0.12}
        color={color}
        anchorX="center"
      >
        {availability.toFixed(0)}% avail
      </Text>
    </group>
  );
}

export default function MarketplaceDynamics3D({ profiles = [] }) {
  const positions = profiles.map((_, index) => {
    const angle = (index / profiles.length) * Math.PI * 2;
    const radius = 5 + Math.random() * 2;
    return [
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 4,
      Math.sin(angle) * radius,
    ];
  });

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden bg-black/20">
      <Canvas camera={{ position: [0, 8, 15], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#a855f7" />

        {/* Central marketplace core */}
        <Sphere args={[1.5, 64, 64]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#a855f7"
            emissive="#a855f7"
            emissiveIntensity={0.8}
            transparent
            opacity={0.5}
            wireframe
          />
        </Sphere>

        {profiles.map((profile, index) => (
          <AgentProfileNode
            key={profile.id}
            profile={profile}
            position={positions[index]}
            index={index}
          />
        ))}

        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={1} />
      </Canvas>

      {profiles.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/60">No marketplace profiles to visualize</p>
        </div>
      )}
    </div>
  );
}