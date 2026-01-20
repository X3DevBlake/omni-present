import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

function TreeNode({ node, onClick }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && node.state === 'running') {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
    }
  });

  const getColor = () => {
    switch (node.state) {
      case 'success': return '#00ff00';
      case 'failure': return '#ff0000';
      case 'running': return '#ffaa00';
      default: return '#0088ff';
    }
  };

  const getShape = () => {
    switch (node.node_type) {
      case 'sequence': return <boxGeometry args={[0.5, 0.5, 0.5]} />;
      case 'selector': return <coneGeometry args={[0.3, 0.6, 8]} />;
      case 'parallel': return <cylinderGeometry args={[0.25, 0.25, 0.5]} />;
      case 'condition': return <octahedronGeometry args={[0.3]} />;
      case 'action': return <sphereGeometry args={[0.3]} />;
      default: return <dodecahedronGeometry args={[0.3]} />;
    }
  };

  return (
    <group position={[node.position.x, node.position.y, node.position.z]}>
      <mesh
        ref={meshRef}
        onClick={() => onClick?.(node)}
      >
        {getShape()}
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={0.4}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
      >
        {node.label}
      </Text>
      {node.execution_count > 0 && (
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.12}
          color="#00f5ff"
          anchorX="center"
        >
          {node.execution_count}x
        </Text>
      )}
    </group>
  );
}

function TreeConnections({ nodes }) {
  return (
    <>
      {nodes?.map((node, i) => {
        if (!node.children || node.children.length === 0) return null;
        
        return node.children.map((childId, j) => {
          const childNode = nodes.find(n => n.node_id === childId);
          if (!childNode) return null;
          
          const points = [
            new THREE.Vector3(node.position.x, node.position.y, node.position.z),
            new THREE.Vector3(childNode.position.x, childNode.position.y, childNode.position.z)
          ];
          
          return (
            <Line
              key={`${i}-${j}`}
              points={points}
              color="#ffffff"
              lineWidth={2}
              opacity={0.5}
              transparent
            />
          );
        });
      })}
    </>
  );
}

export default function BehaviorTreeVisualizer3D({ tree, onNodeClick }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        
        {tree && (
          <>
            <group>
              <Text position={[0, 4, 0]} fontSize={0.4} color="#00f5ff">
                {tree.tree_name}
              </Text>
              <Text position={[0, 3.4, 0]} fontSize={0.2} color="#ffffff">
                {tree.nodes?.length} nodes | {tree.is_active ? 'Active' : 'Inactive'}
              </Text>
            </group>
            
            <TreeConnections nodes={tree.nodes} />
            
            {tree.nodes?.map((node, i) => (
              <TreeNode key={i} node={node} onClick={onNodeClick} />
            ))}
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
        <gridHelper args={[20, 20, '#444444', '#222222']} />
      </Canvas>
    </div>
  );
}