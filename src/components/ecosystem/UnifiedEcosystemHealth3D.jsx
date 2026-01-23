import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Torus, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Cpu, Network, Shield, TrendingUp } from 'lucide-react';
import * as THREE from 'three';

function SystemOrb({ system, position, color, value }) {
  const meshRef = useRef();
  const ringRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 2) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = clock.elapsedTime * 0.5;
      ringRef.current.rotation.y = clock.elapsedTime * 0.7;
    }
  });

  return (
    <group position={position}>
      <Torus ref={ringRef} args={[0.7, 0.03, 16, 64]}>
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </Torus>
      
      <Sphere ref={meshRef} args={[0.5, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={value}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>

      <Text
        position={[0, 1, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
      >
        {system.toUpperCase()}
      </Text>
      <Text
        position={[0, -1, 0]}
        fontSize={0.12}
        color={color}
        anchorX="center"
      >
        {(value * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

function DataFlow({ from, to, flowRate }) {
  const particlesRef = useRef();
  const particleCount = Math.floor(flowRate * 30);

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position;
      
      for (let i = 0; i < positions.count; i++) {
        const t = ((clock.elapsedTime * flowRate + i * 0.1) % 1);
        const x = THREE.MathUtils.lerp(from[0], to[0], t);
        const y = THREE.MathUtils.lerp(from[1], to[1], t);
        const z = THREE.MathUtils.lerp(from[2], to[2], t);
        
        positions.setXYZ(i, x, y, z);
      }
      positions.needsUpdate = true;
    }
  });

  const particlePositions = useMemo(() => {
    return new Float32Array(particleCount * 3);
  }, [particleCount]);

  return (
    <>
      <Line
        points={[from, to]}
        color="#00ffff"
        lineWidth={1}
        transparent
        opacity={0.3}
      />
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#00ffff" transparent opacity={0.8} />
      </points>
    </>
  );
}

function EcosystemScene({ metrics }) {
  const systems = [
    { name: 'Agents', value: (metrics?.agent_metrics?.avg_performance || 0.85), color: '#00ffff', position: [-4, 2, 0] },
    { name: 'Neural', value: (metrics?.neural_infrastructure?.avg_sync_level || 0.90), color: '#ff00ff', position: [0, 3, -4] },
    { name: 'Augmentation', value: (metrics?.augmentation_status?.augmentation_efficiency || 0.88), color: '#00ff88', position: [4, 2, 0] },
    { name: 'Holographic', value: (metrics?.holographic_network?.avg_projection_quality || 0.92), color: '#0088ff', position: [0, -2, 4] },
    { name: 'Financial', value: Math.min(1, (metrics?.financial_intelligence?.avg_strategy_performance || 0.75)), color: '#ffaa00', position: [-3, -2, -3] },
    { name: 'Security', value: (metrics?.security_posture?.security_score || 0.95) / 100, color: '#ff0000', position: [3, -2, -3] }
  ];

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 15, 0]} intensity={2} color="#ffffff" />
      <pointLight position={[10, 0, 10]} intensity={1} color="#00ffff" />
      <pointLight position={[-10, 0, -10]} intensity={1} color="#ff00ff" />
      
      <Text
        position={[0, 6, 0]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
      >
        UNIFIED ECOSYSTEM HEALTH
      </Text>

      {/* Central Core */}
      <group position={[0, 0, 0]}>
        <Sphere args={[1, 64, 64]}>
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={metrics?.system_performance?.overall_health_score || 0.9}
            metalness={1}
            roughness={0}
          />
        </Sphere>
      </group>

      {/* System Orbs */}
      {systems.map((sys, idx) => (
        <SystemOrb
          key={sys.name}
          system={sys.name}
          position={sys.position}
          color={sys.color}
          value={sys.value}
        />
      ))}

      {/* Data Flows */}
      {systems.map((sys, idx) => (
        <DataFlow
          key={`flow-${idx}`}
          from={sys.position}
          to={[0, 0, 0]}
          flowRate={sys.value}
        />
      ))}

      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        autoRotate
        autoRotateSpeed={0.6}
      />
    </>
  );
}

export default function UnifiedEcosystemHealth3D({ metrics }) {
  const overallHealth = metrics?.system_performance?.overall_health_score || 0.9;
  const activeAgents = metrics?.agent_metrics?.active_agents || 0;
  const uptime = metrics?.system_performance?.uptime_percent || 99.9;

  return (
    <Card className="bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 border-blue-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Globe className="w-8 h-8 text-blue-400 animate-pulse" />
          Unified Ecosystem Health Monitor
          <Badge className="bg-blue-500/30 text-blue-300">
            HEALTH: {(overallHealth * 100).toFixed(1)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2 mb-4">
          <div className="bg-black/40 p-2 rounded-lg border border-blue-500/30">
            <div className="flex items-center gap-1 mb-1">
              <Cpu className="w-3 h-3 text-blue-400" />
              <span className="text-white/60 text-xs">Agents</span>
            </div>
            <div className="text-white text-sm font-bold">{activeAgents}</div>
          </div>
          <div className="bg-black/40 p-2 rounded-lg border border-purple-500/30">
            <div className="flex items-center gap-1 mb-1">
              <Network className="w-3 h-3 text-purple-400" />
              <span className="text-white/60 text-xs">Uptime</span>
            </div>
            <div className="text-white text-sm font-bold">{uptime.toFixed(1)}%</div>
          </div>
          <div className="bg-black/40 p-2 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-1 mb-1">
              <Shield className="w-3 h-3 text-green-400" />
              <span className="text-white/60 text-xs">Security</span>
            </div>
            <div className="text-white text-sm font-bold">
              {(metrics?.security_posture?.security_score || 95).toFixed(0)}
            </div>
          </div>
          <div className="bg-black/40 p-2 rounded-lg border border-orange-500/30">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="w-3 h-3 text-orange-400" />
              <span className="text-white/60 text-xs">Learning</span>
            </div>
            <div className="text-white text-sm font-bold">
              {metrics?.learning_ecosystem?.active_guilds || 0}
            </div>
          </div>
          <div className="bg-black/40 p-2 rounded-lg border border-pink-500/30">
            <div className="flex items-center gap-1 mb-1">
              <Globe className="w-3 h-3 text-pink-400" />
              <span className="text-white/60 text-xs">Response</span>
            </div>
            <div className="text-white text-sm font-bold">
              {metrics?.system_performance?.response_time_ms || 12}ms
            </div>
          </div>
        </div>

        <div className="h-[600px] bg-black/20 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [12, 8, 12], fov: 60 }}>
            <color attach="background" args={['#000a1a']} />
            <fog attach="fog" args={['#000a1a', 10, 45]} />
            <EcosystemScene metrics={metrics || {}} />
          </Canvas>
        </div>

        <div className="mt-4 text-xs text-white/60">
          <div className="flex justify-between mb-1">
            <span>System Performance:</span>
            <span className="text-green-400">{(overallHealth * 100).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Predictive Trend:</span>
            <span className="text-cyan-400">{metrics?.predictive_forecast?.health_trend || 'Stable'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}