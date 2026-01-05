import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function HolographicAIAgent({ agent, position = [0, 0, 0], scale = 1, isMoving = false, targetPosition }) {
  const groupRef = useRef();
  const [isInteracting, setIsInteracting] = useState(false);
  const [currentPos, setCurrentPos] = useState(position);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Gentle floating animation
      const baseY = currentPos[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      
      // Move towards target position if moving
      if (isMoving && targetPosition) {
        const targetVec = new THREE.Vector3(...targetPosition);
        const currentVec = new THREE.Vector3(currentPos[0], currentPos[1], currentPos[2]);
        const direction = targetVec.clone().sub(currentVec);
        const distance = direction.length();
        
        if (distance > 0.1) {
          direction.normalize().multiplyScalar(delta * 2);
          const newPos = [
            currentPos[0] + direction.x,
            currentPos[1] + direction.y,
            currentPos[2] + direction.z
          ];
          setCurrentPos(newPos);
          groupRef.current.position.set(newPos[0], baseY, newPos[2]);
          
          // Face movement direction
          const angle = Math.atan2(direction.x, direction.z);
          groupRef.current.rotation.y = angle;
        }
      } else {
        groupRef.current.position.y = baseY;
        
        // Rotate slowly if interacting
        if (isInteracting) {
          groupRef.current.rotation.y += 0.01;
        }
      }
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Holographic body */}
      <mesh
        onPointerOver={() => setIsInteracting(true)}
        onPointerOut={() => setIsInteracting(false)}
      >
        <cylinderGeometry args={[0.3, 0.4, 1.5, 32]} />
        <meshStandardMaterial
          color={agent.color || '#00f5ff'}
          transparent
          opacity={0.6}
          emissive={agent.color || '#00f5ff'}
          emissiveIntensity={isInteracting ? 0.8 : 0.4}
          wireframe={false}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial
          color={agent.color || '#00f5ff'}
          transparent
          opacity={0.7}
          emissive={agent.color || '#00f5ff'}
          emissiveIntensity={isInteracting ? 1 : 0.5}
        />
      </mesh>

      {/* Holographic effect rings */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, -0.75 + i * 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.45 + i * 0.1, 0.5 + i * 0.1, 32]} />
          <meshBasicMaterial
            color={agent.color || '#00f5ff'}
            transparent
            opacity={0.3 - i * 0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Data particles around agent */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 0.7;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle + Date.now() * 0.001) * radius,
              Math.sin(Date.now() * 0.002 + i) * 0.5,
              Math.sin(angle + Date.now() * 0.001) * radius
            ]}
          >
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color={agent.color || '#00f5ff'} />
          </mesh>
        );
      })}

      {/* Agent name label */}
      {agent.name && (
        <mesh position={[0, 1.5, 0]}>
          <planeGeometry args={[1, 0.2]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
}