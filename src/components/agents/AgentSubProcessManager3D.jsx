import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box, Cone, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cpu, Play, Pause, CheckCircle, XCircle, Loader } from 'lucide-react';

function SubProcessNode({ subprocess, position, index }) {
  const meshRef = useRef();
  const ringRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * (1 + index * 0.2);
      
      if (subprocess.subprocess_status === 'running') {
        const pulse = Math.sin(clock.elapsedTime * 4) * 0.15 + 1;
        meshRef.current.scale.setScalar(pulse);
      }
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = clock.elapsedTime * 2;
    }
  });

  const statusColors = {
    queued: '#888888',
    running: '#00ffff',
    paused: '#ffaa00',
    completed: '#00ff00',
    failed: '#ff0000',
    terminated: '#666666'
  };

  const color = statusColors[subprocess.subprocess_status] || '#888888';
  const size = 0.2 + (subprocess.execution_metrics?.efficiency_score || 0.5) * 0.2;

  return (
    <group position={position}>
      {subprocess.subprocess_status === 'running' && (
        <mesh ref={ringRef}>
          <torusGeometry args={[size * 2, 0.02, 16, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
      )}

      <Box ref={meshRef} args={[size, size, size]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={subprocess.subprocess_status === 'running' ? 1 : 0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </Box>

      <Text position={[0, size + 0.3, 0]} fontSize={0.08} color="white" anchorX="center">
        {subprocess.task_allocated?.task_description?.slice(0, 15) || 'TASK'}
      </Text>
      <Text position={[0, -size - 0.25, 0]} fontSize={0.06} color={color} anchorX="center">
        {subprocess.subprocess_status?.toUpperCase()}
      </Text>
    </group>
  );
}

function ParentAgent({ position }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 2) * 0.2 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.8, 64, 64]}>
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={1}
          metalness={1}
          roughness={0}
        />
      </Sphere>
      <Text position={[0, 1.2, 0]} fontSize={0.2} color="#ffffff" anchorX="center">
        PARENT AGENT
      </Text>
    </group>
  );
}

function SubProcessScene({ subprocesses }) {
  const processPositions = useMemo(() => {
    return subprocesses.map((_, idx) => {
      const angle = (idx / subprocesses.length) * Math.PI * 2;
      const radius = 4;
      const height = Math.sin(idx * 0.5) * 2;
      return [Math.cos(angle) * radius, height, Math.sin(angle) * radius];
    });
  }, [subprocesses]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00ffff" />
      <pointLight position={[-10, -5, -10]} intensity={1} color="#ff00ff" />
      
      <Text position={[0, 5, 0]} fontSize={0.4} color="#ffffff" anchorX="center">
        AGENT SUB-PROCESS NETWORK
      </Text>

      <ParentAgent position={[0, 0, 0]} />

      {subprocesses.map((subprocess, idx) => (
        <React.Fragment key={subprocess.subprocess_id || idx}>
          <SubProcessNode
            subprocess={subprocess}
            position={processPositions[idx]}
            index={idx}
          />
          <Line
            points={[[0, 0, 0], processPositions[idx]]}
            color="#00ffff"
            lineWidth={1}
            transparent
            opacity={0.3}
          />
        </React.Fragment>
      ))}

      <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={0.7} />
    </>
  );
}

export default function AgentSubProcessManager3D({ subprocesses = [], onSpawnProcess }) {
  const running = subprocesses.filter(s => s.subprocess_status === 'running').length;
  const completed = subprocesses.filter(s => s.subprocess_status === 'completed').length;
  const avgEfficiency = subprocesses.length > 0
    ? subprocesses.reduce((sum, s) => sum + (s.execution_metrics?.efficiency_score || 0), 0) / subprocesses.length
    : 0;

  return (
    <Card className="bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 border-cyan-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Cpu className="w-8 h-8 text-cyan-400 animate-pulse" />
          Dynamic Sub-Process Manager
          <Badge className="bg-cyan-500/30 text-cyan-300">
            RUNNING: {running}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-black/40 p-3 rounded-lg border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="text-white/60 text-xs">Total</span>
            </div>
            <div className="text-white text-lg font-bold">{subprocesses.length}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-blue-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Loader className="w-4 h-4 text-blue-400 animate-spin" />
              <span className="text-white/60 text-xs">Running</span>
            </div>
            <div className="text-white text-lg font-bold">{running}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-white/60 text-xs">Done</span>
            </div>
            <div className="text-white text-lg font-bold">{completed}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-purple-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span className="text-white/60 text-xs">Efficiency</span>
            </div>
            <div className="text-white text-lg font-bold">{(avgEfficiency * 100).toFixed(0)}%</div>
          </div>
        </div>

        <div className="h-[600px] bg-black/20 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [8, 5, 8], fov: 60 }}>
            <color attach="background" args={['#000510']} />
            <fog attach="fog" args={['#000510', 5, 35]} />
            <SubProcessScene subprocesses={subprocesses} />
          </Canvas>
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={onSpawnProcess} className="bg-cyan-600 hover:bg-cyan-700">
            <Play className="w-4 h-4 mr-2" />
            Spawn Sub-Process
          </Button>
          <Button variant="outline" className="border-cyan-500 text-cyan-400">
            <Pause className="w-4 h-4 mr-2" />
            Pause All
          </Button>
        </div>

        {subprocesses.slice(0, 3).map((sp, idx) => (
          <div key={sp.subprocess_id || idx} className="mt-2 bg-black/40 p-3 rounded-lg border border-cyan-500/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white text-sm">{sp.task_allocated?.task_description}</span>
              <Badge className="bg-cyan-500/30 text-cyan-300">{sp.subprocess_status}</Badge>
            </div>
            <div className="text-white/60 text-xs">
              Efficiency: {((sp.execution_metrics?.efficiency_score || 0) * 100).toFixed(0)}% | 
              Time: {sp.execution_metrics?.execution_time_ms || 0}ms
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}