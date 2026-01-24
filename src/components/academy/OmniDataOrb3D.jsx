import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html, Sphere, Line } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, FlaskConical, Award } from 'lucide-react';
import * as THREE from 'three';

const DataNode = ({ position, data, onClick, isHighlighted, category }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  const categoryColors = {
    course: '#3b82f6',
    article: '#10b981',
    research: '#f59e0b',
    certification: '#8b5cf6'
  };

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const scale = isHighlighted ? 1.5 : hovered ? 1.2 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[0.3, 32, 32]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={categoryColors[category] || '#ffffff'}
          emissive={categoryColors[category] || '#ffffff'}
          emissiveIntensity={isHighlighted ? 0.8 : hovered ? 0.5 : 0.2}
          transparent
          opacity={isHighlighted ? 1 : 0.8}
        />
      </Sphere>
      
      {(hovered || isHighlighted) && (
        <Html distanceFactor={10}>
          <div className="bg-black/80 backdrop-blur-lg text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap">
            <div className="font-semibold">{data.title}</div>
            <div className="text-xs text-gray-300">{category}</div>
          </div>
        </Html>
      )}
    </group>
  );
};

const ConnectionLine = ({ start, end, active }) => {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  
  return (
    <Line
      points={points}
      color={active ? '#3b82f6' : '#4b5563'}
      lineWidth={active ? 2 : 1}
      transparent
      opacity={active ? 0.6 : 0.2}
    />
  );
};

const OrbScene = ({ data, selectedNode, onNodeClick, filter }) => {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  const filteredData = data.filter(item => 
    !filter || item.category === filter || filter === 'all'
  );

  const positions = filteredData.map((_, index) => {
    const phi = Math.acos(-1 + (2 * index) / filteredData.length);
    const theta = Math.sqrt(filteredData.length * Math.PI) * phi;
    const radius = 8;
    
    return [
      radius * Math.cos(theta) * Math.sin(phi),
      radius * Math.sin(theta) * Math.sin(phi),
      radius * Math.cos(phi)
    ];
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />

      {/* Central core */}
      <Sphere args={[1, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
          wireframe
        />
      </Sphere>

      {/* Data nodes */}
      {filteredData.map((item, index) => (
        <DataNode
          key={item.id}
          position={positions[index]}
          data={item}
          category={item.category}
          onClick={() => onNodeClick(item)}
          isHighlighted={selectedNode?.id === item.id}
        />
      ))}

      {/* Connections */}
      {filteredData.map((item, i) => {
        if (item.related_ids && selectedNode?.id === item.id) {
          return item.related_ids.slice(0, 5).map((relatedId, j) => {
            const relatedIndex = filteredData.findIndex(d => d.id === relatedId);
            if (relatedIndex !== -1) {
              return (
                <ConnectionLine
                  key={`${i}-${j}`}
                  start={positions[i]}
                  end={positions[relatedIndex]}
                  active={true}
                />
              );
            }
            return null;
          });
        }
        return null;
      })}

      <OrbitControls enableZoom enablePan enableRotate />
    </group>
  );
};

export default function OmniDataOrb3D() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list(),
    initialData: []
  });

  const { data: articles = [] } = useQuery({
    queryKey: ['documentation'],
    queryFn: () => base44.entities.DocumentationArticle.list(),
    initialData: []
  });

  const { data: research = [] } = useQuery({
    queryKey: ['research'],
    queryFn: () => base44.entities.ResearchProject.list(),
    initialData: []
  });

  const { data: certifications = [] } = useQuery({
    queryKey: ['certifications'],
    queryFn: () => base44.entities.Certification.list(),
    initialData: []
  });

  const allData = [
    ...courses.map(c => ({ ...c, category: 'course', title: c.title })),
    ...articles.map(a => ({ ...a, category: 'article', title: a.title })),
    ...research.map(r => ({ ...r, category: 'research', title: r.title })),
    ...certifications.map(c => ({ ...c, category: 'certification', title: c.title }))
  ].filter(item => 
    !searchQuery || item.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    courses: courses.length,
    articles: articles.length,
    research: research.length,
    certifications: certifications.length
  };

  return (
    <div className="w-full h-screen relative bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 left-6 right-6 z-10"
      >
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search across all academy content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/40 backdrop-blur-xl border-white/20 text-white"
            />
          </div>
          
          <div className="flex gap-2">
            <Badge
              variant={filter === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFilter('all')}
            >
              All ({allData.length})
            </Badge>
            <Badge
              variant={filter === 'course' ? 'default' : 'outline'}
              className="cursor-pointer bg-blue-500/20"
              onClick={() => setFilter('course')}
            >
              <BookOpen className="w-3 h-3 mr-1" />
              Courses ({stats.courses})
            </Badge>
            <Badge
              variant={filter === 'research' ? 'default' : 'outline'}
              className="cursor-pointer bg-amber-500/20"
              onClick={() => setFilter('research')}
            >
              <FlaskConical className="w-3 h-3 mr-1" />
              Research ({stats.research})
            </Badge>
            <Badge
              variant={filter === 'certification' ? 'default' : 'outline'}
              className="cursor-pointer bg-purple-500/20"
              onClick={() => setFilter('certification')}
            >
              <Award className="w-3 h-3 mr-1" />
              Certifications ({stats.certifications})
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* 3D Orb */}
      <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
        <OrbScene
          data={allData}
          selectedNode={selectedNode}
          onNodeClick={setSelectedNode}
          filter={filter}
        />
      </Canvas>

      {/* Selected Node Details */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute bottom-6 right-6 w-96 z-10"
        >
          <Card className="bg-black/60 backdrop-blur-xl border-white/20 p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge className="mb-2">{selectedNode.category}</Badge>
                <h3 className="text-xl font-bold">{selectedNode.title}</h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              {selectedNode.description || selectedNode.abstract}
            </p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold">
              Open in Holographic View
            </button>
          </Card>
        </motion.div>
      )}
    </div>
  );
}