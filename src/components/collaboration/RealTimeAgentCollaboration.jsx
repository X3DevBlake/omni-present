import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Text, Sphere } from '@react-three/drei';
import { Send, Users, Brain, Target, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function AgentNode3D({ position, agent, active, onClick }) {
  const meshRef = React.useRef();
  
  useFrame((state) => {
    if (meshRef.current && active) {
      meshRef.current.rotation.y += 0.05;
    }
  });

  return (
    <group position={position} onClick={() => onClick(agent)}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={active ? '#00f5ff' : agent.color}
          emissive={agent.color}
          emissiveIntensity={active ? 1 : 0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <Text position={[0, 0.8, 0]} fontSize={0.2} color="white">
        {agent.name}
      </Text>
      {active && (
        <Sphere args={[0.7, 16, 16]} position={[0, 0, 0]}>
          <meshBasicMaterial color="#00f5ff" transparent opacity={0.2} wireframe />
        </Sphere>
      )}
    </group>
  );
}

function CommunicationPath({ from, to, message, active }) {
  const points = [from, to];
  
  return (
    <>
      <Line points={points} color={active ? '#00f5ff' : '#a855f7'} lineWidth={active ? 3 : 1} />
      {message && (
        <mesh position={[(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
      )}
    </>
  );
}

export default function RealTimeAgentCollaboration() {
  const [agents, setAgents] = useState([
    { id: 1, name: 'Alpha', color: '#00f5ff', status: 'active', position: [-4, 2, 0], currentTask: 'Data Analysis' },
    { id: 2, name: 'Beta', color: '#a855f7', status: 'active', position: [4, 2, 0], currentTask: 'Pattern Recognition' },
    { id: 3, name: 'Gamma', color: '#ec4899', status: 'active', position: [0, -2, 4], currentTask: 'Optimization' },
    { id: 4, name: 'Delta', color: '#10b981', status: 'idle', position: [0, -2, -4], currentTask: null }
  ]);

  const [communications, setCommunications] = useState([
    { from: 1, to: 2, message: 'Sharing dataset patterns', timestamp: Date.now() - 5000, active: true },
    { from: 2, to: 3, message: 'Delegating optimization task', timestamp: Date.now() - 3000, active: true }
  ]);

  const [selectedAgent, setSelectedAgent] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [activeTask, setActiveTask] = useState(null);

  const [collaborationMetrics, setCollaborationMetrics] = useState({
    tasksCompleted: 0,
    insightsShared: 0,
    problemsSolved: 0,
    efficiency: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCollaborationMetrics(prev => ({
        tasksCompleted: prev.tasksCompleted + Math.floor(Math.random() * 3),
        insightsShared: prev.insightsShared + Math.floor(Math.random() * 2),
        problemsSolved: prev.problemsSolved + Math.floor(Math.random() * 1),
        efficiency: Math.min(100, prev.efficiency + (Math.random() * 2))
      }));

      // Simulate random communications
      if (Math.random() > 0.7) {
        const fromAgent = agents[Math.floor(Math.random() * agents.length)];
        const toAgent = agents[Math.floor(Math.random() * agents.length)];
        if (fromAgent.id !== toAgent.id) {
          const messages = [
            'Need help with complex calculation',
            'Found interesting pattern in data',
            'Requesting resource allocation',
            'Sharing new insight'
          ];
          setCommunications(prev => [...prev.slice(-5), {
            from: fromAgent.id,
            to: toAgent.id,
            message: messages[Math.floor(Math.random() * messages.length)],
            timestamp: Date.now(),
            active: true
          }]);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [agents]);

  const sendMessage = () => {
    if (!messageInput.trim() || !selectedAgent) return;
    
    const newMessage = {
      agent: selectedAgent.name,
      content: messageInput,
      timestamp: new Date().toLocaleTimeString(),
      type: 'user'
    };
    
    setChatHistory([...chatHistory, newMessage]);
    
    // Simulate agent response
    setTimeout(() => {
      const responses = [
        'Acknowledged. Processing your request.',
        'I can help with that. Let me collaborate with other agents.',
        'Interesting insight! Sharing with the team.',
        'Task delegated to appropriate specialist.'
      ];
      setChatHistory(prev => [...prev, {
        agent: selectedAgent.name,
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toLocaleTimeString(),
        type: 'agent'
      }]);
    }, 1000);
    
    setMessageInput('');
  };

  const delegateTask = async (taskName) => {
    setActiveTask(taskName);
    
    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `You are coordinating AI agents. Task: "${taskName}". Suggest which agent should handle this and why, and what sub-tasks to create. Respond in JSON.`,
      response_json_schema: {
        type: 'object',
        properties: {
          recommended_agent: { type: 'string' },
          reasoning: { type: 'string' },
          subtasks: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    setChatHistory(prev => [...prev, {
      agent: 'System',
      content: `Task "${taskName}" delegated to ${aiResponse.recommended_agent}. Reason: ${aiResponse.reasoning}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'system',
      subtasks: aiResponse.subtasks
    }]);
  };

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Tasks Completed', value: collaborationMetrics.tasksCompleted, icon: Target, color: '#10b981' },
          { label: 'Insights Shared', value: collaborationMetrics.insightsShared, icon: Brain, color: '#00f5ff' },
          { label: 'Problems Solved', value: collaborationMetrics.problemsSolved, icon: AlertCircle, color: '#f59e0b' },
          { label: 'Efficiency', value: `${collaborationMetrics.efficiency.toFixed(1)}%`, icon: Users, color: '#a855f7' }
        ].map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon size={20} style={{ color: metric.color }} />
              </div>
              <p className="text-2xl font-bold text-white">{metric.value}</p>
              <p className="text-white/60 text-xs">{metric.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 3D Network Visualization */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-bold mb-4">Agent Communication Network</h3>
          <div className="h-[500px] rounded-xl overflow-hidden bg-black/20">
            <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              
              {agents.map(agent => (
                <AgentNode3D
                  key={agent.id}
                  position={agent.position}
                  agent={agent}
                  active={selectedAgent?.id === agent.id}
                  onClick={setSelectedAgent}
                />
              ))}

              {communications.map((comm, idx) => {
                const fromAgent = agents.find(a => a.id === comm.from);
                const toAgent = agents.find(a => a.id === comm.to);
                if (!fromAgent || !toAgent) return null;
                return (
                  <CommunicationPath
                    key={idx}
                    from={fromAgent.position}
                    to={toAgent.position}
                    message={comm.message}
                    active={comm.active}
                  />
                );
              })}

              <OrbitControls />
            </Canvas>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 flex flex-col">
          <h3 className="text-white font-bold mb-4">Agent Communication</h3>
          
          {/* Agent Selector */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {agents.map(agent => (
              <motion.button
                key={agent.id}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedAgent(agent)}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
                  selectedAgent?.id === agent.id
                    ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-400'
                    : 'bg-white/5 border border-white/10 text-white/70'
                }`}
              >
                {agent.name}
              </motion.button>
            ))}
          </div>

          {/* Chat History */}
          <div className="flex-1 bg-black/20 rounded-lg p-4 mb-4 overflow-y-auto max-h-[280px] space-y-2">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`p-3 rounded-lg ${
                msg.type === 'user' ? 'bg-cyan-500/20 ml-8' :
                msg.type === 'system' ? 'bg-purple-500/20' :
                'bg-white/10 mr-8'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/80 font-semibold text-sm">{msg.agent}</span>
                  <span className="text-white/40 text-xs">{msg.timestamp}</span>
                </div>
                <p className="text-white text-sm">{msg.content}</p>
                {msg.subtasks && (
                  <div className="mt-2 pl-3 border-l-2 border-purple-500/50">
                    {msg.subtasks.map((task, i) => (
                      <p key={i} className="text-white/60 text-xs">• {task}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mb-3">
            {['Analyze Data', 'Optimize Process', 'Debug Issue', 'Generate Report'].map(task => (
              <motion.button
                key={task}
                whileHover={{ scale: 1.05 }}
                onClick={() => delegateTask(task)}
                className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 text-xs font-semibold"
              >
                {task}
              </motion.button>
            ))}
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={selectedAgent ? `Message ${selectedAgent.name}...` : 'Select an agent first...'}
              disabled={!selectedAgent}
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 text-sm"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              disabled={!selectedAgent}
              className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Active Communications Feed */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-white font-bold mb-4">Live Communication Stream</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {communications.slice(-10).reverse().map((comm, idx) => {
            const fromAgent = agents.find(a => a.id === comm.from);
            const toAgent = agents.find(a => a.id === comm.to);
            return (
              <div key={idx} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: fromAgent?.color }} />
                <span className="text-white/80 text-sm font-semibold">{fromAgent?.name}</span>
                <span className="text-white/40 text-xs">→</span>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: toAgent?.color }} />
                <span className="text-white/80 text-sm font-semibold">{toAgent?.name}</span>
                <span className="text-white/60 text-sm flex-1">: {comm.message}</span>
                <span className="text-white/40 text-xs">{new Date(comm.timestamp).toLocaleTimeString()}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}