import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Globe, Bot, Smartphone, Monitor, Play, Pause, Settings } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import HolographicAgent3D from '../components/3d/HolographicAgent3D';
import GoogleEarthTerrain from '../components/3d/GoogleEarthTerrain';
import AgentInteractionLines from '../components/3d/AgentInteractionLines';
import DeviceMarker3D from '../components/3d/DeviceMarker3D';
import SimulationControls from '../components/simulation/SimulationControls';
import AgentCommunicationPanel from '../components/agents/AgentCommunicationPanel';
import GestureControlPanel from '../components/agents/GestureControlPanel';
import CollaborationSessionHub from '../components/collaboration/CollaborationSessionHub';

export default function HolographicWorld() {
  const [userEmail, setUserEmail] = useState(null);
  const [simulation, setSimulation] = useState(null);
  const [agents, setAgents] = useState([]);
  const [devices, setDevices] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [simulationRunning, setSimulationRunning] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(user => {
        setUserEmail(user?.email);
        loadSimulation(user?.email);
      })
      .catch(() => setUserEmail(null));
  }, []);

  useEffect(() => {
    if (simulation?.id) {
      // Subscribe to real-time agent updates
      const unsubscribeAgents = base44.entities.HolographicAgent.subscribe((event) => {
        if (event.type === 'create' || event.type === 'update') {
          loadAgents();
        }
      });

      // Subscribe to interactions
      const unsubscribeInteractions = base44.entities.AgentInteraction.subscribe((event) => {
        if (event.type === 'create') {
          setInteractions(prev => [event.data, ...prev].slice(0, 50));
        }
      });

      return () => {
        unsubscribeAgents();
        unsubscribeInteractions();
      };
    }
  }, [simulation]);

  const loadSimulation = async (email) => {
    try {
      const sims = await base44.entities.WorldSimulation.list({ user_email: email });
      if (sims.length > 0) {
        setSimulation(sims[0]);
        await loadAgents();
        await loadDevices();
      }
    } catch (error) {
      console.error('Error loading simulation:', error);
    }
  };

  const loadAgents = async () => {
    try {
      const agentsList = await base44.entities.HolographicAgent.list({ user_email: userEmail });
      setAgents(agentsList);
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  const loadDevices = async () => {
    try {
      const devicesList = await base44.entities.HolographicDevice.list({ owner_email: userEmail });
      setDevices(devicesList);
    } catch (error) {
      console.error('Error loading devices:', error);
    }
  };

  const createSimulation = async () => {
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Initialize holographic world simulation for user.
Create simulation at San Francisco coordinates (37.7749, -122.4194).
Return simulation details.`,
        response_json_schema: {
          type: 'object',
          properties: {
            simulation_id: { type: 'string' },
            status: { type: 'string' }
          }
        }
      });

      await loadSimulation(userEmail);
    } catch (error) {
      console.error('Error creating simulation:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0D1A] via-[#1a1a2e] to-[#0D0D1A]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Holographic World</h1>
              <p className="text-white/60 text-sm">Real-World 3D Agent Simulation</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
              <p className="text-white/60 text-xs">Active Agents</p>
              <p className="text-cyan-400 text-xl font-bold">{agents.length}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
              <p className="text-white/60 text-xs">Devices</p>
              <p className="text-purple-400 text-xl font-bold">{devices.length}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3D Canvas */}
      <div className="relative" style={{ height: 'calc(100vh - 140px)' }}>
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 50, 100]} />
          <OrbitControls enableDamping dampingFactor={0.05} />
          
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#00FFFF" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8A2BE2" />
          
          {/* Stars Background */}
          <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          {/* Google Earth Terrain */}
          {simulation?.google_earth_config && (
            <GoogleEarthTerrain config={simulation.google_earth_config} />
          )}
          
          {/* Holographic Agents */}
          {agents.map((agent) => (
            <HolographicAgent3D 
              key={agent.id} 
              agent={agent}
              position={[
                agent.current_location?.latitude || 0,
                agent.current_location?.altitude || 0,
                agent.current_location?.longitude || 0
              ]}
            />
          ))}
          
          {/* Device Markers */}
          {devices.map((device) => (
            <DeviceMarker3D 
              key={device.id}
              device={device}
              position={[
                device.location?.latitude || 0,
                0,
                device.location?.longitude || 0
              ]}
            />
          ))}
          
          {/* Agent Interaction Lines */}
          <AgentInteractionLines interactions={interactions} agents={agents} />
        </Canvas>

        {/* Overlay Controls */}
        <div className="absolute top-4 right-4 space-y-2">
          <SimulationControls 
            simulation={simulation}
            running={simulationRunning}
            onToggle={() => setSimulationRunning(!simulationRunning)}
            userEmail={userEmail}
          />
        </div>

        {/* Side Panels */}
        <div className="absolute top-20 left-4 space-y-4 max-w-xs">
          {agents.length > 0 && devices.length > 0 && (
            <GestureControlPanel agent={agents[0]} devices={devices} />
          )}
        </div>

        <div className="absolute top-20 right-4 max-w-md max-h-[calc(100vh-200px)] overflow-y-auto">
          {userEmail && <CollaborationSessionHub userEmail={userEmail} />}
        </div>

        {/* Agent Communication Panel */}
        <div className="absolute bottom-4 left-4 right-4">
          <AgentCommunicationPanel 
            agents={agents}
            interactions={interactions}
            userEmail={userEmail}
          />
        </div>

        {/* Create Simulation Button */}
        {!simulation && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={createSimulation}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white font-bold text-lg shadow-2xl"
            >
              <Globe className="w-6 h-6 inline mr-2" />
              Initialize Holographic World
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}