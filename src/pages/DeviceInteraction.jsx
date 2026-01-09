import React, { useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Activity, Bot, Radio, Eye, Zap } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { base44 } from '@/api/base44Client';
import * as THREE from 'three';

function AIAgentNode({ agent, position, isActive }) {
  const meshRef = React.useRef();

  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.rotation.y += 0.02;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={agent.color}
          emissive={agent.color}
          emissiveIntensity={isActive ? 0.8 : 0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <Text position={[0, 1, 0]} fontSize={0.2} color="white" anchorX="center">
        {agent.name}
      </Text>
    </group>
  );
}

function DeviceNode({ device, position, isOnline }) {
  const meshRef = React.useRef();

  useFrame(() => {
    if (meshRef.current && isOnline) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={isOnline ? '#00f5ff' : '#666666'}
          emissive={isOnline ? '#00f5ff' : '#333333'}
          emissiveIntensity={isOnline ? 0.5 : 0.1}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      <Text position={[0, 1, 0]} fontSize={0.15} color="white" anchorX="center">
        {device.name}
      </Text>
    </group>
  );
}

function DataFlowLine({ from, to, active }) {
  const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)];
  
  return (
    <Line
      points={points}
      color={active ? '#00f5ff' : '#ffffff'}
      lineWidth={active ? 3 : 1}
      transparent
      opacity={active ? 0.8 : 0.2}
    />
  );
}

export default function DeviceInteraction() {
  const [devices, setDevices] = useState([]);
  const [agents, setAgents] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(updateInteractions, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      const orders = await base44.entities.Order.filter({ 
        created_by: user.email, 
        status: 'delivered' 
      });

      const devicesData = orders.map((order, i) => ({
        id: order.device_id,
        name: order.device_name,
        position: [Math.cos(i * 1.5) * 4, 0, Math.sin(i * 1.5) * 4],
        online: Math.random() > 0.2,
        battery: Math.floor(Math.random() * 100)
      }));

      const agentsData = [
        { id: 'agent_1', name: 'Monitor', color: '#10b981', position: [0, 2, 0] },
        { id: 'agent_2', name: 'Optimizer', color: '#a855f7', position: [-2, 2, 2] },
        { id: 'agent_3', name: 'Guardian', color: '#ef4444', position: [2, 2, -2] }
      ];

      setDevices(devicesData);
      setAgents(agentsData);
    } catch (err) {
      console.error('Failed to load data');
    }
  };

  const updateInteractions = () => {
    setInteractions(prev => {
      const newInteractions = devices.filter(d => d.online).map(device => ({
        deviceId: device.id,
        agentId: agents[Math.floor(Math.random() * agents.length)]?.id,
        type: ['sensor_data', 'command', 'analysis'][Math.floor(Math.random() * 3)],
        timestamp: Date.now()
      }));
      return [...prev, ...newInteractions].slice(-20);
    });
  };

  return (
    <AuroraBackground className="min-h-screen">
      <div className="relative h-screen flex flex-col">
        <div className="p-6 bg-black/20 backdrop-blur-sm border-b border-white/10">
          <h1 className="text-3xl font-bold text-white mb-2">Device-AI Interaction Dashboard</h1>
          <p className="text-white/60">Real-time visualization of AI agents controlling physical devices</p>
        </div>

        <div className="flex-1 grid lg:grid-cols-3 gap-4 p-6">
          <div className="lg:col-span-2 bg-black/20 rounded-2xl overflow-hidden border border-white/10">
            <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
              <ambientLight intensity={0.4} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />

              {devices.map(device => (
                <DeviceNode key={device.id} device={device} position={device.position} isOnline={device.online} />
              ))}

              {agents.map(agent => (
                <AIAgentNode key={agent.id} agent={agent} position={agent.position} isActive={true} />
              ))}

              {interactions.filter(i => Date.now() - i.timestamp < 2000).map((interaction, idx) => {
                const device = devices.find(d => d.id === interaction.deviceId);
                const agent = agents.find(a => a.id === interaction.agentId);
                if (!device || !agent) return null;
                
                return (
                  <DataFlowLine
                    key={idx}
                    from={agent.position}
                    to={device.position}
                    active={true}
                  />
                );
              })}

              <OrbitControls enableZoom enablePan />
            </Canvas>
          </div>

          <div className="space-y-4">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Live Interactions
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {interactions.slice(-8).reverse().map((interaction, i) => {
                  const device = devices.find(d => d.id === interaction.deviceId);
                  const agent = agents.find(a => a.id === interaction.agentId);
                  
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white/5 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="w-4 h-4 text-purple-400" />
                        <span className="text-white text-sm">{agent?.name || 'Agent'}</span>
                        <span className="text-white/40 text-xs">→</span>
                        <Radio className="w-4 h-4 text-cyan-400" />
                        <span className="text-white text-sm">{device?.name || 'Device'}</span>
                      </div>
                      <div className="text-white/60 text-xs capitalize">{interaction.type.replace('_', ' ')}</div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-4">
              <h3 className="text-blue-400 font-semibold mb-3">Connected Devices</h3>
              <div className="space-y-2">
                {devices.map(device => (
                  <div key={device.id} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                    <span className="text-white text-sm">{device.name}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${device.online ? 'bg-green-400' : 'bg-red-400'}`} />
                      <span className="text-white/60 text-xs">{device.battery}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-4">
              <h3 className="text-purple-400 font-semibold mb-3">AI Agents</h3>
              <div className="space-y-2">
                {agents.map(agent => (
                  <div key={agent.id} className="bg-white/5 rounded-lg p-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: agent.color }} />
                    <span className="text-white text-sm">{agent.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}