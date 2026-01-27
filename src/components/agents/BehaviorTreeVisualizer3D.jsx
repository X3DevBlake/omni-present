import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

function TreeNode({ position, type, label, active }) {
  const mesh = useRef();
  
  useFrame((state) => {
    if (active && mesh.current) {
        mesh.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
    }
  });

  const color = active ? "#00ff00" : (type === 'action' ? "#ff00ff" : "#00ffff");

  return (
    <group position={position}>
      <mesh ref={mesh}>
        <boxGeometry args={[1.5, 0.8, 0.2]} />
        <meshStandardMaterial color={color} opacity={0.8} transparent />
      </mesh>
      <Text position={[0, 0, 0.15]} fontSize={0.3} color="white">
        {label}
      </Text>
    </group>
  );
}

function Connection({ start, end }) {
    const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
    return <Line points={points} color="white" lineWidth={1} opacity={0.3} transparent />;
}

export default function BehaviorTreeVisualizer3D({ treeData }) {
  // Mock tree structure if none provided
  const nodes = treeData?.nodes || [
    { id: "root", position: [0, 2, 0], type: "selector", label: "Root Selector", active: true },
    { id: "seq1", position: [-2, 0, 0], type: "sequence", label: "Patrol Seq", active: false },
    { id: "act1", position: [-3, -2, 0], type: "action", label: "Move To A", active: false },
    { id: "act2", position: [-1, -2, 0], type: "action", label: "Scan Area", active: false },
    { id: "sel2", position: [2, 0, 0], type: "selector", label: "Combat Sel", active: false },
    { id: "cond1", position: [1, -2, 0], type: "condition", label: "Enemy Visible?", active: false },
    { id: "act3", position: [3, -2, 0], type: "action", label: "Attack", active: false }
  ];

  const connections = [
      { start: [0, 2, 0], end: [-2, 0, 0] },
      { start: [0, 2, 0], end: [2, 0, 0] },
      { start: [-2, 0, 0], end: [-3, -2, 0] },
      { start: [-2, 0, 0], end: [-1, -2, 0] },
      { start: [2, 0, 0], end: [1, -2, 0] },
      { start: [2, 0, 0], end: [3, -2, 0] },
  ];

  return (
    <div className="w-full h-full bg-black rounded-xl overflow-hidden border border-white/10">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls enableZoom={true} />
        
        {nodes.map(node => (
            <TreeNode key={node.id} {...node} />
        ))}
        {connections.map((conn, i) => (
            <Connection key={i} {...conn} />
        ))}
      </Canvas>
      <div className="absolute top-4 left-4 text-white/50 text-xs font-mono pointer-events-none">
        BEHAVIOR TREE SIMULATION // ACTIVE
      </div>
    </div>
  );
}