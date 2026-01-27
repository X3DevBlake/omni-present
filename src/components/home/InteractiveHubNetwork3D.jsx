import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Float, Html, Stars } from '@react-three/drei';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Activity, Zap, Shield, Radio, Users, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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

// ... duplicates removed ...


// --- ADVANCED AGENT SYSTEM ---
const Agent = ({ id, startPos, endPos, color, speed = 1, type = 'data', mission, onPositionUpdate, nearbyAgents, congestionLevel = 0 }) => {
  const agentRef = useRef();
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(true);
  const [anomalyDetected, setAnomalyDetected] = useState(false);
  const [taskDelegated, setTaskDelegated] = useState(false);

  useFrame((state, delta) => {
    if (!active || !agentRef.current) return;
    
    // --- Predictive Pathfinding & Congestion Awareness ---
    // Agents slow down if congestion is high, or "reroute" (simulated by color shift)
    const congestionFactor = Math.max(0.2, 1 - congestionLevel);
    const optimizedSpeed = speed * (1 + Math.min(0.5, progress)) * congestionFactor; 

    const newProgress = progress + (delta * optimizedSpeed * 0.2);
    if (newProgress >= 1) {
      setProgress(0);
    } else {
      setProgress(newProgress);
    }

    const pos = new THREE.Vector3().lerpVectors(
      new THREE.Vector3(...startPos),
      new THREE.Vector3(...endPos),
      progress
    );
    
    // --- Advanced Autonomous Behaviors ---
    if (type === 'security') {
        pos.y += Math.sin(state.clock.elapsedTime * 8 + id) * 0.2;
        pos.x += Math.cos(state.clock.elapsedTime * 4 + id) * 0.1;
    } else if (type === 'ai') {
        pos.x += Math.cos(state.clock.elapsedTime * 5 + id) * 0.15;
        pos.z += Math.sin(state.clock.elapsedTime * 3 + id) * 0.15;
    } else if (type === 'mission_agent') {
        pos.y += Math.sin(state.clock.elapsedTime * 15) * 0.05;
    }

    // --- Threat Learning & Sharing ---
    if (type === 'security' && Math.random() < 0.005) {
        // Security agent "shares" threat intel (visualized as a pulse)
        setAnomalyDetected(true); // Reusing this visual for threat sharing pulse
        setTimeout(() => setAnomalyDetected(false), 500);
    }

    // --- Dynamic Task Delegation ---
    if (!taskDelegated && nearbyAgents && nearbyAgents.length > 0 && Math.random() < 0.002) {
        setTaskDelegated(true);
        setTimeout(() => setTaskDelegated(false), 1000);
    }

    agentRef.current.position.copy(pos);
    if (onPositionUpdate) onPositionUpdate(id, pos);
  });

  if (!active) return null;

  return (
    <group ref={agentRef}>
      <mesh>
        <sphereGeometry args={[type === 'mission_agent' ? 0.15 : 0.08, 16, 16]} />
        <meshBasicMaterial 
            color={
                anomalyDetected ? '#ff0000' : 
                taskDelegated ? '#00ff00' :
                congestionLevel > 0.7 ? '#fb923c' : // Orange if high congestion
                (type === 'security' ? '#ef4444' : type === 'ai' ? '#ec4899' : type === 'mission_agent' ? '#fbbf24' : '#ffffff')
            } 
        />
      </mesh>
      {/* Aura */}
      <mesh scale={type === 'mission_agent' ? [2, 2, 2] : [1.5, 1.5, 1.5]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={anomalyDetected ? '#ff0000' : color} transparent opacity={0.4} />
      </mesh>
      
      {/* Visual Communication Channels (Task Delegation) */}
      {nearbyAgents && nearbyAgents.map((otherPos, i) => (
          <Line
            key={i}
            points={[[0,0,0], [otherPos.x - agentRef.current.position.x, otherPos.y - agentRef.current.position.y, otherPos.z - agentRef.current.position.z]]}
            color={taskDelegated ? "#00ff00" : (anomalyDetected ? "#ff0000" : "#3b82f6")}
            lineWidth={taskDelegated ? 2 : 1}
            transparent
            opacity={taskDelegated ? 0.8 : 0.2}
            dashed={!taskDelegated}
          />
      ))}

      {/* Mission Badge */}
      {type === 'mission_agent' && (
          <Html distanceFactor={15}>
              <div className="bg-amber-500/80 text-black text-[8px] px-1 rounded font-bold border border-amber-300">
                  {mission || "OPS"} {Math.floor(progress * 100)}%
              </div>
          </Html>
      )}
      
      {/* Threat Intel / Anomaly Alert */}
      {anomalyDetected && (
          <Html distanceFactor={10}>
              <div className="bg-red-600 text-white text-[8px] px-1 rounded animate-pulse font-bold">
                  {type === 'security' ? "SHARING INTEL" : "THREAT DETECTED"}
              </div>
          </Html>
      )}
      
      {/* Task Delegation Alert */}
      {taskDelegated && (
          <Html distanceFactor={10}>
              <div className="bg-green-600 text-white text-[8px] px-1 rounded animate-bounce font-bold">
                  DELEGATING
              </div>
          </Html>
      )}
    </group>
  );
};

const AgentSystem = ({ connections, activeSimulation }) => {
  const [agents, setAgents] = useState([]);
  const agentPositions = useRef({});
  const [congestionMap, setCongestionMap] = useState({});

  useFrame((state) => {
    let spawnRate = 0.02; 
    if (activeSimulation === 'traffic_spike') spawnRate = 0.2;
    if (activeSimulation === 'agent_swarm') spawnRate = 0.3;

    // Update congestion (simulated based on agent count)
    const currentCongestion = agents.length / 100; // Normalized 0-1

    if (Math.random() < spawnRate && connections.length > 0) {
      const conn = connections[Math.floor(Math.random() * connections.length)];
      let type = Math.random() > 0.8 ? 'ai' : 'data';
      let mission = null;

      if (activeSimulation === 'security_sweep') type = 'security';
      if (activeSimulation === 'mission_ops') {
          type = 'mission_agent';
          mission = ['ALPHA', 'BRAVO', 'OMEGA'][Math.floor(Math.random() * 3)];
      }
      
      const newAgent = {
        id: Math.random(),
        startPos: conn.start,
        endPos: conn.end,
        color: type === 'mission_agent' ? '#fbbf24' : conn.color,
        speed: type === 'mission_agent' ? 1.5 : 0.5 + Math.random(),
        type: type,
        mission: mission
      };
      
      setAgents(prev => {
          const next = [...prev, newAgent];
          if (next.length > 80) return next.slice(20); 
          return next;
      }); 
    }
  });

  const handlePositionUpdate = (id, pos) => {
      agentPositions.current[id] = pos;
  };

  return (
    <group>
      {agents.map((agent, index) => {
          // Find nearby agents for ad-hoc collaboration
          const nearby = [];
          Object.entries(agentPositions.current).forEach(([otherId, otherPos]) => {
              if (otherId !== String(agent.id) && otherPos.distanceTo(new THREE.Vector3().lerpVectors(new THREE.Vector3(...agent.startPos), new THREE.Vector3(...agent.endPos), 0.5)) < 2.5) {
                  nearby.push(otherPos);
              }
          });

          // Calculate local congestion
          const localCongestion = nearby.length / 5;

          return (
            <Agent 
                key={agent.id} 
                {...agent} 
                onPositionUpdate={handlePositionUpdate}
                nearbyAgents={nearby.slice(0, 3)} 
                congestionLevel={localCongestion}
            />
          );
      })}
    </group>
  );
};

// --- DATA FLOW VISUALIZATION ---
const DataStream = ({ start, end, color }) => {
    const materialRef = useRef();
    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.dashOffset -= 0.05;
        }
    });

    const geometry = useMemo(() => {
        const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
        return new THREE.BufferGeometry().setFromPoints(points);
    }, [start, end]);

    return (
        <line geometry={geometry}>
            <lineDashedMaterial 
                ref={materialRef}
                color={color} 
                dashSize={0.2} 
                gapSize={0.1} 
                opacity={0.3}
                transparent
                linewidth={1}
            />
        </line>
    );
};

