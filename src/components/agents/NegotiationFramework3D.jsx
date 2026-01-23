import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Torus } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Handshake, Scale, ArrowRightLeft } from 'lucide-react';

function NegotiatingAgent({ agent, position, index }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime + index;
      const pulse = Math.sin(clock.elapsedTime * 3 + index) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const color = agent.negotiation_stance === 'cooperative' ? '#00ff88' : 
                agent.negotiation_stance === 'competitive' ? '#ff4444' : '#ffaa00';

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
        />
      </Sphere>
      
      <Text position={[0, 0.6, 0]} fontSize={0.08} color="white" anchorX="center">
        {agent.agent_name}
      </Text>
      <Text position={[0, -0.5, 0]} fontSize={0.06} color={color} anchorX="center">
        {agent.negotiation_stance}
      </Text>
    </group>
  );
}

function ResourcePool({ position, resource }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = clock.elapsedTime * 2;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <torusGeometry args={[0.5, 0.1, 16, 32]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
      </mesh>
      <Text position={[0, 0.8, 0]} fontSize={0.1} color="white" anchorX="center">
        {resource.resource_type}
      </Text>
      <Text position={[0, -0.7, 0]} fontSize={0.08} color="#00ffff" anchorX="center">
        {resource.quantity} units
      </Text>
    </group>
  );
}

function NegotiationScene({ agents, resources }) {
  const agentPositions = agents.map((_, idx) => {
    const angle = (idx / agents.length) * Math.PI * 2;
    const radius = 4;
    return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={2} color="#00ffff" />
      <pointLight position={[10, 5, 10]} intensity={1.5} color="#ff00ff" />
      
      <Text position={[0, 5, 0]} fontSize={0.5} color="#ffffff" anchorX="center">
        NEGOTIATION FRAMEWORK
      </Text>

      <ResourcePool position={[0, 0, 0]} resource={resources[0] || { resource_type: 'CPU', quantity: 100 }} />

      {agents.map((agent, idx) => (
        <React.Fragment key={idx}>
          <NegotiatingAgent agent={agent} position={agentPositions[idx]} index={idx} />
          <Line
            points={[[0, 0, 0], agentPositions[idx]]}
            color="#00ffff"
            lineWidth={2}
            transparent
            opacity={0.3}
          />
        </React.Fragment>
      ))}

      <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={0.6} />
    </>
  );
}

export default function NegotiationFramework3D({ negotiationData, onInitiateNegotiation }) {
  const agents = negotiationData?.participating_agents || [];
  const resources = negotiationData?.resources_negotiating || [{ resource_type: 'CPU', quantity: 100 }];
  const status = negotiationData?.negotiation_status || 'pending';

  const fairnessScore = negotiationData?.fairness_score || 0.8;

  return (
    <Card className="bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-teal-500/20 border-blue-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Handshake className="w-8 h-8 text-blue-400 animate-pulse" />
          Multi-Agent Negotiation Framework
          <Badge className={
            status === 'agreement_reached' ? 'bg-green-500/30 text-green-300' : 
            status === 'negotiating' ? 'bg-blue-500/30 text-blue-300' :
            'bg-orange-500/30 text-orange-300'
          }>
            {status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-black/40 p-3 rounded-lg border border-blue-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-white/60 text-xs">Agents</span>
                </div>
                <div className="text-white text-xl font-bold">{agents.length}</div>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-cyan-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Scale className="w-4 h-4 text-cyan-400" />
                  <span className="text-white/60 text-xs">Fairness</span>
                </div>
                <div className="text-white text-xl font-bold">{(fairnessScore * 100).toFixed(0)}%</div>
              </div>

              <div className="bg-black/40 p-3 rounded-lg border border-teal-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowRightLeft className="w-4 h-4 text-teal-400" />
                  <span className="text-white/60 text-xs">Resources</span>
                </div>
                <div className="text-white text-xl font-bold">{resources.length}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-white font-bold mb-2">Agent Proposals</div>
              
              {negotiationData?.proposals?.slice(0, 3).map((proposal, idx) => (
                <div key={idx} className="bg-blue-500/20 border border-blue-500/50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-bold">{proposal.proposing_agent}</span>
                    <Badge className={
                      proposal.status === 'accepted' ? 'bg-green-500/30 text-green-300' : 
                      proposal.status === 'rejected' ? 'bg-red-500/30 text-red-300' :
                      'bg-orange-500/30 text-orange-300'
                    }>
                      {proposal.status}
                    </Badge>
                  </div>
                  <div className="text-white/70 text-xs">{proposal.proposal_terms}</div>
                  <div className="mt-2 text-cyan-400 text-xs">
                    Value Score: {(proposal.value_score * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>

            <Button 
              onClick={onInitiateNegotiation}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <Handshake className="w-4 h-4 mr-2" />
              Initiate New Negotiation Round
            </Button>
          </div>

          <div className="h-[600px] bg-black/20 rounded-lg overflow-hidden">
            <Canvas camera={{ position: [8, 6, 8], fov: 60 }}>
              <color attach="background" args={['#000510']} />
              <fog attach="fog" args={['#000510', 5, 30]} />
              <NegotiationScene agents={agents} resources={resources} />
            </Canvas>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}