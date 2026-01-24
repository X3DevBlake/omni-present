import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Box } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Command, Brain, Orbit, Shield, Zap, Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

function IntegratedSystemNode({ system, position, active, pulsing }) {
  const [pulse, setPulse] = useState(1);

  useEffect(() => {
    if (!pulsing) return;
    const interval = setInterval(() => {
      setPulse(p => p === 1 ? 1.4 : 1);
    }, 600);
    return () => clearInterval(interval);
  }, [pulsing]);

  return (
    <group position={position}>
      <Sphere args={[0.4 * pulse, 32, 32]}>
        <meshStandardMaterial 
          color={system.color}
          emissive={system.color}
          emissiveIntensity={active ? 0.8 : 0.3}
          metalness={0.9}
        />
      </Sphere>
      <Text position={[0, 0.7, 0]} fontSize={0.12} color="white">
        {system.name}
      </Text>
    </group>
  );
}

function DataFlowStream({ from, to, active }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setProgress(p => (p + 0.03) % 1);
    }, 50);
    return () => clearInterval(interval);
  }, [active]);

  const pos = [
    from[0] + (to[0] - from[0]) * progress,
    from[1] + (to[1] - from[1]) * progress,
    from[2] + (to[2] - from[2]) * progress
  ];

  return active ? (
    <Sphere args={[0.08, 16, 16]} position={pos}>
      <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1.5} />
    </Sphere>
  ) : null;
}

export default function UnifiedCommandCenterViz3D() {
  const [activeSystem, setActiveSystem] = useState('all');

  const { data: missions } = useQuery({
    queryKey: ['missionCommands'],
    queryFn: () => base44.entities.MissionCommand.list('-created_date', 5),
    initialData: []
  });

  const { data: proposals } = useQuery({
    queryKey: ['ethicalProposals'],
    queryFn: () => base44.entities.EthicalProposal.list('-created_date', 5),
    initialData: []
  });

  const { data: interstellarLinks } = useQuery({
    queryKey: ['interstellarLinks'],
    queryFn: () => base44.entities.InterstellarLink.list(),
    initialData: []
  });

  const { data: upgrades } = useQuery({
    queryKey: ['upgradePlans'],
    queryFn: () => base44.entities.UpgradePlan.list('-created_date', 10),
    initialData: []
  });

  const systems = [
    { 
      id: 'mission', 
      name: 'Mission Commander', 
      position: [0, 2, 6], 
      color: '#f97316',
      active: missions.some(m => m.mission_status === 'active')
    },
    { 
      id: 'ethics', 
      name: 'Ethical Council', 
      position: [-6, 2, 0], 
      color: '#8b5cf6',
      active: proposals.some(p => p.status === 'debating')
    },
    { 
      id: 'interstellar', 
      name: 'Interstellar Net', 
      position: [6, 2, 0], 
      color: '#a855f7',
      active: interstellarLinks.some(l => l.ftl_enabled)
    },
    { 
      id: 'upgrade', 
      name: 'Auto-Upgrade', 
      position: [0, 2, -6], 
      color: '#06b6d4',
      active: upgrades.some(u => u.status === 'deploying')
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Card className="bg-gradient-to-br from-black/60 via-purple-950/40 to-indigo-950/40 backdrop-blur-xl border-purple-500/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Command className="w-6 h-6 text-purple-400" />
            Unified Omega Command Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] rounded-lg bg-black/60 mb-4 overflow-hidden relative">
            <Canvas camera={{ position: [0, 8, 15], fov: 60 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[0, 10, 0]} intensity={2} color="#a855f7" />
              <pointLight position={[10, 5, 10]} intensity={1} color="#3b82f6" />
              
              {/* Central Omega Core */}
              <Sphere args={[1, 64, 64]} position={[0, 0, 0]}>
                <meshStandardMaterial 
                  color="#8b5cf6"
                  emissive="#8b5cf6"
                  emissiveIntensity={1}
                  metalness={0.9}
                  roughness={0.1}
                  transparent
                  opacity={0.8}
                />
              </Sphere>

              {/* System Nodes */}
              {systems.map(system => (
                <IntegratedSystemNode
                  key={system.id}
                  system={system}
                  position={system.position}
                  active={system.active}
                  pulsing={activeSystem === system.id || activeSystem === 'all'}
                />
              ))}

              {/* Connection Lines */}
              {systems.map(system => (
                <React.Fragment key={`line_${system.id}`}>
                  <Line
                    points={[[0, 0, 0], system.position]}
                    color={system.color}
                    lineWidth={2}
                    opacity={0.6}
                  />
                  <DataFlowStream
                    from={[0, 0, 0]}
                    to={system.position}
                    active={system.active}
                  />
                </React.Fragment>
              ))}
              
              <OrbitControls enableDamping dampingFactor={0.05} autoRotate autoRotateSpeed={0.5} />
            </Canvas>

            {/* Overlay Stats */}
            <div className="absolute top-4 right-4 space-y-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-black/80 backdrop-blur-sm border border-purple-500/30 rounded-lg p-3"
              >
                <div className="text-purple-300 text-xs mb-1">Systems Online</div>
                <div className="text-white text-2xl font-bold">
                  {systems.filter(s => s.active).length}/{systems.length}
                </div>
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-4">
            {systems.map(system => {
              const Icon = system.id === 'mission' ? Brain :
                          system.id === 'ethics' ? Shield :
                          system.id === 'interstellar' ? Orbit : Zap;
              
              return (
                <motion.button
                  key={system.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveSystem(system.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    activeSystem === system.id
                      ? `border-[${system.color}] bg-white/10`
                      : 'border-gray-700 bg-black/20'
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" style={{ color: system.color }} />
                  <div className="text-white text-xs font-bold">{system.name.split(' ')[0]}</div>
                  <Badge 
                    className="mt-1 text-[10px]"
                    style={{ backgroundColor: system.active ? '#22c55e' : '#6b7280' }}
                  >
                    {system.active ? 'Active' : 'Idle'}
                  </Badge>
                </motion.button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-orange-950/30 border border-orange-500/30 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-orange-400" />
                <span className="text-white font-bold">Mission Commander</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Missions:</span>
                  <span className="text-white">{missions.filter(m => m.mission_status === 'active').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Tasks:</span>
                  <span className="text-white">
                    {missions.reduce((sum, m) => sum + (m.task_assignments?.length || 0), 0)}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-violet-950/30 border border-violet-500/30 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-violet-400" />
                <span className="text-white font-bold">Ethical Council</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Debates:</span>
                  <span className="text-white">{proposals.filter(p => p.status === 'debating').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Approved:</span>
                  <span className="text-white">{proposals.filter(p => p.status === 'approved').length}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Orbit className="w-5 h-5 text-purple-400" />
                <span className="text-white font-bold">Interstellar Network</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">FTL Links:</span>
                  <span className="text-white">{interstellarLinks.filter(l => l.ftl_enabled).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Systems:</span>
                  <span className="text-white">
                    {[...new Set(interstellarLinks.flatMap(l => [l.source_system, l.destination_system]))].length}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-cyan-950/30 border border-cyan-500/30 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span className="text-white font-bold">Auto-Upgrade</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Deploying:</span>
                  <span className="text-white">{upgrades.filter(u => u.status === 'deploying').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Deployed:</span>
                  <span className="text-white">{upgrades.filter(u => u.status === 'deployed').length}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}