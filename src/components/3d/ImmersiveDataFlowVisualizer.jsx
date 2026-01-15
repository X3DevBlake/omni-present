import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function DataFlowNode({ position, color, label, isActive }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.5, 32, 32]}>
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={isActive ? 0.5 : 0.2} 
        />
      </Sphere>
      {isActive && (
        <pointLight color={color} intensity={2} distance={5} />
      )}
    </group>
  );
}

function AnimatedDataFlow({ start, end, color }) {
  const [progress, setProgress] = React.useState(0);
  const particleRef = useRef();
  
  useFrame(() => {
    setProgress((prev) => (prev + 0.01) % 1);
  });

  const points = React.useMemo(() => [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end)
  ], [start, end]);

  const particlePosition = React.useMemo(() => {
    const pos = new THREE.Vector3();
    return pos.lerpVectors(points[0], points[1], progress);
  }, [points, progress]);

  return (
    <>
      <Line points={points} color={color} lineWidth={2} opacity={0.6} transparent />
      <Sphere ref={particleRef} args={[0.1, 16, 16]} position={particlePosition}>
        <meshBasicMaterial color={color} />
      </Sphere>
    </>
  );
}

export default function ImmersiveDataFlowVisualizer({ width = "100%", height = "400px" }) {
  const nodes = [
    { position: [-4, 0, 0], color: "#3b82f6", label: "Data Input", isActive: true },
    { position: [-2, 2, 0], color: "#8b5cf6", label: "Processing", isActive: true },
    { position: [0, 0, 0], color: "#ec4899", label: "AI Analysis", isActive: true },
    { position: [2, 2, 0], color: "#f59e0b", label: "Transformation", isActive: false },
    { position: [4, 0, 0], color: "#10b981", label: "Output", isActive: true }
  ];

  const flows = [
    { start: [-4, 0, 0], end: [-2, 2, 0], color: "#3b82f6" },
    { start: [-2, 2, 0], end: [0, 0, 0], color: "#8b5cf6" },
    { start: [0, 0, 0], end: [2, 2, 0], color: "#ec4899" },
    { start: [2, 2, 0], end: [4, 0, 0], color: "#f59e0b" }
  ];

  return (
    <div style={{ width, height }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }} gl={{ preserveDrawingBuffer: true }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {nodes.map((node, idx) => (
          <DataFlowNode key={`node-${idx}`} {...node} />
        ))}
        
        {flows.map((flow, idx) => (
          <AnimatedDataFlow key={`flow-${idx}`} {...flow} />
        ))}
        
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} enablePan={false} />
      </Canvas>
    </div>
  );
}