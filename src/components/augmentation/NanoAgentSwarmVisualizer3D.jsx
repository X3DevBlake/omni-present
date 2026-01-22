import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Target, Zap } from 'lucide-react';
import * as THREE from 'three';

function NanoAgent({ agent, index }) {
  const meshRef = useRef();
  const trailRef = useRef();
  const [trail, setTrail] = React.useState([]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Simulate movement
      const t = clock.elapsedTime + index * 0.5;
      const x = agent.position?.x || Math.sin(t * 0.5) * 2;
      const y = agent.position?.y || Math.sin(t * 0.7) * 1.5;
      const z = agent.position?.z || Math.cos(t * 0.5) * 2;
      
      meshRef.current.position.set(x, y, z);
      
      // Update trail
      setTrail(prev => {
        const newTrail = [...prev, [x, y, z]];
        return newTrail.slice(-20); // Keep last 20 positions
      });
    }
  });

  const color = agent.health > 0.7 ? '#00ff88' : 
                agent.health > 0.4 ? '#ffaa00' : '#ff0000';

  return (
    <group>
      {trail.length > 1 && (
        <Line
          points={trail}
          color={color}
          lineWidth={0.5}
          transparent
          opacity={0.3}
        />
      )}
      <Sphere ref={meshRef} args={[0.05, 16, 16]}>
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={agent.battery_level || 0.5}
        />
      </Sphere>
    </group>
  );
}

function BodySystem({ deploymentLocation }) {
  const systemRef = useRef();

  useFrame(({ clock }) => {
    if (systemRef.current) {
      systemRef.current.rotation.y = clock.elapsedTime * 0.2;
    }
  });

  // Create anatomical system outline
  const systemShape = useMemo(() => {
    const shapes = {
      circulatory: { radius: 3, segments: 64, color: '#ff0000' },
      neural: { radius: 2.5, segments: 32, color: '#ff00ff' },
      lymphatic: { radius: 3.2, segments: 48, color: '#00ffaa' },
      muscular: { radius: 3.5, segments: 72, color: '#ff8800' },
      digestive: { radius: 2.8, segments: 56, color: '#ffff00' },
      respiratory: { radius: 2.6, segments: 40, color: '#00aaff' }
    };
    return shapes[deploymentLocation] || shapes.circulatory;
  }, [deploymentLocation]);

  return (
    <mesh ref={systemRef}>
      <torusGeometry args={[systemShape.radius, 0.1, 16, systemShape.segments]} />
      <meshStandardMaterial
        color={systemShape.color}
        transparent
        opacity={0.15}
        wireframe
      />
    </mesh>
  );
}

function SwarmScene({ swarmData }) {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ff0080" />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#00ffff" />
      
      <Text
        position={[0, 5, 0]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        NANO-AGENT SWARM: {swarmData.swarm_id?.slice(0, 8) || 'SYSTEM'}
      </Text>

      <Text
        position={[0, 4.3, 0]}
        fontSize={0.2}
        color="#aaaaaa"
        anchorX="center"
        anchorY="middle"
      >
        Location: {swarmData.deployment_location?.toUpperCase() || 'DEPLOYING'}
      </Text>

      {/* Body System Outline */}
      <BodySystem deploymentLocation={swarmData.deployment_location} />

      {/* Nano Agents */}
      {(swarmData.nano_agents || []).map((agent, idx) => (
        <NanoAgent key={agent.agent_id || idx} agent={agent} index={idx} />
      ))}

      {/* Central Task Indicator */}
      {swarmData.collective_task && (
        <group position={[0, 0, 0]}>
          <Sphere args={[0.3, 32, 32]}>
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={swarmData.collective_task.progress || 0.5}
              transparent
              opacity={0.5}
            />
          </Sphere>
          <Text
            position={[0, -0.6, 0]}
            fontSize={0.12}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            Task: {(swarmData.collective_task.progress * 100).toFixed(0)}%
          </Text>
        </group>
      )}

      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        autoRotate
        autoRotateSpeed={1}
      />
    </>
  );
}

export default function NanoAgentSwarmVisualizer3D({ swarmData }) {
  const intelligenceScore = swarmData?.swarm_intelligence_score || 0;
  const swarmSize = swarmData?.swarm_size || 0;
  const activeAgents = (swarmData?.nano_agents || []).filter(a => a.battery_level > 0.2).length;

  return (
    <Card className="bg-gradient-to-br from-green-500/20 via-cyan-500/20 to-blue-500/20 border-green-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Activity className="w-8 h-8 text-green-400 animate-pulse" />
          Nano-Agent Swarm Intelligence
          <Badge className="bg-green-500/30 text-green-300">
            SWARM IQ: {(intelligenceScore * 100).toFixed(0)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-black/40 p-3 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-white/60 text-xs">Total Agents</span>
            </div>
            <div className="text-white text-xl font-bold">{swarmSize}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-white/60 text-xs">Active Agents</span>
            </div>
            <div className="text-white text-xl font-bold">{activeAgents}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-blue-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-white/60 text-xs">Coordination</span>
            </div>
            <div className="text-white text-xl font-bold">
              {swarmData?.coordination_protocol?.toUpperCase().slice(0, 4) || 'N/A'}
            </div>
          </div>
        </div>

        <div className="h-[600px] bg-black/20 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [8, 6, 8], fov: 60 }}>
            <color attach="background" args={['#000511']} />
            <fog attach="fog" args={['#000511', 5, 30]} />
            <SwarmScene swarmData={swarmData || {}} />
          </Canvas>
        </div>

        <div className="mt-4 text-xs text-white/60 space-y-1">
          <div>Protocol: <span className="text-cyan-400">{swarmData?.coordination_protocol || 'adaptive'}</span></div>
          <div>Status: <span className="text-green-400">{swarmData?.swarm_status || 'active'}</span></div>
          {swarmData?.collective_task && (
            <div>Current Task: <span className="text-orange-400">{swarmData.collective_task.task_type}</span></div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}