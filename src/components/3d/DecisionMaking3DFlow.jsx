import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

function DecisionNode({ position, label, confidence, isActive }) {
  const ref = useRef();
  
  useFrame(() => {
    if (ref.current && isActive) {
      ref.current.rotation.y += 0.03;
    }
  });

  const color = confidence > 0.7 ? '#10b981' : confidence > 0.4 ? '#f59e0b' : '#ef4444';

  return (
    <group position={position} ref={ref}>
      <Box args={[1, 1, 1]}>
        <meshPhongMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.5}
          opacity={0.8}
          transparent
        />
      </Box>
      <Text position={[0, -1.2, 0]} fontSize={0.25} color="white">
        {label}
      </Text>
      <Text position={[0, -1.5, 0]} fontSize={0.2} color={color}>
        {(confidence * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

function DecisionFlow({ from, to }) {
  const points = [
    new THREE.Vector3(...from),
    new THREE.Vector3(
      (from[0] + to[0]) / 2,
      (from[1] + to[1]) / 2 + 0.5,
      (from[2] + to[2]) / 2
    ),
    new THREE.Vector3(...to)
  ];

  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.05, 8, false);

  return (
    <mesh geometry={tubeGeometry}>
      <meshBasicMaterial color="#00f5ff" opacity={0.6} transparent />
    </mesh>
  );
}

export default function DecisionMaking3DFlow({ decisions, flows }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-[500px] bg-gradient-to-br from-black/40 to-purple-900/20 rounded-xl border border-purple-500/30"
    >
      <Canvas camera={{ position: [0, 3, 8], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#a855f7" />

        {/* Decision Nodes */}
        {decisions.map((decision, idx) => (
          <DecisionNode
            key={idx}
            position={[
              (idx % 3 - 1) * 3,
              Math.floor(idx / 3) * 2 - 2,
              0
            ]}
            label={decision.label}
            confidence={decision.confidence}
            isActive={decision.isActive}
          />
        ))}

        {/* Decision Flows */}
        {flows.map((flow, idx) => (
          <DecisionFlow key={idx} from={flow.from} to={flow.to} />
        ))}

        <OrbitControls />
      </Canvas>
    </motion.div>
  );
}