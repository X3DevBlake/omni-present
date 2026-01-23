import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Code, Key, Activity, CheckCircle, XCircle } from 'lucide-react';

function APIEndpoint({ endpoint, position, index, stats }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * (0.5 + index * 0.1);
      const pulse = Math.sin(clock.elapsedTime * 2 + index) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const isActive = stats?.success_rate > 0.9;
  const color = isActive ? '#00ff88' : '#ffaa00';

  return (
    <group position={position}>
      <Box ref={meshRef} args={[0.4, 0.4, 0.4]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 0.8 : 0.4}
        />
      </Box>
      <Text position={[0, 0.5, 0]} fontSize={0.1} color="white" anchorX="center">
        {endpoint.slice(0, 12)}
      </Text>
    </group>
  );
}

function APIKeyNode({ apiKey, position }) {
  const meshRef = useRef();
  const glowRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current && glowRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime;
      const pulse = Math.sin(clock.elapsedTime * 2) * 0.2 + 1;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={position}>
      <Sphere ref={glowRef} args={[0.8, 32, 32]}>
        <meshBasicMaterial color="#00ffff" transparent opacity={0.2} />
      </Sphere>
      <Sphere ref={meshRef} args={[0.5, 32, 32]}>
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={1}
          metalness={1}
          roughness={0}
        />
      </Sphere>
      <Text position={[0, 0, 0]} fontSize={0.15} color="#000000" anchorX="center">
        API KEY
      </Text>
    </group>
  );
}

function APIConsoleScene({ apiKeys, endpoints }) {
  const endpointPositions = endpoints.map((_, idx) => {
    const angle = (idx / endpoints.length) * Math.PI * 2;
    const radius = 4;
    return [Math.cos(angle) * radius, Math.sin(idx * 0.5) * 2, Math.sin(angle) * radius];
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00ffff" />
      <pointLight position={[-10, -5, -10]} intensity={1} color="#ff00ff" />
      
      <Text position={[0, 5, 0]} fontSize={0.5} color="#ffffff" anchorX="center">
        DEVELOPER API NETWORK
      </Text>

      <APIKeyNode apiKey={apiKeys[0]} position={[0, 0, 0]} />

      {endpoints.map((endpoint, idx) => (
        <React.Fragment key={idx}>
          <APIEndpoint 
            endpoint={endpoint} 
            position={endpointPositions[idx]} 
            index={idx}
            stats={{ success_rate: 0.95 }}
          />
          <Line
            points={[[0, 0, 0], endpointPositions[idx]]}
            color="#00ffff"
            lineWidth={1}
            transparent
            opacity={0.3}
          />
        </React.Fragment>
      ))}

      <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={0.6} />
    </>
  );
}

export default function DeveloperAPIConsole3D({ apiKeys = [], endpoints = [] }) {
  const totalRequests = apiKeys.reduce((sum, k) => sum + (k.usage_statistics?.total_requests || 0), 0);
  const activeKeys = apiKeys.filter(k => k.is_active).length;

  return (
    <Card className="bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border-cyan-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Code className="w-8 h-8 text-cyan-400 animate-pulse" />
          Developer API Console
          <Badge className="bg-cyan-500/30 text-cyan-300">
            {activeKeys} ACTIVE KEYS
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-black/40 p-3 rounded-lg border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Key className="w-4 h-4 text-cyan-400" />
              <span className="text-white/60 text-xs">API Keys</span>
            </div>
            <div className="text-white text-lg font-bold">{apiKeys.length}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-blue-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-white/60 text-xs">Requests</span>
            </div>
            <div className="text-white text-lg font-bold">{totalRequests}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-white/60 text-xs">Endpoints</span>
            </div>
            <div className="text-white text-lg font-bold">{endpoints.length}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-indigo-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Code className="w-4 h-4 text-indigo-400" />
              <span className="text-white/60 text-xs">Active</span>
            </div>
            <div className="text-white text-lg font-bold">{activeKeys}</div>
          </div>
        </div>

        <div className="h-[600px] bg-black/20 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [8, 5, 8], fov: 60 }}>
            <color attach="background" args={['#000510']} />
            <fog attach="fog" args={['#000510', 5, 35]} />
            <APIConsoleScene apiKeys={apiKeys} endpoints={endpoints} />
          </Canvas>
        </div>

        <div className="mt-4 flex gap-2">
          <Button className="bg-cyan-600 hover:bg-cyan-700">
            <Key className="w-4 h-4 mr-2" />
            Generate API Key
          </Button>
          <Button variant="outline" className="border-cyan-500 text-cyan-400">
            View Documentation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}