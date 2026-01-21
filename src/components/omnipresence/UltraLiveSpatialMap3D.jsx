import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Line, Html, Float, Cylinder, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Map, Thermometer, Volume2, Sun, Wind, Users, Navigation } from 'lucide-react';

// Semantic Object with rich visualization
function SemanticObject3D({ node, showLabels, onSelect }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const pos = node.position || { x: 0, y: 0, z: 0 };
  const dims = node.dimensions || { width: 1, height: 1, depth: 1 };

  const typeColors = {
    furniture: '#f59e0b',
    appliance: '#3b82f6',
    door: '#10b981',
    window: '#06b6d4',
    plant: '#22c55e',
    decoration: '#ec4899'
  };
  const color = typeColors[node.object_type] || '#64748b';

  useFrame((state) => {
    if (ref.current && (hovered || node.properties?.interactable)) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group
      position={[pos.x, pos.y + dims.height / 2, pos.z]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onSelect && onSelect(node)}
    >
      <Box ref={ref} args={[dims.width, dims.height, dims.depth]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.6 : 0.2}
          transparent
          opacity={0.8}
          metalness={0.3}
          roughness={0.4}
        />
      </Box>

      {/* Interactable indicator */}
      {node.properties?.interactable && (
        <Float speed={4} floatIntensity={0.3}>
          <Sphere args={[0.08, 12, 12]} position={[0, dims.height / 2 + 0.15, 0]}>
            <meshBasicMaterial color="#00f5ff" />
          </Sphere>
        </Float>
      )}

      {/* Label */}
      {(showLabels || hovered) && (
        <Html position={[0, dims.height / 2 + 0.3, 0]} center>
          <div className="bg-black/90 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
            {node.label}
            {node.properties?.semantic_tags?.length > 0 && (
              <span className="text-slate-400 ml-1">({node.properties.semantic_tags[0]})</span>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

// Predictive obstacle with trajectory
function PredictiveObstacle3D({ obstacle, showTrajectory }) {
  const ref = useRef();
  const pos = obstacle.current_position || { x: 0, y: 0, z: 0 };
  const velocity = obstacle.velocity || { vx: 0, vz: 0 };

  const typeColors = {
    person: '#ec4899',
    pet: '#a855f7',
    robot: '#3b82f6',
    unknown_dynamic: '#64748b'
  };
  const color = typeColors[obstacle.obstacle_type] || '#ffffff';

  useFrame((state, delta) => {
    if (ref.current) {
      // Animate movement
      ref.current.position.x += velocity.vx * delta * 0.3;
      ref.current.position.z += velocity.vz * delta * 0.3;
      ref.current.rotation.y += 0.02;
    }
  });

  // Trajectory points
  const trajectoryPoints = (obstacle.predicted_trajectory || []).map(t => 
    new THREE.Vector3(t.position?.x || 0, 0.3, t.position?.z || 0)
  );

  return (
    <group>
      <group ref={ref} position={[pos.x, 0.4, pos.z]}>
        <Sphere args={[0.2, 16, 16]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
        </Sphere>
        
        {/* Direction indicator */}
        {(velocity.vx !== 0 || velocity.vz !== 0) && (
          <mesh position={[velocity.vx * 0.5, 0, velocity.vz * 0.5]}>
            <coneGeometry args={[0.08, 0.2, 8]} />
            <meshBasicMaterial color={color} />
          </mesh>
        )}

        {/* Avoidance buffer */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
          <ringGeometry args={[obstacle.avoidance_buffer_meters || 0.5, (obstacle.avoidance_buffer_meters || 0.5) + 0.05, 32]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Predicted trajectory */}
      {showTrajectory && trajectoryPoints.length > 1 && (
        <Line points={[new THREE.Vector3(pos.x, 0.3, pos.z), ...trajectoryPoints]} color={color} lineWidth={2} dashed dashScale={3} transparent opacity={0.5} />
      )}
    </group>
  );
}

// Sensor data heatmap overlay
function SensorHeatmap({ type, data, bounds }) {
  const meshRef = useRef();
  
  const heatmapColors = {
    temperature: { cold: '#3b82f6', hot: '#ef4444' },
    humidity: { low: '#f59e0b', high: '#3b82f6' },
    light: { dark: '#1e293b', bright: '#fbbf24' },
    sound: { quiet: '#10b981', loud: '#ef4444' }
  };

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  const colors = heatmapColors[type] || heatmapColors.temperature;
  const value = Math.min(1, Math.max(0, (data.value - data.min) / (data.max - data.min)));
  const color = new THREE.Color(colors.cold).lerp(new THREE.Color(colors.hot), value);

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[bounds.x, 0.02, bounds.z]}>
      <planeGeometry args={[bounds.width, bounds.depth]} />
      <meshBasicMaterial color={color} transparent opacity={0.25} side={THREE.DoubleSide} />
    </mesh>
  );
}

// Navigation waypoint with connections
function NavigationWaypoint3D({ waypoint, allWaypoints, showConnections }) {
  const ref = useRef();
  const pos = waypoint.position || { x: 0, y: 0, z: 0 };

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.5;
      ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
    }
  });

  // Get connected waypoint positions
  const connections = (waypoint.connected_to || []).map(id => {
    const connected = allWaypoints.find(wp => wp.waypoint_id === id);
    return connected?.position;
  }).filter(Boolean);

  return (
    <group position={[pos.x, 0.1, pos.z]}>
      <mesh ref={ref}>
        <cylinderGeometry args={[0.12, 0.12, 0.03, 6]} />
        <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={0.8} />
      </mesh>

      {/* Connection lines */}
      {showConnections && connections.map((connPos, i) => (
        <Line
          key={i}
          points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(connPos.x - pos.x, 0, connPos.z - pos.z)]}
          color="#00f5ff"
          lineWidth={1}
          transparent
          opacity={0.4}
        />
      ))}
    </group>
  );
}

// Smart device with real-time state
function SmartDevice3D({ device, onControl }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const pos = device.spatial_location || device.device_location || { x: 0, y: 0, z: 0 };

  const categoryShapes = {
    lighting: { color: '#fbbf24', shape: 'bulb' },
    climate: { color: '#3b82f6', shape: 'box' },
    security: { color: '#ef4444', shape: 'shield' },
    sensor: { color: '#10b981', shape: 'sphere' },
    entertainment: { color: '#a855f7', shape: 'box' },
    camera: { color: '#64748b', shape: 'cone' }
  };

  const config = categoryShapes[device.device_category] || { color: '#ffffff', shape: 'sphere' };
  const isOn = device.current_state?.power || device.current_state?.power_on;

  useFrame((state) => {
    if (ref.current) {
      if (isOn) {
        ref.current.rotation.y = state.clock.elapsedTime * 0.5;
      }
    }
  });

  const renderShape = () => {
    switch (config.shape) {
      case 'bulb':
        return (
          <group>
            <Sphere args={[0.12, 16, 16]}>
              <meshStandardMaterial 
                color={isOn ? config.color : '#333'} 
                emissive={isOn ? config.color : '#000'} 
                emissiveIntensity={isOn ? 1 : 0} 
              />
            </Sphere>
            <Cylinder args={[0.06, 0.08, 0.08, 8]} position={[0, -0.1, 0]}>
              <meshStandardMaterial color="#64748b" metalness={0.8} />
            </Cylinder>
          </group>
        );
      case 'shield':
        return (
          <Box args={[0.15, 0.2, 0.05]}>
            <meshStandardMaterial color={config.color} emissive={config.color} emissiveIntensity={isOn ? 0.5 : 0.1} />
          </Box>
        );
      case 'cone':
        return (
          <Cylinder args={[0.05, 0.12, 0.15, 8]}>
            <meshStandardMaterial color={config.color} emissive={isOn ? config.color : '#000'} emissiveIntensity={isOn ? 0.5 : 0} />
          </Cylinder>
        );
      default:
        return (
          <Sphere args={[0.1, 16, 16]}>
            <meshStandardMaterial color={config.color} emissive={config.color} emissiveIntensity={isOn ? 0.5 : 0.1} />
          </Sphere>
        );
    }
  };

  return (
    <group
      ref={ref}
      position={[pos.x || pos.room?.x || 0, 0.5, pos.z || pos.room?.z || 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onControl && onControl(device)}
    >
      {renderShape()}

      {/* Status ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.15, 0]}>
        <ringGeometry args={[0.15, 0.18, 32]} />
        <meshBasicMaterial 
          color={device.connection_status === 'online' || device.connection_status === 'connected' ? '#10b981' : '#ef4444'} 
          transparent 
          opacity={0.6} 
        />
      </mesh>

      {hovered && (
        <Html position={[0, 0.35, 0]} center>
          <div className="bg-black/95 text-white px-3 py-2 rounded-lg text-xs min-w-40">
            <p className="font-bold">{device.device_name}</p>
            <p className="text-slate-400">{device.device_category || device.device_type}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={isOn ? 'text-green-400' : 'text-slate-500'}>{isOn ? 'ON' : 'OFF'}</span>
              {device.current_state?.brightness !== undefined && (
                <span className="text-yellow-400">🔆 {device.current_state.brightness}%</span>
              )}
              {device.current_state?.temperature !== undefined && (
                <span className="text-cyan-400">🌡️ {device.current_state.temperature}°</span>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Task execution visualization
function TaskExecutionOverlay({ task, agents, devices }) {
  const [progress, setProgress] = useState(0);

  useFrame((state) => {
    if (task?.status === 'executing') {
      setProgress((state.clock.elapsedTime * 10) % 100);
    }
  });

  if (!task) return null;

  // Find agent and device positions
  const agentPos = agents.find(a => a.agent_id === task.agent_id)?.current_location;
  const devicePos = devices.find(d => d.id === task.target_devices?.[0]?.device_id)?.spatial_location;

  if (!agentPos || !devicePos) return null;

  return (
    <group>
      {/* Execution beam */}
      <Line
        points={[
          new THREE.Vector3(agentPos.x, 0.5, agentPos.z),
          new THREE.Vector3(devicePos.x, 0.5, devicePos.z)
        ]}
        color="#00f5ff"
        lineWidth={3}
        transparent
        opacity={0.6}
      />

      {/* Progress indicator */}
      <Sphere 
        args={[0.08, 16, 16]} 
        position={[
          agentPos.x + (devicePos.x - agentPos.x) * (progress / 100),
          0.5,
          agentPos.z + (devicePos.z - agentPos.z) * (progress / 100)
        ]}
      >
        <meshBasicMaterial color="#00f5ff" />
      </Sphere>
    </group>
  );
}

// Main scene component
function UltraSpatialMapScene({ 
  semanticGraph, 
  predictiveObstacles, 
  agents, 
  devices, 
  sensorData,
  activeTask,
  showLabels,
  showTrajectories,
  showWaypoints,
  showHeatmap,
  onObjectSelect,
  onDeviceControl
}) {
  const nodes = semanticGraph?.nodes || [];
  const waypoints = semanticGraph?.navigation_mesh?.waypoints || [];

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 12, 10]} intensity={1} />
      <pointLight position={[-5, 10, -5]} intensity={0.5} color="#a855f7" />
      <directionalLight position={[0, 10, 0]} intensity={0.3} />

      {/* Floor */}
      <Box args={[16, 0.05, 14]} position={[6, 0, 5]}>
        <meshStandardMaterial color="#0a0a15" />
      </Box>
      <gridHelper args={[16, 32, '#1a2a4a', '#0a1525']} position={[6, 0.03, 5]} />

      {/* Sensor heatmaps */}
      {showHeatmap && sensorData?.map((sensor, i) => (
        <SensorHeatmap
          key={i}
          type={sensor.type}
          data={sensor}
          bounds={{ x: 6, z: 5, width: 12, depth: 10 }}
        />
      ))}

      {/* Semantic objects */}
      {nodes.map((node, idx) => (
        <SemanticObject3D
          key={node.node_id || idx}
          node={node}
          showLabels={showLabels}
          onSelect={onObjectSelect}
        />
      ))}

      {/* Predictive obstacles */}
      {predictiveObstacles.map((obstacle, idx) => (
        <PredictiveObstacle3D
          key={obstacle.obstacle_id || idx}
          obstacle={obstacle}
          showTrajectory={showTrajectories}
        />
      ))}

      {/* Navigation waypoints */}
      {showWaypoints && waypoints.map((wp, idx) => (
        <NavigationWaypoint3D
          key={wp.waypoint_id || idx}
          waypoint={wp}
          allWaypoints={waypoints}
          showConnections={true}
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

      {/* Task execution overlay */}
      <TaskExecutionOverlay task={activeTask} agents={agents} devices={devices} />

      <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 2.1} />
    </>
  );
}

export default function UltraLiveSpatialMap3D({ 
  semanticGraph,
  predictiveObstacles = [],
  agents = [],
  devices = [],
  sensorData = [],
  activeTask,
  onObjectSelect,
  onDeviceControl
}) {
  const [showLabels, setShowLabels] = useState(true);
  const [showTrajectories, setShowTrajectories] = useState(true);
  const [showWaypoints, setShowWaypoints] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Mock sensor data if not provided
  const mockSensorData = sensorData.length > 0 ? sensorData : [
    { type: 'temperature', value: 72, min: 60, max: 85 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-2">
        <Button size="sm" variant={showLabels ? 'default' : 'outline'} onClick={() => setShowLabels(!showLabels)}>
          Labels
        </Button>
        <Button size="sm" variant={showTrajectories ? 'default' : 'outline'} onClick={() => setShowTrajectories(!showTrajectories)}>
          Trajectories
        </Button>
        <Button size="sm" variant={showWaypoints ? 'default' : 'outline'} onClick={() => setShowWaypoints(!showWaypoints)}>
          <Navigation className="w-3 h-3 mr-1" /> Waypoints
        </Button>
        <Button size="sm" variant={showHeatmap ? 'default' : 'outline'} onClick={() => setShowHeatmap(!showHeatmap)}>
          <Thermometer className="w-3 h-3 mr-1" /> Heatmap
        </Button>
      </div>

      <div className="h-[600px] rounded-lg overflow-hidden border border-slate-700">
        <Canvas camera={{ position: [12, 10, 12], fov: 55 }}>
          <UltraSpatialMapScene
            semanticGraph={semanticGraph}
            predictiveObstacles={predictiveObstacles}
            agents={agents}
            devices={devices}
            sensorData={mockSensorData}
            activeTask={activeTask}
            showLabels={showLabels}
            showTrajectories={showTrajectories}
            showWaypoints={showWaypoints}
            showHeatmap={showHeatmap}
            onObjectSelect={onObjectSelect}
            onDeviceControl={onDeviceControl}
          />
        </Canvas>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#f59e0b]" /> Furniture</span>
        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#3b82f6]" /> Appliance</span>
        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#ec4899]" /> Person</span>
        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#a855f7]" /> Pet</span>
        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#00f5ff]" /> Waypoint</span>
      </div>
    </div>
  );
}