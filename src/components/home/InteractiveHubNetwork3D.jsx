import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html, Line, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  GraduationCap, Brain, Radio, Rocket, Bot, Network, Activity, Globe,
  FlaskConical, Code, Sparkles, Users, MessageSquare, ArrowRight, Zap
} from 'lucide-react';

const hubData = [
  // Academy Cluster
  { id: 'academy', name: 'Academy', page: 'OmniPresentAcademy', position: [0, 3, 0], icon: GraduationCap, color: '#ec4899', size: 0.4, cluster: 'education' },
  { id: 'research', name: 'Research', page: 'ResearchHub', position: [-2, 3, 1], icon: FlaskConical, color: '#8b5cf6', size: 0.3, cluster: 'education' },
  { id: 'training', name: 'AI Training', page: 'AITrainingAcademy', position: [2, 3, -1], icon: Brain, color: '#c084fc', size: 0.3, cluster: 'education' },
  
  // Intelligence Cluster
  { id: 'omega', name: 'Omega Intelligence', page: 'OmegaIntelligenceHub', position: [-3, 0, 0], icon: Brain, color: '#22d3ee', size: 0.4, cluster: 'intelligence' },
  { id: 'predictive', name: 'Predictive Intel', page: 'PredictiveIntelligenceHub', position: [-4, 1, 2], icon: Activity, color: '#06b6d4', size: 0.3, cluster: 'intelligence' },
  { id: 'analytics', name: 'Analytics', page: 'AIAnalyticsHub', position: [-4, -1, -2], icon: Activity, color: '#0891b2', size: 0.3, cluster: 'intelligence' },
  
  // Network Cluster
  { id: 'redcomm', name: 'RedComm', page: 'RedCommHub', position: [3, 0, 0], icon: Radio, color: '#10b981', size: 0.4, cluster: 'network' },
  { id: 'security', name: 'Security', page: 'SecurityIntelligenceHub', position: [4, 1, 2], icon: Globe, color: '#059669', size: 0.3, cluster: 'network' },
  
  // Simulation Cluster
  { id: 'simulation', name: 'Simulation', page: 'SimulationHub', position: [0, -3, 0], icon: Rocket, color: '#f59e0b', size: 0.4, cluster: 'simulation' },
  { id: 'simlab', name: 'Sim Lab', page: 'SimulationLab', position: [-2, -3, 1], icon: FlaskConical, color: '#d97706', size: 0.3, cluster: 'simulation' },
  
  // Marketplace Cluster
  { id: 'marketplace', name: 'Marketplace', page: 'AIAgentMarketplace', position: [0, 0, 3], icon: Bot, color: '#8b5cf6', size: 0.35, cluster: 'marketplace' },
  { id: 'customization', name: 'Customization', page: 'AgentCustomization', position: [1, 1, 4], icon: Sparkles, color: '#a78bfa', size: 0.25, cluster: 'marketplace' },
  
  // Collaboration Cluster
  { id: 'collaboration', name: 'Collaboration', page: 'AgentCollaborationHub', position: [0, 0, -3], icon: Network, color: '#06b6d4', size: 0.35, cluster: 'collaboration' },
  { id: 'team', name: 'Team Hub', page: 'TeamOrchestration', position: [1, 1, -4], icon: Users, color: '#0891b2', size: 0.25, cluster: 'collaboration' },
  
  // Monitoring Cluster
  { id: 'ecosystem', name: 'Ecosystem', page: 'EcosystemMonitoringDashboard', position: [0, -1, -2], icon: Globe, color: '#14b8a6', size: 0.3, cluster: 'monitoring' },
  
  // Developer Cluster
  { id: 'developer', name: 'Developer', page: 'DeveloperPortal', position: [2, -1, 2], icon: Code, color: '#6366f1', size: 0.3, cluster: 'developer' }
];

const connections = [
  // Education connections
  { from: 'academy', to: 'research', strength: 0.9 },
  { from: 'academy', to: 'training', strength: 0.9 },
  { from: 'research', to: 'training', strength: 0.7 },
  
  // Intelligence connections
  { from: 'omega', to: 'predictive', strength: 0.8 },
  { from: 'omega', to: 'analytics', strength: 0.8 },
  { from: 'predictive', to: 'analytics', strength: 0.6 },
  
  // Network connections
  { from: 'redcomm', to: 'security', strength: 0.9 },
  
  // Cross-cluster connections
  { from: 'omega', to: 'academy', strength: 0.7 },
  { from: 'marketplace', to: 'academy', strength: 0.6 },
  { from: 'collaboration', to: 'academy', strength: 0.5 },
  { from: 'simulation', to: 'training', strength: 0.8 },
  { from: 'developer', to: 'academy', strength: 0.7 },
  { from: 'omega', to: 'redcomm', strength: 0.6 },
  { from: 'marketplace', to: 'collaboration', strength: 0.8 },
  { from: 'ecosystem', to: 'omega', strength: 0.7 },
  { from: 'simulation', to: 'omega', strength: 0.6 }
];

