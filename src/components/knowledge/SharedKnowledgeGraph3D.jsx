import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

function KnowledgeNode({ position, knowledge, index, onClick, onHover }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.008;
    }
  });

  const typeColors = {
    insight: '#10b981',
    solution: '#3b82f6',
    pattern: '#a855f7',
    discovery: '#f59e0b',
    warning: '#ef4444'
  };

  const color = typeColors[knowledge.knowledge_type] || '#6b7280';
  const size = 0.3 + (knowledge.relevance_score / 100) * 0.4;

  return (
    <group position={position}>
      <Sphere 
        ref={meshRef} 
        args={[size, 32, 32]}
        onClick={() => onClick(knowledge)}
        onPointerOver={() => {
          setHovered(true);
          onHover(knowledge);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover(null);
          document.body.style.cursor = 'default';
        }}
      >
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.9 : 0.6}
        />
      </Sphere>
      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-black/90 text-white p-3 rounded-lg text-xs max-w-xs backdrop-blur-md border border-white/20">
            <div className="font-bold mb-1">{knowledge.knowledge_type}</div>
            <div className="text-white/80 mb-2">{knowledge.content.substring(0, 100)}...</div>
            <div className="text-white/60">Relevance: {knowledge.relevance_score}%</div>
            <div className="text-white/60">Accessed: {knowledge.access_count || 0}x</div>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function SharedKnowledgeGraph3D({ knowledge, onNodeClick }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  const nodes = (knowledge || []).slice(0, 30).map((k, i) => {
    const angle = (i / 30) * Math.PI * 4;
    const radius = 3 + (i / 30) * 3;
    const height = Math.sin(angle) * 2;
    return {
      position: [Math.cos(angle) * radius, height, Math.sin(angle) * radius],
      knowledge: k,
      index: i
    };
  });

  return (
    <Canvas camera={{ position: [0, 5, 12], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#10b981" />

      <Sphere args={[1.2, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#ec4899"
          emissive="#ec4899"
          emissiveIntensity={0.8}
        />
      </Sphere>

      <Text position={[0, 4, 0]} fontSize={0.6} color="white" anchorX="center">
        Shared Knowledge Base
      </Text>
      <Text position={[0, 3.3, 0]} fontSize={0.3} color="#ec4899" anchorX="center">
        {knowledge?.length || 0} Knowledge Entries
      </Text>

      {nodes.map((node, i) => (
        <React.Fragment key={i}>
          <KnowledgeNode {...node} onClick={onNodeClick} onHover={setHoveredNode} />
          <Line
            points={[[0, 0, 0], node.position]}
            color="#6b7280"
            lineWidth={1}
            transparent
            opacity={0.2}
          />
        </React.Fragment>
      ))}

      <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.3} minDistance={8} maxDistance={25} />
    </Canvas>
  );
}