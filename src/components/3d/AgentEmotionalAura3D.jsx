import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';

function EmotionalAura({ emotion }) {
  const meshRef = useRef();
  const outerRef = useRef();

  const emotionColors = {
    happy: '#10b981',
    neutral: '#3b82f6',
    sad: '#6366f1',
    excited: '#f59e0b',
    focused: '#00f5ff'
  };

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime;
    }
    if (outerRef.current) {
      outerRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.2);
    }
  });

  return (
    <group>
      <Sphere ref={meshRef} args={[0.5, 32, 32]}>
        <meshStandardMaterial
          color={emotionColors[emotion]}
          emissive={emotionColors[emotion]}
          emissiveIntensity={0.5}
        />
      </Sphere>
      <Sphere ref={outerRef} args={[1.2, 32, 32]}>
        <meshStandardMaterial
          color={emotionColors[emotion]}
          transparent
          opacity={0.2}
          wireframe
        />
      </Sphere>
    </group>
  );
}

export default function AgentEmotionalAura3D({ emotion = 'happy' }) {
  return (
    <div className="bg-black/40 rounded-xl border border-white/10 h-96 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <EmotionalAura emotion={emotion} />
        <OrbitControls enableZoom />
      </Canvas>
    </div>
  );
}