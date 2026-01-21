import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Html, Float, TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { 
  Hand, Move, RotateCcw, Thermometer, Lightbulb, 
  Users, Play, Loader2, Target, Settings
} from 'lucide-react';

// Manipulable semantic object
function ManipulableObject3D({ object, isSelected, onSelect, onMove, editMode }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  
  const pos = object.position || { x: 0, y: 0, z: 0 };
  const dims = object.dimensions || { width: 0.5, height: 0.5, depth: 0.5 };

  useFrame((state) => {
    if (meshRef.current) {
      if (isSelected) {
        meshRef.current.material.emissiveIntensity = 0.6 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
      } else if (hovered) {
        meshRef.current.material.emissiveIntensity = 0.4;
      } else {
        meshRef.current.material.emissiveIntensity = 0.2;
      }
    }
  });

  const typeColors = {
    furniture: '#f59e0b',
    door: '#10b981',
    window: '#06b6d4',
    appliance: '#3b82f6',
    thermostat: '#ef4444',
    light: '#fbbf24'
  };

  const color = typeColors[object.object_type] || '#64748b';

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(object);
  };

  return (
    <group position={[pos.x, (dims.height || 0.5) / 2, pos.z]}>
      <Box
        ref={meshRef}
        args={[dims.width || 0.5, dims.height || 0.5, dims.depth || 0.5]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          transparent
          opacity={isSelected ? 1 : 0.85}
        />
      </Box>

      {/* Interaction indicator */}
      {object.properties?.interactable && (
        <Float speed={3}>
          <Sphere args={[0.05, 16, 16]} position={[0, dims.height / 2 + 0.15, 0]}>
            <meshBasicMaterial color="#00f5ff" />
          </Sphere>
        </Float>
      )}

      {/* Selection ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -dims.height / 2 + 0.02, 0]}>
          <ringGeometry args={[Math.max(dims.width, dims.depth) * 0.6, Math.max(dims.width, dims.depth) * 0.7, 32]} />
          <meshBasicMaterial color="#00f5ff" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {(hovered || isSelected) && (
        <Html position={[0, dims.height / 2 + 0.3, 0]} center>
          <div className="bg-black/95 text-white px-3 py-2 rounded-lg text-xs min-w-36">
            <p className="font-bold" style={{ color }}>{object.label}</p>
            <p className="text-slate-400">{object.object_type}</p>
            {object.properties?.interactable && (
              <p className="text-cyan-400 text-xs mt-1">Click to interact</p>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

// Agent with task assignment
function AssignableAgent3D({ agent, isSelected, onSelect, onAssignTask }) {
  const agentRef = useRef();
  const pos = agent.current_location || { x: 0, y: 0, z: 0 };
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (agentRef.current) {
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
      agentRef.current.scale.setScalar(breathe);
    }
  });

  const color = agent.projection_status === 'active' ? '#00f5ff' : '#64748b';

  return (
    <group
      position={[pos.x, 0.35, pos.z]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(agent);
      }}
    >
      <group ref={agentRef}>
        <Sphere args={[0.18, 32, 32]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
        </Sphere>
      </group>

      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
          <ringGeometry args={[0.35, 0.4, 32]} />
          <meshBasicMaterial color="#00f5ff" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {hovered && (
        <Html position={[0, 0.5, 0]} center>
          <div className="bg-black/95 text-white px-3 py-2 rounded-lg text-xs">
            <p className="font-bold" style={{ color }}>Agent {agent.agent_id?.slice(0, 8)}</p>
            <p className="text-slate-400">{agent.current_activity || 'Idle'}</p>
            <Button size="sm" className="mt-2 text-xs w-full" onClick={() => onAssignTask(agent)}>
              Assign Task
            </Button>
          </div>
        </Html>
      )}
    </group>
  );
}

// Environmental control point
function EnvironmentalControlPoint3D({ sensor, onAdjust }) {
  const pointRef = useRef();
  const [hovered, setHovered] = useState(false);
  const pos = sensor.position || { x: 0, y: 0, z: 0 };

  useFrame((state) => {
    if (pointRef.current) {
      pointRef.current.rotation.y = state.clock.elapsedTime;
      if (sensor.alert_triggered) {
        pointRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 6) * 0.2);
      }
    }
  });

  const sensorColors = {
    temperature: '#ef4444',
    humidity: '#06b6d4',
    light: '#fbbf24',
    air_quality: '#10b981'
  };

  const color = sensorColors[sensor.sensor_type] || '#64748b';
  const isAlert = sensor.alert_triggered || (sensor.thresholds && sensor.reading_value > (sensor.thresholds.max_normal || 100));

  return (
    <group
      position={[pos.x, 0.8, pos.z]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onAdjust(sensor)}
    >
      <mesh ref={pointRef}>
        <octahedronGeometry args={[0.1, 0]} />
        <meshStandardMaterial 
          color={color} 
          emissive={isAlert ? '#ef4444' : color} 
          emissiveIntensity={isAlert ? 0.8 : 0.4} 
        />
      </mesh>

      {isAlert && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <ringGeometry args={[0.3, 0.35, 32]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}

      {hovered && (
        <Html position={[0, 0.3, 0]} center>
          <div className={`px-3 py-2 rounded-lg text-xs ${isAlert ? 'bg-red-500/30 border-red-500' : 'bg-black/95'} border text-white`}>
            <p className="font-bold">{sensor.sensor_type}</p>
            <p className="text-lg" style={{ color }}>{sensor.reading_value?.toFixed(1)}{sensor.unit}</p>
            {isAlert && <p className="text-red-400 text-xs">⚠️ Needs adjustment</p>}
            <Button size="sm" className="mt-2 text-xs w-full" variant={isAlert ? 'destructive' : 'default'}>
              Adjust
            </Button>
          </div>
        </Html>
      )}
    </group>
  );
}

// Main manipulation scene
function ManipulationScene({ 
  objects, 
  agents, 
  sensors, 
  selectedObject, 
  selectedAgent,
  onSelectObject,
  onSelectAgent,
  onAssignTask,
  onAdjustSensor
}) {
  return (
    <group>
      <Box args={[16, 0.05, 14]} position={[6, 0, 5]}>
        <meshStandardMaterial color="#050510" />
      </Box>
      <gridHelper args={[16, 32, '#1a3050', '#0a1828']} position={[6, 0.03, 5]} />

      {objects.map((obj, idx) => (
        <ManipulableObject3D
          key={obj.node_id || idx}
          object={obj}
          isSelected={selectedObject?.node_id === obj.node_id}
          onSelect={onSelectObject}
        />
      ))}

      {agents.map((agent, idx) => (
        <AssignableAgent3D
          key={agent.id || idx}
          agent={agent}
          isSelected={selectedAgent?.id === agent.id}
          onSelect={onSelectAgent}
          onAssignTask={onAssignTask}
        />
      ))}

      {sensors.map((sensor, idx) => (
        <EnvironmentalControlPoint3D
          key={sensor.id || idx}
          sensor={sensor}
          onAdjust={onAdjustSensor}
        />
      ))}
    </group>
  );
}

export default function DirectManipulationOverlay3D() {
  const queryClient = useQueryClient();
  const [selectedObject, setSelectedObject] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [taskDescription, setTaskDescription] = useState('');
  const [adjustmentValue, setAdjustmentValue] = useState(72);

  const { data: semanticGraphs = [] } = useQuery({
    queryKey: ['manipulation-graphs'],
    queryFn: () => base44.entities.EnvironmentSemanticGraph.list('-created_date', 1),
    initialData: []
  });

  const { data: agents = [] } = useQuery({
    queryKey: ['manipulation-agents'],
    queryFn: () => base44.entities.AgentPhysicalPresence.filter({ projection_status: 'active' }),
    initialData: [],
    refetchInterval: 3000
  });

  const { data: sensors = [] } = useQuery({
    queryKey: ['manipulation-sensors'],
    queryFn: () => base44.entities.SensorData.list('-reading_timestamp', 20),
    initialData: [],
    refetchInterval: 3000
  });

  const objects = semanticGraphs[0]?.nodes?.filter(n => n.properties?.interactable) || [];

  const interactMutation = useMutation({
    mutationFn: async ({ agentId, objectId, action }) => {
      const response = await base44.functions.invoke('agent-object-interaction', {
        agent_id: agentId,
        object_node_id: objectId,
        interaction_type: action
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Executing: ${data.interaction?.interaction_type}`);
      queryClient.invalidateQueries(['manipulation-agents']);
    }
  });

  const assignTaskMutation = useMutation({
    mutationFn: async ({ agentId, task }) => {
      const response = await base44.functions.invoke('initiate-collaborative-task', {
        initiating_agent_id: agentId,
        detected_need: task,
        priority: 'medium'
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Task created: ${data.decomposition?.task_name}`);
      setTaskDescription('');
      setSelectedAgent(null);
    }
  });

  const handleAssignTask = (agent) => {
    setSelectedAgent(agent);
  };

  const handleAdjustSensor = async (sensor) => {
    // Find related device and adjust
    toast.info(`Adjusting ${sensor.sensor_type} - Target: ${adjustmentValue}`);
  };

  const executeInteraction = (action) => {
    if (!selectedAgent || !selectedObject) {
      toast.error('Select both an agent and an object');
      return;
    }
    interactMutation.mutate({
      agentId: selectedAgent.agent_id,
      objectId: selectedObject.node_id,
      action
    });
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-pink-500/10 to-orange-500/10 border-pink-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Hand className="w-5 h-5 text-pink-400" />
            Direct Manipulation Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Interactable Objects</p>
              <p className="text-white text-xl font-bold">{objects.length}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Active Agents</p>
              <p className="text-cyan-400 text-xl font-bold">{agents.length}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Sensor Alerts</p>
              <p className={`text-xl font-bold ${sensors.filter(s => s.alert_triggered).length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {sensors.filter(s => s.alert_triggered).length}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            {['move', 'rotate', 'open', 'close', 'turn_on', 'turn_off'].map(action => (
              <Button
                key={action}
                size="sm"
                variant="outline"
                onClick={() => executeInteraction(action)}
                disabled={!selectedAgent || !selectedObject || interactMutation.isPending}
              >
                {action.replace('_', ' ')}
              </Button>
            ))}
          </div>

          {/* Environmental Adjustment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Environmental Adjustment</span>
              <span className="text-cyan-400">{adjustmentValue}°F</span>
            </div>
            <Slider
              value={[adjustmentValue]}
              onValueChange={([val]) => setAdjustmentValue(val)}
              min={60}
              max={85}
              step={1}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardContent className="p-0">
          <div className="h-[500px]">
            <Canvas camera={{ position: [10, 8, 10], fov: 50 }}>
              <ambientLight intensity={0.25} />
              <pointLight position={[10, 12, 10]} intensity={1} />
              <pointLight position={[-5, 8, -5]} intensity={0.5} color="#ec4899" />

              <ManipulationScene
                objects={objects}
                agents={agents}
                sensors={sensors}
                selectedObject={selectedObject}
                selectedAgent={selectedAgent}
                onSelectObject={setSelectedObject}
                onSelectAgent={setSelectedAgent}
                onAssignTask={handleAssignTask}
                onAdjustSensor={handleAdjustSensor}
              />

              <OrbitControls enableZoom={true} />
            </Canvas>
          </div>
        </CardContent>
      </Card>

      {/* Task Assignment Panel */}
      {selectedAgent && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              Assign Task to Agent {selectedAgent.agent_id?.slice(0, 8)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Describe the task (e.g., 'Set up the living room for a movie night')"
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white text-sm min-h-20"
            />
            <Button
              onClick={() => assignTaskMutation.mutate({ agentId: selectedAgent.agent_id, task: taskDescription })}
              disabled={!taskDescription || assignTaskMutation.isPending}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
            >
              {assignTaskMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating Task</>
              ) : (
                <><Play className="w-4 h-4 mr-2" /> Assign Task</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}