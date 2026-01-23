import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, Shield, Zap } from 'lucide-react';

function SystemNode({ system, position, index }) {
  const meshRef = useRef();
  const glowRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * (0.5 + index * 0.1);
    }
    if (glowRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 2 + index) * 0.2 + 1;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  const health = system.health || 0.9;
  const color = health > 0.8 ? '#00ff88' : health > 0.5 ? '#ffaa00' : '#ff4444';

  return (
    <group position={position}>
      <Sphere ref={glowRef} args={[0.5, 32, 32]}>
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </Sphere>

      <Box ref={meshRef} args={[0.4, 0.4, 0.4]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={health}
        />
      </Box>

      <Text position={[0, 0.6, 0]} fontSize={0.08} color="white" anchorX="center">
        {system.name}
      </Text>
      <Text position={[0, -0.5, 0]} fontSize={0.06} color={color} anchorX="center">
        {(health * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

function CentralCore({ position, overallHealth }) {
  const meshRef = useRef();
  const ringRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 2) * 0.2 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
    if (ringRef.current) {
      ringRef.current.rotation.y = clock.elapsedTime;
    }
  });

  return (
    <group position={position}>
      <mesh ref={ringRef}>
        <torusGeometry args={[1.5, 0.05, 16, 64]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.5} />
      </mesh>

      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={1.5}
          metalness={1}
          roughness={0}
        />
      </Sphere>

      <Text position={[0, 1.5, 0]} fontSize={0.3} color="#ffffff" anchorX="center">
        ECOSYSTEM
      </Text>
      <Text position={[0, -1.5, 0]} fontSize={0.2} color="#00ffff" anchorX="center">
        {(overallHealth * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

function EcosystemMonitorScene({ systems }) {
  const positions = useMemo(() => {
    return systems.map((_, idx) => {
      const angle = (idx / systems.length) * Math.PI * 2;
      const radius = 5;
      const height = Math.sin(idx * 0.5) * 2;
      return [Math.cos(angle) * radius, height, Math.sin(angle) * radius];
    });
  }, [systems]);

  const overallHealth = systems.length > 0
    ? systems.reduce((sum, s) => sum + s.health, 0) / systems.length
    : 0.95;

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 15, 0]} intensity={2} color="#00ffff" />
      <pointLight position={[10, 5, 10]} intensity={1.5} color="#ff00ff" />
      
      <Text position={[0, 6, 0]} fontSize={0.6} color="#ffffff" anchorX="center">
        ECOSYSTEM MONITOR
      </Text>

      <CentralCore position={[0, 0, 0]} overallHealth={overallHealth} />

      {systems.map((system, idx) => (
        <React.Fragment key={idx}>
          <SystemNode system={system} position={positions[idx]} index={idx} />
          <Line
            points={[[0, 0, 0], positions[idx]]}
            color="#00ffff"
            lineWidth={2}
            transparent
            opacity={0.4}
          />
        </React.Fragment>
      ))}

      <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

export default function EcosystemMonitor3D({ systems = [] }) {
  const overallHealth = systems.length > 0
    ? systems.reduce((sum, s) => sum + s.health, 0) / systems.length
    : 0.95;

  return (
    <Card className="bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border-cyan-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Activity className="w-8 h-8 text-cyan-400 animate-pulse" />
          Real-Time Ecosystem Monitor
          <Badge className="bg-cyan-500/30 text-cyan-300">
            {(overallHealth * 100).toFixed(0)}% HEALTH
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-black/40 p-3 rounded-lg border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-white/60 text-xs">Systems</span>
            </div>
            <div className="text-white text-lg font-bold">{systems.length}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-white/60 text-xs">Healthy</span>
            </div>
            <div className="text-white text-lg font-bold">
              {systems.filter(s => s.health > 0.8).length}
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-orange-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-orange-400" />
              <span className="text-white/60 text-xs">Threats</span>
            </div>
            <div className="text-white text-lg font-bold">
              {systems.filter(s => s.threats > 0).length}
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-purple-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-white/60 text-xs">Active</span>
            </div>
            <div className="text-white text-lg font-bold">
              {systems.filter(s => s.status === 'active').length}
            </div>
          </div>
        </div>

        <div className="h-[600px] bg-black/20 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [10, 6, 10], fov: 60 }}>
            <color attach="background" args={['#000510']} />
            <fog attach="fog" args={['#000510', 5, 40]} />
            <EcosystemMonitorScene systems={systems} />
          </Canvas>
        </div>
      </CardContent>
    </Card>
  );
}