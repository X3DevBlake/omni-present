import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

function EcosystemScene() {
  const groupRef = useRef();
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    // Generate mock agent nodes
    const mockNodes = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 10,
      z: (Math.random() - 0.5) * 10,
      type: ['agent', 'service', 'data'][i % 3],
      active: Math.random() > 0.3
    }));
    setNodes(mockNodes);
  }, []);

  return (
    <group ref={groupRef}>
      <PerspectiveCamera makeDefault position={[0, 0, 15]} />
      <OrbitControls autoRotate autoRotateSpeed={2} />
      
      {/* Central hub */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={0.5} />
      </mesh>

      {/* Agent nodes */}
      {nodes.map(node => (
        <group key={node.id} position={[node.x, node.y, node.z]}>
          <mesh>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial 
              color={node.type === 'agent' ? '#a855f7' : node.type === 'service' ? '#06b6d4' : '#ec4899'}
              emissive={node.active ? (node.type === 'agent' ? '#a855f7' : '#06b6d4') : '#333333'}
              emissiveIntensity={node.active ? 0.8 : 0.2}
            />
          </mesh>
          {/* Connection lines to center */}
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([0, 0, 0, node.x, node.y, node.z])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color={node.active ? '#00f5ff' : '#333333'} linewidth={1} />
          </lineSegments>
        </group>
      ))}

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </group>
  );
}

export default function DynamicEcosystemVisualizer() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-screen bg-black"
    >
      <Canvas>
        <EcosystemScene />
      </Canvas>
      <div className="absolute bottom-6 left-6 text-white/60 text-sm">
        <p>Drag to rotate • Scroll to zoom • Real-time agent ecosystem</p>
      </div>
    </motion.div>
  );
}