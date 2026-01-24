import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Thermometer, Zap, Shield, AlertTriangle, Radio } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function PlanetaryBody({ planet, position, onClick }) {
  const [rotate, setRotate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotate(r => r + 0.01);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const scale = planet.celestial_body_name === 'Jupiter' ? 0.8 : 
                planet.celestial_body_name === 'Earth' ? 0.4 : 0.3;

  return (
    <group position={position} onClick={() => onClick(planet)}>
      <Sphere args={[scale, 32, 32]} rotation={[0, rotate, 0]}>
        <meshStandardMaterial 
          color={planet.celestial_body_name === 'Mars' ? '#cd5c5c' : '#4169e1'}
          emissive={planet.celestial_body_name === 'Mars' ? '#cd5c5c' : '#4169e1'}
          emissiveIntensity={0.3}
          metalness={0.4}
          roughness={0.7}
        />
      </Sphere>
      
      {planet.deployed_agent_count > 0 && (
        <Sphere args={[0.08, 16, 16]} position={[0, scale + 0.2, 0]}>
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1} />
        </Sphere>
      )}

      <Text position={[0, scale + 0.4, 0]} fontSize={0.15} color="white" maxWidth={2}>
        {planet.celestial_body_name}
      </Text>
      
      {planet.deployed_agent_count > 0 && (
        <Text position={[0, -scale - 0.3, 0]} fontSize={0.1} color="#22c55e">
          {planet.deployed_agent_count} agents
        </Text>
      )}
    </group>
  );
}

function AgentMarker({ position, mission }) {
  const [pulse, setPulse] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => p === 1 ? 1.4 : 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = mission.mission_status === 'active' ? '#22c55e' : 
                      mission.mission_status === 'emergency' ? '#ef4444' : '#f59e0b';

  return (
    <Sphere args={[0.06 * pulse, 16, 16]} position={position}>
      <meshStandardMaterial 
        color={statusColor}
        emissive={statusColor}
        emissiveIntensity={0.9}
      />
    </Sphere>
  );
}

