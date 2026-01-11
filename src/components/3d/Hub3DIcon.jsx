import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Box, Torus, Octahedron } from '@react-three/drei';
import * as THREE from 'three';

function Icon3DModel({ type, color, isHovered }) {
  const ref = useRef();
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += isHovered ? 0.03 : 0.01;
      if (isHovered) {
        ref.current.rotation.x += 0.02;
      }
    }
  });

  const renderShape = () => {
    switch(type) {
      case 'galaxy':
        return (
          <group ref={ref}>
            <Sphere args={[1, 32, 32]}>
              <MeshDistortMaterial
                color={color}
                attach="material"
                distort={0.4}
                speed={2}
                roughness={0.2}
              />
            </Sphere>
            <Torus args={[1.5, 0.1, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </Torus>
          </group>
        );
      case 'brain':
        return (
          <Sphere args={[1, 32, 32]} ref={ref}>
            <MeshDistortMaterial
              color={color}
              distort={0.6}
              speed={3}
              roughness={0}
            />
          </Sphere>
        );
      case 'cube':
        return (
          <Box args={[1.5, 1.5, 1.5]} ref={ref}>
            <meshStandardMaterial 
              color={color} 
              emissive={color} 
              emissiveIntensity={0.3}
              wireframe={isHovered}
            />
          </Box>
        );
      case 'neural':
        return (
          <group ref={ref}>
            <Octahedron args={[1, 0]}>
              <meshStandardMaterial 
                color={color} 
                emissive={color} 
                emissiveIntensity={0.5}
                wireframe
              />
            </Octahedron>
            <Sphere args={[0.3, 16, 16]} position={[0, 0, 0]}>
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
            </Sphere>
          </group>
        );
      case 'blockchain':
        return (
          <group ref={ref}>
            {[0, 1, 2].map((i) => (
              <Box 
                key={i}
                args={[0.8, 0.8, 0.8]} 
                position={[(i - 1) * 1.2, 0, 0]}
              >
                <meshStandardMaterial 
                  color={color} 
                  emissive={color} 
                  emissiveIntensity={0.4}
                  transparent
                  opacity={0.8}
                />
              </Box>
            ))}
          </group>
        );
      case 'network':
        return (
          <group ref={ref}>
            <Sphere args={[0.5, 16, 16]} position={[0, 0, 0]}>
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
            </Sphere>
            {[0, 1, 2, 3, 4].map((i) => {
              const angle = (i / 5) * Math.PI * 2;
              return (
                <Sphere 
                  key={i}
                  args={[0.2, 8, 8]} 
                  position={[Math.cos(angle) * 1.5, Math.sin(angle) * 1.5, 0]}
                >
                  <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
                </Sphere>
              );
            })}
          </group>
        );
      default:
        return (
          <Sphere args={[1, 32, 32]} ref={ref}>
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
          </Sphere>
        );
    }
  };

  return (
    <Float speed={2} rotationIntensity={isHovered ? 1 : 0.5} floatIntensity={isHovered ? 1 : 0.5}>
      {renderShape()}
      {isHovered && <pointLight intensity={2} distance={5} color={color} />}
    </Float>
  );
}

export default function Hub3DIcon({ type = 'galaxy', color = '#00f5ff', isHovered = false, size = 80 }) {
  return (
    <div style={{ width: size, height: size }}>
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Icon3DModel type={type} color={color} isHovered={isHovered} />
      </Canvas>
    </div>
  );
}