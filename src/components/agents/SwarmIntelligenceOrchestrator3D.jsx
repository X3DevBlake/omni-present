import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Network, Zap, Brain, TrendingUp } from 'lucide-react';
import * as THREE from 'three';

function SwarmAgent({ agent, position, index, problemCenter }) {
  const meshRef = useRef();
  const trailRef = useRef([]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.elapsedTime;
      const speed = agent.velocity || 0.5;
      
      // Swarm behavior: move towards problem center with some randomness
      const target = new THREE.Vector3(...problemCenter);
      const current = meshRef.current.position;
      const direction = target.sub(current).normalize();
      
      meshRef.current.position.x += (direction.x * speed + Math.sin(t * 2 + index) * 0.1) * 0.01;
      meshRef.current.position.y += (direction.y * speed + Math.cos(t * 2 + index) * 0.1) * 0.01;
      meshRef.current.position.z += (direction.z * speed + Math.sin(t + index) * 0.1) * 0.01;
      
      meshRef.current.rotation.y = t + index;
      
      // Trail effect
      trailRef.current.push(meshRef.current.position.clone());
      if (trailRef.current.length > 20) trailRef.current.shift();
    }
  });

  const color = agent.contribution_level > 0.7 ? '#00ff88' : 
                agent.contribution_level > 0.4 ? '#ffaa00' : '#4488ff';

  return (
    <group>
      <Sphere ref={meshRef} args={[0.15, 16, 16]} position={position}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
        />
      </Sphere>
      
      {trailRef.current.length > 1 && (
        <Line
          points={trailRef.current}
          color={color}
          lineWidth={1}
          transparent
          opacity={0.3}
        />
      )}
    </group>
  );
}

function ProblemCore({ position, solved }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 2) * 0.2 + 1;
      meshRef.current.scale.setScalar(pulse);
      meshRef.current.rotation.y = clock.elapsedTime;
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.8, 32, 32]}>
        <meshStandardMaterial
          color={solved ? '#00ff88' : '#ff00ff'}
          emissive={solved ? '#00ff88' : '#ff00ff'}
          emissiveIntensity={1.5}
          transparent
          opacity={0.7}
        />
      </Sphere>
      <Text position={[0, 1.2, 0]} fontSize={0.2} color="white" anchorX="center">
        PROBLEM CORE
      </Text>
    </group>
  );
}

function SwarmScene({ agents, problemCenter, solved }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#00ffff" />
      <pointLight position={[-10, 5, -10]} intensity={1.5} color="#ff00ff" />
      
      <Text position={[0, 6, 0]} fontSize={0.5} color="#ffffff" anchorX="center">
        SWARM INTELLIGENCE
      </Text>

      <ProblemCore position={problemCenter} solved={solved} />

      {agents.map((agent, idx) => (
        <SwarmAgent 
          key={idx} 
          agent={agent} 
          position={agent.position} 
          index={idx}
          problemCenter={problemCenter}
        />
      ))}

      <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

export default function SwarmIntelligenceOrchestrator3D({ swarmData, onOptimizeSwarm }) {
  const agents = swarmData?.agents || [];
  const problemCenter = [0, 0, 0];
  const solved = swarmData?.problem_solved || false;

  const avgContribution = agents.length > 0
    ? agents.reduce((sum, a) => sum + (a.contribution_level || 0), 0) / agents.length
    : 0;

  const convergenceRate = swarmData?.convergence_rate || 0.75;

  return (
    <Card className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-cyan-500/20 border-purple-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Network className="w-8 h-8 text-purple-400 animate-pulse" />
          Swarm Intelligence Orchestrator
          <Badge className={solved ? 'bg-green-500/30 text-green-300' : 'bg-purple-500/30 text-purple-300'}>
            {solved ? 'SOLVED' : 'OPTIMIZING'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-black/40 p-3 rounded-lg border border-purple-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Network className="w-4 h-4 text-purple-400" />
                  <span className="text-white/60 text-xs">Agents</span>
                </div>
                <div className="text-white text-xl font-bold">{agents.length}</div>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-cyan-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span className="text-white/60 text-xs">Contribution</span>
                </div>
                <div className="text-white text-xl font-bold">{(avgContribution * 100).toFixed(0)}%</div>
              </div>

              <div className="bg-black/40 p-3 rounded-lg border border-pink-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-pink-400" />
                  <span className="text-white/60 text-xs">Convergence</span>
                </div>
                <div className="text-white text-xl font-bold">{(convergenceRate * 100).toFixed(0)}%</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-white font-bold mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                Swarm Insights
              </div>
              
              {swarmData?.emergent_behaviors?.slice(0, 3).map((behavior, idx) => (
                <div key={idx} className="bg-purple-500/20 border border-purple-500/50 p-3 rounded-lg">
                  <div className="text-white text-sm font-bold mb-1">{behavior.pattern_type}</div>
                  <div className="text-white/70 text-xs">{behavior.description}</div>
                  <div className="mt-2">
                    <Badge className="bg-purple-500/30 text-purple-300 text-xs">
                      Innovation: {(behavior.innovation_score * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              onClick={onOptimizeSwarm}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Optimize Swarm Parameters
            </Button>
          </div>

          <div className="h-[600px] bg-black/20 rounded-lg overflow-hidden">
            <Canvas camera={{ position: [8, 6, 8], fov: 60 }}>
              <color attach="background" args={['#0a0015']} />
              <fog attach="fog" args={['#0a0015', 5, 30]} />
              <SwarmScene agents={agents} problemCenter={problemCenter} solved={solved} />
            </Canvas>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}