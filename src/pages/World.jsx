import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Float } from '@react-three/drei';
import { Globe, Cloud, Droplets, Wind, Sun, MapPin, Users, TrendingUp } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import LiveDataFeed from '../components/world/LiveDataFeed';
import { base44 } from '@/api/base44Client';

function WorldGlobe({ markers }) {
  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
      <group>
        <Sphere args={[2, 64, 64]}>
          <meshStandardMaterial
            color="#0ea5e9"
            emissive="#0ea5e9"
            emissiveIntensity={0.3}
            wireframe
            transparent
            opacity={0.8}
          />
        </Sphere>
        
        {markers.map((marker, i) => {
          const phi = (90 - marker.lat) * (Math.PI / 180);
          const theta = (marker.lng + 180) * (Math.PI / 180);
          const x = -(2.1 * Math.sin(phi) * Math.cos(theta));
          const z = 2.1 * Math.sin(phi) * Math.sin(theta);
          const y = 2.1 * Math.cos(phi);
          
          return (
            <mesh key={i} position={[x, y, z]}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshStandardMaterial
                color={marker.color}
                emissive={marker.color}
                emissiveIntensity={1}
              />
            </mesh>
          );
        })}
      </group>
    </Float>
  );
}

export default function World() {
  const [worldState, setWorldState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  
  const markers = [
    { lat: 40.7128, lng: -74.0060, color: '#00f5ff', label: 'New York' },
    { lat: 51.5074, lng: -0.1278, color: '#a855f7', label: 'London' },
    { lat: 35.6762, lng: 139.6503, color: '#ec4899', label: 'Tokyo' },
    { lat: -33.8688, lng: 151.2093, color: '#10b981', label: 'Sydney' },
    { lat: 48.8566, lng: 2.3522, color: '#f59e0b', label: 'Paris' },
  ];

  useEffect(() => {
    loadWorldData();
  }, []);

  const loadWorldData = async () => {
    try {
      const [agentData, worldData] = await Promise.all([
        base44.entities.Agent.list(),
        base44.entities.WorldState.list()
      ]);
      setAgents(agentData);
      if (worldData.length > 0) {
        setWorldState(worldData[0]);
      }
    } catch (error) {
      console.error('Failed to load world data', error);
    } finally {
      setLoading(false);
    }
  };

  const weatherData = [
    { city: 'New York', temp: 72, condition: 'Sunny', icon: Sun, color: 'text-yellow-400' },
    { city: 'London', temp: 58, condition: 'Cloudy', icon: Cloud, color: 'text-gray-400' },
    { city: 'Tokyo', temp: 68, condition: 'Rainy', icon: Droplets, color: 'text-blue-400' },
    { city: 'Sydney', temp: 75, condition: 'Windy', icon: Wind, color: 'text-cyan-400' },
  ];

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl border border-cyan-500/30">
              <Globe className="w-12 h-12 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            World <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Hub</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Real-time global intelligence network monitoring AI agents, environmental data, and world dynamics
          </p>
        </motion.div>

        <LiveDataFeed onDataUpdate={(data) => console.log('World data:', data)} />

        <div className="grid lg:grid-cols-2 gap-8 mt-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 h-[500px]"
          >
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6 text-cyan-400" />
              Global Network
            </h3>
            <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
              <ambientLight intensity={0.4} />
              <pointLight position={[10, 10, 10]} intensity={1} color="#00f5ff" />
              <WorldGlobe markers={markers} />
              <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
            <div className="mt-4 flex justify-center gap-4 flex-wrap">
              {markers.map((marker, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: marker.color }} />
                  <span className="text-white/70">{marker.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Weather Conditions</h3>
              <div className="space-y-3">
                {weatherData.map((weather, i) => {
                  const Icon = weather.icon;
                  return (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-6 h-6 ${weather.color}`} />
                        <div>
                          <div className="text-white font-medium">{weather.city}</div>
                          <div className="text-white/60 text-sm">{weather.condition}</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-white">{weather.temp}°F</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Active Agents
              </h3>
              <div className="text-3xl font-bold text-white mb-2">{agents.length}</div>
              <div className="flex items-center gap-2 text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">All systems operational</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">World State</h3>
              <p className="text-white/60 text-sm mb-4">
                The AI network is monitoring global conditions in real-time across {markers.length} major hubs
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 rounded-lg p-3">
                  <div className="text-cyan-400 text-sm mb-1">Data Points</div>
                  <div className="text-white text-2xl font-bold">2.5M</div>
                </div>
                <div className="bg-black/20 rounded-lg p-3">
                  <div className="text-purple-400 text-sm mb-1">Updates/sec</div>
                  <div className="text-white text-2xl font-bold">247</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AuroraBackground>
  );
}