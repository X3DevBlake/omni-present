import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Html } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { Network, Zap, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

const AgentNode = ({ position, agent, level, isSelected, onClick }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      if (isSelected) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.1);
      }
    }
  });
  
  const levelColors = {
    SOB: '#ef4444',
    manager: '#f59e0b',
    worker: '#3b82f6',
    specialist: '#8b5cf6'
  };
  
  const color = levelColors[level] || '#6b7280';
  const size = level === 'SOB' ? 0.3 : level === 'manager' ? 0.2 : 0.15;
  
  return (
    <group position={position} onClick={onClick}>
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 1.2 : 0.6}
        />
      </Sphere>
      <Text position={[0, size + 0.2, 0]} fontSize={0.12} color="white" anchorX="center">
        {agent.split('_')[0]}
      </Text>
    </group>
  );
};

const BroadcastWave = ({ from, radius }) => {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.x += 0.05;
      meshRef.current.scale.z += 0.05;
      meshRef.current.material.opacity = Math.max(0, meshRef.current.material.opacity - 0.02);
    }
  });
  
  return (
    <group position={from}>
      <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.02, 16, 32]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={1}
          transparent
          opacity={1}
        />
      </mesh>
    </group>
  );
};

export default function RecursiveHAASMonitor3D() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [broadcasting, setBroadcasting] = useState(false);
  const [swarmId, setSwarmId] = useState(null);

  const { data: swarms, refetch } = useQuery({
    queryKey: ['agent_swarms'],
    queryFn: () => base44.entities.AgentSwarmHierarchy.list('-created_date', 1),
    initialData: []
  });

  const swarm = swarms[0];

  const createSwarm = async () => {
    try {
      const response = await base44.functions.invoke('HAASOrchestrator', {
        action: 'create'
      });
      
      if (response.data.success) {
        setSwarmId(response.data.swarm_id);
        refetch();
      }
    } catch (error) {
      console.error('Failed to create swarm:', error);
    }
  };

  const broadcastAction = async () => {
    if (!swarm) return;
    
    setBroadcasting(true);
    
    try {
      const response = await base44.functions.invoke('HAASOrchestrator', {
        swarm_id: swarm.swarm_id,
        action: 'broadcast',
        agent_proposals: [
          { agent_id: 'trajectory_planner', action: 'optimize_path' },
          { agent_id: 'safety_monitor', action: 'check_constraints' },
          { agent_id: 'intent_interpreter', action: 'decode_intent' }
        ],
        bci_intent: true
      });
      
      setTimeout(() => {
        setBroadcasting(false);
        refetch();
      }, 2000);
    } catch (error) {
      console.error('Broadcast failed:', error);
      setBroadcasting(false);
    }
  };

  // Calculate agent positions in 3D hierarchy
  const agentPositions = [];
  if (swarm?.hierarchy_levels) {
    swarm.hierarchy_levels.forEach((level, levelIdx) => {
      const y = 2 - levelIdx * 1.5;
      const agentCount = level.agent_ids.length;
      level.agent_ids.forEach((agentId, agentIdx) => {
        const angle = (agentIdx / Math.max(agentCount, 1)) * Math.PI * 2;
        const radius = levelIdx === 0 ? 0 : levelIdx * 1.5;
        agentPositions.push({
          agent_id: agentId,
          level: level.level_name,
          position: [
            Math.cos(angle) * radius,
            y,
            Math.sin(angle) * radius
          ]
        });
      });
    });
  }

  return (
    <Card className="bg-gradient-to-br from-orange-950/90 via-red-950/90 to-purple-950/90 backdrop-blur-xl border-orange-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Network className="w-7 h-7 text-orange-400" />
          Hierarchical Autonomous Agent Swarm (HAAS)
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          Recursive architecture with Global Workspace Theory
        </p>
      </CardHeader>
      <CardContent>
        {!swarm ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Users className="w-16 h-16 text-gray-600" />
            <p className="text-gray-400">No active swarm detected</p>
            <Button onClick={createSwarm} className="bg-orange-600 hover:bg-orange-700">
              Initialize HAAS Swarm
            </Button>
          </div>
        ) : (
          <>
            <div className="h-[500px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-orange-500/20">
              <Canvas camera={{ position: [0, 3, 6], fov: 60 }}>
                <ambientLight intensity={0.3} />
                <pointLight position={[10, 10, 10]} intensity={0.8} />

                {/* Agent nodes */}
                {agentPositions.map((agent, idx) => (
                  <AgentNode
                    key={agent.agent_id}
                    position={agent.position}
                    agent={agent.agent_id}
                    level={agent.level}
                    isSelected={selectedAgent === agent.agent_id}
                    onClick={() => setSelectedAgent(agent.agent_id)}
                  />
                ))}

                {/* Connections between levels */}
                {agentPositions.map((agent, idx) => {
                  const parentLevel = swarm.hierarchy_levels.find(l => l.level_name === agent.level)?.level;
                  if (parentLevel === 0) return null;
                  
                  const parentLevelData = swarm.hierarchy_levels.find(l => l.level === parentLevel - 1);
                  if (!parentLevelData || parentLevelData.agent_ids.length === 0) return null;
                  
                  const parentAgent = agentPositions.find(a => 
                    parentLevelData.agent_ids.includes(a.agent_id)
                  );
                  
                  if (!parentAgent) return null;
                  
                  return (
                    <Line
                      key={`conn_${idx}`}
                      points={[
                        new THREE.Vector3(...agent.position),
                        new THREE.Vector3(...parentAgent.position)
                      ]}
                      color="#f59e0b"
                      lineWidth={1}
                      opacity={0.4}
                      transparent
                    />
                  );
                })}

                {/* Broadcast wave */}
                {broadcasting && (
                  <BroadcastWave from={[0, 2, 0]} radius={0.5} />
                )}

                <OrbitControls enableZoom />
              </Canvas>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-black/60 rounded-lg p-3 border border-red-500/30">
                <div className="text-red-400 text-xs mb-1">SOB Agents</div>
                <div className="text-white text-2xl font-bold">
                  {swarm.hierarchy_levels.find(l => l.level_name === 'SOB')?.agent_ids.length || 0}
                </div>
              </div>
              
              <div className="bg-black/60 rounded-lg p-3 border border-amber-500/30">
                <div className="text-amber-400 text-xs mb-1">Managers</div>
                <div className="text-white text-2xl font-bold">
                  {swarm.hierarchy_levels.find(l => l.level_name === 'manager')?.agent_ids.length || 0}
                </div>
              </div>
              
              <div className="bg-black/60 rounded-lg p-3 border border-blue-500/30">
                <div className="text-blue-400 text-xs mb-1">Workers</div>
                <div className="text-white text-2xl font-bold">{swarm.total_agents - 5}</div>
              </div>
            </div>

            <div className="bg-black/60 rounded-lg p-4 border border-green-500/30 mb-4">
              <div className="text-green-400 text-sm font-bold mb-2">GWT Sustainability</div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-xs">E/C Ratio:</span>
                <span className="text-white font-mono">
                  {swarm.gwt_implementation.sustainability_ratio?.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-xs">Ignition Threshold:</span>
                <Badge className={
                  swarm.gwt_implementation.sustainability_ratio > swarm.gwt_implementation.ignition_threshold
                    ? 'bg-green-600'
                    : 'bg-gray-600'
                }>
                  {swarm.gwt_implementation.sustainability_ratio > swarm.gwt_implementation.ignition_threshold
                    ? 'Active'
                    : 'Subliminal'}
                </Badge>
              </div>
            </div>

            <Button
              onClick={broadcastAction}
              disabled={broadcasting}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              {broadcasting ? 'Broadcasting...' : 'Trigger Global Broadcast'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}