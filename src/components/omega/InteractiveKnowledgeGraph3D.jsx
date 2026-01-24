import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Html } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { Network, Search, Plus, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InteractiveNode = ({ position, data, onClick, isSelected, connections }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      const scale = 0.25 + connections * 0.05 + (isSelected ? 0.15 : 0) + (hovered ? 0.1 : 0);
      meshRef.current.scale.setScalar(scale);
    }
  });
  
  const typeColors = {
    concept: '#8b5cf6',
    entity: '#3b82f6',
    relation: '#10b981',
    agent: '#f59e0b',
    data: '#ec4899'
  };
  
  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[0.25, 32, 32]}
        onClick={() => onClick(data)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={typeColors[data.type]}
          emissive={typeColors[data.type]}
          emissiveIntensity={isSelected ? 1.5 : hovered ? 1.0 : 0.6}
        />
      </Sphere>
      <Text position={[0, 0.5, 0]} fontSize={0.12} color="white" anchorX="center">
        {data.label}
      </Text>
      {isSelected && (
        <Html position={[0, -0.5, 0]} center>
          <div className="bg-black/90 rounded-lg p-2 border border-purple-500/50 text-xs text-white min-w-32">
            <div className="font-bold mb-1">{data.label}</div>
            <div className="text-gray-400">Type: {data.type}</div>
            <div className="text-gray-400">Connections: {connections}</div>
          </div>
        </Html>
      )}
    </group>
  );
};

const DynamicEdge = ({ from, to, strength, label }) => {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.3 + strength * 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });
  
  return (
    <>
      <Line
        ref={lineRef}
        points={[new THREE.Vector3(...from), new THREE.Vector3(...to)]}
        color="#6ee7b7"
        lineWidth={1 + strength * 2}
        transparent
        opacity={0.5}
      />
      {label && (
        <Text
          position={[
            (from[0] + to[0]) / 2,
            (from[1] + to[1]) / 2 + 0.3,
            (from[2] + to[2]) / 2
          ]}
          fontSize={0.08}
          color="#6ee7b7"
          anchorX="center"
        >
          {label}
        </Text>
      )}
    </>
  );
};

export default function InteractiveKnowledgeGraph3D() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);

  const buildGraph = () => {
    setIsBuilding(true);
    
    const newNodes = [
      { id: 'n1', label: 'OML', type: 'concept', pos: [0, 2, 0] },
      { id: 'n2', label: 'Finance', type: 'entity', pos: [-2, 1, 0] },
      { id: 'n3', label: 'Neural', type: 'concept', pos: [2, 1, 0] },
      { id: 'n4', label: 'Aether', type: 'entity', pos: [-2, -1, 0] },
      { id: 'n5', label: 'HAAS', type: 'agent', pos: [2, -1, 0] },
      { id: 'n6', label: 'RedComm', type: 'data', pos: [0, -2, 0] },
      { id: 'n7', label: 'InfoNCE', type: 'concept', pos: [0, 0, 1] },
      { id: 'n8', label: 'GWT', type: 'relation', pos: [1, 0, -1] }
    ];
    
    const newEdges = [
      { from: [0, 2, 0], to: [-2, 1, 0], strength: 0.9, label: 'monetizes' },
      { from: [0, 2, 0], to: [2, 1, 0], strength: 0.85, label: 'integrates' },
      { from: [-2, 1, 0], to: [-2, -1, 0], strength: 0.7, label: 'visualizes' },
      { from: [2, 1, 0], to: [2, -1, 0], strength: 0.8, label: 'controls' },
      { from: [2, -1, 0], to: [0, -2, 0], strength: 0.75, label: 'communicates' },
      { from: [0, 0, 1], to: [2, 1, 0], strength: 0.95, label: 'aligns' },
      { from: [1, 0, -1], to: [2, -1, 0], strength: 0.88, label: 'broadcasts' }
    ];
    
    setNodes(newNodes);
    setEdges(newEdges);
    setTimeout(() => setIsBuilding(false), 1000);
  };

  const addNode = () => {
    if (!searchQuery) return;
    
    const newNode = {
      id: `n${nodes.length + 1}`,
      label: searchQuery,
      type: 'concept',
      pos: [
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 2
      ]
    };
    
    setNodes([...nodes, newNode]);
    
    if (selectedNode) {
      setEdges([...edges, {
        from: selectedNode.pos,
        to: newNode.pos,
        strength: 0.7,
        label: 'relates'
      }]);
    }
    
    setSearchQuery('');
  };

  const filteredNodes = searchQuery ? 
    nodes.filter(n => n.label.toLowerCase().includes(searchQuery.toLowerCase())) : 
    nodes;

  const getNodeConnections = (nodeId) => {
    return edges.filter(e => 
      nodes.some(n => n.id === nodeId && 
        (n.pos[0] === e.from[0] && n.pos[1] === e.from[1] || 
         n.pos[0] === e.to[0] && n.pos[1] === e.to[1]))
    ).length;
  };

  return (
    <Card className="bg-gradient-to-br from-teal-950/90 via-cyan-950/90 to-sky-950/90 backdrop-blur-xl border-teal-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Network className="w-7 h-7 text-teal-400" />
          Interactive Knowledge Graph
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or add node..."
            className="bg-black/60 border-teal-500/30 text-white"
            onKeyPress={(e) => e.key === 'Enter' && addNode()}
          />
          <Button onClick={addNode} size="icon" className="bg-teal-600">
            <Plus className="w-4 h-4" />
          </Button>
          <Button onClick={buildGraph} size="icon" className="bg-cyan-600">
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        <div className="h-[500px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-teal-500/20">
          <Canvas camera={{ position: [0, 0, 7], fov: 60 }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#14b8a6" />
            <pointLight position={[-10, -10, -10]} intensity={0.6} color="#06b6d4" />

            {filteredNodes.map((node) => (
              <InteractiveNode
                key={node.id}
                position={node.pos}
                data={node}
                onClick={setSelectedNode}
                isSelected={selectedNode?.id === node.id}
                connections={getNodeConnections(node.id)}
              />
            ))}

            {edges.map((edge, idx) => (
              <DynamicEdge
                key={idx}
                from={edge.from}
                to={edge.to}
                strength={edge.strength}
                label={edge.label}
              />
            ))}

            <OrbitControls enableZoom enablePan />
          </Canvas>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div className="bg-black/60 rounded p-2 border border-teal-500/30">
            <div className="text-teal-400 text-[10px]">Nodes</div>
            <div className="text-white font-bold">{nodes.length}</div>
          </div>
          <div className="bg-black/60 rounded p-2 border border-cyan-500/30">
            <div className="text-cyan-400 text-[10px]">Edges</div>
            <div className="text-white font-bold">{edges.length}</div>
          </div>
          <div className="bg-black/60 rounded p-2 border border-blue-500/30">
            <div className="text-blue-400 text-[10px]">Density</div>
            <div className="text-white font-bold">
              {nodes.length > 0 ? (edges.length / nodes.length).toFixed(1) : 0}
            </div>
          </div>
          <div className="bg-black/60 rounded p-2 border border-green-500/30">
            <div className="text-green-400 text-[10px]">Selected</div>
            <div className="text-white font-bold">{selectedNode ? '1' : '0'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}