function HubNode({ hub, isSelected, isHovered, onClick, onHover }) {
  const meshRef = useRef();
  const [scale, setScale] = useState(1);
  
  useFrame((state) => {
    if (meshRef.current) {
      const targetScale = isSelected ? 2 : isHovered ? 1.5 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      if (isSelected) {
        meshRef.current.rotation.y = state.clock.elapsedTime * 1.5;
      } else {
        meshRef.current.rotation.y += 0.01;
      }
    }
  });

  return (
    <group position={hub.position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick(hub);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(hub.id);
        }}
        onPointerOut={() => onHover(null)}
      >
        <sphereGeometry args={[hub.size, 32, 32]} />
        <meshStandardMaterial
          color={hub.color}
          emissive={hub.color}
          emissiveIntensity={isSelected ? 1.5 : isHovered ? 1 : 0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Outer glow rings */}
      {(isSelected || isHovered) && (
        <>
          <mesh>
            <ringGeometry args={[hub.size * 1.2, hub.size * 1.4, 32]} />
            <meshBasicMaterial color={hub.color} transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[hub.size * 1.3, hub.size * 1.5, 32]} />
            <meshBasicMaterial color={hub.color} transparent opacity={0.2} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}

      {/* Label */}
      <Text
        position={[0, hub.size + 0.3, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {hub.name}
      </Text>

      {/* Info panel on hover */}
      {(isHovered || isSelected) && (
        <Html distanceFactor={5} position={[0, hub.size + 0.6, 0]}>
          <div className="bg-black/95 border-2 rounded-lg p-3 min-w-[150px] pointer-events-none backdrop-blur-xl"
            style={{ borderColor: hub.color }}
          >
            <div className="font-bold text-xs mb-1" style={{ color: hub.color }}>
              {hub.name} Hub
            </div>
            <div className="text-white/80 text-xs">Cluster: {hub.cluster}</div>
            {isSelected && (
              <div className="mt-2 text-cyan-400 text-xs">
                Click card to enter →
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

function DataFlowParticle({ from, to, color, delay }) {
  const particleRef = useRef();
  const [progress, setProgress] = useState(0);

  useFrame((state) => {
    const t = (state.clock.elapsedTime * 0.5 + delay) % 1;
    setProgress(t);
    
    if (particleRef.current) {
      const fromPos = new THREE.Vector3(...from);
      const toPos = new THREE.Vector3(...to);
      particleRef.current.position.lerpVectors(fromPos, toPos, t);
    }
  });

  return (
    <mesh ref={particleRef}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function ConnectionLine({ from, to, strength, isActive }) {
  const points = [
    new THREE.Vector3(...from),
    new THREE.Vector3(...to)
  ];

  return (
    <>
      <Line
        points={points}
        color={isActive ? '#ec4899' : '#3b82f6'}
        lineWidth={isActive ? 3 : strength * 2}
        transparent
        opacity={isActive ? 0.8 : strength * 0.4}
      />
      {isActive && (
        <DataFlowParticle 
          from={from} 
          to={to} 
          color="#ec4899" 
          delay={Math.random()}
        />
      )}
    </>
  );
}

function HubNetwork3D({ selectedHub, onSelectHub, hoveredHub, onHoverHub }) {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current && !selectedHub) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Render connections */}
      {connections.map((conn, idx) => {
        const fromHub = hubData.find(h => h.id === conn.from);
        const toHub = hubData.find(h => h.id === conn.to);
        if (!fromHub || !toHub) return null;
        
        const isActive = selectedHub?.id === conn.from || selectedHub?.id === conn.to ||
                        hoveredHub === conn.from || hoveredHub === conn.to;
        
        return (
          <ConnectionLine
            key={idx}
            from={fromHub.position}
            to={toHub.position}
            strength={conn.strength}
            isActive={isActive}
          />
        );
      })}

      {/* Render hubs */}
      {hubData.map((hub) => (
        <HubNode
          key={hub.id}
          hub={hub}
          isSelected={selectedHub?.id === hub.id}
          isHovered={hoveredHub === hub.id}
          onClick={onSelectHub}
          onHover={onHoverHub}
        />
      ))}

      {/* Central energy core */}
      <Sphere args={[0.3, 32, 32]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#c084fc"
          emissive="#c084fc"
          emissiveIntensity={0.8}
          distort={0.3}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </group>
  );
}

export default function InteractiveHubNetwork3D() {
  const [selectedHub, setSelectedHub] = useState(null);
  const [hoveredHub, setHoveredHub] = useState(null);
  const [viewMode, setViewMode] = useState('network'); // 'network' or 'cluster'

  const clusterColors = {
    education: '#ec4899',
    intelligence: '#22d3ee',
    network: '#10b981',
    simulation: '#f59e0b',
    marketplace: '#8b5cf6',
    collaboration: '#06b6d4',
    monitoring: '#14b8a6',
    developer: '#6366f1'
  };

  const clusters = [...new Set(hubData.map(h => h.cluster))];

  return (
    <div className="relative w-full h-[800px] bg-black/40 rounded-3xl border-2 border-purple-500/30 backdrop-blur-xl overflow-hidden">
      {/* Controls */}
      <div className="absolute top-6 left-6 z-10 space-y-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="bg-black/90 border-purple-500/40 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="text-white font-bold text-sm mb-3">View Mode</div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => setViewMode('network')}
                  className={viewMode === 'network' 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'bg-white/10 hover:bg-white/20'}
                >
                  <Network className="w-4 h-4 mr-1" />
                  Network
                </Button>
                <Button
                  size="sm"
                  onClick={() => setViewMode('cluster')}
                  className={viewMode === 'cluster' 
                    ? 'bg-cyan-600 hover:bg-cyan-700' 
                    : 'bg-white/10 hover:bg-white/20'}
                >
                  <Globe className="w-4 h-4 mr-1" />
                  Clusters
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {viewMode === 'cluster' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-black/90 border-cyan-500/40 backdrop-blur-xl">
              <CardContent className="p-4">
                <div className="text-white font-bold text-sm mb-3">Clusters</div>
                <div className="space-y-2">
                  {clusters.map((cluster, idx) => (
                    <div key={cluster} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: clusterColors[cluster] }}
                      />
                      <span className="text-white/80 text-xs capitalize">{cluster}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-black/90 border-green-500/40 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="text-green-400 font-bold text-sm mb-2">Network Stats</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-white/80">
                  <span>Total Hubs:</span>
                  <span className="font-bold">{hubData.length}</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Connections:</span>
                  <span className="font-bold">{connections.length}</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Clusters:</span>
                  <span className="font-bold">{clusters.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Hub Detail Card */}
      <AnimatePresence>
        {selectedHub && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="absolute top-6 right-6 z-10 w-80"
          >
            <Card className="bg-black/95 border-2 backdrop-blur-2xl shadow-2xl"
              style={{ borderColor: selectedHub.color }}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-3">
                    {React.createElement(selectedHub.icon, { 
                      className: "w-8 h-8",
                      style: { color: selectedHub.color }
                    })}
                    {selectedHub.name}
                  </CardTitle>
                  <button
                    onClick={() => setSelectedHub(null)}
                    className="text-white/60 hover:text-white"
                  >
                    <Sparkles className="w-5 h-5" />
                  </button>
                </div>
                <Badge className="w-fit" style={{ backgroundColor: selectedHub.color + '40', color: selectedHub.color }}>
                  {selectedHub.cluster} cluster
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-white/60 text-xs mb-1">Connections</div>
                    <div className="text-white text-2xl font-bold">
                      {connections.filter(c => c.from === selectedHub.id || c.to === selectedHub.id).length}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-white/60 text-xs">Connected Hubs:</div>
                    {connections
                      .filter(c => c.from === selectedHub.id || c.to === selectedHub.id)
                      .slice(0, 5)
                      .map((conn, idx) => {
                        const connectedId = conn.from === selectedHub.id ? conn.to : conn.from;
                        const connectedHub = hubData.find(h => h.id === connectedId);
                        if (!connectedHub) return null;
                        
                        return (
                          <div key={idx} className="flex items-center gap-2 bg-white/5 rounded p-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: connectedHub.color }}
                            />
                            <span className="text-white text-xs">{connectedHub.name}</span>
                            <div className="ml-auto text-white/40 text-xs">
                              {Math.round(conn.strength * 100)}%
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  <Link to={createPageUrl(selectedHub.page)}>
                    <Button 
                      className="w-full"
                      style={{ 
                        backgroundColor: selectedHub.color,
                        color: 'white'
                      }}
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Enter {selectedHub.name}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute bottom-6 left-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-black/80 border border-purple-500/30 rounded-lg px-4 py-3 backdrop-blur-xl">
            <div className="text-white/60 text-xs">
              <Zap className="w-3 h-3 inline mr-1 text-purple-400" />
              Click nodes to explore • Drag to rotate • Scroll to zoom
            </div>
          </div>
        </motion.div>
      </div>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} color="#8b5cf6" intensity={1.5} />
        <pointLight position={[-10, -10, -10]} color="#22d3ee" intensity={1} />
        <pointLight position={[0, 10, 0]} color="#ec4899" intensity={1.2} />

        <Suspense fallback={null}>
          <HubNetwork3D
            selectedHub={selectedHub}
            onSelectHub={setSelectedHub}
            hoveredHub={hoveredHub}
            onHoverHub={setHoveredHub}
          />
        </Suspense>

        <OrbitControls
          enableZoom={true}
          enablePan={true}
          minDistance={6}
          maxDistance={20}
          autoRotate={!selectedHub}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}