import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';

function MatrixColumn({ position, chars }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y -= 0.02;
      if (groupRef.current.position.y < -5) {
        groupRef.current.position.y = 5;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {chars.map((char, i) => (
        <Text
          key={i}
          position={[0, -i * 0.3, 0]}
          fontSize={0.2}
          color="#00f5ff"
        >
          {char}
        </Text>
      ))}
    </group>
  );
}

export default function CodeGenerationMatrix3D() {
  const columns = useMemo(() => {
    const cols = [];
    const codeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789{}[]();'.split('');
    for (let i = 0; i < 20; i++) {
      cols.push({
        position: [(i - 10) * 0.4, Math.random() * 5, 0],
        chars: Array.from({ length: 10 }, () => codeChars[Math.floor(Math.random() * codeChars.length)])
      });
    }
    return cols;
  }, []);

  return (
    <div className="bg-black/40 rounded-xl border border-white/10 h-96 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.3} />
        {columns.map((col, i) => (
          <MatrixColumn key={i} position={col.position} chars={col.chars} />
        ))}
        <OrbitControls enableZoom />
        <fog attach="fog" args={['#000000', 5, 12]} />
      </Canvas>
    </div>
  );
}