const HubNode = ({ hub, position, color, onSelect, isSelected, isHovered, onHover }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = isSelected ? 1.8 : isHovered ? 1.4 : 1;
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
    
    // Connect everything to Core Systems
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
    }
    
    // Also random inter-category connections for a "mesh" look
    for (let i = 0; i < categories.length; i++) {
        const catA = categories[i];
        const catB = categories[(i + 3) % categories.length]; // Connect to non-adjacent
        lines.push({
            start: catA.position,
            end: catB.position,
            color: new THREE.Color(catA.color).lerp(new THREE.Color(catB.color), 0.5).getStyle()
        });
    }

    return lines;
  }, [categories]);

  // Expose connections to parent via callback or context if needed, 
  // but here we just render lines. 
  // Wait, AgentSystem needs these connections to spawn agents on paths.
  // We should lift this calculation up or pass a ref. 
  // For simplicity, we'll re-calculate or pass a prop callback.
  useEffect(() => {
      if (onConnectionsUpdate) {
          onConnectionsUpdate(connections);
      }
  }, [connections]);

  return (
    <group ref={linesRef}>
      {connections.map((conn, i) => (
        <group key={i}>
            {/* Static faint connection */}
            <Line
            points={[conn.start, conn.end]}
            color={conn.color}
            lineWidth={0.5}
            transparent
            opacity={0.1}
            />
            {/* Dynamic data stream effect */}
            <DataStream start={conn.start} end={conn.end} color={conn.color} />
        </group>
      ))}
    </group>
  );
};

