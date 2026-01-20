import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box, Line } from '@react-three/drei';

function DocumentNode({ position, index, retrieved }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.008;
    }
  });

  return (
    <Box ref={meshRef} args={[0.4, 0.6, 0.1]} position={position}>
      <meshStandardMaterial 
        color={retrieved ? '#10b981' : '#6b7280'}
        emissive={retrieved ? '#10b981' : '#6b7280'}
        emissiveIntensity={retrieved ? 0.6 : 0.2}
        transparent
        opacity={retrieved ? 1 : 0.4}
      />
    </Box>
  );
}

export default function RAG3D({ rag }) {
  const topK = rag?.top_k_documents || 5;
  const totalDocs = 20;

  const documents = Array.from({ length: totalDocs }, (_, i) => {
    const angle = (i / totalDocs) * Math.PI * 2;
    const radius = 5;
    return {
      position: [Math.cos(angle) * radius, (Math.random() - 0.5) * 2, Math.sin(angle) * radius],
      index: i,
      retrieved: i < topK
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
          emissiveIntensity={0.7}
        />
      </Sphere>

      <Text position={[0, 4, 0]} fontSize={0.6} color="white" anchorX="center">
        RAG System
      </Text>
      <Text position={[0, 3.3, 0]} fontSize={0.3} color="#ec4899" anchorX="center">
        {rag?.system_name || 'Retrieval-Augmented'}
      </Text>
      <Text position={[0, 2.8, 0]} fontSize={0.25} color="#10b981" anchorX="center">
        {rag?.retrieval_method || 'hybrid'} • {rag?.knowledge_base_size || 10000} docs
      </Text>

      {documents.map((doc, i) => (
        <DocumentNode key={i} {...doc} />
      ))}

      {documents.filter(d => d.retrieved).map((doc, i) => (
        <Line
          key={`line-${i}`}
          points={[[0, 0, 0], doc.position]}
          color="#10b981"
          lineWidth={2}
          transparent
          opacity={0.5}
        />
      ))}

      <group position={[0, -3.5, 0]}>
        <Text fontSize={0.35} color="#10b981" anchorX="center">
          Accuracy: {((rag?.generation_quality?.factual_accuracy || 0.91) * 100).toFixed(0)}%
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.3} color="#ec4899" anchorX="center">
          Recall@{topK}: {((rag?.retrieval_metrics?.recall_at_k || 0.87) * 100).toFixed(0)}%
        </Text>
        <Text position={[0, -1.2, 0]} fontSize={0.25} color="#60a5fa" anchorX="center">
          Grounded: {((rag?.generation_quality?.groundedness || 0.93) * 100).toFixed(0)}%
        </Text>
      </group>

      <OrbitControls enableZoom={true} minDistance={8} maxDistance={20} />
    </Canvas>
  );
}