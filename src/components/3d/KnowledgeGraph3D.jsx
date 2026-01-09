import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

function KnowledgeNode({ position, data, onClick, selected }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && !selected) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={() => onClick(data)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={selected ? 1.5 : hovered ? 1.2 : 1}
      >
        <icosahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color={selected ? '#00f5ff' : data.color}
          emissive={data.color}
          emissiveIntensity={selected ? 1 : hovered ? 0.8 : 0.4}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {data.label}
      </Text>
    </group>
  );
}

function ConnectionLine({ start, end, active }) {
  return (
    <Line
      points={[start, end]}
      color={active ? '#00f5ff' : '#a855f7'}
      lineWidth={active ? 2 : 1}
      opacity={active ? 0.8 : 0.3}
    />
  );
}

export default function KnowledgeGraph3D() {
  const [nodes] = useState([
    { id: 1, label: 'AI Models', category: 'core', color: '#00f5ff', connections: [2, 3, 4] },
    { id: 2, label: 'Training Data', category: 'data', color: '#a855f7', connections: [1, 5] },
    { id: 3, label: 'Algorithms', category: 'core', color: '#ec4899', connections: [1, 4, 6] },
    { id: 4, label: 'Neural Networks', category: 'core', color: '#10b981', connections: [1, 3] },
    { id: 5, label: 'Datasets', category: 'data', color: '#f59e0b', connections: [2, 7] },
    { id: 6, label: 'Deep Learning', category: 'core', color: '#3b82f6', connections: [3, 8] },
    { id: 7, label: 'Data Processing', category: 'data', color: '#ef4444', connections: [5] },
    { id: 8, label: 'Optimization', category: 'methods', color: '#14b8a6', connections: [6, 3] }
  ]);

  const [selectedNode, setSelectedNode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate positions in 3D space
  const getNodePosition = (index, total) => {
    const radius = 4;
    const angle = (index / total) * Math.PI * 2;
    const height = Math.sin(angle * 2) * 2;
    return [
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    ];
  };

  const filteredNodes = nodes.filter(node =>
    node.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-lg">3D Knowledge Graph</h3>
          <input
            type="text"
            placeholder="Search knowledge..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm w-64"
          />
        </div>

        {/* 3D Canvas */}
        <div className="h-[600px] rounded-xl overflow-hidden bg-black/20">
          <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f5ff" />

            {/* Render nodes */}
            {filteredNodes.map((node, index) => (
              <KnowledgeNode
                key={node.id}
                position={getNodePosition(index, filteredNodes.length)}
                data={node}
                onClick={setSelectedNode}
                selected={selectedNode?.id === node.id}
              />
            ))}

            {/* Render connections */}
            {filteredNodes.map((node, index) => {
              const nodePos = getNodePosition(index, filteredNodes.length);
              return node.connections.map(connId => {
                const connNode = filteredNodes.find(n => n.id === connId);
                if (!connNode) return null;
                const connIndex = filteredNodes.findIndex(n => n.id === connId);
                const connPos = getNodePosition(connIndex, filteredNodes.length);
                const active = selectedNode?.id === node.id || selectedNode?.id === connId;
                return (
                  <ConnectionLine
                    key={`${node.id}-${connId}`}
                    start={nodePos}
                    end={connPos}
                    active={active}
                  />
                );
              });
            })}

            <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
          </Canvas>
        </div>

        {/* Selected Node Info */}
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg"
          >
            <h4 className="text-white font-bold mb-2">{selectedNode.label}</h4>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-white/60">Category:</span>
                <span className="text-white ml-2">{selectedNode.category}</span>
              </div>
              <div>
                <span className="text-white/60">Connections:</span>
                <span className="text-white ml-2">{selectedNode.connections.length}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Legend */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-[#00f5ff]" />
              <p className="text-white/70 text-xs">Core Concepts</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-[#a855f7]" />
              <p className="text-white/70 text-xs">Data Related</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-[#ec4899]" />
              <p className="text-white/70 text-xs">Methods</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}