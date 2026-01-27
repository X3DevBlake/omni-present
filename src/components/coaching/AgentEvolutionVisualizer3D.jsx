import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Torus, Line, Text, Float } from '@react-three/drei';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Brain, TrendingUp } from 'lucide-react';
import * as THREE from 'three';

function EvolutionCore({ mastery }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x += 0.005;
      const scale = 1 + Math.sin(state.clock.elapsedTime) * 0.1;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  const color = new THREE.Color().setHSL(mastery * 0.7, 1, 0.5);

  return (
    <group>
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.8}
          wireframe={false}
        />
      </Sphere>
      <Torus args={[1.5, 0.05, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={2} />
      </Torus>
      <Torus args={[1.8, 0.02, 16, 100]} rotation={[Math.PI / 3, 0, 0]}>
        <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={1} />
      </Torus>
    </group>
  );
}

function TrajectoryLine({ points }) {
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  }, [points]);

  return (
    <Line
      points={curve.getPoints(50)}
      color="#ffffff"
      opacity={0.3}
      transparent
      lineWidth={1}
    />
  );
}

function SkillNode({ position, label }) {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position}>
        <Sphere args={[0.1, 16, 16]}>
          <meshStandardMaterial color="white" emissive="white" emissiveIntensity={1} />
        </Sphere>
        <Text
          position={[0, 0.2, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </group>
    </Float>
  );
}

export default function AgentEvolutionVisualizer3D({ agentId }) {
  const { data } = useQuery({
    queryKey: ['agent-evolution', agentId],
    queryFn: async () => {
      const response = await base44.functions.invoke('getEvolutionTrajectory', { agent_id: agentId });
      return response.data.trajectory;
    },
    enabled: !!agentId
  });

  const trajectoryPoints = [
    [-2, -1, 0],
    [-1, 0, 1],
    [0, 0, 0],
    [1, 1, -1],
    [2, 2, 0]
  ];

  return (
    <Card className="bg-black/60 border-purple-500/30 backdrop-blur-xl h-[500px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Brain className="w-5 h-5 text-purple-400" />
          Agent Evolutionary Trajectory
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 relative p-0">
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          
          <EvolutionCore mastery={data?.current_mastery || 0.5} />
          <TrajectoryLine points={trajectoryPoints} />
          
          {data?.recommended_skills?.map((skill, i) => {
             const x = Math.cos(i * 2) * 2.5;
             const y = Math.sin(i * 2) * 2.5;
             return <SkillNode key={i} position={[x, y, 0]} label={skill} />;
          })}

          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>

        {/* Overlay Stats */}
        <div className="absolute bottom-4 left-4 p-4 bg-black/40 rounded-lg backdrop-blur-md border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm font-bold text-white">Projected Growth</span>
          </div>
          <div className="text-xs text-gray-300">
            Next Stage: <span className="text-purple-400 font-bold">{data?.next_stage || 'Calculating...'}</span>
          </div>
          <div className="text-xs text-gray-300 mt-1">
            Current Mastery: <span className="text-blue-400 font-bold">{((data?.current_mastery || 0) * 100).toFixed(0)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}