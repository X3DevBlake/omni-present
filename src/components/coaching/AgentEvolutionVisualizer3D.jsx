import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Torus, Line, Text, Float } from '@react-three/drei';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Brain, TrendingUp } from 'lucide-react';
import * as THREE from 'three';

function EvolutionCore({ mastery, auraColor = '#a855f7' }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x += 0.005;
      const scale = 1 + Math.sin(state.clock.elapsedTime) * 0.1;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group>
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <meshStandardMaterial 
          color={auraColor}
          emissive={auraColor}
          emissiveIntensity={mastery}
          roughness={0.2}
          metalness={0.8}
          wireframe={false}
        />
      </Sphere>
      {/* Dynamic Rings representing evolution layers */}
      <Torus args={[1.5, 0.02, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={2} transparent opacity={0.6} />
      </Torus>
      <Torus args={[1.8, 0.01, 16, 100]} rotation={[Math.PI / 3, 0, 0]}>
        <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={1} transparent opacity={0.4} />
      </Torus>
    </group>
  );
}

function ConnectionLine({ start, end, active }) {
  return (
    <Line
      points={[start, end]}
      color={active ? "#4ade80" : "#ffffff"}
      opacity={active ? 0.8 : 0.2}
      transparent
      lineWidth={active ? 2 : 1}
    />
  );
}

function SkillNode({ position, label, status }) {
  const isMastered = status === 'mastered';
  const isLocked = status === 'locked';
  const color = isMastered ? '#4ade80' : isLocked ? '#64748b' : '#fbbf24';

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position}>
        <Sphere args={[0.15, 16, 16]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isMastered ? 1.5 : 0.5} />
        </Sphere>
        <Text
          position={[0, 0.25, 0]}
          fontSize={0.12}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="black"
        >
          {label}
        </Text>
      </group>
    </Float>
  );
}

export default function AgentEvolutionVisualizer3D({ agentId, targetRole = 'Generalist' }) {
  const { data } = useQuery({
    queryKey: ['agent-evolution-path', agentId, targetRole],
    queryFn: async () => {
      const response = await base44.functions.invoke('generatePersonalizedPath', { 
        agent_id: agentId,
        target_role: targetRole
      });
      return response.data.path;
    },
    enabled: !!agentId
  });

  return (
    <Card className="bg-black/60 border-purple-500/30 backdrop-blur-xl h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Brain className="w-5 h-5 text-purple-400" />
          Neural Evolution: {targetRole}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 relative p-0 overflow-hidden rounded-b-xl">
        <Canvas camera={{ position: [0, 0, 7], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          
          <EvolutionCore 
            mastery={data?.current_stage === 'Sentient' ? 1 : 0.5} 
            auraColor={data?.current_stage === 'Sentient' ? '#a855f7' : '#3b82f6'}
          />
          
          {data?.nodes?.map((node, i) => (
             <group key={i}>
               <SkillNode 
                 position={node.position} 
                 label={node.skill} 
                 status={node.status} 
               />
               {node.parent && (
                 <ConnectionLine 
                   start={node.position} 
                   end={data.nodes.find(n => n.id === node.parent)?.position || [0,0,0]}
                   active={node.status !== 'locked'}
                 />
               )}
             </group>
          ))}

          <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.3} />
        </Canvas>

        {/* Overlay Stats */}
        <div className="absolute top-4 right-4 p-4 bg-black/60 rounded-lg backdrop-blur-md border border-white/10 w-64">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm font-bold text-white">Projected Impact</span>
          </div>
          {data?.projected_impact ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-white/70">
                <span>Efficiency Boost</span>
                <span className="text-green-400 font-bold">{data.projected_impact.efficiency_boost}</span>
              </div>
              <div className="flex justify-between text-xs text-white/70">
                <span>Visual Form</span>
                <span className="text-purple-400 font-bold">{data.projected_impact.visual_evolution}</span>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                Next Stage: <span className="text-white font-bold">{data.current_stage}</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-white/40">Calculating personalized trajectory...</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}