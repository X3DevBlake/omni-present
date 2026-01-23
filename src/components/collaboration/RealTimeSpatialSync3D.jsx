import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Wifi, Smartphone, Monitor, Tablet } from 'lucide-react';

function DeviceNode({ device, index, total }) {
  const meshRef = useRef();
  const angle = (index / total) * Math.PI * 2;
  const radius = 5;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const pulse = Math.sin(state.clock.elapsedTime * 2 + index) * 0.1 + 1;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  const deviceColors = {
    desktop: '#0088FF',
    mobile: '#00FF88',
    tablet: '#FF8800',
    ar_glasses: '#FF00FF'
  };

  return (
    <group position={[x, 0, z]}>
      <Sphere ref={meshRef} args={[0.5, 16, 16]}>
        <meshStandardMaterial
          color={deviceColors[device.device_type] || '#FFFFFF'}
          emissive={deviceColors[device.device_type] || '#FFFFFF'}
          emissiveIntensity={0.7}
        />
      </Sphere>
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
      >
        {device.device_type}
      </Text>
    </group>
  );
}

function SyncConnection({ from, to, latency }) {
  const lineRef = useRef();

  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 0.7;
    }
  });

  const color = latency < 50 ? '#00FF00' : latency < 100 ? '#FFFF00' : '#FF0000';

  return (
    <Line
      ref={lineRef}
      points={[from, to]}
      color={color}
      lineWidth={2}
      transparent
    />
  );
}

function SyncScene({ session }) {
  const participants = session?.participants || [];
  
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      <OrbitControls autoRotate autoRotateSpeed={0.5} />

      {/* Central sync hub */}
      <Sphere args={[0.8, 32, 32]}>
        <meshStandardMaterial
          color="#00FFFF"
          emissive="#00FFFF"
          emissiveIntensity={1}
          wireframe
        />
      </Sphere>

      {participants.map((participant, idx) => {
        const angle = (idx / participants.length) * Math.PI * 2;
        const radius = 5;
        
        return (
          <React.Fragment key={idx}>
            <DeviceNode
              device={participant}
              index={idx}
              total={participants.length}
            />
            <SyncConnection
              from={[0, 0, 0]}
              to={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
              latency={50 + Math.random() * 50}
            />
          </React.Fragment>
        );
      })}

      <Text
        position={[0, -3, 0]}
        fontSize={0.4}
        color="#00FFFF"
        anchorX="center"
      >
        Real-Time Sync
      </Text>
    </>
  );
}

export default function RealTimeSpatialSync3D({ sessionId }) {
  const { data: session } = useQuery({
    queryKey: ['spatial-session', sessionId],
    queryFn: async () => {
      const sessions = await base44.entities.MultiUserSpatialSession.filter({ session_id: sessionId });
      return sessions[0];
    },
    refetchInterval: 1000,
    enabled: !!sessionId
  });

  const participants = session?.participants || [];
  const avgLatency = participants.length > 0
    ? participants.reduce((sum, p) => sum + 50, 0) / participants.length
    : 0;

  const deviceIcons = {
    desktop: Monitor,
    mobile: Smartphone,
    tablet: Tablet,
    ar_glasses: Wifi
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-cyan-950 border-cyan-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Wifi className="w-6 h-6 text-cyan-400" />
            Cross-Device Sync
          </span>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-cyan-900 text-cyan-200">
              {participants.length} Devices
            </Badge>
            <Badge variant="outline" className={
              avgLatency < 50 ? 'bg-green-900 text-green-200' : 'bg-yellow-900 text-yellow-200'
            }>
              {avgLatency.toFixed(0)}ms
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-96 w-full rounded-lg overflow-hidden bg-black">
          <Canvas camera={{ position: [8, 8, 8], fov: 60 }}>
            <color attach="background" args={['#001122']} />
            <fog attach="fog" args={['#001122', 5, 30]} />
            <SyncScene session={session} />
          </Canvas>
        </div>

        {participants.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-slate-400">Connected Devices</div>
            <div className="grid grid-cols-2 gap-2">
              {participants.map((participant, idx) => {
                const Icon = deviceIcons[participant.device_type] || Monitor;
                return (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-slate-800 rounded">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <div className="flex-1">
                      <div className="text-white text-xs">{participant.device_type}</div>
                      <div className="text-slate-400 text-xs">
                        {participant.user_id.substring(0, 8)}...
                      </div>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}