export default function PlanetaryOperationsDashboard3D() {
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [selectedMission, setSelectedMission] = useState(null);
  const queryClient = useQueryClient();

  const { data: planets } = useQuery({
    queryKey: ['planetaryProfiles'],
    queryFn: () => base44.entities.PlanetaryEnvironmentalProfile.list(),
    initialData: []
  });

  const { data: missions } = useQuery({
    queryKey: ['agentMissions'],
    queryFn: () => base44.entities.AgentMissionLog.list('-created_date', 50),
    initialData: []
  });

  const adaptMutation = useMutation({
    mutationFn: ({ agent_id, planet }) => 
      base44.functions.invoke('adaptAgentToEnvironment', { agent_id, planet }),
    onSuccess: () => {
      queryClient.invalidateQueries(['agentMissions']);
    }
  });

  // Position planets in 3D space
  const planetPositions = planets.map((planet, idx) => {
    const angle = (idx / planets.length) * Math.PI * 2;
    const distance = 2 + (planet.orbital_parameters?.semi_major_axis_au || idx) * 1.5;
    return {
      planet,
      position: [Math.cos(angle) * distance, 0, Math.sin(angle) * distance]
    };
  });

  const activeMissions = missions.filter(m => m.mission_status === 'active');
  const emergencyMissions = missions.filter(m => m.mission_status === 'emergency');

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-cyan-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Globe className="w-6 h-6 text-cyan-400" />
          Planetary Operations Command
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] rounded-lg bg-black/60 mb-4">
          <Canvas camera={{ position: [10, 8, 10], fov: 60 }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[0, 0, 0]} intensity={2} color="#fbbf24" />
            <pointLight position={[15, 15, 15]} intensity={0.5} />
            
            {/* Central Sun */}
            <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1.5} />
            </Sphere>

            {/* Planetary Bodies */}
            {planetPositions.map(({ planet, position }) => (
              <PlanetaryBody
                key={planet.profile_id}
                planet={planet}
                position={position}
                onClick={setSelectedPlanet}
              />
            ))}

            {/* Agent Mission Markers */}
            {activeMissions.slice(0, 20).map((mission, idx) => {
              const planetPos = planetPositions.find(p => 
                p.planet.celestial_body_name === mission.celestial_body
              )?.position || [0, 0, 0];
              
              const offset = [
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5
              ];

              return (
                <AgentMarker
                  key={mission.log_id}
                  position={[
                    planetPos[0] + offset[0],
                    planetPos[1] + offset[1],
                    planetPos[2] + offset[2]
                  ]}
                  mission={mission}
                />
              );
            })}
            
            <OrbitControls enableDamping dampingFactor={0.05} autoRotate autoRotateSpeed={0.5} />
          </Canvas>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-gray-400">Worlds</span>
            </div>
            <div className="text-2xl font-bold text-white">{planets.length}</div>
          </div>

          <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Active</span>
            </div>
            <div className="text-2xl font-bold text-white">{activeMissions.length}</div>
          </div>

          <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-gray-400">Emergency</span>
            </div>
            <div className="text-2xl font-bold text-white">{emergencyMissions.length}</div>
          </div>

          <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Radio className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Total</span>
            </div>
            <div className="text-2xl font-bold text-white">{missions.length}</div>
          </div>
        </div>

        {selectedPlanet && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cyan-950/30 border border-cyan-500/30 rounded-lg p-4 mb-4"
          >
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              {selectedPlanet.celestial_body_name}
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-400 block mb-1">Surface Gravity:</span>
                <Badge className="bg-blue-600">
                  {selectedPlanet.physics_constants?.surface_gravity_ms2?.toFixed(2)} m/s²
                </Badge>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Radiation:</span>
                <Badge className="bg-red-600">
                  {selectedPlanet.physics_constants?.radiation_exposure_msv_year?.toFixed(1)} mSv/yr
                </Badge>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Deployed Agents:</span>
                <Badge className="bg-green-600">{selectedPlanet.deployed_agent_count || 0}</Badge>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Solar Efficiency:</span>
                <Badge className="bg-yellow-600">
                  {Math.round((selectedPlanet.resource_availability?.solar_power_efficiency || 0) * 100)}%
                </Badge>
              </div>
            </div>

            {selectedPlanet.communication_challenges?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-cyan-700">
                <span className="text-gray-400 text-xs block mb-2">Communication Challenges:</span>
                <div className="space-y-1">
                  {selectedPlanet.communication_challenges.slice(0, 3).map((ch, idx) => (
                    <div key={idx} className="text-xs flex justify-between">
                      <span className="text-white">{ch.challenge_type}</span>
                      <Badge className="bg-orange-600 text-xs">
                        {Math.round(ch.severity * 100)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeMissions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-400" />
              Active Missions
            </h4>
            {activeMissions.slice(0, 5).map(mission => (
              <motion.div
                key={mission.log_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-900/50 border border-gray-700 rounded-lg p-3"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-white text-sm font-bold">{mission.mission_type}</div>
                    <div className="text-gray-400 text-xs">{mission.celestial_body}</div>
                  </div>
                  <Badge className={
                    mission.mission_status === 'active' ? 'bg-green-600' :
                    mission.mission_status === 'emergency' ? 'bg-red-600' : 'bg-yellow-600'
                  }>
                    {mission.mission_status}
                  </Badge>
                </div>

                {mission.sensor_readings && (
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <Thermometer className="w-3 h-3 text-orange-400 inline mr-1" />
                      <span className="text-gray-300">
                        {mission.sensor_readings.temperature_k}K
                      </span>
                    </div>
                    <div>
                      <Zap className="w-3 h-3 text-yellow-400 inline mr-1" />
                      <span className="text-gray-300">
                        {mission.sensor_readings.radiation_msv_h?.toFixed(2)} mSv/h
                      </span>
                    </div>
                    <div>
                      <Radio className="w-3 h-3 text-purple-400 inline mr-1" />
                      <span className="text-gray-300">
                        {mission.communication_link_status?.latency_to_earth_ms}ms
                      </span>
                    </div>
                  </div>
                )}

                {mission.adaptive_behaviors_active?.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <div className="text-xs text-gray-400 mb-1">Adaptive Behaviors:</div>
                    <div className="flex flex-wrap gap-1">
                      {mission.adaptive_behaviors_active.slice(0, 3).map((behavior, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px]">
                          {behavior.behavior_name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}