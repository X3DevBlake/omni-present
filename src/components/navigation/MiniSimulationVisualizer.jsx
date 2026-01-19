import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function MiniSimulationVisualizer() {
  const gridRef = useRef();
  const cubesRef = useRef();

  const gridElements = React.useMemo(() => {
    const elements = [];
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        elements.push({
          position: [x * 0.6, -0.5, z * 0.6],
          height: 0.3 + Math.random() * 0.5
        });
      }
    }
    return elements;
  }, []);

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.rotation.y += 0.01;
    }

    if (cubesRef.current) {
      cubesRef.current.children.forEach((child, i) => {
        child.position.y = -0.5 + Math.abs(Math.sin(state.clock.elapsedTime + i * 0.5)) * 0.5;
      });
    }
  });

  return (
    <group>
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 2]} intensity={0.5} color="#f59e0b" />

      <gridHelper args={[4, 8, '#f59e0b', '#444']} position={[0, -0.5, 0]} />

      <group ref={cubesRef}>
        {gridElements.map((element, i) => (
          <mesh key={i} position={element.position}>
            <boxGeometry args={[0.4, element.height, 0.4]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.3} />
          </mesh>
        ))}
      </group>

      <group ref={gridRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.02, 16, 100]} />
          <meshBasicMaterial color="#f59e0b" opacity={0.5} transparent />
        </mesh>
      </group>
    </group>
  );
}