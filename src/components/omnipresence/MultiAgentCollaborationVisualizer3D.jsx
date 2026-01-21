import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Line, Html, Float, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Users, Loader2, Play, Brain } from 'lucide-react';

function CollaboratingAgent({ agent, position, role, taskProgress, isLeader }) {
  const groupRef = useRef();
  const bodyRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.08;
    }
    if (bodyRef.current) {
      bodyRef.current.rotation.y += 0.015;
    }
  });

  const roleColors = {
    coordinator: '#ec4899',
    executor: '#10b981',
    monitor: '#f59e0b',
    support: '#8b5cf6'
  };

  const color = roleColors[role] || '#00f5ff';

  return (
    <group ref={groupRef} position={position}>
      <Trail width={0.4} length={5} color={color} attenuation={(t) => t * t}>
        <group ref={bodyRef}>
          <Sphere args={[isLeader ? 0.25 : 0.2, 32, 32]}>
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isLeader ? 1.5 : 1} />
          </Sphere>

          {/* Leader crown */}
          {isLeader && (
            <mesh position={[0, 0.35, 0]}>
              <coneGeometry args={[0.1, 0.15, 4]} />
              <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1} />
            </mesh>
          )}

          {/* Progress ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.15, 0]}>
            <ringGeometry args={[0.35, 0.4, 32, 1, 0, (taskProgress || 0) * Math.PI * 2]} />
            <meshBasicMaterial color="#10b981" side={THREE.DoubleSide} />
          </mesh>

          {/* Energy field */}
          <Sphere args={[0.35, 16, 16]}>
            <meshBasicMaterial color={color} transparent opacity={0.1} wireframe />
          </Sphere>
        </group>
      </Trail>

      <Html position={[0, 0.5, 0]} center>
        <div className="bg-black/90 text-white px-2 py-1 rounded text-xs">
          <span style={{ color }}>{role || 'Agent'}</span>
          {taskProgress && <span className="ml-2 text-green-400">{Math.round(taskProgress * 100)}%</span>}
        </div>
      </Html>
    </group>
  );
}

function KnowledgeShareBeam({ from, to, active }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current && active) {
      ref.current.material.dashOffset = state.clock.elapsedTime * 5;
    }
  });

  return (
    <Line
      ref={ref}
      points={[from, to]}
      color={active ? '#00f5ff' : '#334155'}
      lineWidth={active ? 3 : 1}
      dashed={active}
      dashScale={10}
      transparent
      opacity={active ? 0.8 : 0.3}
    />
  );
}

function TaskZone({ position, size, zoneName, zoneType }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.material.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  const zoneColors = {
    coordination: '#ec4899',
    execution: '#10b981',
    monitoring: '#f59e0b',
    support: '#8b5cf6'
  };

  return (
    <group position={position}>
      <mesh ref={ref}>
        <boxGeometry args={[size[0], 0.1, size[2]]} />
        <meshStandardMaterial
          color={zoneColors[zoneType] || '#00f5ff'}
          emissive={zoneColors[zoneType] || '#00f5ff'}
          emissiveIntensity={0.3}
          transparent
          opacity={0.2}
        />
      </mesh>
      <Html position={[0, 0.3, 0]} center>
        <div className="bg-black/70 text-white px-2 py-0.5 rounded text-xs">
          {zoneName}
        </div>
      </Html>
    </group>
  );
}

function CollaborationScene3D({ task, agents }) {
  const participants = task?.participating_agents || [];
  const taskZones = task?.physical_workspace?.coordination_zones || [];

  return (
    <Canvas camera={{ position: [8, 6, 8], fov: 55 }}>
      <ambientLight intensity={0.25} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-5, 10, -5]} intensity={0.5} color="#a855f7" />

      {/* Floor */}
      <Box args={[12, 0.05, 10]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#080812" />
      </Box>
      <gridHelper args={[12, 12, '#1e3a5f', '#0f172a']} position={[0, 0.03, 0]} />

      {/* Task zones */}
      {taskZones.map((zone, idx) => (
        <TaskZone
          key={idx}
          position={[zone.boundaries?.x || idx * 3 - 3, 0.1, zone.boundaries?.z || 0]}
          size={[2, 0.1, 2]}
          zoneName={zone.zone_name}
          zoneType={zone.zone_name?.toLowerCase().includes('coord') ? 'coordination' : 'execution'}
        />
      ))}

      {/* Participating agents */}
      {participants.map((p, idx) => {
        const angle = (idx / participants.length) * Math.PI * 2;
        const radius = 3;
        const position = [Math.cos(angle) * radius, 0.5, Math.sin(angle) * radius];
        const agent = agents.find(a => a.agent_id === p.agent_id || a.id === p.agent_id);

        return (
          <CollaboratingAgent
            key={idx}
            agent={agent || p}
            position={position}
            role={p.role}
            taskProgress={p.contribution_score}
            isLeader={idx === 0}
          />
        );
      })}

      {/* Knowledge sharing beams */}
      {participants.length > 1 && participants.map((p1, i) => 
        participants.slice(i + 1).map((p2, j) => {
          const angle1 = (i / participants.length) * Math.PI * 2;
          const angle2 = ((i + j + 1) / participants.length) * Math.PI * 2;
          return (
            <KnowledgeShareBeam
              key={`${i}-${j}`}
              from={new THREE.Vector3(Math.cos(angle1) * 3, 0.5, Math.sin(angle1) * 3)}
              to={new THREE.Vector3(Math.cos(angle2) * 3, 0.5, Math.sin(angle2) * 3)}
              active={task?.task_status === 'active'}
            />
          );
        })
      )}

      {/* Central coordination hub */}
      <Float speed={2}>
        <Sphere args={[0.15, 32, 32]} position={[0, 1.5, 0]}>
          <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={1.5} />
        </Sphere>
      </Float>

      <OrbitControls enableZoom={true} />
    </Canvas>
  );
}

