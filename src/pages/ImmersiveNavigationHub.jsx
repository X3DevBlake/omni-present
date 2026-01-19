import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ImmersiveNavEnvironment from '../components/navigation/ImmersiveNavEnvironment';
import { Button } from '@/components/ui/button';
import { X, Info, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImmersiveNavigationHub() {
  const navigate = useNavigate();
  const [selectedHub, setSelectedHub] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [controlMode, setControlMode] = useState('orbit'); // 'orbit' or 'fps'

  // Fetch real-time ecosystem data
  const { data: ecosystemData } = useQuery({
    queryKey: ['immersive-nav-data'],
    queryFn: async () => {
      const response = await base44.functions.invoke('aggregate-realtime-ecosystem-data', {});
      return response.data;
    },
    refetchInterval: 5000,
  });

  useEffect(() => {
    const timer = setTimeout(() => setShowInstructions(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleHubClick = (hubName, path) => {
    setSelectedHub(hubName);
    setTimeout(() => {
      navigate(path);
    }, 1000);
  };

  const hubData = {
    home: {
      name: 'Ecosystem Home',
      path: '/Home',
      color: '#00f5ff',
      metrics: ecosystemData?.overview || {},
    },
    agents: {
      name: 'AI Agents Hub',
      path: '/AIManagement',
      color: '#a855f7',
      metrics: {
        active: ecosystemData?.agents?.active_count || 0,
        collaborations: ecosystemData?.collaborations?.active_count || 0,
      },
    },
    banking: {
      name: 'Banking & DeFi',
      path: '/EnhancedBankingHub',
      color: '#3b82f6',
      metrics: {
        volume: ecosystemData?.transactions?.total_volume || 0,
        staked: ecosystemData?.staking?.total_staked || 0,
      },
    },
    ailab: {
      name: 'AI Labs',
      path: '/AILabs',
      color: '#ec4899',
      metrics: {
        models: ecosystemData?.models?.count || 0,
        training: ecosystemData?.training?.active_sessions || 0,
      },
    },
    simulation: {
      name: 'Simulation Hub',
      path: '/SimulationHub',
      color: '#f59e0b',
      metrics: {
        scenarios: ecosystemData?.simulations?.active_count || 0,
        agents: ecosystemData?.simulations?.total_agents || 0,
      },
    },
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D Environment */}
      <Canvas
        camera={{ position: [0, 5, 15], fov: 60 }}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <ImmersiveNavEnvironment
            hubData={hubData}
            onHubClick={handleHubClick}
            selectedHub={selectedHub}
            controlMode={controlMode}
          />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-auto">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Immersive Navigation</h1>
            <p className="text-gray-400">Explore the ecosystem in 3D</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowInstructions(!showInstructions)}
              className="bg-black/50 border-white/20 hover:bg-white/10"
            >
              <Info className="w-4 h-4 text-white" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setControlMode(controlMode === 'orbit' ? 'fps' : 'orbit')}
              className="bg-black/50 border-white/20 hover:bg-white/10"
            >
              <Settings className="w-4 h-4 text-white" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/Home')}
              className="bg-black/50 border-white/20 hover:bg-white/10"
            >
              <X className="w-4 h-4 text-white" />
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <AnimatePresence>
          {showInstructions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute bottom-6 left-1/2 transform -translate-x-1/2 pointer-events-auto"
            >
              <div className="bg-black/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 max-w-2xl">
                <h3 className="text-white font-semibold mb-3">How to Navigate</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-gray-300">
                    <span className="text-cyan-400 font-medium">Click & Drag:</span> Rotate view
                  </div>
                  <div className="text-gray-300">
                    <span className="text-cyan-400 font-medium">Scroll:</span> Zoom in/out
                  </div>
                  <div className="text-gray-300">
                    <span className="text-cyan-400 font-medium">Click Portal:</span> Enter hub
                  </div>
                  <div className="text-gray-300">
                    <span className="text-cyan-400 font-medium">Hover:</span> View metrics
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hub Info Panels */}
        <div className="absolute right-6 top-24 space-y-3 pointer-events-auto max-w-sm">
          {Object.entries(hubData).map(([key, hub]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * Object.keys(hubData).indexOf(key) }}
              className="bg-black/60 backdrop-blur-lg border border-white/10 rounded-xl p-4 hover:bg-black/80 transition-all cursor-pointer"
              onClick={() => handleHubClick(hub.name, hub.path)}
              style={{ borderColor: hub.color + '40' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: hub.color }}
                />
                <div className="flex-1">
                  <h4 className="text-white font-medium text-sm">{hub.name}</h4>
                  <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    {Object.entries(hub.metrics).map(([key, value]) => (
                      <span key={key}>
                        {key}: <span className="text-white">{typeof value === 'number' ? value.toLocaleString() : value}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Control Mode Indicator */}
        <div className="absolute bottom-6 left-6 pointer-events-auto">
          <div className="bg-black/60 backdrop-blur-lg border border-white/10 rounded-lg px-4 py-2">
            <span className="text-gray-400 text-sm">
              Mode: <span className="text-cyan-400 font-medium">{controlMode === 'orbit' ? 'Orbit' : 'Free Camera'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Transition Effect */}
      <AnimatePresence>
        {selectedHub && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-xl pointer-events-none"
          >
            <div className="flex items-center justify-center h-full">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-white text-4xl font-bold"
              >
                Entering {selectedHub}...
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}