import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Float, Html } from '@react-three/drei';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

// The 14 Categories Color Mapping & Positions
const CATEGORY_CONFIG = {
  "Core Systems": { color: '#ffffff', pos: [0, 0, 0] },
  "Intelligence & AI": { color: '#8b5cf6', pos: [0, 6, 0] },
  "Academy & Learning": { color: '#ec4899', pos: [6, 0, 0] },
  "Network & Communication": { color: '#22d3ee', pos: [-6, 0, 0] },
  "Marketplace & Economy": { color: '#10b981', pos: [0, -6, 0] },
  "Simulation & Modeling": { color: '#f59e0b', pos: [4, 4, 4] },
  "Development & API": { color: '#a855f7', pos: [-4, -4, -4] },
  "Security & Compliance": { color: '#ef4444', pos: [4, -4, 4] },
  "Physical & Embodiment": { color: '#fbbf24', pos: [-4, 4, -4] },
  "Collaboration & Community": { color: '#6366f1', pos: [0, 0, 6] },
  "Quantum & Consciousness": { color: '#d946ef', pos: [0, 0, -6] },
  "Analytics & Monitoring": { color: '#14b8a6', pos: [6, 6, 0] },
  "Governance & Ethics": { color: '#f43f5e', pos: [-6, -6, 0] },
  "Support & Resources": { color: '#94a3b8', pos: [0, 3, 5] }
};

const HubNode = ({ hub, position, color, onSelect, isSelected, isHovered, onHover }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = isSelected ? 1.5 : isHovered ? 1.3 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
      if (isSelected || isHovered) {
        meshRef.current.rotation.y = state.clock.elapsedTime * 2;
      }
    }
  });

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
        <Sphere
          ref={meshRef}
          args={[0.15, 32, 32]}
          onClick={(e) => { e.stopPropagation(); onSelect(hub); }}
          onPointerOver={(e) => { e.stopPropagation(); onHover(hub.page); }}
          onPointerOut={() => onHover(null)}
        >
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 2 : isHovered ? 1.5 : 0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </Sphere>
        
        {(isHovered || isSelected) && (
          <Html distanceFactor={8}>
            <div className="bg-black/90 border rounded-lg p-2 min-w-[120px] pointer-events-none backdrop-blur-md shadow-xl"
              style={{ borderColor: color }}>
              <div className="font-bold text-xs mb-0.5" style={{ color }}>{hub.name}</div>
              <div className="text-white/50 text-[10px] uppercase tracking-wider">{hub.category}</div>
            </div>
          </Html>
        )}
      </Float>
    </group>
  );
};

const CategoryNode = ({ category, onSelectHub, selectedHub, hoveredHub, onHover }) => {
  const groupRef = useRef();
  const [expanded, setExpanded] = useState(true); // Default to expanded to see clusters
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  const hubPositions = useMemo(() => {
    return category.hubs.map((_, i) => {
      // Fibonacci sphere algorithm for better distribution
      const phi = Math.acos(-1 + (2 * i) / category.hubs.length);
      const theta = Math.sqrt(category.hubs.length * Math.PI) * phi;
      const radius = expanded ? 1.5 : 0.5; // Cluster radius
      
      return [
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(phi)
      ];
    });
  }, [category.hubs.length, expanded]);

  return (
    <group position={category.position} ref={groupRef}>
      {/* Category Core */}
      <Sphere
        args={[0.4, 32, 32]}
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
      >
        <meshStandardMaterial
          color={category.color}
          emissive={category.color}
          emissiveIntensity={1.2}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>
      
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.25}
        color={category.color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {category.name}
      </Text>

      {/* Hub Nodes */}
      {category.hubs.map((hub, i) => (
        <React.Fragment key={hub.id || i}>
          <HubNode
            hub={hub}
            position={hubPositions[i]}
            color={category.color}
            onSelect={onSelectHub}
            isSelected={selectedHub?.page === hub.page}
            isHovered={hoveredHub === hub.page}
            onHover={onHover}
          />
          {/* Connection Line to Core */}
          <Line
            points={[[0, 0, 0], hubPositions[i]]}
            color={category.color}
            lineWidth={0.5}
            transparent
            opacity={0.2}
          />
        </React.Fragment>
      ))}
    </group>
  );
};

const ConnectionLines = ({ categories }) => {
  const linesRef = useRef();
  
  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.children.forEach((line, i) => {
        line.material.opacity = 0.05 + Math.sin(state.clock.elapsedTime + i) * 0.02;
      });
    }
  });

  const connections = useMemo(() => {
    const lines = [];
    if (!categories) return [];
    // Connect categories to a central point (0,0,0) or to each other
    // Let's connect everything to Core Systems if it exists, or just a mesh
    const core = categories.find(c => c.name === "Core Systems");
    
    if (core) {
      categories.forEach(cat => {
        if (cat.name !== "Core Systems") {
          lines.push({
            start: core.position,
            end: cat.position,
            color: cat.color
          });
        }
      });
    } else {
        // Fallback mesh
        for (let i = 0; i < categories.length; i++) {
            for (let j = i + 1; j < categories.length; j++) {
                if (Math.random() > 0.8) { // Sparse connections
                    lines.push({
                        start: categories[i].position,
                        end: categories[j].position,
                        color: categories[i].color
                    });
                }
            }
        }
    }
    return lines;
  }, [categories]);

  return (
    <group ref={linesRef}>
      {connections.map((conn, i) => (
        <Line
          key={i}
          points={[conn.start, conn.end]}
          color={conn.color}
          lineWidth={1}
          transparent
          opacity={0.1}
        />
      ))}
    </group>
  );
};

