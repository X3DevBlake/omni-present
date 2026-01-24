import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rocket, Zap, Radio, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function StarSystem({ system, position, onClick }) {
  const [glow, setGlow] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlow(g => g === 1 ? 1.5 : 1);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <group position={position} onClick={() => onClick(system)}>
      <Sphere args={[0.4, 32, 32]}>
        <meshStandardMaterial 
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={glow}
          metalness={0.8}
        />
      </Sphere>
      <Text position={[0, 0.7, 0]} fontSize={0.12} color="white">
        {system.source_system || system.destination_system}
      </Text>
    </group>
  );
}

function FTLLink({ from, to, link }) {
  const [particlePos, setParticlePos] = useState(0);

  useEffect(() => {
    if (!link.ftl_capability) return;
    const interval = setInterval(() => {
      setParticlePos(p => (p + 0.05) % 1);
    }, 30);
    return () => clearInterval(interval);
  }, [link.ftl_capability]);

  const position = [
    from[0] + (to[0] - from[0]) * particlePos,
    from[1] + (to[1] - from[1]) * particlePos,
    from[2] + (to[2] - from[2]) * particlePos
  ];

  const color = link.link_technology === 'wormhole_simulation' ? '#a855f7' :
                link.link_technology === 'alcubierre_channel' ? '#ec4899' :
                link.link_technology === 'quantum_relay_chain' ? '#06b6d4' : '#3b82f6';

  return (
    <>
      <Line
        points={[from, to]}
        color={color}
        lineWidth={link.ftl_capability ? 3 : 1.5}
        opacity={0.4}
        dashed={!link.ftl_capability}
      />
      {link.ftl_capability && (
        <Sphere args={[0.12, 16, 16]} position={position}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
        </Sphere>
      )}
    </>
  );
}

export default function InterstellarNetworkTopology3D() {
  const [selectedLink, setSelectedLink] = useState(null);
  const queryClient = useQueryClient();

  const { data: links } = useQuery({
    queryKey: ['interstellarLinks'],
    queryFn: () => base44.entities.InterstellarLink.list(),
    initialData: []
  });

  const predictMutation = useMutation({
    mutationFn: () => 
      base44.functions.invoke('predictInterstellarChallenges', {
        source_system: 'Sol (Earth)',
        destination_system: 'Proxima Centauri',
        distance_ly: 4.24
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['interstellarLinks']);
    }
  });

  const systems = [...new Set(links.flatMap(l => [l.source_system, l.destination_system]))];
  
  const systemPositions = systems.map((sys, idx) => {
    const angle = (idx / systems.length) * Math.PI * 2;
    const radius = 6;
    return {
      system: { source_system: sys },
      position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius]
    };
  });

  const ftlLinks = links.filter(l => l.ftl_capability);
  const conventionalLinks = links.filter(l => !l.ftl_capability);

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Rocket className="w-6 h-6 text-purple-400" />
          Interstellar Network Topology
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] rounded-lg bg-black/60 mb-4">
          <Canvas camera={{ position: [0, 10, 12], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[0, 10, 10]} intensity={2} />
            
            {/* Star Systems */}
            {systemPositions.map(({ system, position }, idx) => (
              <StarSystem
                key={idx}
                system={system}
                position={position}
                onClick={() => {}}
              />
            ))}

            {/* Interstellar Links */}
            {links.map((link, idx) => {
              const fromPos = systemPositions.find(s => 
                s.system.source_system === link.source_system
              )?.position;
              const toPos = systemPositions.find(s => 
                s.system.source_system === link.destination_system
              )?.position;
              
              if (fromPos && toPos) {
                return (
                  <FTLLink
                    key={link.link_id}
                    from={fromPos}
                    to={toPos}
                    link={link}
                  />
                );
              }
              return null;
            })}
            
            <OrbitControls enableDamping dampingFactor={0.05} />
          </Canvas>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">FTL Links</span>
            </div>
            <div className="text-2xl font-bold text-white">{ftlLinks.length}</div>
          </div>

          <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Radio className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Conv.</span>
            </div>
            <div className="text-2xl font-bold text-white">{conventionalLinks.length}</div>
          </div>

          <div className="bg-yellow-950/30 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-400">Systems</span>
            </div>
            <div className="text-2xl font-bold text-white">{systems.length}</div>
          </div>

          <div className="bg-pink-950/30 border border-pink-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Rocket className="w-4 h-4 text-pink-400" />
              <span className="text-xs text-gray-400">Avg Dist</span>
            </div>
            <div className="text-xl font-bold text-white">
              {links.length > 0 ? (links.reduce((sum, l) => sum + l.distance_light_years, 0) / links.length).toFixed(1) : 0} ly
            </div>
          </div>
        </div>

        <Button
          onClick={() => predictMutation.mutate()}
          disabled={predictMutation.isPending}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          <Rocket className="w-4 h-4 mr-2" />
          {predictMutation.isPending ? 'Analyzing...' : 'AI Predict Interstellar Challenges'}
        </Button>

        {links.length > 0 && (
          <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
            {links.slice(0, 5).map(link => (
              <motion.div
                key={link.link_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-900/50 border border-gray-700 rounded-lg p-3"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-white text-xs font-bold">
                      {link.source_system} → {link.destination_system}
                    </div>
                    <div className="text-gray-400 text-xs">{link.distance_light_years} light-years</div>
                  </div>
                  <Badge className={link.ftl_capability ? 'bg-purple-600' : 'bg-blue-600'}>
                    {link.link_technology.replace(/_/g, ' ')}
                  </Badge>
                </div>
                {link.ftl_capability && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Wormhole Stability:</span>
                    <Badge variant="outline">
                      {Math.round((link.wormhole_stability || 0) * 100)}%
                    </Badge>
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