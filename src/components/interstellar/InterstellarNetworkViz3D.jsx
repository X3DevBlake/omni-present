import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Orbit, Sparkles, Zap, Radio, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function StarSystem({ name, position, active }) {
  const [pulse, setPulse] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => p === 1 ? 1.2 : 1);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <group position={position}>
      <Sphere args={[0.4 * pulse, 32, 32]}>
        <meshStandardMaterial 
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={1.2}
        />
      </Sphere>
      <Text position={[0, 0.8, 0]} fontSize={0.15} color="white">
        {name}
      </Text>
    </group>
  );
}

function FTLLink({ from, to, link, animate }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!animate) return;
    const speed = link.ftl_enabled ? 0.05 : 0.01;
    const interval = setInterval(() => {
      setProgress(p => (p + speed) % 1);
    }, 50);
    return () => clearInterval(interval);
  }, [animate, link]);

  const particlePos = [
    from[0] + (to[0] - from[0]) * progress,
    from[1] + (to[1] - from[1]) * progress,
    from[2] + (to[2] - from[2]) * progress
  ];

  const color = link.link_type === 'wormhole_simulated' ? '#a855f7' :
                link.link_type === 'alcubierre_bridge' ? '#06b6d4' :
                link.link_type === 'quantum_ansible' ? '#fbbf24' : '#3b82f6';

  return (
    <>
      <Line
        points={[from, to]}
        color={color}
        lineWidth={link.ftl_enabled ? 3 : 1}
        opacity={link.ftl_enabled ? 0.8 : 0.4}
        dashed={!link.ftl_enabled}
      />
      {animate && link.ftl_enabled && (
        <Sphere args={[0.12, 16, 16]} position={particlePos}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
        </Sphere>
      )}
    </>
  );
}

export default function InterstellarNetworkViz3D() {
  const [selectedLink, setSelectedLink] = useState(null);
  const [transmitting, setTransmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: links } = useQuery({
    queryKey: ['interstellarLinks'],
    queryFn: () => base44.entities.InterstellarLink.list(),
    initialData: []
  });

  const simulateMutation = useMutation({
    mutationFn: ({ source, destination, type }) =>
      base44.functions.invoke('ftlCommunicationSimulator', {
        source_system: source,
        destination_system: destination,
        link_type: type
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['interstellarLinks']);
      setTransmitting(true);
      setTimeout(() => setTransmitting(false), 5000);
    }
  });

  const starSystems = [
    { name: 'Sol', position: [0, 0, 0] },
    { name: 'Alpha Centauri', position: [8, 1, 0] },
    { name: 'Sirius', position: [0, -1, 10] },
    { name: 'Procyon', position: [-8, 2, 5] },
    { name: 'Vega', position: [6, -2, -8] }
  ];

  const ftlLinks = links.filter(l => l.ftl_enabled);
  const avgLatency = links.reduce((sum, l) => sum + (l.effective_latency_ms || 0), 0) / (links.length || 1);

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Orbit className="w-6 h-6 text-purple-400" />
          Interstellar Communication Network
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] rounded-lg bg-black/60 mb-4">
          <Canvas camera={{ position: [12, 10, 12], fov: 60 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[0, 0, 0]} intensity={2} color="#fbbf24" />
            
            {/* Star Systems */}
            {starSystems.map((system, idx) => (
              <StarSystem key={idx} name={system.name} position={system.position} active={true} />
            ))}

            {/* Communication Links */}
            {links.map((link, idx) => {
              const sourcePos = starSystems.find(s => s.name === link.source_system)?.position || [0, 0, 0];
              const destPos = starSystems.find(s => s.name === link.destination_system)?.position || [0, 0, 0];
              
              return (
                <FTLLink
                  key={link.link_id}
                  from={sourcePos}
                  to={destPos}
                  link={link}
                  animate={transmitting}
                />
              );
            })}
            
            <OrbitControls enableDamping dampingFactor={0.05} />
          </Canvas>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">FTL Links</span>
            </div>
            <div className="text-2xl font-bold text-white">{ftlLinks.length}</div>
          </div>

          <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Radio className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Total</span>
            </div>
            <div className="text-2xl font-bold text-white">{links.length}</div>
          </div>

          <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-gray-400">Latency</span>
            </div>
            <div className="text-lg font-bold text-white">
              {avgLatency < 1000 ? `${avgLatency.toFixed(1)}ms` : `${(avgLatency/1000).toFixed(1)}s`}
            </div>
          </div>

          <div className="bg-yellow-950/30 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-400">Challenges</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {links.reduce((sum, l) => sum + (l.ai_predicted_challenges?.length || 0), 0)}
            </div>
          </div>
        </div>

        <Button
          onClick={() => simulateMutation.mutate({ 
            source: 'Sol', 
            destination: 'Alpha Centauri',
            type: 'wormhole_simulated'
          })}
          disabled={simulateMutation.isPending}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {simulateMutation.isPending ? 'Simulating...' : 'Simulate Wormhole Link'}
        </Button>
      </CardContent>
    </Card>
  );
}