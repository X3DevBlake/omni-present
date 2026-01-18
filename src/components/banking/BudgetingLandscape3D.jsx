import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box } from '@react-three/drei';

function LandscapeScene({ budgetData }) {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.0005;
      groupRef.current.rotation.y += 0.0003;
    }
  });

  const categories = [
    { name: 'Food', amount: 450, color: '#ef4444', x: -8 },
    { name: 'Transport', amount: 300, color: '#f59e0b', x: -4 },
    { name: 'Entertainment', amount: 200, color: '#3b82f6', x: 0 },
    { name: 'Utilities', amount: 350, color: '#10b981', x: 4 },
    { name: 'Health', amount: 250, color: '#8b5cf6', x: 8 },
  ];

  return (
    <>
      <OrbitControls autoRotate autoRotateSpeed={1.5} />
      <ambientLight intensity={0.6} />
      <pointLight position={[20, 30, 20]} intensity={1.5} />
      <pointLight position={[-20, -20, 20]} intensity={0.5} />

      <group ref={groupRef}>
        {categories.map((cat, idx) => {
          const height = (cat.amount / 500) * 5;
          return (
            <group key={idx} position={[cat.x, 0, 0]}>
              <Box args={[1.2, height, 1.2]} position={[0, height / 2, 0]}>
                <meshPhongMaterial color={cat.color} emissive={cat.color} emissiveIntensity={0.2} />
              </Box>
            </group>
          );
        })}

        {/* Ground plane */}
        <Box args={[20, 0.5, 3]} position={[0, -0.3, 0]}>
          <meshPhongMaterial color="#1f2937" />
        </Box>
      </group>
    </>
  );
}

export default function BudgetingLandscape3D({ budgetData }) {
  return (
    <Canvas camera={{ position: [0, 8, 18], fov: 45 }}>
      <LandscapeScene budgetData={budgetData} />
    </Canvas>
  );
}