export default function MultiAgentCollaborationVisualizer3D({ agents = [], collaborativeTasks = [] }) {
  const queryClient = useQueryClient();
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [activeTask, setActiveTask] = useState(collaborativeTasks[0]);

  const createCollabMutation = useMutation({
    mutationFn: async ({ task_name, agent_ids, coordination_strategy }) => {
      const response = await base44.functions.invoke('coordinate-multi-agent-task', {
        task_name,
        agent_ids,
        coordination_strategy
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Multi-agent collaboration initiated!');
      setActiveTask(data);
      queryClient.invalidateQueries(['collaborative-tasks']);
    }
  });

  const toggleAgentSelection = (agentId) => {
    setSelectedAgents(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleStartCollaboration = () => {
    if (selectedAgents.length < 2 || !taskDescription) {
      toast.error('Select at least 2 agents and describe the task');
      return;
    }
    createCollabMutation.mutate({
      task_name: taskDescription,
      agent_ids: selectedAgents,
      coordination_strategy: 'democratic'
    });
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-400" />
            Multi-Agent Collaboration Framework
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {agents.map((agent) => (
              <Button
                key={agent.id}
                size="sm"
                variant={selectedAgents.includes(agent.agent_id || agent.id) ? 'default' : 'outline'}
                onClick={() => toggleAgentSelection(agent.agent_id || agent.id)}
                className={selectedAgents.includes(agent.agent_id || agent.id) ? 'bg-pink-600' : 'bg-slate-800/50'}
              >
                {agent.agent_id?.slice(0, 8) || `Agent ${agent.id?.slice(0, 6)}`}
              </Button>
            ))}
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Describe the collaborative task..."
              className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm"
            />
            <Button
              onClick={handleStartCollaboration}
              disabled={createCollabMutation.isPending || selectedAgents.length < 2}
              className="bg-gradient-to-r from-pink-600 to-purple-600"
            >
              {createCollabMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Coordinating</>
              ) : (
                <><Brain className="w-4 h-4 mr-2" /> Start Collaboration</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Collaboration Visualization</CardTitle>
            {activeTask && (
              <Badge className={
                activeTask.task_status === 'active' ? 'bg-green-500/20 text-green-400' :
                activeTask.task_status === 'completed' ? 'bg-cyan-500/20 text-cyan-400' :
                'bg-yellow-500/20 text-yellow-400'
              }>
                {activeTask.task_status || 'Planning'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[500px]">
            <CollaborationScene3D task={activeTask} agents={agents} />
          </div>
        </CardContent>
      </Card>

      {activeTask && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-slate-900/60 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Task Decomposition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeTask.task_decomposition?.map((subtask, idx) => (
                  <div key={idx} className="bg-slate-800/50 rounded p-2 flex items-center justify-between">
                    <span className="text-white text-sm">{subtask.subtask}</span>
                    <Badge className={
                      subtask.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      subtask.status === 'in_progress' ? 'bg-cyan-500/20 text-cyan-400' :
                      'bg-slate-700 text-slate-400'
                    }>
                      {subtask.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Knowledge Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeTask.knowledge_sharing?.slice(0, 5).map((ks, idx) => (
                  <div key={idx} className="bg-slate-800/50 rounded p-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-pink-400">{ks.from_agent?.slice(0, 8)}</span>
                      <span className="text-slate-500">→</span>
                      <span className="text-cyan-400">{ks.to_agents?.length} agents</span>
                    </div>
                    <p className="text-slate-300 text-sm mt-1">{ks.knowledge_type}: {ks.content?.slice(0, 50)}...</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}