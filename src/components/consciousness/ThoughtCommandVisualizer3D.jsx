import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, CheckCircle, XCircle, Clock } from 'lucide-react';
import * as THREE from 'three';

function ThoughtParticle({ command, index, totalCommands }) {
  const meshRef = useRef();
  const trailRef = useRef();
  const [position, setPosition] = useState([0, 0, 0]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Spiral motion from brain to execution
      const t = (clock.elapsedTime * 0.5 + index * 0.3) % 1;
      const angle = t * Math.PI * 4;
      const radius = 3 * (1 - t);
      const height = -3 + t * 6;
      
      const x = Math.cos(angle) * radius;
      const y = height;
      const z = Math.sin(angle) * radius;
      
      meshRef.current.position.set(x, y, z);
      setPosition([x, y, z]);
      
      // Pulse based on confidence
      const scale = 0.1 + (command.neural_confidence || 0.5) * 0.1;
      const pulse = Math.sin(clock.elapsedTime * 5) * 0.02 + 1;
      meshRef.current.scale.setScalar(scale * pulse);
    }
  });

  const getColor = () => {
    if (command.execution_status === 'executed') return '#00ff00';
    if (command.execution_status === 'failed') return '#ff0000';
    if (command.execution_status === 'processing') return '#ffaa00';
    return '#00ffff';
  };

  return (
    <Sphere ref={meshRef} args={[0.1, 16, 16]}>
      <meshStandardMaterial
        color={getColor()}
        emissive={getColor()}
        emissiveIntensity={1}
      />
    </Sphere>
  );
}

function BrainSource() {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * 0.3;
      const pulse = Math.sin(clock.elapsedTime * 2) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={[0, -3, 0]}>
      <Sphere ref={meshRef} args={[0.8, 32, 32]}>
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={0.8}
          metalness={0.5}
          roughness={0.5}
        />
      </Sphere>
      <Text
        position={[0, -1.2, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
      >
        NEURAL SOURCE
      </Text>
    </group>
  );
}

function ExecutionTarget({ commandType }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = clock.elapsedTime * 0.5;
    }
  });

  return (
    <group position={[0, 3, 0]}>
      <Sphere ref={meshRef} args={[0.6, 32, 32]}>
        <meshStandardMaterial
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={0.6}
          transparent
          opacity={0.8}
        />
      </Sphere>
      <Text
        position={[0, 1, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
      >
        EXECUTION
      </Text>
      <Text
        position={[0, 0.7, 0]}
        fontSize={0.12}
        color="#00ff88"
        anchorX="center"
      >
        {commandType?.toUpperCase() || 'SYSTEM'}
      </Text>
    </group>
  );
}

function ThoughtCommandScene({ commands }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={1.5} color="#00ff88" />
      <pointLight position={[0, -10, 0]} intensity={1.5} color="#ff00ff" />
      <spotLight position={[5, 5, 5]} intensity={1} color="#ffffff" angle={0.3} />
      
      <Text
        position={[0, 5, 0]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
      >
        THOUGHT COMMAND STREAM
      </Text>

      <BrainSource />
      <ExecutionTarget commandType={commands[0]?.command_type} />

      {/* Spiral connecting line */}
      <Line
        points={[
          [0, -3, 0],
          [2, -1, 1],
          [1, 1, -1],
          [0, 3, 0]
        ]}
        color="#ffffff"
        lineWidth={1}
        transparent
        opacity={0.2}
        dashed
      />

      {/* Thought particles */}
      {commands.slice(0, 10).map((command, idx) => (
        <ThoughtParticle
          key={command.command_id || idx}
          command={command}
          index={idx}
          totalCommands={commands.length}
        />
      ))}

      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        autoRotate
        autoRotateSpeed={1.2}
      />
    </>
  );
}

export default function ThoughtCommandVisualizer3D({ commands = [] }) {
  const totalCommands = commands.length;
  const executed = commands.filter(c => c.execution_status === 'executed').length;
  const avgLatency = commands.length > 0
    ? commands.reduce((sum, c) => sum + (c.execution_latency_ms || 0), 0) / commands.length
    : 0;
  const avgConfidence = commands.length > 0
    ? commands.reduce((sum, c) => sum + (c.neural_confidence || 0), 0) / commands.length
    : 0;

  return (
    <Card className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-cyan-500/20 border-purple-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Brain className="w-8 h-8 text-purple-400 animate-pulse" />
          Thought Command Pipeline
          <Badge className="bg-purple-500/30 text-purple-300">
            LATENCY: {avgLatency.toFixed(0)}ms
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-black/40 p-3 rounded-lg border border-purple-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-white/60 text-xs">Total Thoughts</span>
            </div>
            <div className="text-white text-lg font-bold">{totalCommands}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-white/60 text-xs">Executed</span>
            </div>
            <div className="text-white text-lg font-bold">{executed}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-white/60 text-xs">Confidence</span>
            </div>
            <div className="text-white text-lg font-bold">{(avgConfidence * 100).toFixed(0)}%</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-orange-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="text-white/60 text-xs">Avg Speed</span>
            </div>
            <div className="text-white text-lg font-bold">{avgLatency.toFixed(0)}ms</div>
          </div>
        </div>

        <div className="h-[600px] bg-black/20 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [6, 4, 6], fov: 70 }}>
            <color attach="background" args={['#0a0015']} />
            <fog attach="fog" args={['#0a0015', 5, 30]} />
            <ThoughtCommandScene commands={commands} />
          </Canvas>
        </div>

        <div className="mt-4 space-y-2">
          {commands.slice(0, 3).map((command, idx) => (
            <div key={command.command_id || idx} className="bg-black/40 p-3 rounded-lg border border-purple-500/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white text-sm font-bold">{command.interpreted_intent}</span>
                <Badge className={
                  command.execution_status === 'executed' ? 'bg-green-500/30 text-green-300' :
                  command.execution_status === 'failed' ? 'bg-red-500/30 text-red-300' :
                  'bg-orange-500/30 text-orange-300'
                }>
                  {command.execution_status}
                </Badge>
              </div>
              <div className="text-white/60 text-xs">
                Type: {command.command_type} | Latency: {command.execution_latency_ms}ms
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}