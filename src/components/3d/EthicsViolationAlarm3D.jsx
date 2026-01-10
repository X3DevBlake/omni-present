import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';

function AlarmSphere() {
  const meshRef = useRef();
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTriggered(Math.random() > 0.7);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useFrame((state) => {
    if (meshRef.current && triggered) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 10) * 0.3);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 32, 32]}>
      <meshStandardMaterial
        color={triggered ? '#ef4444' : '#10b981'}
        emissive={triggered ? '#ef4444' : '#10b981'}
        emissiveIntensity={triggered ? 0.8 : 0.3}
        wireframe
      />
    </Sphere>
  );
}

export default function EthicsViolationAlarm3D() {
  return (
    <div className="bg-black/40 rounded-xl border border-white/10 h-96 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <AlarmSphere />
        <OrbitControls enableZoom />
      </Canvas>
    </div>
  );
}