export default function InteractiveHubNetwork3D() {
  const [selectedHub, setSelectedHub] = useState(null);
  const [hoveredHub, setHoveredHub] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [activeSimulation, setActiveSimulation] = useState('idle'); // 'traffic_spike', 'agent_swarm', 'security_sweep'
  const [networkConnections, setNetworkConnections] = useState([]);

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
    <div className="relative w-full h-full min-h-[700px] bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      
      {/* Simulation Controls Overlay */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <Card className="bg-black/80 backdrop-blur-xl border-white/10 p-3">
            <div className="text-xs font-bold text-white mb-2 uppercase tracking-wider">Sim Control</div>
            <div className="flex gap-2">
                <Button 
                    size="sm" 
                    variant={activeSimulation === 'traffic_spike' ? 'default' : 'outline'} 
                    className="h-8 text-xs"
                    onClick={() => setActiveSimulation(prev => prev === 'traffic_spike' ? 'idle' : 'traffic_spike')}
                >
                    <Activity className="w-3 h-3 mr-1" /> Spike
                </Button>
                <Button 
                    size="sm" 
                    variant={activeSimulation === 'agent_swarm' ? 'default' : 'outline'} 
                    className="h-8 text-xs"
                    onClick={() => setActiveSimulation(prev => prev === 'agent_swarm' ? 'idle' : 'agent_swarm')}
                >
                    <Users className="w-3 h-3 mr-1" /> Swarm
                </Button>
                <Button 
                    size="sm" 
                    variant={activeSimulation === 'security_sweep' ? 'default' : 'outline'} 
                    className="h-8 text-xs"
                    onClick={() => setActiveSimulation(prev => prev === 'security_sweep' ? 'idle' : 'security_sweep')}
                >
                    <Shield className="w-3 h-3 mr-1" /> Sweep
                </Button>
            </div>
        </Card>
      </div>

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
      <div className="w-full h-full absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black pointer-events-none" />
        
        <Canvas camera={{ position: [0, 15, 20], fov: 45 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4c1d95" />
          
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

          {/* Central Star/Glow for visual anchor */}
          <pointLight position={[0,0,0]} intensity={2} color="#ffffff" distance={10} />
          
          {filterCategory === 'All' && (
            <>
                <ConnectionLines 
                    categories={groupedHubs} 
                    onConnectionsUpdate={setNetworkConnections}
                />
                <AgentSystem 
                    connections={networkConnections} 
                    activeSimulation={activeSimulation}
                />
            </>
          )}
          
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
            autoRotateSpeed={activeSimulation !== 'idle' ? 0.8 : 0.3}
            minDistance={5}
            maxDistance={50}
            enablePan={true}
          />
        </Canvas>
      </div>

      {/* Mission Assignment & Hub Panel */}
      {selectedHub && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl z-20 min-w-[350px]"
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
                <Link to={selectedHub.path && !selectedHub.path.includes('GenericHub') ? createPageUrl(selectedHub.path) : createPageUrl('GenericHub') + '?name=' + encodeURIComponent(selectedHub.name)} className="flex-1">
                  <button
                    className="w-full px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-lg font-bold text-sm transition-colors"
                  >
                    Enter Hub
                  </button>
                </Link>

                {/* Mission Assignment UI */}
                <button 
                    className={`px-3 py-2 border border-white/20 rounded-lg hover:bg-white/5 ${activeSimulation === 'mission_ops' ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-purple-500/20 text-purple-300 border-purple-500/50'}`}
                    onClick={() => {
                        if (activeSimulation === 'mission_ops') {
                            // Assign as target
                            console.log("Assigned target:", selectedHub.name);
                            // Here we would call base44.functions.invoke('assignMission', { targetHub: selectedHub.id })
                        } else {
                            console.log("Dispatching standard agent");
                        }
                    }}
                    title={activeSimulation === 'mission_ops' ? "Assign Mission Target" : "Dispatch Agent"}
                >
                    {activeSimulation === 'mission_ops' ? <Radio className="w-4 h-4 animate-pulse" /> : <Zap className="w-4 h-4" />}
                </button>
            </div>
            {activeSimulation === 'mission_ops' && (
                <div className="text-[10px] text-amber-400 text-center mt-1">
                    MISSION MODE ACTIVE: Select to assign target
                </div>
            )}
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