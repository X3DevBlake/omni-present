import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Line, Html, Float, Plane, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Map, Thermometer, Sun, Volume2, Activity, Zap, Navigation } from 'lucide-react';

// Semantic object with full interaction
function SemanticObject3D({ node, onSelect, isSelected, showLabels }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const pos = node.position || { x: 0, y: 0, z: 0 };
  const dims = node.dimensions || { width: 0.5, height: 0.5, depth: 0.5 };

  useFrame((state) => {
    if (ref.current) {
      if (isSelected) {
        ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.05);
      }
      if (node.properties?.interactable) {
        ref.current.material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }
    }
  });

  const typeColors = {
    furniture: '#f59e0b',
    appliance: '#3b82f6',
    door: '#10b981',
    window: '#06b6d4',
    wall: '#475569',
    plant: '#22c55e',
    decoration: '#a855f7'
  };

  const color = typeColors[node.object_type] || '#64748b';

  return (
    <group
      position={[pos.x, (dims.height || 0.5) / 2, pos.z]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onSelect && onSelect(node)}
    >
      <Box ref={ref} args={[dims.width || 0.5, dims.height || 0.5, dims.depth || 0.5]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered || isSelected ? 0.5 : 0.2}
          transparent
          opacity={0.85}
        />
      </Box>

      {node.properties?.interactable && (
        <Float speed={3}>
          <Sphere args={[0.06, 16, 16]} position={[0, dims.height / 2 + 0.12, 0]}>
            <meshBasicMaterial color="#00f5ff" />
          </Sphere>
        </Float>
      )}

      {(hovered || (showLabels && node.properties?.interactable)) && (
        <Html position={[0, dims.height / 2 + 0.3, 0]} center>
          <div className="bg-black/95 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
            <span style={{ color }}>{node.label}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

// Predictive obstacle with trajectory
function PredictiveObstacle3D({ obstacle, showTrajectory }) {
  const ref = useRef();
  const trailRef = useRef([]);
  const pos = obstacle.current_position || { x: 0, y: 0, z: 0 };

  useFrame((state, delta) => {
    if (ref.current && obstacle.velocity) {
      // Simulate movement
      ref.current.position.x += (obstacle.velocity.vx || 0) * delta * 0.5;
      ref.current.position.z += (obstacle.velocity.vz || 0) * delta * 0.5;
      ref.current.rotation.y += 0.02;
    }
  });

  const typeColors = {
    person: '#ec4899',
    pet: '#a855f7',
    robot: '#3b82f6',
    unknown_dynamic: '#64748b'
  };

  const color = typeColors[obstacle.obstacle_type] || '#f59e0b';

  // Trajectory points
  const trajectoryPoints = useMemo(() => {
    if (!showTrajectory || !obstacle.predicted_trajectory) return [];
    return obstacle.predicted_trajectory.map(t => 
      new THREE.Vector3(t.position?.x || 0, 0.2, t.position?.z || 0)
    );
  }, [obstacle.predicted_trajectory, showTrajectory]);

  return (
    <group ref={ref} position={[pos.x, 0.3, pos.z]}>
      <Sphere args={[0.15, 16, 16]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
      </Sphere>

      {/* Avoidance buffer zone */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.15, 0]}>
        <ringGeometry args={[obstacle.avoidance_buffer_meters || 0.5, (obstacle.avoidance_buffer_meters || 0.5) + 0.05, 32]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* Predicted trajectory */}
      {trajectoryPoints.length > 1 && (
        <Line points={trajectoryPoints} color={color} lineWidth={2} dashed transparent opacity={0.5} />
      )}

      <Html position={[0, 0.3, 0]} center>
        <div className="bg-black/80 px-2 py-1 rounded text-xs" style={{ color }}>
          {obstacle.obstacle_type}
        </div>
      </Html>
    </group>
  );
}

// Smart device with real-time state
function SmartDevice3D({ device, onControl }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const pos = device.spatial_location || device.device_location || { x: 0, y: 0, z: 0 };

  useFrame((state) => {
    if (ref.current) {
      if (device.current_state?.power) {
        ref.current.material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      }
    }
  });

  const categoryIcons = {
    lighting: '💡',
    climate: '🌡️',
    security: '🔒',
    entertainment: '📺',
    sensor: '📡',
    appliance: '🔌'
  };

  const isOn = device.current_state?.power !== false;
  const color = isOn ? '#10b981' : '#64748b';

  return (
    <group
      position={[pos.x || 0, 0.5, pos.z || 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onControl && onControl(device)}
    >
      <Box ref={ref} args={[0.25, 0.25, 0.25]}>
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={isOn ? 0.5 : 0.1}
          metalness={0.7}
          roughness={0.3}
        />
      </Box>

      {/* Connection status indicator */}
      <Sphere args={[0.04, 8, 8]} position={[0.15, 0.15, 0.15]}>
        <meshBasicMaterial color={device.connection_status === 'online' ? '#10b981' : '#ef4444'} />
      </Sphere>

      {hovered && (
        <Html position={[0, 0.4, 0]} center>
          <div className="bg-black/95 text-white px-3 py-2 rounded-lg text-xs min-w-36">
            <p className="font-bold">{categoryIcons[device.device_category]} {device.device_name}</p>
            <p className="text-slate-400">{device.protocol || device.api_provider}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={isOn ? 'text-green-400' : 'text-slate-500'}>{isOn ? 'ON' : 'OFF'}</span>
              {device.current_state?.brightness !== undefined && (
                <span className="text-yellow-400">{device.current_state.brightness}%</span>
              )}
              {device.current_state?.temperature_current !== undefined && (
                <span className="text-cyan-400">{device.current_state.temperature_current}°</span>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Sensor data heatmap overlay (ultra animated)
function SensorHeatmap3D({ sensorData, type = 'temperature' }) {
  const meshRef = useRef();
  const pulseRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime;
      meshRef.current.material.opacity = 0.18 + Math.sin(t * 1.2) * 0.06;
      meshRef.current.scale.setScalar(1 + Math.sin(t * 0.8) * 0.03);
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
    air_quality: { low: '#10b981', high: '#ef4444' },
  };

  const gradientColor = useMemo(() => {
    const value = sensorData?.reading_value ?? sensorData?.value ?? 50;
    const min = sensorData?.thresholds?.min_normal ?? 0;
    const max = sensorData?.thresholds?.max_normal ?? 100;
    const normalized = Math.min(1, Math.max(0, (value - min) / (max - min || 1)));
    const scale = heatmapColors[type] || heatmapColors.temperature;
    // simple lerp between low/high
    return normalized < 0.5 ? scale.low : scale.high;
  }, [sensorData, type]);

  if (!sensorData) return null;

  const x = sensorData.position?.x ?? 5;
  const z = sensorData.position?.z ?? 5;

  return (
    <group>
      <mesh ref={meshRef} position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2, 48]} />
        <meshBasicMaterial color={gradientColor} transparent opacity={0.25} />
      </mesh>
      {/* subtle pulse ring */}
      <mesh ref={pulseRef} position={[x, 0.021, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.1, 2.25, 64]} />
        <meshBasicMaterial color={gradientColor} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// Navigation mesh visualization
function NavigationMesh3D({ waypoints, showPaths }) {
  if (!waypoints || waypoints.length === 0) return null;

  return (
    <group>
      {waypoints.map((wp, idx) => (
        <group key={wp.waypoint_id || idx} position={[wp.position?.x || 0, 0.05, wp.position?.z || 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.15, 0.2, 16]} />
            <meshBasicMaterial color="#00f5ff" transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {showPaths && waypoints.map((wp, idx) => {
        if (!wp.connected_to) return null;
        return wp.connected_to.map((targetId, connIdx) => {
          const target = waypoints.find(w => w.waypoint_id === targetId);
          if (!target) return null;
          return (
            <Line
              key={`${idx}-${connIdx}`}
              points={[
                [wp.position?.x || 0, 0.05, wp.position?.z || 0],
                [target.position?.x || 0, 0.05, target.position?.z || 0]
              ]}
              color="#00f5ff"
              lineWidth={1}
              transparent
              opacity={0.3}
            />
          );
        });
      })}
    </group>
  );
}

// Task execution overlay
function TaskExecutionOverlay3D({ task, agents, devices }) {
  if (!task || task.task_status !== 'in_progress') return null;

  const executingAgents = agents.filter(a => 
    task.participating_agents?.some(pa => pa.agent_id === a.agent_id)
  );

  return (
    <group>
      {executingAgents.map((agent, idx) => {
        const agentPos = agent.current_location || { x: 0, y: 0, z: 0 };
        
        // Find target device for current subtask
        const currentSubtask = task.task_decomposition?.find(t => t.status === 'in_progress' && t.assigned_to === agent.agent_id);
        
        return (
          <group key={agent.id || idx}>
            {/* Task progress indicator above agent */}
            <Html position={[agentPos.x, 1.5, agentPos.z]} center>
              <div className="bg-purple-500/20 border border-purple-500/50 px-2 py-1 rounded text-xs text-purple-300">
                <div className="w-20 h-1 bg-slate-700 rounded overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 transition-all" 
                    style={{ width: `${task.progress || 0}%` }}
                  />
                </div>
                <p className="text-center mt-1">{task.progress || 0}%</p>
              </div>
            </Html>

            {/* Connection beam to target device */}
            {currentSubtask && (
              <Line
                points={[
                  [agentPos.x, 0.5, agentPos.z],
                  [5, 0.5, 5] // Would be device position
                ]}
                color="#a855f7"
                lineWidth={2}
                dashed
              />
            )}
          </group>
        );
      })}
    </group>
  );
}

// Real-time sensor overlay
function LiveSensorOverlay3D({ sensors, showValues = true }) {
  return (
    <group>
      {sensors.map((sensor, idx) => {
        const pos = sensor.position || { x: 0, y: 0, z: 0 };
        const sensorColors = {
          temperature: '#ef4444',
          humidity: '#06b6d4',
          light: '#fbbf24',
          air_quality: '#10b981',
          motion: '#ec4899'
        };
        const color = sensorColors[sensor.sensor_type] || '#64748b';
        
        return (
          <group key={sensor.id || idx} position={[pos.x, 0.5, pos.z]}>
            <Float speed={2}>
              <Sphere args={[0.08, 16, 16]}>
                <meshBasicMaterial color={color} transparent opacity={0.8} />
              </Sphere>
            </Float>
            
            {showValues && (
              <Html position={[0, 0.15, 0]} center>
                <div className="bg-black/80 px-2 py-1 rounded text-xs" style={{ color }}>
                  {sensor.sensor_type}: {sensor.reading_value?.toFixed(1)}{sensor.unit}
                  {sensor.trend && <span className="ml-1">{sensor.trend === 'increasing' ? '↑' : sensor.trend === 'decreasing' ? '↓' : '→'}</span>}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

// Live task progress overlay with interactive bars
function LiveTaskProgressOverlay3D({ tasks, agents, color = '#a855f7', showSteps = true }) {
  return (
    <group>
      {tasks.map((task, idx) => {
        const primaryAgent = agents.find(a => 
          task.participating_agents?.some(pa => pa.agent_id === a.agent_id)
        );
        
        if (!primaryAgent?.current_location) return null;
        
        const pos = primaryAgent.current_location;
        
        return (
          <group key={task.id || idx} position={[pos.x, 1.2, pos.z]}>
            <Html center>
              <div className="bg-purple-500/20 border border-purple-500/50 px-3 py-2 rounded-lg text-xs text-white min-w-40">
                <p className="font-bold mb-1">{task.task_name}</p>
                <div className="w-full h-2 bg-slate-700 rounded overflow-hidden mb-1">
                  <div 
                    className="h-full transition-all" 
                    style={{ width: `${task.progress || 0}%`, background: `linear-gradient(90deg, ${color}, #ec4899)` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{task.progress || 0}%</span>
                  {showSteps && (
                    <span className="text-purple-300">{task.task_decomposition?.filter(t => t.status === 'completed').length || 0}/{task.task_decomposition?.length || 0} steps</span>
                  )}
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

// Main scene
function SpatialScene({ 
  semanticGraph, 
  obstacles, 
  devices, 
  agents, 
  activeTasks,
  sensorData,
  showLabels,
  showTrajectories,
  showNavigation,
  showHeatmap,
  showSensors,
  showTaskProgress,
  onObjectSelect,
  onDeviceControl
}) {
  return (
    <group>
      {/* Floor */}
      <Box args={[16, 0.05, 14]} position={[6, 0, 5]}>
        <meshStandardMaterial color="#080815" />
      </Box>
      <gridHelper args={[16, 32, '#1a2744', '#0a1525']} position={[6, 0.03, 5]} />

      {/* Semantic objects */}
      {semanticGraph?.nodes?.map((node, idx) => (
        <SemanticObject3D
          key={node.node_id || idx}
          node={node}
          onSelect={onObjectSelect}
          showLabels={showLabels}
        />
      ))}

      {/* Predictive obstacles */}
      {obstacles.map((obstacle, idx) => (
        <PredictiveObstacle3D
          key={obstacle.obstacle_id || idx}
          obstacle={obstacle}
          showTrajectory={showTrajectories}
        />
      ))}

      {/* Smart devices */}
      {devices.map((device, idx) => (
        <SmartDevice3D
          key={device.id || idx}
          device={device}
          onControl={onDeviceControl}
        />
      ))}

      {/* Agents */}
      {agents.map((agent, idx) => {
        const pos = agent.current_location || { x: 0, y: 0, z: 0 };
        const statusColors = { active: '#00f5ff', idle: '#64748b', transitioning: '#f59e0b' };
        const color = statusColors[agent.projection_status] || '#00f5ff';
        
        return (
          <group key={agent.id || idx} position={[pos.x, 0.4, pos.z]}>
            <Float speed={2}>
              <Sphere args={[0.2, 32, 32]}>
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
              </Sphere>
            </Float>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.25, 0]}>
              <ringGeometry args={[agent.interaction_zone_radius || 1, (agent.interaction_zone_radius || 1) + 0.1, 32]} />
              <meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })}

      {/* Navigation mesh */}
      {showNavigation && (
        <NavigationMesh3D 
          waypoints={semanticGraph?.navigation_mesh?.waypoints} 
          showPaths={true}
        />
      )}

      {/* Sensor heatmap */}
      {showHeatmap && sensorData.map((sensor, idx) => (
        <SensorHeatmap3D key={idx} sensorData={sensor} type="temperature" />
      ))}

      {/* Task execution overlays */}
      {activeTasks.map((task, idx) => (
        <TaskExecutionOverlay3D
          key={task.id || idx}
          task={task}
          agents={agents}
          devices={devices}
        />
      ))}

      {/* Live sensor overlays */}
      {showSensors && <LiveSensorOverlay3D sensors={sensorData} showValues={true} />}

      {/* Live task progress */}
      {showTaskProgress && <LiveTaskProgressOverlay3D tasks={activeTasks} agents={agents} />}
    </group>
  );
}

export default function LiveSpatialProjectionMap3D() {
  const queryClient = useQueryClient();
  const [selectedObject, setSelectedObject] = useState(null);
  const [showLabels, setShowLabels] = useState(true);
  const [showTrajectories, setShowTrajectories] = useState(true);
  const [showNavigation, setShowNavigation] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showSensors, setShowSensors] = useState(true);
  const [showTaskProgress, setShowTaskProgress] = useState(true);

  const { data: semanticGraphs = [] } = useQuery({
    queryKey: ['spatial-semantic-graphs'],
    queryFn: () => base44.entities.EnvironmentSemanticGraph.list('-created_date', 1),
    initialData: []
  });

  const { data: obstacles = [] } = useQuery({
    queryKey: ['spatial-obstacles'],
    queryFn: () => base44.entities.PredictiveObstacle.list('-last_updated', 20),
    initialData: [],
    refetchInterval: 2000
  });

  const { data: devices = [] } = useQuery({
    queryKey: ['spatial-devices'],
    queryFn: () => base44.entities.CrossPlatformDevice.list('-created_date', 50),
    initialData: []
  });

  const { data: agents = [] } = useQuery({
    queryKey: ['spatial-agents'],
    queryFn: () => base44.entities.AgentPhysicalPresence.list('-created_date', 20),
    initialData: [],
    refetchInterval: 3000
  });

  const { data: activeTasks = [] } = useQuery({
    queryKey: ['spatial-tasks'],
    queryFn: () => base44.entities.AgentCollaborativeTask.filter({ task_status: 'in_progress' }),
    initialData: []
  });

  const currentGraph = semanticGraphs[0];

  // Real sensor data
  const { data: sensorData = [] } = useQuery({
    queryKey: ['live-spatial-sensors'],
    queryFn: () => base44.entities.SensorData.list('-reading_timestamp', 30),
    initialData: [],
    refetchInterval: 3000
  });

  const { data: taskPlans = [] } = useQuery({
    queryKey: ['live-spatial-task-plans'],
    queryFn: () => base44.entities.AutonomousTaskPlan.filter({ plan_status: 'executing' }),
    initialData: [],
    refetchInterval: 3000
  });

  const handleDeviceControl = async (device) => {
    toast.info(`Device: ${device.device_name} - Click to toggle`);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Map className="w-5 h-5 text-cyan-400" />
            Live Spatial Projection Map
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={showLabels ? 'default' : 'outline'}
              onClick={() => setShowLabels(!showLabels)}
            >
              Labels
            </Button>
            <Button
              size="sm"
              variant={showTrajectories ? 'default' : 'outline'}
              onClick={() => setShowTrajectories(!showTrajectories)}
            >
              <Navigation className="w-4 h-4 mr-1" /> Trajectories
            </Button>
            <Button
              size="sm"
              variant={showNavigation ? 'default' : 'outline'}
              onClick={() => setShowNavigation(!showNavigation)}
            >
              <Activity className="w-4 h-4 mr-1" /> Nav Mesh
            </Button>
            <Button
              size="sm"
              variant={showHeatmap ? 'default' : 'outline'}
              onClick={() => setShowHeatmap(!showHeatmap)}
            >
              <Thermometer className="w-4 h-4 mr-1" /> Heatmap
            </Button>
            <Button
              size="sm"
              variant={showSensors ? 'default' : 'outline'}
              onClick={() => setShowSensors(!showSensors)}
            >
              <Sun className="w-4 h-4 mr-1" /> Sensors
            </Button>
            <Button
              size="sm"
              variant={showTaskProgress ? 'default' : 'outline'}
              onClick={() => setShowTaskProgress(!showTaskProgress)}
            >
              <Activity className="w-4 h-4 mr-1" /> Tasks
            </Button>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Objects</p>
              <p className="text-white text-xl font-bold">{currentGraph?.nodes?.length || 0}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Moving</p>
              <p className="text-orange-400 text-xl font-bold">{obstacles.length}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Devices</p>
              <p className="text-green-400 text-xl font-bold">{devices.length}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Agents</p>
              <p className="text-white text-xl font-bold">{agents.length}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Sensors</p>
              <p className="text-cyan-400 text-xl font-bold">{sensorData.length}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Task Plans</p>
              <p className="text-purple-400 text-xl font-bold">{taskPlans.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardContent className="p-0">
          <div className="h-[600px]">
            <Canvas camera={{ position: [12, 10, 12], fov: 50 }}>
              <ambientLight intensity={0.25} />
              <pointLight position={[10, 12, 10]} intensity={1} />
              <pointLight position={[-5, 8, -5]} intensity={0.5} color="#a855f7" />

              <SpatialScene
                semanticGraph={currentGraph}
                obstacles={obstacles}
                devices={devices}
                agents={agents}
                activeTasks={activeTasks}
                sensorData={sensorData}
                showLabels={showLabels}
                showTrajectories={showTrajectories}
                showNavigation={showNavigation}
                showHeatmap={showHeatmap}
                showSensors={showSensors}
                showTaskProgress={showTaskProgress}
                onObjectSelect={setSelectedObject}
                onDeviceControl={handleDeviceControl}
              />

              <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 2.1} />
            </Canvas>
          </div>
        </CardContent>
      </Card>

      {selectedObject && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              Selected: {selectedObject.label}
              <Badge>{selectedObject.object_type}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Position</p>
                <p className="text-white">
                  ({selectedObject.position?.x?.toFixed(1)}, {selectedObject.position?.z?.toFixed(1)})
                </p>
              </div>
              <div>
                <p className="text-slate-400">Size</p>
                <p className="text-white">
                  {selectedObject.dimensions?.width?.toFixed(1)} x {selectedObject.dimensions?.depth?.toFixed(1)}m
                </p>
              </div>
              <div>
                <p className="text-slate-400">Interactable</p>
                <p className={selectedObject.properties?.interactable ? 'text-green-400' : 'text-slate-500'}>
                  {selectedObject.properties?.interactable ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Confidence</p>
                <p className="text-cyan-400">{((selectedObject.confidence || 0.9) * 100).toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}