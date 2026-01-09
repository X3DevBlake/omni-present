import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function IconGeometry({ icon, color }) {
  const meshRef = React.useRef(null);

  React.useEffect(() => {
    const rotation = setInterval(() => {
      if (meshRef.current) {
        meshRef.current.rotation.x += 0.01;
        meshRef.current.rotation.y += 0.01;
        meshRef.current.rotation.z += 0.005;
      }
    }, 50);
    return () => clearInterval(rotation);
  }, []);

  return (
    <group ref={meshRef}>
      <Sphere args={[1, 64, 64]} scale={0.8}>
        <MeshDistortMaterial
          color={color}
          speed={2}
          distort={0.4}
          emissive={color}
          emissiveIntensity={0.5}
          wireframe={false}
        />
      </Sphere>
      <mesh scale={0.4}>
        <octahedronGeometry args={[1, 2]} />
        <meshBasicMaterial color={color} wireframe />
      </mesh>
    </group>
  );
}

export default function Rotating3DIcon({ icon, color = '#00f5ff', size = 120 }) {
  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ambientLight intensity={1.5} color="#ffffff" />
        <pointLight position={[10, 10, 10]} intensity={2} color={color} />
        <pointLight position={[-10, -10, -10]} intensity={1} color={color} />
        <IconGeometry icon={icon} color={color} />
      </Canvas>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: size * 0.4,
          zIndex: 10,
          pointerEvents: 'none'
        }}
      >
        {icon}
      </div>
    </div>
  );
}