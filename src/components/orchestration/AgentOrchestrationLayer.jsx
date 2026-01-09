import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Text } from '@react-three/drei';
import { Target, GitBranch, Zap, Users, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function AgentOrchNode({ position, agent, status, onClick }) {
  const meshRef = React.useRef();
  useFrame(() => {
    if (meshRef.current && status === 'active') {
      meshRef.current.rotation.y += 0.02;
    }
  });

  const color = status === 'active' ? '#10b981' : status === 'busy' ? '#f59e0b' : '#6b7280';

  return (
    <group position={position} onClick={() => onClick(agent)}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
      <Text position={[0, -0.8, 0]} fontSize={0.15} color="white">{agent.name}</Text>
    </group>
  );
}

export default function AgentOrchestrationLayer() {
  const [goal, setGoal] = useState('');
  const [orchestrationActive, setOrchestrationActive] = useState(false);
  const [decomposedTasks, setDecomposedTasks] = useState([]);
  const [agents] = useState([
    { id: 1, name: 'Alpha', capabilities: ['analysis', 'processing'], load: 45, status: 'active' },
    { id: 2, name: 'Beta', capabilities: ['communication', 'coordination'], load: 32, status: 'active' },
    { id: 3, name: 'Gamma', capabilities: ['optimization', 'planning'], load: 78, status: 'busy' },
    { id: 4, name: 'Delta', capabilities: ['execution', 'monitoring'], load: 20, status: 'active' }
  ]);
  const [taskAssignments, setTaskAssignments] = useState([]);
  const [communications, setCommunications] = useState([]);

  const decomposeGoal = async () => {
    if (!goal.trim()) return;
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Break down this complex multi-agent goal into executable tasks: "${goal}". For each task, specify required capabilities, priority, dependencies, and estimated duration.`,
      response_json_schema: {
        type: 'object',
        properties: {
          tasks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                title: { type: 'string' },
                description: { type: 'string' },
                required_capabilities: { type: 'array', items: { type: 'string' } },
                priority: { type: 'string' },
                dependencies: { type: 'array', items: { type: 'number' } },
                estimated_duration: { type: 'string' }
              }
            }
          }
        }
      }
    });

    setDecomposedTasks(response.tasks);
    assignTasks(response.tasks);
  };

  const assignTasks = (tasks) => {
    const assignments = tasks.map(task => {
      const suitableAgents = agents.filter(agent => 
        task.required_capabilities.some(cap => agent.capabilities.includes(cap))
      ).sort((a, b) => a.load - b.load);
      
      return {
        taskId: task.id,
        taskTitle: task.title,
        assignedAgent: suitableAgents[0]?.name || 'Unassigned',
        status: 'pending',
        progress: 0
      };
    });
    setTaskAssignments(assignments);
  };

  const startOrchestration = () => {
    setOrchestrationActive(true);
    
    const interval = setInterval(() => {
      setTaskAssignments(prev => prev.map(assignment => {
        if (assignment.status === 'pending' && Math.random() > 0.7) {
          return { ...assignment, status: 'in-progress', progress: 10 };
        }
        if (assignment.status === 'in-progress') {
          const newProgress = Math.min(100, assignment.progress + Math.random() * 15);
          return {
            ...assignment,
            progress: newProgress,
            status: newProgress >= 100 ? 'completed' : 'in-progress'
          };
        }
        return assignment;
      }));

      if (Math.random() > 0.6) {
        const fromAgent = agents[Math.floor(Math.random() * agents.length)];
        const toAgent = agents[Math.floor(Math.random() * agents.length)];
        if (fromAgent.id !== toAgent.id) {
          setCommunications(prev => [...prev.slice(-5), {
            from: fromAgent.name,
            to: toAgent.name,
            message: 'Task coordination update',
            priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
            timestamp: Date.now()
          }]);
        }
      }
    }, 2000);

    setTimeout(() => {
      clearInterval(interval);
      setOrchestrationActive(false);
    }, 20000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-white font-bold text-xl mb-4">Agent Orchestration Layer</h3>

        {/* Goal Input */}
        <div className="mb-6">
          <label className="text-white/70 text-sm mb-2 block">Define Multi-Agent Goal:</label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="E.g., Analyze market data, generate insights, create report, and distribute to stakeholders..."
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 h-24 mb-3"
          />
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={decomposeGoal}
              className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-400 font-semibold flex items-center gap-2"
            >
              <GitBranch className="w-4 h-4" />
              Decompose Goal
            </motion.button>
            {decomposedTasks.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={startOrchestration}
                disabled={orchestrationActive}
                className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                {orchestrationActive ? 'Running...' : 'Start Orchestration'}
              </motion.button>
            )}
          </div>
        </div>

        {/* Agent Network Visualization */}
        {decomposedTasks.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="h-80 bg-black/20 rounded-xl overflow-hidden">
              <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                {agents.map((agent, idx) => {
                  const angle = (idx / agents.length) * Math.PI * 2;
                  return (
                    <AgentOrchNode
                      key={agent.id}
                      position={[Math.cos(angle) * 4, Math.sin(angle) * 4, 0]}
                      agent={agent}
                      status={agent.status}
                      onClick={() => {}}
                    />
                  );
                })}
                {communications.slice(-3).map((comm, idx) => {
                  const fromIdx = agents.findIndex(a => a.name === comm.from);
                  const toIdx = agents.findIndex(a => a.name === comm.to);
                  if (fromIdx === -1 || toIdx === -1) return null;
                  const fromAngle = (fromIdx / agents.length) * Math.PI * 2;
                  const toAngle = (toIdx / agents.length) * Math.PI * 2;
                  return (
                    <Line
                      key={idx}
                      points={[
                        [Math.cos(fromAngle) * 4, Math.sin(fromAngle) * 4, 0],
                        [Math.cos(toAngle) * 4, Math.sin(toAngle) * 4, 0]
                      ]}
                      color={comm.priority === 'high' ? '#ef4444' : '#00f5ff'}
                      lineWidth={2}
                    />
                  );
                })}
                <OrbitControls />
              </Canvas>
            </div>

            <div className="space-y-3">
              <h4 className="text-white font-bold text-sm">Agent Status</h4>
              {agents.map(agent => (
                <div key={agent.id} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold text-sm">{agent.name}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      agent.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      agent.status === 'busy' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {agent.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">Load: {agent.load}%</span>
                    <span className="text-white/60">{agent.capabilities.join(', ')}</span>
                  </div>
                  <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-400" style={{ width: `${agent.load}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Task Assignments */}
        {taskAssignments.length > 0 && (
          <div className="mb-6">
            <h4 className="text-white font-bold mb-3">Task Assignments</h4>
            <div className="space-y-2">
              {taskAssignments.map((assignment, idx) => (
                <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-semibold text-sm">{assignment.taskTitle}</span>
                      <span className="text-cyan-400 text-xs">→ {assignment.assignedAgent}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      assignment.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      assignment.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {assignment.status}
                    </span>
                  </div>
                  {assignment.status !== 'pending' && (
                    <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-400 to-cyan-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${assignment.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Communication Log */}
        {communications.length > 0 && (
          <div>
            <h4 className="text-white font-bold mb-3 text-sm">Inter-Agent Communications</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {communications.slice(-8).reverse().map((comm, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-white/5 rounded text-xs">
                  <span className={`w-2 h-2 rounded-full ${
                    comm.priority === 'high' ? 'bg-red-400' :
                    comm.priority === 'medium' ? 'bg-yellow-400' :
                    'bg-green-400'
                  }`} />
                  <span className="text-white/80">{comm.from}</span>
                  <span className="text-white/40">→</span>
                  <span className="text-white/80">{comm.to}</span>
                  <span className="text-white/60 flex-1">: {comm.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}