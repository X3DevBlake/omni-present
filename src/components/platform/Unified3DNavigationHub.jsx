import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Float, Html, Stars, Sparkles, Cloud } from '@react-three/drei';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Globe, ArrowRight, Activity, Database, Cpu, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

// --- VISUAL CONFIGURATION ---
const CATEGORY_COLORS = {
  "Core Systems": '#ffffff',
  "Intelligence & AI": '#8b5cf6',
  "Academy & Learning": '#ec4899',
  "Network & Communication": '#22d3ee',
  "Marketplace & Economy": '#10b981',
  "Simulation & Modeling": '#f59e0b',
  "Development & API": '#a855f7',
  "Security & Compliance": '#ef4444',
  "Physical & Embodiment": '#fbbf24',
  "Collaboration & Community": '#6366f1',
  "Quantum & Consciousness": '#d946ef',
  "Analytics & Monitoring": '#14b8a6',
  "Governance & Ethics": '#f43f5e',
  "Support & Resources": '#94a3b8'
};

// --- 3D COMPONENTS ---

const HubStar = ({ hub, position, color, isSelected, onClick, isHovered, onHover }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const scale = isSelected ? 2.5 : isHovered ? 1.8 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    meshRef.current.rotation.y += 0.01;
    if (isSelected) {
        meshRef.current.rotation.x += 0.02;
    }
  });

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh 
            ref={meshRef}
            onClick={(e) => { e.stopPropagation(); onClick(hub); }}
            onPointerOver={(e) => { e.stopPropagation(); onHover(hub.id); }}
            onPointerOut={() => onHover(null)}
        >
          <sphereGeometry args={[0.15, 32, 32]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color}
            emissiveIntensity={isSelected ? 3 : isHovered ? 2 : 0.5}
            toneMapped={false}
          />
        </mesh>
        
        {isSelected && (
            <mesh>
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshBasicMaterial color={color} wireframe transparent opacity={0.3} />
            </mesh>
        )}

        {(isHovered || isSelected) && (
            <Html distanceFactor={15} zIndexRange={[100, 0]}>
                <div className="bg-black/80 backdrop-blur-md border border-white/20 p-2 rounded-lg min-w-[150px] transform -translate-x-1/2 -translate-y-full mt-[-20px] pointer-events-none">
                    <div className="text-xs font-bold text-white whitespace-nowrap">{hub.name}</div>
                    <div className="text-[10px] text-gray-400">{hub.category}</div>
                </div>
            </Html>
        )}
      </Float>
    </group>
  );
};

const ConnectionLines = ({ hubs, activeCategory }) => {
    const lines = useMemo(() => {
        const _lines = [];
        // Connect hubs within same category
        const byCat = {};
        hubs.forEach((h, i) => {
            if (!byCat[h.category]) byCat[h.category] = [];
            byCat[h.category].push({ pos: h.position, color: CATEGORY_COLORS[h.category] || '#fff' });
        });

        Object.values(byCat).forEach(group => {
            for (let i = 0; i < group.length - 1; i++) {
                if (Math.random() > 0.7) { // Don't connect everything, too messy
                    _lines.push({
                        start: group[i].pos,
                        end: group[i+1].pos,
                        color: group[i].color
                    });
                }
            }
            // Connect to center
            if (group.length > 0) {
                 _lines.push({
                    start: group[0].pos,
                    end: [0,0,0],
                    color: group[0].color,
                    opacity: 0.1
                });
            }
        });
        return _lines;
    }, [hubs]);

    return (
        <group>
            {lines.map((l, i) => (
                <Line 
                    key={i} 
                    points={[l.start, l.end]} 
                    color={l.color} 
                    lineWidth={0.5} 
                    transparent 
                    opacity={l.opacity || 0.2} 
                />
            ))}
        </group>
    );
};

