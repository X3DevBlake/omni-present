import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere, Html } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function DeviceNode({ device, position, health }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const healthColor = health > 80 ? '#22c55e' : health > 50 ? '#eab308' : '#ef4444';

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial color={healthColor} emissive={healthColor} emissiveIntensity={0.5} />
      </Sphere>
      <Html distanceFactor={10}>
        <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {device.device_id}
          <div className="text-green-400">{health.toFixed(0)}%</div>
        </div>
      </Html>
    </group>
  );
}

function LinkLine({ start, end, health, bandwidth }) {
  const points = useMemo(() => [start, end], [start, end]);
  const color = health > 80 ? '#22c55e' : health > 50 ? '#eab308' : '#ef4444';
  const linewidth = (bandwidth / 100) * 3;

  return (
    <Line
      points={points}
      color={color}
      linewidth={linewidth}
      transparent
      opacity={0.6}
    />
  );
}

function AnimatedDataPacket({ start, end }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const t = (Math.sin(state.clock.elapsedTime * 2) + 1) / 2;
      meshRef.current.position.lerpVectors(
        { x: start[0], y: start[1], z: start[2] },
        { x: end[0], y: end[1], z: end[2] },
        t
      );
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.1, 16, 16]}>
      <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={2} />
    </Sphere>
  );
}

export default function RedCommNetworkTopology3D() {
  const { data: linkHealthData = [], isLoading } = useQuery({
    queryKey: ['redcomm-link-health'],
    queryFn: () => base44.entities.RedCommLinkHealth.list('-created_date', 20),
    refetchInterval: 5000
  });

  const { data: devices = [] } = useQuery({
    queryKey: ['redcomm-devices'],
    queryFn: () => base44.entities.RedCommDevice.list('-created_date', 20),
    refetchInterval: 5000
  });

  // Create 3D positions for devices
  const devicePositions = useMemo(() => {
    const positions = {};
    devices.forEach((device, idx) => {
      const angle = (idx / devices.length) * Math.PI * 2;
      const radius = 5;
      positions[device.device_id] = [
        Math.cos(angle) * radius,
        Math.sin(idx * 0.5) * 2,
        Math.sin(angle) * radius
      ];
    });
    return positions;
  }, [devices]);

  const avgHealth = linkHealthData.length > 0
    ? linkHealthData.reduce((sum, link) => sum + link.health_score, 0) / linkHealthData.length
    : 0;

  const criticalLinks = linkHealthData.filter(link => link.health_score < 50).length;
  const activeLinks = linkHealthData.filter(link => link.self_healing_status === 'stable').length;

  if (isLoading) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-8 text-center text-gray-400">
          Loading RedComm Network Topology...
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-indigo-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            RedComm Network Topology - Real-Time 3D
          </CardTitle>
          <div className="flex gap-4 mt-4">
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
              {devices.length} Devices
            </Badge>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
              {activeLinks} Active Links
            </Badge>
            <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
              Avg Health: {avgHealth.toFixed(1)}%
            </Badge>
            {criticalLinks > 0 && (
              <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/50">
                {criticalLinks} Critical
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] bg-black/30 rounded-lg overflow-hidden">
            <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
              <ambientLight intensity={0.3} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4f46e5" />

              {/* Render devices */}
              {devices.map((device) => (
                <DeviceNode
                  key={device.id}
                  device={device}
                  position={devicePositions[device.device_id] || [0, 0, 0]}
                  health={
                    linkHealthData.find(l => l.device_a_id === device.device_id)?.health_score || 100
                  }
                />
              ))}

              {/* Render links */}
              {linkHealthData.map((link) => {
                const startPos = devicePositions[link.device_a_id];
                const endPos = devicePositions[link.device_b_id];
                if (!startPos || !endPos) return null;

                return (
                  <React.Fragment key={link.id}>
                    <LinkLine
                      start={startPos}
                      end={endPos}
                      health={link.health_score}
                      bandwidth={link.bandwidth_utilization * 100}
                    />
                    {link.self_healing_status === 'stable' && (
                      <AnimatedDataPacket start={startPos} end={endPos} />
                    )}
                  </React.Fragment>
                );
              })}

              <OrbitControls enableDamping dampingFactor={0.05} />
            </Canvas>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            {linkHealthData.slice(0, 6).map((link) => (
              <div key={link.id} className="bg-gray-800/50 rounded-lg p-3">
                <div className="text-xs text-gray-400">{link.link_id}</div>
                <div className="flex items-center gap-2 mt-1">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: link.health_score > 80 ? '#22c55e' : link.health_score > 50 ? '#eab308' : '#ef4444' }}
                  />
                  <span className="text-sm text-white">{link.health_score.toFixed(0)}%</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {link.self_healing_status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}