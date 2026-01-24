import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { Network, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

const KnowledgeNode = ({ position, label, nodeType, connections }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      meshRef.current.scale.setScalar(0.8 + connections * 0.1 + pulse);
    }
  });
  
  const typeColors = {
    concept: '#8b5cf6',
    entity: '#3b82f6',
    relation: '#10b981',
    event: '#f59e0b'
  };
  
  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.2, 32, 32]}>
        <meshStandardMaterial
          color={typeColors[nodeType]}
          emissive={typeColors[nodeType]}
          emissiveIntensity={0.8 + connections * 0.2}
        />
      </Sphere>
      <Text position={[0, 0.4, 0]} fontSize={0.1} color="white" anchorX="center">
        {label}
      </Text>
    </group>
  );
};

const KnowledgeEdge = ({ from, to, relationStrength, animated }) => {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current && animated) {
      lineRef.current.material.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });
  
  return (
    <Line
      ref={lineRef}
      points={[new THREE.Vector3(...from), new THREE.Vector3(...to)]}
      color="#6ee7b7"
      lineWidth={1 + relationStrength * 2}
      transparent
      opacity={0.5}
    />
  );
};

export default function KnowledgeGraph3DBuilder() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [isBuilding, setIsBuilding] = useState(false);

  const buildGraph = () => {
    setIsBuilding(true);
    
    // Simulate knowledge graph construction
    const newNodes = [
      { id: 'n1', label: 'OML', type: 'concept', pos: [0, 2, 0], connections: 3 },
      { id: 'n2', label: 'Finance', type: 'entity', pos: [-2, 0, 0], connections: 2 },
      { id: 'n3', label: 'Neural', type: 'concept', pos: [2, 0, 0], connections: 2 },
      { id: 'n4', label: 'Aether', type: 'entity', pos: [0, -2, 0], connections: 2 },
      { id: 'n5', label: 'HAAS', type: 'concept', pos: [-1.5, 1, 0], connections: 3 },
      { id: 'n6', label: 'RedComm', type: 'entity', pos: [1.5, -1, 0], connections: 2 }
    ];
    
    const newEdges = [
      { from: [0, 2, 0], to: [-2, 0, 0], strength: 0.8 },
      { from: [0, 2, 0], to: [2, 0, 0], strength: 0.9 },
      { from: [-2, 0, 0], to: [0, -2, 0], strength: 0.6 },
      { from: [2, 0, 0], to: [0, -2, 0], strength: 0.7 },
      { from: [-1.5, 1, 0], to: [0, 2, 0], strength: 0.85 }
    ];
    
    setNodes(newNodes);
    setEdges(newEdges);
    setTimeout(() => setIsBuilding(false), 1000);
  };

  return (
    <Card className="bg-gradient-to-br from-teal-950/90 via-cyan-950/90 to-blue-950/90 backdrop-blur-xl border-teal-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Network className="w-7 h-7 text-teal-400" />
          Real-Time Knowledge Graph
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          Dynamic semantic relationships across Omega systems
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-teal-500/20">
          <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.8} color="#14b8a6" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />

            {nodes.map((node, idx) => (
              <KnowledgeNode
                key={node.id}
                position={node.pos}
                label={node.label}
                nodeType={node.type}
                connections={node.connections}
              />
            ))}

            {edges.map((edge, idx) => (
              <KnowledgeEdge
                key={idx}
                from={edge.from}
                to={edge.to}
                relationStrength={edge.strength}
                animated={true}
              />
            ))}

            <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
          </Canvas>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-black/60 rounded-lg p-3 border border-teal-500/30">
            <div className="text-teal-400 text-xs mb-1">Nodes</div>
            <div className="text-white text-2xl font-bold">{nodes.length}</div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-cyan-500/30">
            <div className="text-cyan-400 text-xs mb-1">Relations</div>
            <div className="text-white text-2xl font-bold">{edges.length}</div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-blue-500/30">
            <div className="text-blue-400 text-xs mb-1">Density</div>
            <div className="text-white text-2xl font-bold">
              {nodes.length > 0 ? (edges.length / nodes.length).toFixed(1) : 0}
            </div>
          </div>
        </div>

        <Button
          onClick={buildGraph}
          disabled={isBuilding}
          className="w-full bg-teal-600 hover:bg-teal-700"
        >
          <Brain className="w-4 h-4 mr-2" />
          {isBuilding ? 'Building Graph...' : 'Build Knowledge Graph'}
        </Button>
      </CardContent>
    </Card>
  );
}