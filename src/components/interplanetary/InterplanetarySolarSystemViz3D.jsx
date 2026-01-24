import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Orbit, Radio, Zap, TrendingUp, Navigation } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function CelestialBody({ body, orbitRadius, orbitSpeed, onClick }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime * orbitSpeed;
      meshRef.current.position.x = Math.cos(time) * orbitRadius;
      meshRef.current.position.z = Math.sin(time) * orbitRadius;
      meshRef.current.rotation.y += 0.01;
    }
  });

  const radius = body.radius || 0.3;
  const color = body.color || '#4169e1';

  return (
    <mesh ref={meshRef} onClick={() => onClick(body)}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial 
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        metalness={0.5}
        roughness={0.4}
      />
    </mesh>
  );
}

function CommunicationBeam({ from, to, link, animate }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!animate) return;
    const interval = setInterval(() => {
      setProgress(p => (p + 0.02) % 1);
    }, 50);
    return () => clearInterval(interval);
  }, [animate]);

  const particlePos = [
    from[0] + (to[0] - from[0]) * progress,
    from[1] + (to[1] - from[1]) * progress,
    from[2] + (to[2] - from[2]) * progress
  ];

  const color = link.link_type === 'quantum_entangled' ? '#a855f7' :
                link.link_type === 'thz_beam' ? '#06b6d4' :
                link.link_type === 'optical_laser' ? '#22c55e' : '#3b82f6';

  return (
    <>
      <Line
        points={[from, to]}
        color={color}
        lineWidth={link.ai_routing_priority * 2 || 1}
        opacity={0.3 + (link.link_health || 0.5) * 0.4}
      />
      {animate && (
        <Sphere args={[0.08, 16, 16]} position={particlePos}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
        </Sphere>
      )}
    </>
  );
}

export default function InterplanetarySolarSystemViz3D() {
  const [selectedLink, setSelectedLink] = useState(null);
  const [routingActive, setRoutingActive] = useState(false);
  const queryClient = useQueryClient();

  const { data: links } = useQuery({
    queryKey: ['interplanetaryLinks'],
    queryFn: () => base44.entities.InterplanetaryLink.list(),
    initialData: []
  });

  const routingMutation = useMutation({
    mutationFn: ({ source, destination }) => 
      base44.functions.invoke('dynamicInterplanetaryRouting', { 
        source_body: source, 
        destination_body: destination,
        priority: 'high'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['interplanetaryLinks']);
      setRoutingActive(true);
      setTimeout(() => setRoutingActive(false), 5000);
    }
  });

  const celestialBodies = [
    { name: 'Mercury', orbitRadius: 2, orbitSpeed: 0.8, radius: 0.2, color: '#b0b0b0' },
    { name: 'Venus', orbitRadius: 3, orbitSpeed: 0.6, radius: 0.28, color: '#ffa500' },
    { name: 'Earth', orbitRadius: 4, orbitSpeed: 0.5, radius: 0.3, color: '#4169e1' },
    { name: 'Mars', orbitRadius: 5, orbitSpeed: 0.4, radius: 0.25, color: '#cd5c5c' },
    { name: 'Jupiter', orbitRadius: 7, orbitSpeed: 0.2, radius: 0.7, color: '#daa520' },
    { name: 'Saturn', orbitRadius: 9, orbitSpeed: 0.15, radius: 0.6, color: '#f4a460' }
  ];

  const triggerRouting = () => {
    routingMutation.mutate({ source: 'Earth', destination: 'Mars' });
  };

  const activeLinks = links.filter(l => l.active);
  const avgLatency = activeLinks.reduce((sum, l) => sum + (l.current_latency_ms || 0), 0) / (activeLinks.length || 1);

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-blue-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Orbit className="w-6 h-6 text-blue-400" />
          InterPlanetary DTN Fabric
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] rounded-lg bg-black/60 mb-4">
          <Canvas camera={{ position: [0, 15, 15], fov: 60 }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[0, 0, 0]} intensity={3} color="#fbbf24" />
            
            {/* Sun */}
            <Sphere args={[0.8, 32, 32]} position={[0, 0, 0]}>
              <meshStandardMaterial 
                color="#fbbf24"
                emissive="#fbbf24"
                emissiveIntensity={2}
              />
            </Sphere>

            {/* Orbit Rings */}
            {celestialBodies.map((body, idx) => (
              <mesh key={`orbit_${idx}`} rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[body.orbitRadius - 0.02, body.orbitRadius + 0.02, 64]} />
                <meshBasicMaterial color="#333333" transparent opacity={0.2} />
              </mesh>
            ))}

            {/* Planets */}
            {celestialBodies.map((body, idx) => (
              <CelestialBody
                key={idx}
                body={body}
                orbitRadius={body.orbitRadius}
                orbitSpeed={body.orbitSpeed}
                onClick={() => {}}
              />
            ))}

            {/* Communication Links */}
            {links.slice(0, 12).map((link, idx) => {
              const sourceBody = celestialBodies.find(b => b.name === link.source_body);
              const destBody = celestialBodies.find(b => b.name === link.destination_body);
              
              if (!sourceBody || !destBody) return null;

              return (
                <CommunicationBeam
                  key={link.link_id}
                  from={[sourceBody.orbitRadius, 0, 0]}
                  to={[destBody.orbitRadius, 0, 0]}
                  link={link}
                  animate={routingActive && link.ai_routing_priority > 0.7}
                />
              );
            })}
            
            <OrbitControls enableDamping dampingFactor={0.05} />
          </Canvas>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Radio className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Links</span>
            </div>
            <div className="text-2xl font-bold text-white">{activeLinks.length}</div>
          </div>

          <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Avg Latency</span>
            </div>
            <div className="text-xl font-bold text-white">{Math.round(avgLatency)}ms</div>
          </div>

          <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Bandwidth</span>
            </div>
            <div className="text-xl font-bold text-white">
              {activeLinks.reduce((sum, l) => sum + (l.bandwidth_gbps || 0), 0).toFixed(0)} Gbps
            </div>
          </div>

          <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-gray-400">Health</span>
            </div>
            <div className="text-xl font-bold text-white">
              {Math.round((activeLinks.reduce((sum, l) => sum + (l.link_health || 0), 0) / (activeLinks.length || 1)) * 100)}%
            </div>
          </div>
        </div>

        <Button
          onClick={triggerRouting}
          disabled={routingMutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Navigation className="w-4 h-4 mr-2" />
          {routingMutation.isPending ? 'Calculating Route...' : 'AI Dynamic Routing'}
        </Button>
      </CardContent>
    </Card>
  );
}