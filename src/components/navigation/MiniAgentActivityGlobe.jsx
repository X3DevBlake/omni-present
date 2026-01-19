import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

export default function MiniAgentActivityGlobe({ agentCount = 5 }) {
  const globeRef = useRef();
  const pointsRef = useRef();

  const agentPositions = React.useMemo(() => {
    const positions = [];
    for (let i = 0; i < agentCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / agentCount);
      const theta = Math.sqrt(agentCount * Math.PI) * phi;
      positions.push({
        x: Math.cos(theta) * Math.sin(phi) * 1.2,
        y: Math.sin(theta) * Math.sin(phi) * 1.2,
        z: Math.cos(phi) * 1.2
      });
    }
    return positions;
  }, [agentCount]);

  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.005;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 2]} intensity={0.5} />

      {/* Globe */}
      <Sphere ref={globeRef} args={[1, 32, 32]}>
        <meshStandardMaterial
          color="#a855f7"
          wireframe
          opacity={0.3}
          transparent
        />
      </Sphere>

      {/* Agent Points */}
      <group ref={pointsRef}>
        {agentPositions.map((pos, i) => (
          <mesh key={i} position={[pos.x, pos.y, pos.z]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#a855f7" />
          </mesh>
        ))}
      </group>
    </group>
  );
}