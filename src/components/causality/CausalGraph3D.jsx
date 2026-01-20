import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

function VariableNode({ position, node, onClick }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  const nodeColors = {
    'cause': '#10b981',
    'effect': '#ef4444',
    'confounder': '#f59e0b',
    'mediator': '#a855f7'
  };

  return (
    <group position={position} onClick={onClick}>
      <Sphere ref={meshRef} args={[0.5, 32, 32]}>
        <meshStandardMaterial 
          color={nodeColors[node.node_type] || '#60a5fa'}
          emissive={nodeColors[node.node_type] || '#60a5fa'}
          emissiveIntensity={0.5}
          metalness={0.7}
          roughness={0.3}
        />
      </Sphere>
      <Text position={[0, 0.9, 0]} fontSize={0.25} color="white" anchorX="center">
        {node.variable_name}
      </Text>
      <Text position={[0, 0.5, 0]} fontSize={0.18} color="#a0a0a0" anchorX="center">
        {node.node_type}
      </Text>
    </group>
  );
}

function CausalEdge({ start, end, strength, timeLag }) {
  const lineRef = useRef();
  const arrowRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      const opacity = 0.4 + Math.sin(state.clock.elapsedTime + strength * 10) * 0.2;
      lineRef.current.material.opacity = opacity;
    }
  });

  const strengthColor = new THREE.Color().lerpColors(
    new THREE.Color('#404040'),
    new THREE.Color('#10b981'),
    strength
  );

  const direction = new THREE.Vector3(...end).sub(new THREE.Vector3(...start));
  const midpoint = new THREE.Vector3(...start).add(direction.clone().multiplyScalar(0.7));

  return (
    <group>
      <Line
        ref={lineRef}
        points={[start, end]}
        color={strengthColor}
        lineWidth={strength * 4}
        transparent
        opacity={0.6}
      />
      <mesh position={midpoint.toArray()}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshStandardMaterial color={strengthColor} />
      </mesh>
      {timeLag > 0 && (
        <Html position={midpoint.toArray()}>
          <div style={{ 
            background: 'rgba(0,0,0,0.7)', 
            color: '#60a5fa', 
            padding: '2px 6px', 
            borderRadius: '4px',
            fontSize: '10px'
          }}>
            +{timeLag}t
          </div>
        </Html>
      )}
    </group>
  );
}

export default function CausalGraph3D({ graph, onNodeClick }) {
  const nodes = graph?.nodes || [];
  const edges = graph?.causal_edges || [];

  const nodePositions = nodes.map((node, i) => {
    const angle = (i / nodes.length) * Math.PI * 2;
    const radius = 6;
    const height = Math.sin(angle * 2) * 2;
    return {
      node,
      position: [Math.cos(angle) * radius, height, Math.sin(angle) * radius]
    };
  });

  const edgeData = edges.map(edge => {
    const startNode = nodePositions.find(n => n.node.node_id === edge.source);
    const endNode = nodePositions.find(n => n.node.node_id === edge.target);
    return startNode && endNode ? {
      start: startNode.position,
      end: endNode.position,
      strength: edge.strength || 0.5,
      timeLag: edge.time_lag || 0
    } : null;
  }).filter(Boolean);

  return (
    <Canvas camera={{ position: [0, 5, 18], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#10b981" />

      <Text position={[0, 8, 0]} fontSize={0.7} color="white" anchorX="center">
        Causal Graph
      </Text>
      <Text position={[0, 7.2, 0]} fontSize={0.3} color="#10b981" anchorX="center">
        {graph?.graph_name || 'System Causality'}
      </Text>
      <Text position={[0, 6.6, 0]} fontSize={0.25} color="#60a5fa" anchorX="center">
        {nodes.length} variables | {edges.length} relationships
      </Text>

      {/* Variable nodes */}
      {nodePositions.map((pos, i) => (
        <VariableNode key={i} {...pos} onClick={() => onNodeClick?.(pos.node)} />
      ))}

      {/* Causal edges */}
      {edgeData.map((edge, i) => (
        <CausalEdge key={i} {...edge} />
      ))}

      {/* Confounders indicator */}
      {graph?.confounders?.length > 0 && (
        <group position={[0, -6, 0]}>
          <Text fontSize={0.35} color="#f59e0b" anchorX="center">
            ⚠️ {graph.confounders.length} Confounders Detected
          </Text>
        </group>
      )}

      <OrbitControls 
        enableZoom={true}
        minDistance={12}
        maxDistance={35}
      />
    </Canvas>
  );
}