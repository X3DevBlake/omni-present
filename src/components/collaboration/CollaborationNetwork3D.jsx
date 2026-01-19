import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';

function GroupNode({ group, position, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const color = group.status === 'active' ? '#00f5ff' : '#888888';
  const size = 0.5 + (group.member_agents?.length || 0) * 0.1;

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={group.status === 'active' ? 0.8 : 0.3}
          transparent
          opacity={0.9}
        />
      </Sphere>

      <Text
        position={[0, size + 0.8, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
      >
        {group.group_name}
      </Text>

      <Text
        position={[0, -size - 0.8, 0]}
        fontSize={0.15}
        color={color}
        anchorX="center"
      >
        {group.member_agents?.length || 0} agents
      </Text>
    </group>
  );
}

export default function CollaborationNetwork3D({ groups = [], channels = [] }) {
  const positions = groups.map((_, index) => {
    const angle = (index / groups.length) * Math.PI * 2;
    const radius = 6;
    return [
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 2,
      Math.sin(angle) * radius,
    ];
  });

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden bg-black/20">
      <Canvas camera={{ position: [0, 8, 20], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#00f5ff" />

        {/* Central hub */}
        <Sphere args={[1.5, 64, 64]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#a855f7"
            emissive="#a855f7"
            emissiveIntensity={0.8}
            transparent
            opacity={0.4}
            wireframe
          />
        </Sphere>

        {groups.map((group, index) => (
          <React.Fragment key={group.id}>
            <GroupNode group={group} position={positions[index]} index={index} />
            
            <Line
              points={[[0, 0, 0], positions[index]]}
              color="#00f5ff"
              lineWidth={2}
              transparent
              opacity={group.status === 'active' ? 0.6 : 0.2}
            />
          </React.Fragment>
        ))}

        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5} />
      </Canvas>

      {groups.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/60">No working groups to visualize</p>
        </div>
      )}
    </div>
  );
}