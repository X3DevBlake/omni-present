import React, { useRef, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Line, Html, Float, TransformControls, Plane } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Hand, Move, RotateCcw, Trash2, Play, Loader2, MousePointer } from 'lucide-react';

// Draggable semantic object
function DraggableSemanticObject({ node, onInteract, onPositionChange, isSelected, editMode }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  
  const pos = node.position || { x: 0, y: 0, z: 0 };
  const dims = node.dimensions || { width: 0.5, height: 0.5, depth: 0.5 };

  useFrame((state) => {
    if (meshRef.current) {
      if (isSelected) {
        meshRef.current.material.emissiveIntensity = 0.6 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
      } else if (hovered) {
        meshRef.current.material.emissiveIntensity = 0.4;
      } else {
        meshRef.current.material.emissiveIntensity = node.properties?.interactable ? 0.3 : 0.1;
      }
    }
  });

  const typeColors = {
    furniture: '#f59e0b',
    door: '#10b981',
    window: '#06b6d4',
    appliance: '#3b82f6',
    decoration: '#a855f7',
    plant: '#22c55e'
  };

  const color = typeColors[node.object_type] || '#64748b';

  const handleClick = (e) => {
    e.stopPropagation();
    if (editMode) {
      onInteract && onInteract(node, 'select');
    } else {
      onInteract && onInteract(node, 'interact');
    }
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
      {node.properties?.interactable && (
        <Float speed={3}>
          <Sphere args={[0.05, 16, 16]} position={[0, dims.height / 2 + 0.15, 0]}>
            <meshBasicMaterial color="#00f5ff" />
          </Sphere>
        </Float>
      )}

      {/* Selection highlight */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -dims.height / 2 + 0.02, 0]}>
          <ringGeometry args={[Math.max(dims.width, dims.depth) * 0.6, Math.max(dims.width, dims.depth) * 0.7, 32]} />
          <meshBasicMaterial color="#00f5ff" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}

      {(hovered || isSelected) && (
        <Html position={[0, dims.height / 2 + 0.3, 0]} center>
          <div className="bg-black/95 text-white px-3 py-2 rounded-lg text-xs min-w-32">
            <p className="font-bold" style={{ color }}>{node.label}</p>
            <p className="text-slate-400">{node.object_type}</p>
            {node.properties?.interactable && (
              <p className="text-cyan-400 text-xs mt-1">Click to interact</p>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

// Interactive agent with task assignment
function InteractiveAgent({ agent, onAssignTask, isSelected }) {
  const agentRef = useRef();
  const pos = agent.current_location || { x: 0, y: 0, z: 0 };
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (agentRef.current) {
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
      agentRef.current.scale.setScalar(breathe);
    }
  });

  const statusColors = {
    active: '#00f5ff',
    idle: '#64748b',
    transitioning: '#f59e0b'
  };

  const color = statusColors[agent.projection_status] || '#00f5ff';

  return (
    <group
      position={[pos.x, 0.35, pos.z]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onAssignTask && onAssignTask(agent);
      }}
    >
      <group ref={agentRef}>
        <Sphere args={[0.18, 32, 32]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
        </Sphere>
      </group>

      {/* Selection ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
          <ringGeometry args={[0.35, 0.4, 32]} />
          <meshBasicMaterial color="#00f5ff" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Movement path visualization */}
      {agent.movement_path?.length > 1 && (
        <Line
          points={agent.movement_path.map(wp => [wp.waypoint?.x || 0, 0.1, wp.waypoint?.z || 0])}
          color={color}
          lineWidth={2}
          transparent
          opacity={0.6}
        />
      )}

      {hovered && (
        <Html position={[0, 0.5, 0]} center>
          <div className="bg-black/95 text-white px-3 py-2 rounded-lg text-xs">
            <p className="font-bold" style={{ color }}>Agent {agent.agent_id?.slice(0, 8)}</p>
            <p className="text-slate-400">{agent.current_activity || 'Idle'}</p>
            <p className="text-cyan-400 text-xs mt-1">Click to assign task</p>
          </div>
        </Html>
      )}
    </group>
  );
}

// Task placement marker
function TaskMarker({ position, taskType, onConfirm }) {
  const markerRef = useRef();

  useFrame((state) => {
    if (markerRef.current) {
      markerRef.current.rotation.y = state.clock.elapsedTime * 2;
      markerRef.current.position.y = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  return (
    <group position={[position.x, 0, position.z]}>
      <mesh ref={markerRef}>
        <octahedronGeometry args={[0.15, 0]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.8} />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.3, 0.35, 32]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      <Html position={[0, 0.6, 0]} center>
        <div className="bg-green-500/20 border border-green-500 px-2 py-1 rounded text-xs text-green-300">
          {taskType || 'Task'} - Click to confirm
        </div>
      </Html>
    </group>
  );
}

// Floor with click detection
function InteractiveFloor({ onFloorClick, editMode }) {
  const floorRef = useRef();

  const handleClick = (e) => {
    if (editMode) {
      e.stopPropagation();
      const point = e.point;
      onFloorClick && onFloorClick({ x: point.x, y: 0, z: point.z });
    }
  };

  return (
    <group>
      <Box args={[16, 0.05, 14]} position={[6, 0, 5]} onClick={handleClick}>
        <meshStandardMaterial color="#050510" />
      </Box>
      <gridHelper args={[16, 32, '#1a3050', '#0a1828']} position={[6, 0.03, 5]} />
    </group>
  );
}

// Main scene
function InteractiveScene({
  semanticGraph,
  agents,
  selectedObject,
  selectedAgent,
  taskMarker,
  editMode,
  onObjectInteract,
  onAgentSelect,
  onFloorClick
}) {
  return (
    <group>
      <InteractiveFloor onFloorClick={onFloorClick} editMode={editMode} />

      {semanticGraph?.nodes?.map((node, idx) => (
        <DraggableSemanticObject
          key={node.node_id || idx}
          node={node}
          isSelected={selectedObject?.node_id === node.node_id}
          editMode={editMode}
          onInteract={onObjectInteract}
        />
      ))}

      {agents.map((agent, idx) => (
        <InteractiveAgent
          key={agent.id || idx}
          agent={agent}
          isSelected={selectedAgent?.id === agent.id}
          onAssignTask={onAgentSelect}
        />
      ))}

      {taskMarker && (
        <TaskMarker 
          position={taskMarker.position} 
          taskType={taskMarker.type}
        />
      )}
    </group>
  );
}

export default function InteractiveSpatialMap3D() {
  const queryClient = useQueryClient();
  const [selectedObject, setSelectedObject] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [taskMarker, setTaskMarker] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [interactionMode, setInteractionMode] = useState('select'); // select, move, interact
  const [gestureMode, setGestureMode] = useState(false);
  const [lastGesture, setLastGesture] = useState(null);

  const { data: semanticGraphs = [] } = useQuery({
    queryKey: ['interactive-semantic-graphs'],
    queryFn: () => base44.entities.EnvironmentSemanticGraph.list('-created_date', 1),
    initialData: []
  });

  const { data: agents = [] } = useQuery({
    queryKey: ['interactive-agents'],
    queryFn: () => base44.entities.AgentPhysicalPresence.list('-created_date', 20),
    initialData: [],
    refetchInterval: 3000
  });

  const currentGraph = semanticGraphs[0];

  const interactMutation = useMutation({
    mutationFn: async ({ agent_id, object_node_id, interaction_type }) => {
      const response = await base44.functions.invoke('agent-object-interaction', {
        agent_id,
        object_node_id,
        interaction_type
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Agent executing: ${data.interaction.interaction_type} on ${data.interaction.target_object.label}`);
      queryClient.invalidateQueries(['interactive-agents']);
      setSelectedObject(null);
      setSelectedAgent(null);
    }
  });

  const handleObjectInteract = (node, action) => {
    if (action === 'select') {
      setSelectedObject(node);
    } else if (action === 'interact' && selectedAgent) {
      // Trigger interaction
      interactMutation.mutate({
        agent_id: selectedAgent.agent_id,
        object_node_id: node.node_id,
        interaction_type: 'move'
      });
    } else {
      setSelectedObject(node);
      toast.info(`Select an agent first, then click an object to interact`);
    }
  };

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    if (selectedObject && selectedObject.properties?.interactable) {
      toast.info(`Now click "${selectedObject.label}" to send agent to interact`);
    }
  };

  const handleFloorClick = (position) => {
    if (selectedAgent && editMode) {
      setTaskMarker({ position, type: 'Move' });
    }
  };

  const executeInteraction = (interactionType) => {
    if (!selectedAgent || !selectedObject) {
      toast.error('Select both an agent and an object');
      return;
    }

    interactMutation.mutate({
      agent_id: selectedAgent.agent_id,
      object_node_id: selectedObject.node_id,
      interaction_type: interactionType
    });
  };

  const interactableObjects = currentGraph?.nodes?.filter(n => n.properties?.interactable) || [];

  const handleGestureDetected = (gestureData) => {
    setLastGesture(gestureData);
    if (gestureData.interpretation?.command_type === 'select' && gestureData.interpretation.target_type === 'object') {
      const obj = interactableObjects.find(o => o.node_id === gestureData.interpretation.target_id);
      if (obj) setSelectedObject(obj);
    } else if (gestureData.interpretation?.command_type === 'assign_task' && gestureData.interpretation.target_type === 'agent') {
      const agent = agents.find(a => a.agent_id === gestureData.interpretation.target_id);
      if (agent) setSelectedAgent(agent);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Hand className="w-5 h-5 text-blue-400" />
            Ultra Interactive Spatial Map
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant={gestureMode ? 'default' : 'outline'}
              onClick={() => setGestureMode(!gestureMode)}
              size="sm"
              className={gestureMode ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}
            >
              <Hand className="w-4 h-4 mr-2" />
              {gestureMode ? 'Gesture Active' : 'Enable Gestures'}
            </Button>
            <Button
              variant={editMode ? 'default' : 'outline'}
              onClick={() => setEditMode(!editMode)}
              size="sm"
            >
              <MousePointer className="w-4 h-4 mr-2" />
              {editMode ? 'Exit Edit Mode' : 'Edit Mode'}
            </Button>

            <Button
              variant={interactionMode === 'move' ? 'default' : 'outline'}
              onClick={() => setInteractionMode('move')}
              size="sm"
              disabled={!selectedObject || !selectedAgent}
            >
              <Move className="w-4 h-4 mr-2" /> Move
            </Button>

            <Button
              variant={interactionMode === 'interact' ? 'default' : 'outline'}
              onClick={() => setInteractionMode('interact')}
              size="sm"
              disabled={!selectedObject || !selectedAgent}
            >
              <Play className="w-4 h-4 mr-2" /> Interact
            </Button>

            {selectedObject && selectedAgent && (
              <Button
                onClick={() => executeInteraction(interactionMode)}
                disabled={interactMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-cyan-600"
              >
                {interactMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Executing</>
                ) : (
                  <><Play className="w-4 h-4 mr-2" /> Execute {interactionMode}</>
                )}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Interactable Objects</p>
              <p className="text-white text-xl font-bold">{interactableObjects.length}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Selected Object</p>
              <p className="text-cyan-400 text-sm font-medium truncate">{selectedObject?.label || 'None'}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Selected Agent</p>
              <p className="text-purple-400 text-sm font-medium">{selectedAgent?.agent_id?.slice(0, 8) || 'None'}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Gesture Mode</p>
              <p className={`text-sm font-medium ${gestureMode ? 'text-pink-400' : 'text-slate-500'}`}>
                {gestureMode ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>

          {gestureMode && lastGesture?.interpretation && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
              <p className="text-purple-300 text-sm font-bold mb-1">Last Gesture: {lastGesture.interpretation.command_type}</p>
              <p className="text-slate-400 text-xs">{lastGesture.feedback}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardContent className="p-0">
          <div className="h-[550px]">
            <Canvas camera={{ position: [12, 10, 12], fov: 50 }}>
              <ambientLight intensity={0.25} />
              <pointLight position={[10, 12, 10]} intensity={1} />
              <pointLight position={[-5, 8, -5]} intensity={0.5} color="#00f5ff" />

              <InteractiveScene
                semanticGraph={currentGraph}
                agents={agents}
                selectedObject={selectedObject}
                selectedAgent={selectedAgent}
                taskMarker={taskMarker}
                editMode={editMode}
                onObjectInteract={handleObjectInteract}
                onAgentSelect={handleAgentSelect}
                onFloorClick={handleFloorClick}
              />

              <OrbitControls enableZoom={true} />
            </Canvas>
          </div>
        </CardContent>
      </Card>

      {selectedObject && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Badge className="bg-orange-500/20 text-orange-400">{selectedObject.object_type}</Badge>
              {selectedObject.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['move', 'rotate', 'push', 'open', 'close', 'turn_on', 'turn_off'].map(action => (
                <Button
                  key={action}
                  size="sm"
                  variant="outline"
                  onClick={() => executeInteraction(action)}
                  disabled={!selectedAgent || interactMutation.isPending}
                >
                  {action.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}