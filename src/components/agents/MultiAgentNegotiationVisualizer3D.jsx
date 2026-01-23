import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Torus } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, Scale, TrendingUp } from 'lucide-react';

function NegotiatingAgent({ agent, position, isHighPriority }) {
  const meshRef = useRef();
  const orbitRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 2) * 0.15 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
    if (orbitRef.current) {
      orbitRef.current.rotation.y = clock.elapsedTime * (isHighPriority ? 2 : 1);
    }
  });

  const color = isHighPriority ? '#ffaa00' : '#00aaff';
  const size = 0.3 + agent.priority_score * 0.2;

  return (
    <group position={position}>
      <mesh ref={orbitRef}>
        <torusGeometry args={[size * 1.5, 0.02, 16, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>

      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isHighPriority ? 1 : 0.6}
        />
      </Sphere>

      <Text position={[0, size + 0.4, 0]} fontSize={0.1} color="white" anchorX="center">
        AGENT {agent.agent_id?.slice(0, 6)}
      </Text>
      <Text position={[0, -size - 0.35, 0]} fontSize={0.08} color={color} anchorX="center">
        Priority: {(agent.priority_score * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

function NegotiationTable({ position }) {
  const tableRef = useRef();

  useFrame(({ clock }) => {
    if (tableRef.current) {
      tableRef.current.rotation.y = clock.elapsedTime * 0.3;
    }
  });

  return (
    <group position={position} ref={tableRef}>
      <Torus args={[2, 0.1, 16, 64]}>
        <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
      </Torus>
      <Text position={[0, 0, 0]} fontSize={0.2} color="#000000" anchorX="center">
        NEGOTIATION
      </Text>
    </group>
  );
}

function ProposalBeam({ from, to, roundNumber }) {
  const lineRef = useRef();

  useFrame(({ clock }) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.3 + Math.sin(clock.elapsedTime * 3 + roundNumber) * 0.2;
    }
  });

  return (
    <Line
      ref={lineRef}
      points={[from, to]}
      color="#00ff88"
      lineWidth={2}
      transparent
      opacity={0.4}
    />
  );
}

function NegotiationScene({ negotiation }) {
  const agents = negotiation?.participating_agents || [];
  
  const agentPositions = useMemo(() => {
    return agents.map((_, idx) => {
      const angle = (idx / agents.length) * Math.PI * 2;
      const radius = 5;
      return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
    });
  }, [agents]);

  const rounds = negotiation?.negotiation_rounds || [];
  const consensusScore = rounds[rounds.length - 1]?.consensus_score || 0;

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={2} color="#ffffff" />
      <pointLight position={[10, 5, 10]} intensity={1} color="#00ffff" />
      
      <Text position={[0, 4, 0]} fontSize={0.5} color="#ffffff" anchorX="center">
        MULTI-AGENT NEGOTIATION
      </Text>

      <Text position={[0, 3.3, 0]} fontSize={0.2} color="#00ff88" anchorX="center">
        Consensus: {(consensusScore * 100).toFixed(0)}%
      </Text>

      <NegotiationTable position={[0, 0, 0]} />

      {agents.map((agent, idx) => (
        <NegotiatingAgent
          key={agent.agent_id || idx}
          agent={agent}
          position={agentPositions[idx]}
          isHighPriority={agent.priority_score > 0.7}
        />
      ))}

      {agents.map((_, idx) => (
        <ProposalBeam
          key={`beam-${idx}`}
          from={agentPositions[idx]}
          to={[0, 0, 0]}
          roundNumber={rounds.length}
        />
      ))}

      <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

export default function MultiAgentNegotiationVisualizer3D({ negotiation, onExecuteRound }) {
  const agents = negotiation?.participating_agents?.length || 0;
  const rounds = negotiation?.negotiation_rounds?.length || 0;
  const consensusScore = negotiation?.negotiation_rounds?.[rounds - 1]?.consensus_score || 0;

  return (
    <Card className="bg-gradient-to-br from-orange-500/20 via-amber-500/20 to-yellow-500/20 border-orange-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Scale className="w-8 h-8 text-orange-400 animate-pulse" />
          Multi-Agent Negotiation Protocol
          <Badge className="bg-orange-500/30 text-orange-300">
            CONSENSUS: {(consensusScore * 100).toFixed(0)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-black/40 p-3 rounded-lg border border-orange-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-orange-400" />
              <span className="text-white/60 text-xs">Agents</span>
            </div>
            <div className="text-white text-lg font-bold">{agents}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-amber-500/30">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span className="text-white/60 text-xs">Rounds</span>
            </div>
            <div className="text-white text-lg font-bold">{rounds}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-yellow-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Scale className="w-4 h-4 text-yellow-400" />
              <span className="text-white/60 text-xs">Fairness</span>
            </div>
            <div className="text-white text-lg font-bold">
              {((negotiation?.ai_mediation?.fairness_score || 0.8) * 100).toFixed(0)}%
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-white/60 text-xs">Status</span>
            </div>
            <div className="text-white text-sm font-bold">
              {negotiation?.negotiation_outcome || 'ONGOING'}
            </div>
          </div>
        </div>

        <div className="h-[600px] bg-black/20 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [10, 6, 10], fov: 60 }}>
            <color attach="background" args={['#0a0500']} />
            <fog attach="fog" args={['#0a0500', 5, 35]} />
            <NegotiationScene negotiation={negotiation || {}} />
          </Canvas>
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={onExecuteRound} className="bg-orange-600 hover:bg-orange-700">
            <MessageSquare className="w-4 h-4 mr-2" />
            Execute Round
          </Button>
          <Button variant="outline" className="border-orange-500 text-orange-400">
            View Proposals
          </Button>
        </div>

        {negotiation?.negotiation_subject && (
          <div className="mt-4 bg-black/40 p-4 rounded-lg border border-orange-500/30">
            <div className="text-orange-400 font-bold mb-2">Negotiation Subject:</div>
            <div className="text-white/80 text-sm">
              Type: {negotiation.negotiation_subject.subject_type} | 
              Resource: {negotiation.negotiation_subject.resource_contested}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}