const GalaxyScene = ({ hubs, onSelectHub, selectedHub, hoveredHubId, setHoveredHubId }) => {
    const { camera } = useThree();
    
    useFrame((state) => {
        // Slow rotation of the entire galaxy
        state.camera.lookAt(0, 0, 0);
    });

    return (
        <>
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Sparkles count={200} scale={12} size={2} speed={0.4} opacity={0.5} color="#fff" />
            <Cloud opacity={0.1} speed={0.1} width={20} depth={5} segments={10} color="#4c1d95" />

            {/* Core */}
            <Sphere args={[1, 32, 32]}>
                <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2} />
            </Sphere>
            <pointLight position={[0,0,0]} intensity={2} distance={20} color="white" />

            <ConnectionLines hubs={hubs} />

            {hubs.map((hub, i) => (
                <HubStar 
                    key={hub.id || i} 
                    hub={hub} 
                    position={hub.position}
                    color={CATEGORY_COLORS[hub.category] || '#ffffff'}
                    isSelected={selectedHub?.id === hub.id}
                    onClick={onSelectHub}
                    isHovered={hoveredHubId === hub.id}
                    onHover={setHoveredHubId}
                />
            ))}
            
            <OrbitControls enablePan={true} enableZoom={true} maxDistance={60} minDistance={2} autoRotate autoRotateSpeed={0.5} />
        </>
    );
};

// --- MAIN COMPONENT ---

