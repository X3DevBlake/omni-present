import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function SimulationHubTransition() {
  const gridRef = useRef();
  const buildingRef = useRef();

  const gridElements = useMemo(() => {
    const elements = [];
    for (let x = -10; x <= 10; x += 2) {
      for (let z = -10; z <= 10; z += 2) {
        elements.push({
          position: [x, -5 + Math.random() * 10, z],
          height: Math.random() * 3,
          delay: Math.random() * 2
        });
      }
    }
    return elements;
  }, []);

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.rotation.y += 0.005;
    }

    if (buildingRef.current) {
      buildingRef.current.children.forEach((child, i) => {
        const scale = Math.max(0, Math.sin(state.clock.elapsedTime * 2 - gridElements[i].delay));
        child.scale.y = scale * gridElements[i].height;
      });
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 10, 0]} intensity={2} color="#f59e0b" />

      {/* Grid Floor */}
      <gridHelper args={[40, 40, '#f59e0b', '#333']} position={[0, -5, 0]} />

      {/* Building Elements */}
      <group ref={buildingRef}>
        {gridElements.map((element, i) => (
          <mesh key={i} position={element.position}>
            <boxGeometry args={[1.5, 1, 1.5]} />
            <meshStandardMaterial
              color="#f59e0b"
              emissive="#f59e0b"
              emissiveIntensity={0.3}
              metalness={0.5}
              roughness={0.5}
            />
          </mesh>
        ))}
      </group>

      {/* Rotating Grid */}
      <group ref={gridRef} rotation={[Math.PI / 4, 0, 0]}>
        <mesh>
          <torusGeometry args={[8, 0.05, 16, 100]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[6, 0.05, 16, 100]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
      </group>
    </>
  );
}