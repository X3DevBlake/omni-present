import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, Lightbulb, Users, Sparkles } from 'lucide-react';
import * as THREE from 'three';

function AgentNode({ agent, position, isContributor }) {
  const meshRef = useRef();
  const glowRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current && glowRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 2 + position[0]) * 0.15 + 1;
      meshRef.current.scale.setScalar(pulse);
      glowRef.current.scale.setScalar(pulse * 1.3);
      
      if (isContributor) {
        meshRef.current.rotation.y = clock.elapsedTime * 2;
      }
    }
  });

  const color = isContributor ? '#ff00ff' : '#00ffff';
  const size = isContributor ? 0.4 : 0.25;

  return (
    <group position={position}>
      <Sphere ref={glowRef} args={[size * 1.5, 32, 32]}>
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </Sphere>
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isContributor ? 1.2 : 0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>
      {isContributor && (
        <Text
          position={[0, size + 0.4, 0]}
          fontSize={0.12}
          color="#ffffff"
          anchorX="center"
        >
          {agent.contribution_type?.toUpperCase() || 'KEY'}
        </Text>
      )}
    </group>
  );
}

function KnowledgeConnection({ from, to, knowledge }) {
  const lineRef = useRef();

  useFrame(({ clock }) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.3 + Math.sin(clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <Line
      ref={lineRef}
      points={[from, to]}
      color="#ffaa00"
      lineWidth={2}
      transparent
      opacity={0.4}
      dashed
      dashScale={50}
      dashSize={0.5}
      gapSize={0.3}
    />
  );
}

function EmergentInsight({ event, position }) {
  const meshRef = useRef();
  const ringsRef = useRef([]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.elapsedTime;
      meshRef.current.rotation.y = clock.elapsedTime * 0.7;
    }

    ringsRef.current.forEach((ring, idx) => {
      if (ring) {
        const scale = 1 + Math.sin(clock.elapsedTime * 2 + idx) * 0.3;
        ring.scale.setScalar(scale);
      }
    });
  });

  return (
    <group position={position}>
      {/* Insight core */}
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={event.innovation_score || 1}
        />
      </Sphere>

      {/* Expanding rings */}
      {[1, 1.5, 2].map((radius, idx) => (
        <mesh
          key={idx}
          ref={el => ringsRef.current[idx] = el}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[radius, 0.02, 16, 64]} />
          <meshBasicMaterial
            color="#ffff00"
            transparent
            opacity={0.3 - idx * 0.1}
          />
        </mesh>
      ))}

      <Text
        position={[0, 0.6, 0]}
        fontSize={0.15}
        color="#ffff00"
        anchorX="center"
      >
        {event.emergent_behavior_type?.toUpperCase() || 'INSIGHT'}
      </Text>
    </group>
  );
}

function EmergentIntelligenceScene({ events }) {
  const latestEvent = events[0] || {};
  const participants = latestEvent.participating_agents || [];

  const agentPositions = useMemo(() => {
    return participants.map((_, idx) => {
      const angle = (idx / participants.length) * Math.PI * 2;
      const radius = 4;
      return [
        Math.cos(angle) * radius,
        Math.sin(idx * 0.5) * 2,
        Math.sin(angle) * radius
      ];
    });
  }, [participants]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={2} color="#ffff00" />
      <pointLight position={[10, 0, 10]} intensity={1} color="#ff00ff" />
      <pointLight position={[-10, 0, -10]} intensity={1} color="#00ffff" />
      
      <Text
        position={[0, 6, 0]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
      >
        EMERGENT INTELLIGENCE
      </Text>

      {/* Central Insight */}
      {latestEvent.event_id && (
        <EmergentInsight event={latestEvent} position={[0, 0, 0]} />
      )}

      {/* Participating Agents */}
      {participants.map((agent, idx) => (
        <AgentNode
          key={agent.agent_id || idx}
          agent={agent}
          position={agentPositions[idx]}
          isContributor={agent.contribution_weight > 0.7}
        />
      ))}

      {/* Knowledge Connections */}
      {participants.map((agent, idx) => (
        <KnowledgeConnection
          key={`conn-${idx}`}
          from={agentPositions[idx]}
          to={[0, 0, 0]}
          knowledge={agent.contribution_type}
        />
      ))}

      {/* Multiple Events */}
      {events.slice(1, 4).map((event, idx) => {
        const angle = (idx / 3) * Math.PI * 2;
        const radius = 6;
        return (
          <EmergentInsight
            key={event.event_id || idx}
            event={event}
            position={[
              Math.cos(angle) * radius,
              -2,
              Math.sin(angle) * radius
            ]}
          />
        );
      })}

      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        autoRotate
        autoRotateSpeed={1}
      />
    </>
  );
}

export default function EmergentIntelligenceVisualizer3D({ events = [] }) {
  const totalEvents = events.length;
  const avgInnovation = events.length > 0
    ? events.reduce((sum, e) => sum + (e.innovation_score || 0), 0) / events.length
    : 0;
  const totalParticipants = events.reduce((sum, e) => sum + (e.participating_agents?.length || 0), 0);

  return (
    <Card className="bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-pink-500/20 border-yellow-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Lightbulb className="w-8 h-8 text-yellow-400 animate-pulse" />
          Emergent Collective Intelligence
          <Badge className="bg-yellow-500/30 text-yellow-300">
            INNOVATION: {(avgInnovation * 100).toFixed(0)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-black/40 p-3 rounded-lg border border-yellow-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <span className="text-white/60 text-xs">Breakthroughs</span>
            </div>
            <div className="text-white text-xl font-bold">{totalEvents}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-orange-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-orange-400" />
              <span className="text-white/60 text-xs">Contributors</span>
            </div>
            <div className="text-white text-xl font-bold">{totalParticipants}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-pink-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-white/60 text-xs">Avg IQ Boost</span>
            </div>
            <div className="text-white text-xl font-bold">
              {events[0]?.collective_iq_boost?.toFixed(1) || '0'}x
            </div>
          </div>
        </div>

        <div className="h-[600px] bg-black/20 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [10, 6, 10], fov: 60 }}>
            <color attach="background" args={['#0a0a0a']} />
            <fog attach="fog" args={['#0a0a0a', 10, 40]} />
            <EmergentIntelligenceScene events={events} />
          </Canvas>
        </div>

        {events[0] && (
          <div className="mt-4 bg-black/40 p-4 rounded-lg border border-yellow-500/30">
            <div className="text-white font-bold mb-2">Latest Breakthrough:</div>
            <div className="text-yellow-400 text-sm mb-2">{events[0].emergent_behavior_type}</div>
            <div className="text-white/70 text-xs">{events[0].emergent_solution}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}