export default function Unified3DNavigationHub() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedHub, setSelectedHub] = useState(null);
    const [hoveredHubId, setHoveredHubId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Fetch ALL hubs
    const { data: rawHubs = [], isLoading } = useQuery({
        queryKey: ['unified-hubs-all'],
        queryFn: () => base44.entities.Hub.list({ limit: 2000 }),
        initialData: []
    });

    // Process and position hubs in a galaxy spiral
    const processedHubs = useMemo(() => {
        const uniqueHubs = Array.from(new Map(rawHubs.map(item => [item.name, item])).values());
        
        // Assign positions based on category clustering
        const categoryAngles = {};
        const cats = Object.keys(CATEGORY_COLORS);
        cats.forEach((c, i) => {
            categoryAngles[c] = (i / cats.length) * Math.PI * 2;
        });

        return uniqueHubs.map((hub, i) => {
            const catAngle = categoryAngles[hub.category] || 0;
            // Spiral distribution + randomness
            const radius = 5 + Math.random() * 15;
            const angle = catAngle + (Math.random() * 0.5 - 0.25) + (radius * 0.1); // Spiral twist
            const y = (Math.random() - 0.5) * 4; // Vertical spread
            
            return {
                ...hub,
                position: [
                    Math.cos(angle) * radius,
                    y,
                    Math.sin(angle) * radius
                ],
                // Add id if missing for keying
                id: hub.id || `hub-${i}`
            };
        });
    }, [rawHubs]);

    const filteredHubs = useMemo(() => {
        return processedHubs.filter(h => {
            const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  h.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  h.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || h.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [processedHubs, searchTerm, selectedCategory]);

    const handleSelectHub = (hub) => {
        setSelectedHub(hub);
        setIsSidebarOpen(true);
    };

    return (
        <div className="w-full h-screen bg-black relative overflow-hidden flex">
            {/* Left Control Panel */}
            <motion.div 
                className="absolute top-0 left-0 bottom-0 z-20 w-80 bg-black/80 backdrop-blur-xl border-r border-white/10 flex flex-col"
                initial={{ x: -320 }}
                animate={{ x: isSidebarOpen ? 0 : -320 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                <div className="p-6 border-b border-white/10">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                        Omni-Navigation
                    </h1>
                    <p className="text-xs text-gray-400">Gateway to {processedHubs.length} System Nodes</p>
                </div>

                <div className="p-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <Input 
                            placeholder="Search modules..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-2">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categories</div>
                        <div className="flex flex-wrap gap-2">
                            <Badge 
                                variant={selectedCategory === 'All' ? 'default' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => setSelectedCategory('All')}
                            >
                                All
                            </Badge>
                            {Object.keys(CATEGORY_COLORS).map(cat => (
                                <Badge
                                    key={cat}
                                    variant={selectedCategory === cat ? 'default' : 'outline'}
                                    className="cursor-pointer border-white/10 hover:bg-white/10"
                                    style={{ 
                                        color: selectedCategory === cat ? '#000' : CATEGORY_COLORS[cat],
                                        borderColor: CATEGORY_COLORS[cat] 
                                    }}
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Results List */}
                    <div className="space-y-2 mt-4">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {filteredHubs.length} Modules Found
                        </div>
                        {filteredHubs.slice(0, 50).map(hub => (
                            <div 
                                key={hub.id}
                                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                    selectedHub?.id === hub.id 
                                    ? 'bg-white/10 border-purple-500/50' 
                                    : 'bg-black/40 border-white/5 hover:bg-white/5'
                                }`}
                                onClick={() => setSelectedHub(hub)}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="font-medium text-sm text-gray-200">{hub.name}</div>
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[hub.category] }} />
                                </div>
                                <div className="text-[10px] text-gray-500 mt-1 truncate">{hub.category}</div>
                            </div>
                        ))}
                        {filteredHubs.length > 50 && (
                            <div className="text-center text-xs text-gray-600 py-2">
                                + {filteredHubs.length - 50} more...
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Selected Hub Detail Overlay (Bottom Center) */}
            <AnimatePresence>
                {selectedHub && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-2xl px-4"
                    >
                        <Card className="bg-black/90 backdrop-blur-xl border border-purple-500/30 shadow-2xl shadow-purple-900/20 overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                                <div className="p-6 flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge variant="outline" style={{ color: CATEGORY_COLORS[selectedHub.category], borderColor: CATEGORY_COLORS[selectedHub.category] }}>
                                            {selectedHub.category}
                                        </Badge>
                                        {selectedHub.featured && <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/50">Featured</Badge>}
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">{selectedHub.name}</h2>
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                        {selectedHub.description || "Advanced Omni-Present System Node ready for interaction and data processing."}
                                    </p>
                                    <div className="flex gap-3">
                                        <Link to={selectedHub.path && !selectedHub.path.includes('GenericHub') ? createPageUrl(selectedHub.path) : createPageUrl('GenericHub') + '?name=' + encodeURIComponent(selectedHub.name)} className="flex-1">
                                            <Button className="w-full bg-white text-black hover:bg-gray-200">
                                                Enter System <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </Link>
                                        <Button variant="outline" onClick={() => setSelectedHub(null)}>Close</Button>
                                    </div>
                                </div>
                                <div className="bg-white/5 p-6 min-w-[200px] flex flex-col justify-center gap-4 border-l border-white/5">
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <Activity className="w-4 h-4 text-green-400" />
                                        <span>Status: Active</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <Cpu className="w-4 h-4 text-blue-400" />
                                        <span>Load: {(Math.random() * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <Zap className="w-4 h-4 text-yellow-400" />
                                        <span>Latency: 12ms</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Sidebar Button */}
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="absolute top-4 left-4 z-30 p-2 bg-black/60 backdrop-blur rounded-lg border border-white/10 hover:bg-white/10 text-white"
            >
                {isSidebarOpen ? <Globe className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
            </button>

            {/* 3D Scene */}
            <div className="flex-1 h-full relative bg-gradient-to-br from-gray-900 via-black to-black">
                {/* Simulation Traffic Overlay */}
                <div className="absolute inset-0 z-10 pointer-events-none opacity-30 bg-[url('https://media.giphy.com/media/26tnAqsS3J6S71jXy/giphy.gif')] bg-cover mix-blend-screen" />
                
                <Canvas camera={{ position: [20, 20, 20], fov: 45 }}>
                    <GalaxyScene 
                        hubs={filteredHubs} 
                        onSelectHub={handleSelectHub} 
                        selectedHub={selectedHub}
                        hoveredHubId={hoveredHubId}
                        setHoveredHubId={setHoveredHubId}
                    />
                    <Sparkles count={500} scale={20} size={4} speed={0.2} opacity={0.5} color="#8b5cf6" />
                </Canvas>
                
                {/* Overlay Gradient for UI readability */}
                <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent to-black/40" />
                
                {/* Enhanced Footer Status */}
                <div className="absolute bottom-4 right-4 z-20 flex gap-4">
                    <Badge variant="outline" className="bg-black/60 border-purple-500/50 text-purple-300 backdrop-blur">
                        <Activity className="w-3 h-3 mr-1 animate-pulse" /> Network Traffic: High
                    </Badge>
                    <Badge variant="outline" className="bg-black/60 border-cyan-500/50 text-cyan-300 backdrop-blur">
                        <Database className="w-3 h-3 mr-1" /> Nodes: {filteredHubs.length}
                    </Badge>
                </div>
            </div>
        </div>
    );
}