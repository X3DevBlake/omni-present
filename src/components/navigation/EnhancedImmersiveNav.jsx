import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Brain, TrendingUp, Zap, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Dynamic3DNavPortal from './Dynamic3DNavPortal';
import { usePersonalizedNavTheme } from './PersonalizedNavTheme';

// Live Data Hub with real-time metrics
function LiveDataHub({ position, hubData, onClick }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += 0.005;
    
    // Pulse based on activity level
    const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1 * (hubData.activity / 100);
    meshRef.current.scale.set(scale, scale, scale);
  });

  const color = hubData.status === 'critical' ? '#ff4444' : 
                hubData.status === 'active' ? '#00ff88' : '#4488ff';

  return (
    <group position={position} onClick={onClick}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Activity ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.5, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
      
      {/* Data particles */}
      {Array.from({ length: 5 }).map((_, i) => (
        <DataParticle 
          key={i} 
          radius={2} 
          speed={0.5 + i * 0.2} 
          offset={i * (Math.PI * 2 / 5)}
          color={color}
        />
      ))}
    </group>
  );
}

function DataParticle({ radius, speed, offset, color }) {
  const ref = useRef();
  
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed + offset;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.z = Math.sin(t) * radius;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

// AI Navigation Assistant
function AINavigationAssistant({ userContext, onSuggestion }) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    // Analyze user context and generate suggestions
    const newSuggestions = [];
    
    if (userContext.recentActivity?.includes('simulation')) {
      newSuggestions.push({
        hub: 'simulation',
        reason: 'Continue your active simulation',
        priority: 'high'
      });
    }
    
    if (userContext.performanceAlerts > 0) {
      newSuggestions.push({
        hub: 'monitoring',
        reason: `${userContext.performanceAlerts} alerts need attention`,
        priority: 'critical'
      });
    }

    if (userContext.newData) {
      newSuggestions.push({
        hub: 'ailab',
        reason: 'New training data available',
        priority: 'medium'
      });
    }
    
    setSuggestions(newSuggestions);
  }, [userContext]);

  return suggestions.length > 0 ? (
    <div className="absolute bottom-4 left-4 space-y-2 z-20">
      {suggestions.map((sug, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`backdrop-blur-sm rounded-lg p-3 cursor-pointer border ${
            sug.priority === 'critical' 
              ? 'bg-red-500/20 border-red-500' 
              : sug.priority === 'high'
              ? 'bg-orange-500/20 border-orange-500'
              : 'bg-blue-500/20 border-blue-500'
          }`}
          onClick={() => onSuggestion(sug.hub)}
        >
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-white" />
            <div>
              <p className="text-white font-medium text-sm">{sug.reason}</p>
              <p className="text-white/60 text-xs">Tap to navigate</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  ) : null;
}

export default function EnhancedImmersiveNav({ onClose }) {
  const navigate = useNavigate();
  const [selectedHub, setSelectedHub] = useState(null);
  const [userContext, setUserContext] = useState({
    recentActivity: [],
    performanceAlerts: 0,
    newData: false,
  });
  const { theme } = usePersonalizedNavTheme();
  const [view, setView] = useState('portals'); // 'portals' or 'hubs'

  // Fetch live data for each hub
  const { data: hubsData } = useQuery({
    queryKey: ['live-hub-data'],
    queryFn: async () => {
      const [agents, simulations, alerts] = await Promise.all([
        base44.entities.Agent.list(),
        base44.entities.Simulation.filter({ status: 'running' }),
        base44.entities.ProactiveAlert.filter({ status: 'active' }),
      ]);

      return {
        agents: {
          activity: Math.min(100, agents.length * 10),
          status: agents.length > 5 ? 'active' : 'normal',
          label: 'AI Agents',
          path: '/AIManagement',
          metrics: { total: agents.length, active: agents.length }
        },
        simulation: {
          activity: Math.min(100, simulations.length * 20),
          status: simulations.length > 0 ? 'active' : 'normal',
          label: 'Simulations',
          path: '/SimulationStudio',
          metrics: { running: simulations.length }
        },
        monitoring: {
          activity: Math.min(100, alerts.length * 15),
          status: alerts.length > 3 ? 'critical' : alerts.length > 0 ? 'active' : 'normal',
          label: 'Monitoring',
          path: '/AlertManagementDashboard',
          metrics: { alerts: alerts.length }
        },
      };
    },
    refetchInterval: 3000,
  });

  useEffect(() => {
    if (hubsData) {
      setUserContext({
        recentActivity: localStorage.getItem('recentNav')?.split(',') || [],
        performanceAlerts: hubsData.monitoring?.metrics?.alerts || 0,
        newData: Math.random() > 0.7,
      });
    }
  }, [hubsData]);

  const handleHubClick = (hubKey) => {
    const hub = hubsData[hubKey];
    setSelectedHub({ ...hub, key: hubKey });
  };

  const handleNavigate = () => {
    if (selectedHub) {
      localStorage.setItem('recentNav', [selectedHub.key, ...(userContext.recentActivity || [])].slice(0, 5).join(','));
      navigate(createPageUrl(selectedHub.path));
      onClose();
    }
  };

  const navDestinations = React.useMemo(() => {
    if (!hubsData) return [];
    return [
      { name: 'AI Agents', path: '/AIManagement', activity: hubsData.agents?.activity || 0 },
      { name: 'Simulations', path: '/SimulationStudio', activity: hubsData.simulation?.activity || 0 },
      { name: 'Monitoring', path: '/AlertManagementDashboard', activity: hubsData.monitoring?.activity || 0 },
      { name: 'Orchestration', path: '/AgentOrchestrationHub', activity: 20 },
      { name: 'AI Labs', path: '/AILabsLifecycle', activity: 15 },
      { name: 'Analytics', path: '/AIAnalyticsHub', activity: 10 },
    ];
  }, [hubsData]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {view === 'portals' ? (
        <Dynamic3DNavPortal
          destinations={navDestinations}
          onNavigate={(dest) => {
            navigate(createPageUrl(dest.path));
            onClose();
          }}
        />
      ) : (
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 10]} />
          <OrbitControls enablePan={false} maxDistance={20} minDistance={5} />
          
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          
          <Stars radius={100} depth={50} count={5000} factor={4} />
          
          {hubsData && (
            <>
              <LiveDataHub 
                position={[-4, 0, 0]} 
                hubData={hubsData.agents}
                onClick={() => handleHubClick('agents')}
              />
              <LiveDataHub 
                position={[4, 0, 0]} 
                hubData={hubsData.simulation}
                onClick={() => handleHubClick('simulation')}
              />
              <LiveDataHub 
                position={[0, 4, 0]} 
                hubData={hubsData.monitoring}
                onClick={() => handleHubClick('monitoring')}
              />
            </>
          )}
        </Canvas>
      )}

      {/* AI Assistant */}
      <AINavigationAssistant 
        userContext={userContext}
        onSuggestion={(hub) => {
          const hubData = hubsData[hub];
          if (hubData) {
            navigate(createPageUrl(hubData.path));
            onClose();
          }
        }}
      />

      {/* Hub Details Panel */}
      <AnimatePresence>
        {selectedHub && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/20 p-6 min-w-96"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-2xl font-bold">{selectedHub.label}</h3>
              <button onClick={() => setSelectedHub(null)} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              {Object.entries(selectedHub.metrics).map(([key, value]) => (
                <div key={key} className="bg-white/5 rounded-lg p-3">
                  <div className="text-white/60 text-xs capitalize">{key}</div>
                  <div className="text-white text-xl font-bold">{value}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">{selectedHub.activity}% activity level</span>
            </div>

            <button
              onClick={handleNavigate}
              className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white py-3 rounded-lg font-medium"
            >
              Navigate to {selectedHub.label}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Toggle */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <button
          onClick={() => setView('portals')}
          className={`px-4 py-2 rounded-lg backdrop-blur-sm transition-all ${
            view === 'portals' ? 'bg-cyan-600 text-white' : 'bg-white/10 text-white/60'
          }`}
        >
          Portal View
        </button>
        <button
          onClick={() => setView('hubs')}
          className={`px-4 py-2 rounded-lg backdrop-blur-sm transition-all ${
            view === 'hubs' ? 'bg-cyan-600 text-white' : 'bg-white/10 text-white/60'
          }`}
        >
          Hub View
        </button>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full p-3 text-white"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  );
}

function useFrame(callback) {
  useEffect(() => {
    let frame;
    const animate = (state) => {
      callback(state);
      frame = requestAnimationFrame(() => animate(state));
    };
    animate({ clock: { elapsedTime: 0 } });
    return () => cancelAnimationFrame(frame);
  }, [callback]);
}