import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Line, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Play, CheckCircle, XCircle, Loader2, Zap } from 'lucide-react';

function TaskExecutionBeam({ from, to, status, progress }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current && status === 'executing') {
      ref.current.material.dashOffset = state.clock.elapsedTime * 3;
    }
  });

  const statusColors = {
    pending: '#f59e0b',
    executing: '#00f5ff',
    completed: '#10b981',
    failed: '#ef4444'
  };

  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...from),
    new THREE.Vector3((from[0] + to[0]) / 2, 2, (from[2] + to[2]) / 2),
    new THREE.Vector3(...to)
  );

  return (
    <group>
      <mesh ref={ref}>
        <tubeGeometry args={[curve, 32, 0.04, 8, false]} />
        <meshBasicMaterial
          color={statusColors[status]}
          transparent
          opacity={status === 'executing' ? 0.8 : 0.4}
        />
      </mesh>

      {/* Progress indicator */}
      {status === 'executing' && (
        <Float speed={10}>
          <Sphere args={[0.08, 16, 16]} position={curve.getPoint(progress || 0.5).toArray()}>
            <meshBasicMaterial color="#ffffff" />
          </Sphere>
        </Float>
      )}
    </group>
  );
}

function AgentNode({ position, isExecuting }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.02;
      if (isExecuting) {
        ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 5) * 0.1);
      }
    }
  });

  return (
    <group position={position}>
      <Sphere ref={ref} args={[0.25, 32, 32]}>
        <meshStandardMaterial
          color={isExecuting ? '#10b981' : '#00f5ff'}
          emissive={isExecuting ? '#10b981' : '#00f5ff'}
          emissiveIntensity={isExecuting ? 1.5 : 0.8}
        />
      </Sphere>
      <Sphere args={[0.35, 16, 16]}>
        <meshBasicMaterial color={isExecuting ? '#10b981' : '#00f5ff'} transparent opacity={0.15} wireframe />
      </Sphere>
      <Html position={[0, 0.5, 0]} center>
        <div className="bg-black/80 text-white px-2 py-1 rounded text-xs">
          {isExecuting ? '⚡ Executing' : '🤖 Agent'}
        </div>
      </Html>
    </group>
  );
}

function DeviceTarget({ position, device, status }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.01;
    }
  });

  const statusColors = {
    pending: '#f59e0b',
    executing: '#00f5ff',
    completed: '#10b981',
    failed: '#ef4444'
  };

  return (
    <group position={position}>
      <Box ref={ref} args={[0.3, 0.3, 0.3]}>
        <meshStandardMaterial
          color={statusColors[status] || '#ffffff'}
          emissive={statusColors[status] || '#ffffff'}
          emissiveIntensity={0.6}
        />
      </Box>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <ringGeometry args={[0.3, 0.4, 32]} />
        <meshBasicMaterial color={statusColors[status]} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <Html position={[0, 0.5, 0]} center>
        <div className="bg-black/80 text-white px-2 py-1 rounded text-xs">
          {device?.device_name || 'Device'}
        </div>
      </Html>
    </group>
  );
}

function TaskVisualization3D({ action, devices }) {
  const agentPos = [0, 0.5, 0];
  const targetDevices = action?.target_devices || [];

  return (
    <Canvas camera={{ position: [5, 4, 5], fov: 50 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#a855f7" />

      {/* Floor */}
      <Box args={[8, 0.05, 8]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#0a0a1a" />
      </Box>
      <gridHelper args={[8, 8, '#334155', '#1e293b']} position={[0, 0.03, 0]} />

      {/* Agent */}
      <AgentNode position={agentPos} isExecuting={action?.status === 'executing'} />

      {/* Target devices */}
      {targetDevices.map((td, idx) => {
        const angle = (idx / targetDevices.length) * Math.PI * 2;
        const devicePos = [Math.cos(angle) * 2.5, 0.5, Math.sin(angle) * 2.5];
        const device = devices.find(d => d.id === td.device_id);
        const step = action?.execution_sequence?.find(s => s.device_id === td.device_id);

        return (
          <React.Fragment key={idx}>
            <DeviceTarget position={devicePos} device={device || td} status={step?.status || 'pending'} />
            <TaskExecutionBeam
              from={agentPos}
              to={devicePos}
              status={step?.status || 'pending'}
              progress={0.5}
            />
          </React.Fragment>
        );
      })}

      <OrbitControls enableZoom={true} />
    </Canvas>
  );
}

export default function PhysicalTaskActionVisualizer3D({ agents = [], devices = [] }) {
  const queryClient = useQueryClient();
  const [selectedAgent, setSelectedAgent] = useState(agents[0]);
  const [intent, setIntent] = useState('');
  const [currentAction, setCurrentAction] = useState(null);

  const executeTaskMutation = useMutation({
    mutationFn: async ({ agent_id, intent, context }) => {
      const response = await base44.functions.invoke('execute-agent-physical-action', {
        agent_id,
        intent,
        context
      });
      return response.data;
    },
    onSuccess: (data) => {
      setCurrentAction(data.action_plan);
      toast.success(`Task executing: ${data.verbal_response}`);
      queryClient.invalidateQueries(['agent-physical-actions']);
    },
    onError: (error) => {
      toast.error(`Task failed: ${error.message}`);
    }
  });

  const handleExecuteTask = () => {
    if (!selectedAgent || !intent) return;
    executeTaskMutation.mutate({
      agent_id: selectedAgent.agent_id || selectedAgent.id,
      intent,
      context: {
        user_present: true,
        time_of_day: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'
      }
    });
  };

  const quickTasks = [
    'Turn on the living room lights',
    'Set the thermostat to 72 degrees',
    'Lock all doors',
    'Dim the bedroom lights to 30%',
    'Create a cozy movie night atmosphere'
  ];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Physical Task Execution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <select
              value={selectedAgent?.id || ''}
              onChange={(e) => setSelectedAgent(agents.find(a => a.id === e.target.value))}
              className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm"
            >
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.agent_id?.slice(0, 12) || `Agent ${agent.id?.slice(0, 8)}`}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              placeholder="Describe the task (e.g., 'Turn on lights and set thermostat to 70')"
              className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm"
            />
            <Button
              onClick={handleExecuteTask}
              disabled={executeTaskMutation.isPending || !intent}
              className="bg-gradient-to-r from-green-600 to-emerald-600"
            >
              {executeTaskMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Executing</>
              ) : (
                <><Play className="w-4 h-4 mr-2" /> Execute</>
              )}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickTasks.map((task, idx) => (
              <Button
                key={idx}
                size="sm"
                variant="outline"
                onClick={() => setIntent(task)}
                className="bg-slate-800/50 text-xs"
              >
                {task}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Task Execution Visualizer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <TaskVisualization3D action={currentAction} devices={devices} />
          </div>
        </CardContent>
      </Card>

      {currentAction && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              Execution Results
              <Badge className={currentAction.action_type === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-cyan-500/20 text-cyan-400'}>
                {currentAction.action_type}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-slate-300 text-sm">{currentAction.expected_outcome}</p>
              <div className="flex flex-wrap gap-2">
                {currentAction.target_devices?.map((td, idx) => (
                  <Badge key={idx} className="bg-slate-700">
                    {td.device_name}: {td.command}
                  </Badge>
                ))}
              </div>
              {currentAction.verbal_response && (
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
                  <p className="text-cyan-400 text-sm">🤖 "{currentAction.verbal_response}"</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}