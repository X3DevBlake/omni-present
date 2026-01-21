import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Line, Html, Float, Trail, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Map, Brain, Thermometer, Activity, Zap, Eye, Hand, Sparkles as SparklesIcon } from 'lucide-react';

// Ultra animated thought bubble with progression
function UltraThoughtBubble3D({ thought, position, index, showLinks = false }) {
  const bubbleRef = useRef();
  const [expanded, setExpanded] = useState(false);

  useFrame((state) => {
    if (bubbleRef.current) {
      const t = state.clock.elapsedTime;
      bubbleRef.current.position.y = position[1] + Math.sin(t * 2 + index * 0.5) * 0.08;
      bubbleRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
      
      // Pulsing based on confidence
      const pulse = 1 + (thought.confidence_level || 0.5) * Math.sin(t * 3) * 0.1;
      bubbleRef.current.scale.setScalar(pulse);
    }
  });

  const typeColors = {
    reasoning: '#3b82f6',
    planning: '#a855f7',
    decision: '#10b981',
    observation: '#f59e0b',
    prediction: '#ec4899',
    collaboration: '#06b6d4',
    learning: '#8b5cf6'
  };

  const color = typeColors[thought.thought_type] || '#00f5ff';

  return (
    <group ref={bubbleRef} position={position} onClick={() => setExpanded(!expanded)}>
      <Float speed={2} floatIntensity={0.3}>
        <Sphere args={[0.18, 24, 24]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.4} />
        </Sphere>
      </Float>

      {/* Confidence indicator ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.23, 32, 1, 0, (thought.confidence_level || 0.5) * Math.PI * 2]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>

      {/* Sparkles for high confidence */}
      {thought.confidence_level > 0.8 && (
        <Sparkles count={10} scale={0.5} size={1} speed={0.5} color={color} />
      )}

      <Html position={[0.25, 0, 0]} center={false}>
        <div 
          className={`bg-black/95 text-white rounded-xl shadow-2xl transition-all ${expanded ? 'p-4 min-w-72' : 'p-2 min-w-48'}`}
          style={{ borderColor: color, borderWidth: 2, borderStyle: 'solid' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="font-bold text-sm">{thought.thought_type}</span>
          </div>
          <p className="text-slate-300 text-xs mb-2">{thought.thought_content?.main_thought}</p>
          
          {expanded && (
            <>
              {thought.thought_content?.sub_thoughts?.map((st, i) => (
                <p key={i} className="text-slate-400 text-xs ml-3">• {st}</p>
              ))}
              {thought.thought_content?.conclusion && (
                <p className="text-cyan-300 text-xs mt-2 font-medium">→ {thought.thought_content.conclusion}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 bg-slate-700 rounded overflow-hidden">
                  <div className="h-full" style={{ width: `${(thought.confidence_level || 0) * 100}%`, backgroundColor: color }} />
                </div>
                <span className="text-xs text-slate-500">{((thought.confidence_level || 0) * 100).toFixed(0)}%</span>
              </div>
            </>
          )}
        </div>
      </Html>
    </group>
  );
}

// Ultra animated sensor with real-time data
function UltraSensor3D({ sensor, showValue = true }) {
  const sensorRef = useRef();
  const auraRef = useRef();
  
  const pos = sensor.position || { x: 0, y: 0, z: 0 };
  const isAlert = sensor.alert_triggered || (sensor.thresholds && sensor.reading_value > (sensor.thresholds.max_normal || 100));

  useFrame((state) => {
    if (sensorRef.current) {
      sensorRef.current.rotation.y = state.clock.elapsedTime * (isAlert ? 2 : 0.5);
      if (isAlert) {
        sensorRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 6) * 0.15);
      }
    }
    if (auraRef.current) {
      auraRef.current.scale.setScalar(1.5 + Math.sin(state.clock.elapsedTime * 2) * 0.2);
      auraRef.current.material.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
    }
  });

  const sensorColors = {
    temperature: '#ef4444',
    humidity: '#06b6d4',
    light: '#fbbf24',
    air_quality: '#10b981',
    motion: '#a855f7',
    sound: '#ec4899'
  };

  const color = sensorColors[sensor.sensor_type] || '#64748b';

  return (
    <group position={[pos.x, 0.5, pos.z]}>
      {/* Aura */}
      <Sphere ref={auraRef} args={[0.3, 32, 32]}>
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </Sphere>

      {/* Core sensor */}
      <mesh ref={sensorRef}>
        <octahedronGeometry args={[0.08, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isAlert ? 0.9 : 0.5} />
      </mesh>

      {/* Alert ring */}
      {isAlert && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
          <ringGeometry args={[0.35, 0.4, 32]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {showValue && (
        <Html position={[0, 0.25, 0]} center>
          <div className={`px-2 py-1 rounded text-xs font-bold ${isAlert ? 'bg-red-500/40 border-red-500' : 'bg-black/80 border-slate-600'} border`}>
            <span style={{ color }}>{sensor.reading_value?.toFixed(1)}</span>
            <span className="text-slate-400 ml-1">{sensor.unit}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

// Ultra task progress ring (3D interactive)
function UltraTaskProgress3D({ task, position }) {
  const progressRef = useRef();
  const ringRef = useRef();

  useFrame((state) => {
    if (progressRef.current) {
      progressRef.current.rotation.z = state.clock.elapsedTime * 0.6;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -state.clock.elapsedTime * 0.4;
    }
  });

  const progress = task.overall_progress || task.progress || 0;
  const activeTasks = task.task_decomposition?.filter(t => t.status === 'in_progress').length || 
                      task.sub_tasks?.filter(t => t.status === 'in_progress').length || 0;

  const statusColors = {
    planning: '#64748b',
    ready: '#3b82f6',
    executing: '#10b981',
    paused: '#f59e0b',
    completed: '#22c55e',
    failed: '#ef4444'
  };

  const color = statusColors[task.plan_status || task.task_status] || '#a855f7';

  return (
    <group position={position}>
      {/* Outer ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.35, 0.38, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Progress ring */}
      <mesh ref={progressRef} rotation={[0, 0, -Math.PI / 2]}>
        <ringGeometry args={[0.3, 0.34, 64, 1, 0, (progress / 100) * Math.PI * 2]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Center indicator */}
      <Sphere args={[0.12, 24, 24]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
      </Sphere>

      <Html position={[0, 0, 0]} center>
        <div className="bg-black/90 px-3 py-2 rounded-lg text-center min-w-24">
          <p className="text-white text-lg font-bold">{progress.toFixed(0)}%</p>
          {activeTasks > 0 && (
            <p className="text-xs" style={{ color }}>{activeTasks} active</p>
          )}
        </div>
      </Html>
    </group>
  );
}

// Gesture recognition indicator
function GestureIndicator3D({ gesture, position }) {
  const indicatorRef = useRef();

  useFrame((state) => {
    if (indicatorRef.current) {
      indicatorRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 5) * 0.2);
      indicatorRef.current.material.opacity = 0.8 - Math.sin(state.clock.elapsedTime * 4) * 0.2;
    }
  });

  const gestureColors = {
    swipe: '#3b82f6',
    pinch: '#10b981',
    grab: '#f59e0b',
    point: '#ec4899',
    wave: '#06b6d4',
    circle: '#a855f7'
  };

  const color = gestureColors[gesture?.type] || '#00f5ff';

  if (!gesture) return null;

  return (
    <group position={position}>
      <Sphere ref={indicatorRef} args={[0.15, 16, 16]}>
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </Sphere>
      <Html position={[0, 0.3, 0]} center>
        <div className="bg-black/90 px-3 py-1 rounded-lg text-xs" style={{ borderColor: color, borderWidth: 1, borderStyle: 'solid' }}>
          <span className="text-white font-bold">{gesture.type}</span>
        </div>
      </Html>
    </group>
  );
}

// Main ultra scene
function UltraSpatialScene({ 
  semanticGraph, 
  obstacles, 
  devices, 
  agents, 
  activeTasks,
  thoughts,
  sensorData, 
  gestureData,
  showHeatmap,
  showSensors,
  showTaskProgress,
  showThoughts
}) {
  return (
    <group>
      {/* Floor */}
      <Box args={[16, 0.05, 14]} position={[6, 0, 5]}>
        <meshStandardMaterial color="#050510" metalness={0.8} roughness={0.2} />
      </Box>
      <gridHelper args={[16, 32, '#1a3a60', '#0a1a35']} position={[6, 0.03, 5]} />

      {/* Ultra sensor heatmaps */}
      {showHeatmap && sensorData.map((sensor, idx) => (
        <SensorHeatmap3D key={sensor.id || idx} sensorData={sensor} type={sensor.sensor_type} />
      ))}

      {/* Ultra sensors */}
      {showSensors && sensorData.map((sensor, idx) => (
        <UltraSensor3D key={sensor.id || idx} sensor={sensor} showValue={true} />
      ))}

      {/* Semantic objects */}
      {semanticGraph?.nodes?.map((node, idx) => (
        <SemanticObject3D key={node.node_id || idx} node={node} />
      ))}

      {/* Agents with trails */}
      {agents.map((agent, idx) => (
        <UltraAgent3D key={agent.id || idx} agent={agent} />
      ))}

      {/* Ultra thought bubbles */}
      {showThoughts && thoughts.map((thought, idx) => {
        const agent = agents.find(a => a.agent_id === thought.agent_id);
        const pos = agent?.current_location || { x: idx * 2, y: 0, z: 0 };
        return (
          <UltraThoughtBubble3D
            key={thought.thought_id || idx}
            thought={thought}
            position={[pos.x + 0.5, 1, pos.z]}
            index={idx}
          />
        );
      })}

      {/* Ultra task progress */}
      {showTaskProgress && activeTasks.map((task, idx) => {
        const agent = agents.find(a => a.agent_id === task.agent_id || task.initiating_agent_id);
        const pos = agent?.current_location || { x: idx * 2, y: 0, z: idx * 2 };
        return (
          <UltraTaskProgress3D
            key={task.id || idx}
            task={task}
            position={[pos.x - 0.5, 1.2, pos.z]}
          />
        );
      })}

      {/* Gesture indicator */}
      {gestureData && (
        <GestureIndicator3D 
          gesture={gestureData} 
          position={[gestureData.position?.x || 0, 0.5, gestureData.position?.z || 0]} 
        />
      )}

      {/* Obstacles with predictions */}
      {obstacles.map((obs, idx) => (
        <PredictiveObstacle3D key={obs.id || idx} obstacle={obs} />
      ))}

      {/* Devices */}
      {devices.map((device, idx) => (
        <SmartDevice3D key={device.id || idx} device={device} />
      ))}
    </group>
  );
}

// Helper components
function SemanticObject3D({ node }) {
  const meshRef = useRef();
  const pos = node.position || { x: 0, y: 0, z: 0 };
  const dims = node.dimensions || { width: 0.5, height: 0.5, depth: 0.5 };

  useFrame((state) => {
    if (meshRef.current && node.properties?.interactable) {
      meshRef.current.material.emissiveIntensity = 0.2 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const typeColors = {
    furniture: '#f59e0b',
    door: '#10b981',
    window: '#06b6d4',
    appliance: '#3b82f6'
  };

  const color = typeColors[node.object_type] || '#64748b';

  return (
    <Box ref={meshRef} args={[dims.width, dims.height, dims.depth]} position={[pos.x, dims.height / 2, pos.z]}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} transparent opacity={0.8} />
    </Box>
  );
}

function UltraAgent3D({ agent }) {
  const agentRef = useRef();
  const pos = agent.current_location || { x: 0, y: 0, z: 0 };

  useFrame((state) => {
    if (agentRef.current) {
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
      agentRef.current.scale.setScalar(breathe);
    }
  });

  const color = agent.projection_status === 'active' ? '#00f5ff' : '#64748b';

  return (
    <group position={[pos.x, 0.35, pos.z]}>
      <Trail width={0.15} length={15} color={color} attenuation={(t) => t * t}>
        <Sphere ref={agentRef} args={[0.18, 32, 32]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} metalness={0.8} roughness={0.2} />
        </Sphere>
      </Trail>
    </group>
  );
}

function PredictiveObstacle3D({ obstacle }) {
  const pos = obstacle.current_position || { x: 0, y: 0, z: 0 };
  return (
    <Sphere args={[0.15, 16, 16]} position={[pos.x, 0.25, pos.z]}>
      <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
    </Sphere>
  );
}

function SmartDevice3D({ device }) {
  const pos = device.spatial_location || { x: 0, y: 0, z: 0 };
  const isOn = device.current_state?.power;
  const color = isOn ? '#10b981' : '#64748b';
  
  return (
    <Box args={[0.2, 0.2, 0.2]} position={[pos.x || 0, 0.1, pos.z || 0]}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isOn ? 0.6 : 0.2} />
    </Box>
  );
}

function SensorHeatmap3D({ sensorData, type }) {
  const meshRef = useRef();
  const pulseRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.opacity = 0.18 + Math.sin(state.clock.elapsedTime * 1.2) * 0.06;
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.03);
    }
    if (pulseRef.current) {
      pulseRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
      pulseRef.current.material.opacity = 0.12 + Math.sin(state.clock.elapsedTime * 3) * 0.06;
    }
  });

  const heatmapColors = {
    temperature: { low: '#3b82f6', high: '#ef4444' },
    humidity: { low: '#f59e0b', high: '#06b6d4' },
    light: { low: '#1e293b', high: '#fbbf24' },
    air_quality: { low: '#10b981', high: '#ef4444' }
  };

  const value = sensorData?.reading_value ?? 50;
  const min = sensorData?.thresholds?.min_normal ?? 0;
  const max = sensorData?.thresholds?.max_normal ?? 100;
  const normalized = Math.min(1, Math.max(0, (value - min) / (max - min || 1)));
  const scale = heatmapColors[type] || heatmapColors.temperature;
  const color = normalized < 0.5 ? scale.low : scale.high;

  const x = sensorData.position?.x ?? 5;
  const z = sensorData.position?.z ?? 5;

  return (
    <group>
      <mesh ref={meshRef} position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} />
      </mesh>
      <mesh ref={pulseRef} position={[x, 0.021, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.1, 2.25, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export default function UltraLiveSpatialProjectionMap3D() {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [showTaskProgress, setShowTaskProgress] = useState(true);
  const [showThoughts, setShowThoughts] = useState(true);
  const [gestureData, setGestureData] = useState(null);

  const { data: semanticGraphs = [] } = useQuery({
    queryKey: ['ultra-semantic-graphs'],
    queryFn: () => base44.entities.EnvironmentSemanticGraph.list('-created_date', 1),
    initialData: []
  });

  const { data: obstacles = [] } = useQuery({
    queryKey: ['ultra-obstacles'],
    queryFn: () => base44.entities.PredictiveObstacle.list('-created_date', 15),
    initialData: []
  });

  const { data: devices = [] } = useQuery({
    queryKey: ['ultra-devices'],
    queryFn: () => base44.entities.CrossPlatformDevice.list('-created_date', 20),
    initialData: []
  });

  const { data: agents = [] } = useQuery({
    queryKey: ['ultra-agents'],
    queryFn: () => base44.entities.AgentPhysicalPresence.filter({ projection_status: 'active' }),
    initialData: [],
    refetchInterval: 2000
  });

  const { data: activeTasks = [] } = useQuery({
    queryKey: ['ultra-tasks'],
    queryFn: () => base44.entities.AutonomousTaskPlan.filter({ plan_status: 'executing' }),
    initialData: [],
    refetchInterval: 2000
  });

  const { data: thoughts = [] } = useQuery({
    queryKey: ['ultra-thoughts'],
    queryFn: () => base44.entities.AgentThoughtProcess.list('-timestamp', 25),
    initialData: [],
    refetchInterval: 1500
  });

  const { data: sensorData = [] } = useQuery({
    queryKey: ['ultra-sensor-data'],
    queryFn: () => base44.entities.SensorData.list('-reading_timestamp', 40),
    initialData: [],
    refetchInterval: 2500
  });

  const currentGraph = semanticGraphs[0];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Map className="w-5 h-5 text-cyan-400" />
            Ultra Live Spatial Projection Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-4">
            <label className="flex items-center gap-2 text-sm text-white">
              <Switch checked={showHeatmap} onCheckedChange={setShowHeatmap} />
              <Thermometer className="w-4 h-4" /> Heatmaps
            </label>
            <label className="flex items-center gap-2 text-sm text-white">
              <Switch checked={showSensors} onCheckedChange={setShowSensors} />
              <Eye className="w-4 h-4" /> Sensors
            </label>
            <label className="flex items-center gap-2 text-sm text-white">
              <Switch checked={showTaskProgress} onCheckedChange={setShowTaskProgress} />
              <Activity className="w-4 h-4" /> Tasks
            </label>
            <label className="flex items-center gap-2 text-sm text-white">
              <Switch checked={showThoughts} onCheckedChange={setShowThoughts} />
              <Brain className="w-4 h-4" /> Thoughts
            </label>
          </div>

          <div className="grid grid-cols-5 gap-2">
            <div className="bg-slate-800/50 rounded p-2 text-center">
              <p className="text-slate-400 text-xs">Objects</p>
              <p className="text-white font-bold">{currentGraph?.nodes?.length || 0}</p>
            </div>
            <div className="bg-slate-800/50 rounded p-2 text-center">
              <p className="text-slate-400 text-xs">Agents</p>
              <p className="text-cyan-400 font-bold">{agents.length}</p>
            </div>
            <div className="bg-slate-800/50 rounded p-2 text-center">
              <p className="text-slate-400 text-xs">Sensors</p>
              <p className="text-green-400 font-bold">{sensorData.length}</p>
            </div>
            <div className="bg-slate-800/50 rounded p-2 text-center">
              <p className="text-slate-400 text-xs">Tasks</p>
              <p className="text-purple-400 font-bold">{activeTasks.length}</p>
            </div>
            <div className="bg-slate-800/50 rounded p-2 text-center">
              <p className="text-slate-400 text-xs">Thoughts</p>
              <p className="text-pink-400 font-bold">{thoughts.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardContent className="p-0">
          <div className="h-[600px]">
            <Canvas camera={{ position: [12, 10, 12], fov: 55 }}>
              <ambientLight intensity={0.15} />
              <pointLight position={[10, 12, 10]} intensity={0.8} color="#ffffff" />
              <pointLight position={[-5, 8, -5]} intensity={0.5} color="#a855f7" />
              <pointLight position={[5, 5, 5]} intensity={0.3} color="#00f5ff" />
              <spotLight position={[0, 15, 0]} angle={0.5} penumbra={0.5} intensity={0.4} color="#ec4899" />

              <UltraSpatialScene
                semanticGraph={currentGraph}
                obstacles={obstacles}
                devices={devices}
                agents={agents}
                activeTasks={activeTasks}
                thoughts={thoughts}
                sensorData={sensorData}
                gestureData={gestureData}
                showHeatmap={showHeatmap}
                showSensors={showSensors}
                showTaskProgress={showTaskProgress}
                showThoughts={showThoughts}
              />

              <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 2.1} />
            </Canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}