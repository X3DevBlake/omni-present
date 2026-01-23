import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap } from 'lucide-react';

function DataParticle({ data, index, streamIndex, totalStreams }) {
  const meshRef = useRef();
  const streamAngle = (streamIndex / totalStreams) * Math.PI * 2;
  const baseX = Math.cos(streamAngle) * 5;
  const baseZ = Math.sin(streamAngle) * 5;
  
  useFrame((state) => {
    if (meshRef.current) {
      const progress = (state.clock.elapsedTime + index * 0.5) % 5;
      const y = progress - 2.5;
      meshRef.current.position.y = y;
      meshRef.current.position.x = baseX + Math.sin(state.clock.elapsedTime + index) * 0.5;
      meshRef.current.position.z = baseZ + Math.cos(state.clock.elapsedTime + index) * 0.5;
      
      const pulse = Math.sin(state.clock.elapsedTime * 3 + index) * 0.2 + 1;
      meshRef.current.scale.set(pulse, pulse, pulse);
      
      // Fade at top and bottom
      if (meshRef.current.material) {
        meshRef.current.material.opacity = Math.max(0, 1 - Math.abs(y) / 2.5);
      }
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.1, 8, 8]}>
      <meshStandardMaterial
        color={data.color || '#00FFFF'}
        emissive={data.color || '#00FFFF'}
        emissiveIntensity={0.8}
        transparent
      />
    </Sphere>
  );
}

function StreamPath({ streamIndex, totalStreams }) {
  const angle = (streamIndex / totalStreams) * Math.PI * 2;
  const radius = 5;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  const points = [
    [x, -3, z],
    [x, 3, z]
  ];

  return (
    <Line
      points={points}
      color="#00FFFF"
      lineWidth={1}
      transparent
      opacity={0.3}
    />
  );
}

function DataStreamScene({ streams }) {
  const totalStreams = streams.length || 1;
  
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={1} color="#00FFFF" />
      <pointLight position={[0, -10, 0]} intensity={0.5} color="#FF00FF" />
      
      <OrbitControls autoRotate autoRotateSpeed={0.5} />

      {/* Central data hub */}
      <Sphere args={[1, 32, 32]}>
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={1}
          wireframe
        />
      </Sphere>

      {streams.map((stream, streamIdx) => (
        <React.Fragment key={streamIdx}>
          <StreamPath streamIndex={streamIdx} totalStreams={totalStreams} />
          
          {[...Array(10)].map((_, particleIdx) => (
            <DataParticle
              key={`${streamIdx}-${particleIdx}`}
              data={stream}
              index={particleIdx}
              streamIndex={streamIdx}
              totalStreams={totalStreams}
            />
          ))}
        </React.Fragment>
      ))}

      <Text position={[0, -4, 0]} fontSize={0.4} color="#00FFFF" anchorX="center">
        Real-Time Data Streams
      </Text>
    </>
  );
}

export default function HolographicDataStream3D({ 
  streams = [],
  title = "Holographic Data Streams" 
}) {
  const activeStreams = streams.filter(s => s.active);
  const totalDataRate = streams.reduce((sum, s) => sum + (s.update_frequency_hz || 0), 0);

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-cyan-950 border-cyan-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            {title}
          </span>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-cyan-900 text-cyan-200">
              {activeStreams.length} Active
            </Badge>
            <Badge variant="outline" className="bg-green-900 text-green-200">
              <Zap className="w-3 h-3 mr-1" />
              {totalDataRate.toFixed(0)} Hz
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full rounded-lg overflow-hidden bg-black">
          <Canvas camera={{ position: [8, 5, 8], fov: 60 }}>
            <color attach="background" args={['#001122']} />
            <fog attach="fog" args={['#001122', 10, 40]} />
            <DataStreamScene streams={streams} />
          </Canvas>
        </div>

        {streams.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {streams.slice(0, 4).map((stream, idx) => (
              <div key={idx} className="p-2 bg-slate-800 rounded flex items-center justify-between">
                <span className="text-white text-sm">{stream.name}</span>
                <Badge variant="outline" className={stream.active ? 'bg-green-900 text-green-200' : 'bg-slate-700'}>
                  {stream.active ? 'Live' : 'Paused'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}