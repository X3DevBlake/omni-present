import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function KnowledgeNode({ node, position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.008;
      if (node.access_count > 10) {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
        meshRef.current.scale.setScalar(pulse);
      }
    }
  });

  const getNodeColor = () => {
    switch (node.node_type) {
      case 'concept': return '#00f5ff';
      case 'entity': return '#a855f7';
      case 'fact': return '#44ff44';
      case 'rule': return '#ec4899';
      default: return '#3b82f6';
    }
  };

  const size = 0.15 + node.confidence * 0.2;

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={getNodeColor()}
          emissive={getNodeColor()}
          emissiveIntensity={node.confidence}
        />
      </mesh>
      <Text position={[0, -0.5, 0]} fontSize={0.08} color="white">
        {node.label}
      </Text>
    </group>
  );
}

function KnowledgeEdges({ edges, nodes }) {
  return (
    <>
      {edges?.map((edge, i) => {
        const fromNode = nodes?.find(n => n.node_id === edge.from_node);
        const toNode = nodes?.find(n => n.node_id === edge.to_node);
        
        if (!fromNode || !toNode) return null;
        
        const fromIndex = nodes.indexOf(fromNode);
        const toIndex = nodes.indexOf(toNode);
        
        const angle1 = (fromIndex / nodes.length) * Math.PI * 2;
        const angle2 = (toIndex / nodes.length) * Math.PI * 2;
        const radius = 3;
        
        const points = [
          new THREE.Vector3(Math.cos(angle1) * radius, Math.sin(angle1) * radius, 0),
          new THREE.Vector3(Math.cos(angle2) * radius, Math.sin(angle2) * radius, 0)
        ];
        
        return (
          <Line
            key={i}
            points={points}
            color="#ffffff"
            lineWidth={edge.strength * 3}
            opacity={edge.strength * 0.7}
            transparent
          />
        );
      })}
    </>
  );
}

function CentralCore({ evolution }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return evolution?.enabled ? (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[0.8, 2]} />
      <meshStandardMaterial
        color="#a855f7"
        emissive="#a855f7"
        emissiveIntensity={0.5}
        wireframe
      />
    </mesh>
  ) : null;
}

export default function SharedKnowledgeGraph3D({ graph }) {
  return (
    <div className="w-full h-[700px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 2, 12], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        
        {graph && (
          <>
            <Text position={[0, 5, 0]} fontSize={0.4} color="#00f5ff">
              {graph.graph_name}
            </Text>
            <Text position={[0, 4.3, 0]} fontSize={0.2} color="#ffffff">
              {graph.domain.replace('_', ' ').toUpperCase()}
            </Text>
            <Text position={[0, 3.8, 0]} fontSize={0.18} color="#a855f7">
              {graph.graph_metrics?.total_nodes} Nodes | {graph.graph_metrics?.total_edges} Edges
            </Text>

            <CentralCore evolution={graph.auto_evolution} />
            <KnowledgeEdges edges={graph.edges} nodes={graph.nodes} />

            {graph.nodes?.slice(0, 30).map((node, i) => {
              const angle = (i / Math.min(graph.nodes.length, 30)) * Math.PI * 2;
              const radius = 3;
              
              return (
                <KnowledgeNode
                  key={i}
                  node={node}
                  position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
                />
              );
            })}

            <group position={[0, -4, 0]}>
              <Text fontSize={0.15} color="#44ff44">
                Density: {(graph.graph_metrics?.graph_density * 100).toFixed(1)}%
              </Text>
              <Text position={[0, -0.4, 0]} fontSize={0.15} color="#00f5ff">
                Contributors: {graph.contributors?.length}
              </Text>
            </group>
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}