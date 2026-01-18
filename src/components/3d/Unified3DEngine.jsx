import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid, Sky } from '@react-three/drei';

export function Scene3D({ children, enablePostProcessing = true, cameraPosition = [0, 5, 10] }) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
      <PerspectiveCamera makeDefault position={cameraPosition} />
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />
      
      <Suspense fallback={null}>
        {children}
      </Suspense>
      
      <Grid args={[100, 100]} cellSize={1} cellThickness={0.5} cellColor="#6b7280" sectionSize={10} sectionThickness={1} sectionColor="#3b82f6" fadeDistance={50} fadeStrength={1} followCamera={false} infiniteGrid />
      <Environment preset="city" />
      <OrbitControls enableDamping dampingFactor={0.05} minDistance={2} maxDistance={100} />
    </Canvas>
  );
}

export function AnimatedNode({ position, color = '#00f5ff', label, onClick, intensity = 1 }) {
  const meshRef = useRef();
  const glowRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });
  
  return (
    <group position={position} onClick={onClick}>
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh ref={glowRef} scale={1.2}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
      {label && (
        <mesh position={[0, 1, 0]}>
          <planeGeometry args={[2, 0.5]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
}

export function DataFlowLine({ start, end, color = '#a855f7', animated = true }) {
  const lineRef = useRef();
  const particleRef = useRef();
  
  useFrame((state) => {
    if (animated && particleRef.current) {
      const progress = (Math.sin(state.clock.elapsedTime * 2) + 1) / 2;
      particleRef.current.position.lerpVectors(
        new THREE.Vector3(...start),
        new THREE.Vector3(...end),
        progress
      );
    }
  });
  
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  
  return (
    <>
      <line ref={lineRef} geometry={lineGeometry}>
        <lineBasicMaterial color={color} linewidth={2} transparent opacity={0.6} />
      </line>
      {animated && (
        <mesh ref={particleRef}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      )}
    </>
  );
}

export default Scene3D;