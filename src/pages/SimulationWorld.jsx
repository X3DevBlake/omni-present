import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars, Text } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2, Filter, Play, Pause, ZoomIn, ZoomOut, Users, DollarSign, Cloud, AlertTriangle } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { toast } from 'sonner';
import * as THREE from 'three';

function Agent3D({ agent, onClick, isSelected }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      if (isSelected) {
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2 + agent.position[1];
      }
    }
  });

  return (
    <group position={agent.position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        scale={hovered || isSelected ? 1.2 : 1}
      >
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={agent.color} 
          emissive={agent.color}
          emissiveIntensity={isSelected ? 0.8 : 0.4}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {(hovered || isSelected) && (
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {agent.name}
        </Text>
      )}
      
      {isSelected && (
        <mesh position={[0, 0, 0]}>
          <ringGeometry args={[0.5, 0.6, 32]} />
          <meshBasicMaterial color={agent.color} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function Faction3D({ faction, agents }) {
  const memberPositions = agents.filter(a => faction.members?.includes(a.id)).map(a => a.position);
  
  if (memberPositions.length < 2) return null;

  const centerPos = memberPositions.reduce((acc, pos) => [
    acc[0] + pos[0] / memberPositions.length,
    acc[1] + pos[1] / memberPositions.length,
    acc[2] + pos[2] / memberPositions.length
  ], [0, 0, 0]);

  return (
    <group position={centerPos}>
      <mesh>
        <cylinderGeometry args={[2, 2, 0.1, 32]} />
        <meshStandardMaterial color={faction.color || '#ff6b6b'} transparent opacity={0.2} />
      </mesh>
      <Text
        position={[0, 1, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
      >
        {faction.name}
      </Text>
    </group>
  );
}

function ResourceNode({ resource, position }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function TradeRoute({ from, to, active }) {
  const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={active ? '#00f5ff' : '#ffffff'} transparent opacity={active ? 0.8 : 0.2} linewidth={2} />
    </line>
  );
}

function EnvironmentalEffect({ event }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.3);
      meshRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={event.position}>
      <sphereGeometry args={[event.radius || 1, 16, 16]} />
      <meshBasicMaterial 
        color={event.type === 'storm' ? '#3b82f6' : event.type === 'earthquake' ? '#ef4444' : '#fbbf24'} 
        transparent 
        opacity={0.3}
      />
    </mesh>
  );
}

export default function SimulationWorld() {
  const [agents, setAgents] = useState([]);
  const [factions, setFactions] = useState([]);
  const [resources, setResources] = useState([]);
  const [tradeRoutes, setTradeRoutes] = useState([]);
  const [environmentalEvents, setEnvironmentalEvents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isSimulating, setIsSimulating] = useState(true);
  const [viewMode, setViewMode] = useState('overview');
  const [filters, setFilters] = useState({ agents: true, factions: true, resources: true, trades: true });
  const [stats, setStats] = useState({});

  useEffect(() => {
    // Initialize simulation data
    const initialAgents = Array.from({ length: 20 }, (_, i) => ({
      id: `agent_${i}`,
      name: `Agent ${i}`,
      color: ['#00f5ff', '#a855f7', '#ec4899', '#10b981'][i % 4],
      position: [
        (Math.random() - 0.5) * 20,
        0,
        (Math.random() - 0.5) * 20
      ],
      experience: Math.random() * 500,
      faction: i < 10 ? 'faction_1' : 'faction_2'
    }));

    const initialFactions = [
      { id: 'faction_1', name: 'The Collective', color: '#00f5ff', members: initialAgents.slice(0, 10).map(a => a.id) },
      { id: 'faction_2', name: 'Free Agents', color: '#ec4899', members: initialAgents.slice(10).map(a => a.id) }
    ];

    const initialResources = Array.from({ length: 10 }, (_, i) => ({
      id: `resource_${i}`,
      type: ['food', 'water', 'materials'][i % 3],
      position: [(Math.random() - 0.5) * 25, 0.5, (Math.random() - 0.5) * 25]
    }));

    setAgents(initialAgents);
    setFactions(initialFactions);
    setResources(initialResources);
  }, []);

  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      // Update agent positions
      setAgents(prev => prev.map(agent => ({
        ...agent,
        position: [
          agent.position[0] + (Math.random() - 0.5) * 0.2,
          agent.position[1],
          agent.position[2] + (Math.random() - 0.5) * 0.2
        ]
      })));

      // Generate random trade routes
      if (Math.random() > 0.8) {
        const from = agents[Math.floor(Math.random() * agents.length)];
        const to = agents[Math.floor(Math.random() * agents.length)];
        if (from && to && from.id !== to.id) {
          setTradeRoutes(prev => [...prev, { from: from.position, to: to.position, active: true, id: Date.now() }].slice(-15));
        }
      }

      // Generate random environmental events
      if (Math.random() > 0.95) {
        setEnvironmentalEvents(prev => [...prev, {
          id: Date.now(),
          type: ['storm', 'earthquake', 'discovery'][Math.floor(Math.random() * 3)],
          position: [(Math.random() - 0.5) * 20, 0, (Math.random() - 0.5) * 20],
          radius: 2 + Math.random() * 2
        }].slice(-5));
      }

      // Update stats
      setStats({
        activeAgents: agents.length,
        activeTrades: tradeRoutes.filter(r => r.active).length,
        resources: resources.length,
        events: environmentalEvents.length
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating, agents, tradeRoutes, resources, environmentalEvents]);

  return (
    <AuroraBackground className="min-h-screen">
      <div className="relative h-screen flex flex-col">
        <div className="p-6 flex items-center justify-between bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Simulation World</h1>
            <p className="text-white/60">Real-time 3D visualization of AI society</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 ${
                isSimulating ? 'bg-red-500/20 border border-red-500/40 text-red-300' : 'bg-green-500/20 border border-green-500/40 text-green-300'
              }`}
            >
              {isSimulating ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Play</>}
            </button>
          </div>
        </div>

        <div className="flex-1 relative">
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 15, 25]} />
            <OrbitControls enableZoom enablePan maxPolarAngle={Math.PI / 2.1} />
            
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <directionalLight position={[-5, 10, 5]} intensity={0.5} />
            
            <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
            
            {/* Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
              <planeGeometry args={[50, 50, 20, 20]} />
              <meshStandardMaterial color="#0a0a0f" wireframe opacity={0.2} transparent />
            </mesh>

            {/* Agents */}
            {filters.agents && agents.map(agent => (
              <Agent3D 
                key={agent.id} 
                agent={agent} 
                onClick={() => setSelectedAgent(agent)}
                isSelected={selectedAgent?.id === agent.id}
              />
            ))}

            {/* Factions */}
            {filters.factions && factions.map(faction => (
              <Faction3D key={faction.id} faction={faction} agents={agents} />
            ))}

            {/* Resources */}
            {filters.resources && resources.map(resource => (
              <ResourceNode key={resource.id} resource={resource} position={resource.position} />
            ))}

            {/* Trade Routes */}
            {filters.trades && tradeRoutes.map(route => (
              <TradeRoute key={route.id} from={route.from} to={route.to} active={route.active} />
            ))}

            {/* Environmental Events */}
            {environmentalEvents.map(event => (
              <EnvironmentalEffect key={event.id} event={event} />
            ))}

            <Environment preset="night" />
          </Canvas>

          {/* Stats Overlay */}
          <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-4 min-w-64">
            <h3 className="text-white font-bold mb-3">Live Statistics</h3>
            <div className="space-y-2">
              {[
                { label: 'Active Agents', value: stats.activeAgents || 0, icon: Users, color: 'cyan' },
                { label: 'Active Trades', value: stats.activeTrades || 0, icon: DollarSign, color: 'green' },
                { label: 'Resources', value: stats.resources || 0, icon: DollarSign, color: 'yellow' },
                { label: 'Events', value: stats.events || 0, icon: AlertTriangle, color: 'red' }
              ].map(stat => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 text-${stat.color}-400`} />
                      <span className="text-white/70 text-sm">{stat.label}</span>
                    </div>
                    <span className={`text-${stat.color}-400 font-bold`}>{stat.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filters */}
          <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </h3>
            <div className="space-y-2">
              {Object.entries(filters).map(([key, value]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setFilters({ ...filters, [key]: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-white text-sm capitalize">{key}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Selected Agent Panel */}
          <AnimatePresence>
            {selectedAgent && (
              <motion.div
                className="absolute bottom-4 left-4 right-4 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${selectedAgent.color}40`, border: `2px solid ${selectedAgent.color}` }}>
                      <Users className="w-8 h-8" style={{ color: selectedAgent.color }} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xl mb-1">{selectedAgent.name}</h3>
                      <p className="text-white/60 text-sm">Experience: {selectedAgent.experience?.toFixed(0) || 0} XP</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedAgent(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg">
                    <Minimize2 className="w-5 h-5 text-white/70" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-white/60 text-xs mb-1">Faction</div>
                    <div className="text-white font-semibold">{selectedAgent.faction || 'None'}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-white/60 text-xs mb-1">Skills</div>
                    <div className="text-cyan-400 font-semibold">{selectedAgent.skills?.length || 2}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-white/60 text-xs mb-1">Reputation</div>
                    <div className="text-yellow-400 font-semibold">{selectedAgent.reputation || 50}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AuroraBackground>
  );
}