export default function InteractiveHubNetwork3D() {
  const [selectedHub, setSelectedHub] = useState(null);
  const [hoveredHub, setHoveredHub] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');

  // Fetch dynamic hubs
  const { data: hubs = [] } = useQuery({
    queryKey: ['hubs-3d'],
    queryFn: () => base44.entities.Hub.list({ limit: 500 }),
    initialData: []
  });

  // Group hubs by category
  const groupedHubs = useMemo(() => {
    const groups = {};
    hubs.forEach(hub => {
      // Use configured category or fallback
      const catKey = CATEGORY_CONFIG[hub.category] ? hub.category : "Core Systems";
      
      if (!groups[catKey]) {
        groups[catKey] = {
          name: catKey,
          ...CATEGORY_CONFIG[catKey],
          hubs: []
        };
      }
      groups[catKey].hubs.push(hub);
    });
    return Object.values(groups);
  }, [hubs]);

  const displayedCategories = filterCategory === 'All' 
    ? groupedHubs 
    : groupedHubs.filter(g => g.name === filterCategory);

  return (
    <div className="relative w-full h-full min-h-[600px]">
      {/* Category Filter Controls */}
      <div className="absolute top-4 left-4 z-10 w-[200px] max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setFilterCategory('All')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all text-left flex items-center justify-between ${
              filterCategory === 'All' 
                ? 'bg-white text-black' 
                : 'bg-black/60 text-white border border-white/10 hover:bg-white/10'
            }`}
          >
            <span>All Systems</span>
            <span className="bg-black/20 px-1.5 rounded text-[10px]">{hubs.length}</span>
          </button>
          
          {Object.keys(CATEGORY_CONFIG).map(cat => {
             const count = hubs.filter(h => h.category === cat).length;
             if (count === 0) return null;
             return (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all text-left flex items-center justify-between ${
                  filterCategory === cat 
                    ? 'bg-white/10 border-l-4' 
                    : 'bg-black/40 text-gray-400 border border-white/5 hover:border-white/20'
                }`}
                style={{ 
                  borderLeftColor: filterCategory === cat ? CATEGORY_CONFIG[cat].color : undefined,
                  color: filterCategory === cat ? 'white' : undefined
                }}
              >
                <span className="truncate pr-2">{cat}</span>
                <span className="bg-white/5 px-1.5 rounded text-[10px] opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="w-full h-full absolute inset-0 bg-black rounded-3xl overflow-hidden border border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black pointer-events-none" />
        
        <Canvas camera={{ position: [0, 10, 15], fov: 50 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4c1d95" />
          
          {/* Central Star/Glow for visual anchor */}
          <pointLight position={[0,0,0]} intensity={2} color="#ffffff" distance={10} />
          
          {filterCategory === 'All' && <ConnectionLines categories={groupedHubs} />}
          
          {displayedCategories.map((category) => (
            <CategoryNode
              key={category.name}
              category={category}
              onSelectHub={setSelectedHub}
              selectedHub={selectedHub}
              hoveredHub={hoveredHub}
              onHover={setHoveredHub}
            />
          ))}
          
          <OrbitControls
            enableZoom={true}
            autoRotate={!selectedHub}
            autoRotateSpeed={0.5}
            minDistance={5}
            maxDistance={40}
            enablePan={true}
          />
        </Canvas>
      </div>

      {/* Selected Hub Interaction Panel */}
      {selectedHub && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl z-20 min-w-[300px]"
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full border" 
                      style={{ borderColor: CATEGORY_CONFIG[selectedHub.category]?.color || '#fff', color: CATEGORY_CONFIG[selectedHub.category]?.color || '#fff' }}>
                    {selectedHub.category}
                </span>
                <button
                  onClick={() => setSelectedHub(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
            </div>
            
            <div>
                <div className="text-white font-bold text-xl">{selectedHub.name}</div>
                <div className="text-gray-400 text-xs mt-1 max-w-md line-clamp-2">
                    {selectedHub.description || "Advanced Omni-Present System Node"}
                </div>
            </div>

            <div className="flex gap-2 mt-2">
                <Link to={createPageUrl(selectedHub.page)} className="flex-1">
                  <button
                    className="w-full px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-lg font-bold text-sm transition-colors"
                  >
                    Enter Hub
                  </button>
                </Link>
                {/* Optional secondary action */}
                <button className="px-3 py-2 border border-white/20 rounded-lg hover:bg-white/5">
                    <Activity className="w-4 h-4 text-white" />
                </button>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Legend / Stats */}
      <div className="absolute bottom-4 right-4 text-right pointer-events-none">
        <div className="text-white/20 text-xs font-mono">
            LIVE SYSTEM VISUALIZATION<br/>
            NODES: {hubs.length}<br/>
            CLUSTERS: {Object.keys(CATEGORY_CONFIG).length}
        </div>
      </div>
    </div>
  );
}