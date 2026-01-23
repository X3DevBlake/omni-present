import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, TrendingUp, Clock, CheckCircle } from 'lucide-react';

function RequestNode({ log, position, index }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.elapsedTime - index * 0.1;
      if (t > 0) {
        meshRef.current.position.y = position[1] + Math.sin(t * 2) * 0.2;
      }
    }
  });

  const isSuccess = log.response_status < 400;
  const color = isSuccess ? '#00ff88' : '#ff4444';

  return (
    <Sphere ref={meshRef} args={[0.1, 16, 16]} position={position}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isSuccess ? 0.5 : 1}
      />
    </Sphere>
  );
}

function APIGatewayScene({ logs }) {
  const positions = useMemo(() => {
    return logs.slice(0, 50).map((_, idx) => {
      const angle = (idx / 50) * Math.PI * 2;
      const radius = 3 + Math.random();
      const height = Math.random() * 4 - 2;
      return [Math.cos(angle) * radius, height, Math.sin(angle) * radius];
    });
  }, [logs]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={2} color="#00ffff" />
      
      <Text position={[0, 5, 0]} fontSize={0.5} color="#ffffff" anchorX="center">
        API GATEWAY
      </Text>

      <Sphere args={[0.8, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={1.2}
        />
      </Sphere>

      {logs.slice(0, 50).map((log, idx) => (
        <RequestNode key={idx} log={log} position={positions[idx]} index={idx} />
      ))}

      <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={0.7} />
    </>
  );
}

export default function APIGatewayMetrics3D({ logs = [] }) {
  const successRate = logs.length > 0
    ? (logs.filter(l => l.response_status < 400).length / logs.length) * 100
    : 100;

  const avgResponseTime = logs.length > 0
    ? logs.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / logs.length
    : 0;

  return (
    <Card className="bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-teal-500/20 border-green-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Globe className="w-8 h-8 text-green-400 animate-pulse" />
          API Gateway Metrics
          <Badge className="bg-green-500/30 text-green-300">
            {successRate.toFixed(1)}% SUCCESS
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-black/40 p-3 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-white/60 text-xs">Requests</span>
            </div>
            <div className="text-white text-lg font-bold">{logs.length}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-white/60 text-xs">Success</span>
            </div>
            <div className="text-white text-lg font-bold">{successRate.toFixed(0)}%</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-teal-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-teal-400" />
              <span className="text-white/60 text-xs">Avg Time</span>
            </div>
            <div className="text-white text-lg font-bold">{avgResponseTime.toFixed(0)}ms</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span className="text-white/60 text-xs">Endpoints</span>
            </div>
            <div className="text-white text-lg font-bold">
              {new Set(logs.map(l => l.endpoint)).size}
            </div>
          </div>
        </div>

        <div className="h-[500px] bg-black/20 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [8, 5, 8], fov: 60 }}>
            <color attach="background" args={['#001010']} />
            <fog attach="fog" args={['#001010', 5, 35]} />
            <APIGatewayScene logs={logs} />
          </Canvas>
        </div>
      </CardContent>
    </Card>
  );
}