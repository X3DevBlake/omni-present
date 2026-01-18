import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls, Sphere, RoundedBox } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Users, TrendingUp, Zap, Settings, Database, Brain, Shield } from 'lucide-react';

function NavigationNode({ position, label, icon, pageName, color, onHover }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();
  const navigate = useNavigate();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      if (hovered) {
        meshRef.current.scale.lerp({ x: 1.2, y: 1.2, z: 1.2 }, 0.1);
      } else {
        meshRef.current.scale.lerp({ x: 1, y: 1, z: 1 }, 0.1);
      }
    }
  });
  
  return (
    <group position={position}>
      <RoundedBox
        ref={meshRef}
        args={[2, 2, 2]}
        radius={0.2}
        onPointerOver={() => { setHovered(true); onHover(label); }}
        onPointerOut={() => setHovered(false)}
        onClick={() => navigate(createPageUrl(pageName))}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 1.5 : 0.5}
          metalness={0.9}
          roughness={0.1}
        />
      </RoundedBox>
      
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
      
      {hovered && (
        <Sphere args={[2.5, 32, 32]} position={[0, 0, 0]}>
          <meshBasicMaterial color={color} transparent opacity={0.1} wireframe />
        </Sphere>
      )}
    </group>
  );
}

function ConnectionLine({ start, end }) {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  
  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color="#3b82f6" linewidth={1} transparent opacity={0.3} />
    </line>
  );
}

export default function ImmersiveNavigationHub() {
  const [hoveredNode, setHoveredNode] = useState('');
  
  const navigationNodes = [
    { label: 'Home', icon: Home, pageName: 'Home', color: '#6366f1', position: [0, 0, 0] },
    { label: 'Agents', icon: Users, pageName: 'AgentManagementHub', color: '#8b5cf6', position: [5, 2, 0] },
    { label: 'DeFi', icon: TrendingUp, pageName: 'EnhancedDeFiHub', color: '#10b981', position: [5, -2, 0] },
    { label: 'Simulation', icon: Zap, pageName: 'SimulationLab', color: '#f59e0b', position: [-5, 2, 0] },
    { label: 'Analytics', icon: Database, pageName: 'AIAnalyticsHub', color: '#06b6d4', position: [-5, -2, 0] },
    { label: 'AI Lab', icon: Brain, pageName: 'AILab', color: '#ec4899', position: [0, 4, -3] },
    { label: 'Governance', icon: Shield, pageName: 'AgentGovernance', color: '#14b8a6', position: [0, -4, -3] }
  ];
  
  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        
        {navigationNodes.map((node, i) => (
          <NavigationNode
            key={i}
            position={node.position}
            label={node.label}
            icon={node.icon}
            pageName={node.pageName}
            color={node.color}
            onHover={setHoveredNode}
          />
        ))}
        
        {navigationNodes.map((node, i) => 
          navigationNodes.slice(i + 1).map((targetNode, j) => (
            <ConnectionLine
              key={`${i}-${j}`}
              start={node.position}
              end={targetNode.position}
            />
          ))
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full"
      >
        <p className="text-white text-sm">
          {hoveredNode ? `Navigate to ${hoveredNode}` : 'Hover over nodes to explore'}
        </p>
      </motion.div>
    </div>
  );
}