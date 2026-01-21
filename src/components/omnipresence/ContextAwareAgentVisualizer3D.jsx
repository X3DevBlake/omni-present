import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Line, Html, Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Brain, Eye, Thermometer, Sun, Volume2, Users, Loader2, Activity } from 'lucide-react';

// Context-aware agent with adaptive behavior
function ContextAwareAgent3D({ agent, contextualState, sensorData, onSelect, isSelected }) {
  const agentRef = useRef();
  const auraRef = useRef();
  const [hovered, setHovered] = useState(false);

  const pos = agent.current_location || { x: 0, y: 0, z: 0 };
  const awarenessScore = contextualState?.awareness_score || 50;

  useFrame((state) => {
    if (agentRef.current) {
      // Breathing based on awareness
      const breathe = 1 + Math.sin(state.clock.elapsedTime * (1 + awarenessScore / 100)) * 0.04;
      agentRef.current.scale.setScalar(breathe);
      
      // Rotate based on environmental activity
      agentRef.current.rotation.y += 0.01 * (awarenessScore / 100);
    }

    if (auraRef.current) {
      // Awareness aura pulsing
      const pulse = 0.5 + (awarenessScore / 100) * 0.5;
      auraRef.current.scale.setScalar(pulse + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });

  // Color based on awareness and context
  const agentColor = useMemo(() => {
    if (awarenessScore > 80) return '#10b981';
    if (awarenessScore > 50) return '#00f5ff';
    return '#64748b';
  }, [awarenessScore]);

  const roomType = contextualState?.current_context?.room_type;
  const nearbyObjects = contextualState?.current_context?.nearby_objects || [];
  const adaptations = contextualState?.behavioral_adaptations || [];

  return (
    <group
      position={[pos.x, 0.4, pos.z]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onSelect && onSelect(agent)}
    >
      {/* Agent body */}
      <group ref={agentRef}>
        <Sphere args={[0.2, 32, 32]}>
          <meshStandardMaterial color={agentColor} emissive={agentColor} emissiveIntensity={0.7} metalness={0.8} />
        </Sphere>
        
        {/* Awareness indicator rings */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.32, 32]} />
          <meshBasicMaterial color={agentColor} transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Awareness aura */}
      <Sphere ref={auraRef} args={[0.4, 32, 32]}>
        <meshBasicMaterial color={agentColor} transparent opacity={0.1 + (awarenessScore / 200)} />
      </Sphere>

      {/* Context visualization - objects within awareness */}
      {nearbyObjects.slice(0, 3).map((obj, idx) => {
        const angle = (idx / 3) * Math.PI * 2;
        const radius = 0.6;
        return (
          <group key={idx}>
            <Line
              points={[
                [0, 0, 0],
                [Math.cos(angle) * radius, 0.1, Math.sin(angle) * radius]
              ]}
              color="#00f5ff"
              lineWidth={1}
              transparent
              opacity={0.3}
            />
            <Sphere args={[0.04, 8, 8]} position={[Math.cos(angle) * radius, 0.1, Math.sin(angle) * radius]}>
              <meshBasicMaterial color="#f59e0b" />
            </Sphere>
          </group>
        );
      })}

      {/* Adaptations indicator */}
      {adaptations.length > 0 && (
        <Float speed={2}>
          <mesh position={[0, 0.4, 0]}>
            <octahedronGeometry args={[0.06, 0]} />
            <meshBasicMaterial color="#a855f7" />
          </mesh>
        </Float>
      )}

      {/* Info panel */}
      {(hovered || isSelected) && (
        <Html position={[0, 0.8, 0]} center>
          <div className="bg-black/95 text-white px-4 py-3 rounded-lg text-xs min-w-56 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: agentColor }} />
              <span className="font-bold">Agent {agent.agent_id?.slice(0, 8)}</span>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Awareness</span>
                <span style={{ color: agentColor }}>{awarenessScore}/100</span>
              </div>
              
              {roomType && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Room</span>
                  <span className="text-cyan-400 capitalize">{roomType}</span>
                </div>
              )}

              {nearbyObjects.length > 0 && (
                <div>
                  <span className="text-slate-400">Nearby ({nearbyObjects.length})</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {nearbyObjects.slice(0, 3).map((obj, i) => (
                      <span key={i} className="bg-orange-500/20 text-orange-400 px-1 rounded text-xs">
                        {obj.object_label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {adaptations.length > 0 && (
                <div>
                  <span className="text-slate-400">Adaptations</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {adaptations.slice(0, 2).map((adapt, i) => (
                      <span key={i} className="bg-purple-500/20 text-purple-400 px-1 rounded text-xs">
                        {adapt.adaptation_type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {contextualState?.current_context?.environmental_conditions && (
                <div className="border-t border-slate-700 pt-2 mt-2 text-xs">
                  {Object.entries(contextualState.current_context.environmental_conditions).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-slate-500 capitalize">{key}</span>
                      <span className="text-slate-300">{typeof value === 'number' ? value.toFixed(1) : value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Sensor data visualization
function SensorOverlay3D({ sensor }) {
  const meshRef = useRef();
  const pos = sensor.position || { x: 0, y: 0, z: 0 };

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  const sensorColors = {
    temperature: '#ef4444',
    humidity: '#06b6d4',
    light: '#fbbf24',
    motion: '#ec4899',
    air_quality: '#10b981',
    sound: '#8b5cf6'
  };

  const color = sensorColors[sensor.sensor_type] || '#64748b';

  return (
    <group position={[pos.x, 0.1, pos.z]}>
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.5, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      
      <Sphere args={[0.08, 16, 16]} position={[0, 0.5, 0]}>
        <meshBasicMaterial color={color} />
      </Sphere>

      <Html position={[0, 0.7, 0]} center>
        <div className="bg-black/80 px-2 py-1 rounded text-xs" style={{ color }}>
          {sensor.sensor_type}: {sensor.reading_value?.toFixed(1)} {sensor.unit}
        </div>
      </Html>
    </group>
  );
}

// Main scene
function ContextScene({ agents, contextualStates, sensorData, selectedAgent, onSelectAgent }) {
  return (
    <group>
      <Box args={[16, 0.05, 14]} position={[6, 0, 5]}>
        <meshStandardMaterial color="#050510" />
      </Box>
      <gridHelper args={[16, 32, '#1a3050', '#0a1828']} position={[6, 0.03, 5]} />

      {sensorData.map((sensor, idx) => (
        <SensorOverlay3D key={sensor.id || idx} sensor={sensor} />
      ))}

      {agents.map((agent, idx) => {
        const context = contextualStates.find(cs => cs.agent_id === agent.agent_id);
        return (
          <ContextAwareAgent3D
            key={agent.id || idx}
            agent={agent}
            contextualState={context}
            sensorData={sensorData}
            isSelected={selectedAgent?.id === agent.id}
            onSelect={onSelectAgent}
          />
        );
      })}
    </group>
  );
}

export default function ContextAwareAgentVisualizer3D() {
  const queryClient = useQueryClient();
  const [selectedAgent, setSelectedAgent] = useState(null);

  const { data: agents = [] } = useQuery({
    queryKey: ['context-agents'],
    queryFn: () => base44.entities.AgentPhysicalPresence.list('-created_date', 20),
    initialData: [],
    refetchInterval: 3000
  });

  const { data: contextualStates = [] } = useQuery({
    queryKey: ['contextual-states'],
    queryFn: () => base44.entities.AgentContextualState.list('-last_context_update', 20),
    initialData: [],
    refetchInterval: 5000
  });

  const { data: sensorData = [] } = useQuery({
    queryKey: ['sensor-data'],
    queryFn: () => base44.entities.SensorData.list('-reading_timestamp', 50),
    initialData: [],
    refetchInterval: 2000
  });

  const updateContextMutation = useMutation({
    mutationFn: async (agentId) => {
      const response = await base44.functions.invoke('context-aware-agent-intelligence', {
        agent_id: agentId,
        update_context: true,
        generate_adaptations: true
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Context updated! Awareness: ${data.context_summary?.awareness_score}/100`);
      queryClient.invalidateQueries(['contextual-states']);
    }
  });

  const avgAwareness = contextualStates.length > 0
    ? contextualStates.reduce((sum, cs) => sum + (cs.awareness_score || 50), 0) / contextualStates.length
    : 0;

  const totalAdaptations = contextualStates.reduce((sum, cs) => sum + (cs.behavioral_adaptations?.length || 0), 0);

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-emerald-400" />
            Context-Aware Agent Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => agents.forEach(a => updateContextMutation.mutate(a.agent_id))}
              disabled={updateContextMutation.isPending}
              className="bg-gradient-to-r from-emerald-600 to-teal-600"
            >
              {updateContextMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating</>
              ) : (
                <><Eye className="w-4 h-4 mr-2" /> Update All Contexts</>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs flex items-center gap-1"><Brain className="w-3 h-3" /> Avg Awareness</p>
              <p className="text-white text-xl font-bold">{avgAwareness.toFixed(0)}/100</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs flex items-center gap-1"><Activity className="w-3 h-3" /> Adaptations</p>
              <p className="text-white text-xl font-bold">{totalAdaptations}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs flex items-center gap-1"><Thermometer className="w-3 h-3" /> Sensors</p>
              <p className="text-white text-xl font-bold">{sensorData.length}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs flex items-center gap-1"><Users className="w-3 h-3" /> Context-Aware</p>
              <p className="text-white text-xl font-bold">{contextualStates.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">3D Context Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[550px]">
            <Canvas camera={{ position: [10, 8, 10], fov: 50 }}>
              <ambientLight intensity={0.25} />
              <pointLight position={[10, 12, 10]} intensity={1} />
              <pointLight position={[-5, 8, -5]} intensity={0.5} color="#10b981" />

              <ContextScene
                agents={agents}
                contextualStates={contextualStates}
                sensorData={sensorData}
                selectedAgent={selectedAgent}
                onSelectAgent={setSelectedAgent}
              />

              <OrbitControls enableZoom={true} />
            </Canvas>
          </div>
        </CardContent>
      </Card>

      {selectedAgent && contextualStates.find(cs => cs.agent_id === selectedAgent.agent_id) && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              Agent Context Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const context = contextualStates.find(cs => cs.agent_id === selectedAgent.agent_id);
              return (
                <div className="space-y-3">
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-slate-400 text-sm mb-2">Current Context</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">Room:</span>
                        <span className="text-white ml-2 capitalize">{context?.current_context?.room_type || 'Unknown'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Zone:</span>
                        <span className="text-white ml-2">{context?.current_context?.activity_zone || 'General'}</span>
                      </div>
                    </div>
                  </div>

                  {context?.behavioral_adaptations?.length > 0 && (
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-slate-400 text-sm mb-2">Active Adaptations</p>
                      <div className="space-y-2">
                        {context.behavioral_adaptations.slice(0, 3).map((adapt, i) => (
                          <div key={i} className="flex items-start justify-between text-xs">
                            <span className="text-purple-400">{adapt.adaptation_type}</span>
                            <Badge className="bg-purple-500/20 text-purple-300">
                              {((adapt.confidence || 0.8) * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {context?.communication_adjustments && (
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-slate-400 text-sm mb-2">Communication Style</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-cyan-500/20 text-cyan-400">
                          {context.communication_adjustments.tone}
                        </Badge>
                        <Badge className="bg-blue-500/20 text-blue-400">
                          {context.communication_adjustments.verbosity}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}