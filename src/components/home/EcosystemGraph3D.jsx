import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

function EcosystemNode({ node, onClick }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      
      if (node.health_status === 'critical') {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
        meshRef.current.scale.setScalar(pulse);
      }
    }
  });

  const getGeometry = () => {
    switch (node.node_type) {
      case 'agent': return <icosahedronGeometry args={[node.visual_properties?.size || 0.5, 1]} />;
      case 'model': return <boxGeometry args={[node.visual_properties?.size || 0.5, node.visual_properties?.size || 0.5, node.visual_properties?.size || 0.5]} />;
      case 'pipeline': return <cylinderGeometry args={[0.3, 0.3, node.visual_properties?.size || 0.6, 8]} />;
      case 'security': return <octahedronGeometry args={[node.visual_properties?.size || 0.4, 0]} />;
      default: return <sphereGeometry args={[node.visual_properties?.size || 0.4, 16, 16]} />;
    }
  };

  return (
    <group position={[node.position_3d?.x || 0, node.position_3d?.y || 0, node.position_3d?.z || 0]}>
      <mesh ref={meshRef} onClick={onClick}>
        {getGeometry()}
        <meshStandardMaterial
          color={node.visual_properties?.color || '#ffffff'}
          emissive={node.visual_properties?.color || '#ffffff'}
          emissiveIntensity={node.visual_properties?.glow_intensity || 0.5}
          opacity={node.health_status === 'offline' ? 0.3 : 1}
          transparent
        />
      </mesh>
      
      <Text
        position={[0, (node.visual_properties?.size || 0.5) + 0.4, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
      >
        {node.label || node.node_type}
      </Text>

      <Html distanceFactor={10}>
        <div className="bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none">
          {node.health_status === 'healthy' && '✓ Healthy'}
          {node.health_status === 'warning' && '⚠ Warning'}
          {node.health_status === 'critical' && '🚨 Critical'}
          {node.health_status === 'offline' && '○ Offline'}
        </div>
      </Html>
    </group>
  );
}

function ConnectionLine({ edge, nodes }) {
  const sourceNode = nodes.find(n => n.node_id === edge.source);
  const targetNode = nodes.find(n => n.node_id === edge.target);

  if (!sourceNode || !targetNode) return null;

  const points = [
    new THREE.Vector3(sourceNode.position_3d?.x || 0, sourceNode.position_3d?.y || 0, sourceNode.position_3d?.z || 0),
    new THREE.Vector3(targetNode.position_3d?.x || 0, targetNode.position_3d?.y || 0, targetNode.position_3d?.z || 0)
  ];

  const getColor = () => {
    switch (edge.connection_type) {
      case 'data_flow': return '#00f5ff';
      case 'collaboration': return '#a855f7';
      case 'dependency': return '#ff8800';
      default: return '#ffffff';
    }
  };

  return (
    <Line
      points={points}
      color={getColor()}
      lineWidth={edge.strength * 2}
      opacity={edge.active ? 0.6 : 0.2}
      transparent
      dashed={!edge.active}
    />
  );
}

function ParticleField() {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 500; i++) {
      pts.push(new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      ));
    }
    return pts;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#00f5ff" opacity={0.3} transparent />
    </points>
  );
}

export default function EcosystemGraph3D({ graphData, onNodeClick }) {
  const { nodes = [], edges = [], metadata = {} } = graphData || {};

  return (
    <div className="w-full h-[700px] bg-black/20 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        <pointLight position={[0, 10, -10]} intensity={0.5} color="#00f5ff" />
        
        <ParticleField />

        {nodes.map((node, i) => (
          <EcosystemNode
            key={node.node_id || i}
            node={node}
            onClick={() => onNodeClick && onNodeClick(node)}
          />
        ))}

        {edges.map((edge, i) => (
          <ConnectionLine key={i} edge={edge} nodes={nodes} />
        ))}

        <Text position={[0, 8, 0]} fontSize={0.5} color="#00f5ff">
          Live Ecosystem Map
        </Text>
        
        <group position={[0, -8, 0]}>
          <Text fontSize={0.2} color="#44ff44">
            {metadata.total_nodes || 0} Nodes
          </Text>
          <Text position={[3, 0, 0]} fontSize={0.2} color="#00f5ff">
            {metadata.total_edges || 0} Connections
          </Text>
          <Text position={[-3, 0, 0]} fontSize={0.15} color="#ff4444">
            {metadata.health_summary?.critical || 0} Critical
          </Text>
        </group>
        
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={30}
        />
      </Canvas>
    </div>
  );
}