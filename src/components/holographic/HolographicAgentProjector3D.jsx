import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box, Cone } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Radio, Maximize2, Minimize2, Settings } from 'lucide-react';
import * as THREE from 'three';

function HolographicAgent({ appearance, position, isActive }) {
  const groupRef = useRef();
  const glitchRef = useRef(0);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Gentle float animation
      groupRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.8) * 0.1;
      
      // Rotation
      groupRef.current.rotation.y = clock.elapsedTime * 0.3;
      
      // Hologram glitch effect
      if (Math.random() < 0.01) {
        glitchRef.current = 0.3;
      }
      glitchRef.current *= 0.9;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Main holographic body */}
      <Sphere args={[0.5, 32, 32]}>
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={isActive ? 0.8 : 0.3}
          transparent
          opacity={0.7 - glitchRef.current}
          wireframe={glitchRef.current > 0.1}
        />
      </Sphere>

      {/* Head */}
      <Sphere args={[0.3, 32, 32]} position={[0, 1, 0]}>
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={0.6}
          transparent
          opacity={0.6}
        />
      </Sphere>

      {/* Eyes */}
      <Sphere args={[0.08, 16, 16]} position={[-0.12, 1.05, 0.2]}>
        <meshBasicMaterial color="#ffffff" />
      </Sphere>
      <Sphere args={[0.08, 16, 16]} position={[0.12, 1.05, 0.2]}>
        <meshBasicMaterial color="#ffffff" />
      </Sphere>

      {/* Energy aura */}
      <Sphere args={[0.8, 32, 32]}>
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.1}
        />
      </Sphere>

      {/* Agent label */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.2}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
      >
        {appearance?.animation_state || 'AGENT'}
      </Text>
    </group>
  );
}

function ProjectionDevice({ device, position }) {
  const deviceRef = useRef();
  const beamRef = useRef();

  useFrame(({ clock }) => {
    if (beamRef.current) {
      beamRef.current.material.opacity = 0.2 + Math.sin(clock.elapsedTime * 3) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Device base */}
      <Box args={[0.4, 0.2, 0.4]} ref={deviceRef}>
        <meshStandardMaterial
          color={device.active ? "#00ff00" : "#666666"}
          emissive={device.active ? "#00ff00" : "#000000"}
          emissiveIntensity={0.5}
        />
      </Box>

      {/* Projection beam */}
      {device.active && (
        <Cone ref={beamRef} args={[0.8, 3, 32, 1, true]} position={[0, 1.5, 0]}>
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </Cone>
      )}

      <Text
        position={[0, -0.3, 0]}
        fontSize={0.1}
        color="#aaaaaa"
        anchorX="center"
      >
        {device.device_type}
      </Text>
    </group>
  );
}

function HolographicProjectionScene({ session }) {
  const devices = session?.device_network || [];
  const agentPosition = [
    session?.spatial_position?.x || 0,
    session?.spatial_position?.y || 1.5,
    session?.spatial_position?.z || 0
  ];

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
      <pointLight position={[-10, 5, -10]} intensity={0.8} color="#ff00ff" />
      
      <Text
        position={[0, 4, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
      >
        HOLOGRAPHIC PROJECTION ACTIVE
      </Text>

      {/* Holographic Agent */}
      <HolographicAgent
        appearance={session?.agent_appearance}
        position={agentPosition}
        isActive={session?.session_status === 'active'}
      />

      {/* Projection Devices */}
      {devices.map((device, idx) => {
        const angle = (idx / devices.length) * Math.PI * 2;
        const radius = 5;
        return (
          <ProjectionDevice
            key={device.device_id || idx}
            device={device}
            position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
          />
        );
      })}

      {/* Floor grid */}
      <gridHelper args={[20, 20, '#00ffff', '#003333']} position={[0, 0, 0]} />

      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        autoRotate
        autoRotateSpeed={0.8}
      />
    </>
  );
}

export default function HolographicAgentProjector3D({ session }) {
  const [expanded, setExpanded] = useState(false);
  const activeDevices = (session?.device_network || []).filter(d => d.active).length;
  const qualityScore = session?.performance_metrics?.quality_score || 0;

  return (
    <Card className="bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 border-cyan-500/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-3 text-2xl">
            <Radio className="w-8 h-8 text-cyan-400 animate-pulse" />
            Holographic Agent Projection
            <Badge className="bg-cyan-500/30 text-cyan-300">
              QUALITY: {(qualityScore * 100).toFixed(0)}%
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
            className="text-white hover:bg-white/10"
          >
            {expanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-black/40 p-3 rounded-lg border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span className="text-white/60 text-xs">Devices</span>
            </div>
            <div className="text-white text-lg font-bold">{activeDevices}/{(session?.device_network || []).length}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-blue-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-white/60 text-xs">FPS</span>
            </div>
            <div className="text-white text-lg font-bold">{session?.performance_metrics?.frame_rate || 60}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-purple-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-white/60 text-xs">Latency</span>
            </div>
            <div className="text-white text-lg font-bold">{session?.performance_metrics?.latency_ms || 0}ms</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-pink-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Settings className="w-4 h-4 text-pink-400" />
              <span className="text-white/60 text-xs">Status</span>
            </div>
            <div className="text-white text-sm font-bold">{session?.session_status || 'INIT'}</div>
          </div>
        </div>

        <div className={`bg-black/20 rounded-lg overflow-hidden ${expanded ? 'h-[800px]' : 'h-[500px]'}`}>
          <Canvas camera={{ position: [8, 5, 8], fov: 60 }}>
            <color attach="background" args={['#000511']} />
            <fog attach="fog" args={['#000511', 5, 40]} />
            <HolographicProjectionScene session={session || {}} />
          </Canvas>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button className="bg-cyan-600 hover:bg-cyan-700">
            <Radio className="w-4 h-4 mr-2" />
            Adjust Projection
          </Button>
          <Button variant="outline" className="border-cyan-500 text-cyan-400">
            Device Settings
          </Button>
          <Button variant="outline" className="border-purple-500 text-purple-400">
            Agent Appearance
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}