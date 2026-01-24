import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lightbulb, Loader2, TrendingUp, Zap } from 'lucide-react';
import { toast } from 'sonner';

function ProtocolOrb({ protocol, position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.15 + 1;
      meshRef.current.scale.setScalar(pulse * protocol.protocol_maturity);
    }
  });

  const statusColor = {
    'proposed': '#3b82f6',
    'testing': '#eab308',
    'validated': '#22c55e',
    'deployed': '#8b5cf6'
  }[protocol.status] || '#3b82f6';

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <dodecahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={1.5}
        />
      </mesh>
      <Html distanceFactor={10}>
        <div className="bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          <div className="font-bold text-cyan-400">{protocol.protocol_name}</div>
          <div className="text-gray-400">Maturity: {(protocol.protocol_maturity * 100).toFixed(0)}%</div>
        </div>
      </Html>
    </group>
  );
}

export default function ProtocolProposalVisualizer3D() {
  const [selectedAgent, setSelectedAgent] = useState('');
  const queryClient = useQueryClient();

  const { data: agents = [] } = useQuery({
    queryKey: ['autonomous-agents'],
    queryFn: () => base44.entities.AutonomousInterstellarAgent.list('-created_date', 10)
  });

  const { data: protocols = [] } = useQuery({
    queryKey: ['proposed-protocols'],
    queryFn: () => base44.entities.ProposedCommunicationProtocol.list('-created_date', 20),
    refetchInterval: 5000
  });

  const proposeProtocols = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('interstellar/protocolProposalEngine', {
        agentId: selectedAgent
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Agent proposed ${data.protocols_proposed} innovative protocols!`);
      queryClient.invalidateQueries({ queryKey: ['proposed-protocols'] });
    }
  });

  const validatedProtocols = protocols.filter(p => p.status === 'validated');
  const testingProtocols = protocols.filter(p => p.status === 'testing');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-gray-900 to-cyan-900/30 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-cyan-400" />
            Autonomous Protocol Innovation Engine
          </CardTitle>
          <div className="flex gap-3 mt-4 items-center">
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="w-64 bg-gray-800/50 border-cyan-500/30">
                <SelectValue placeholder="Select autonomous agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map(a => (
                  <SelectItem key={a.agent_id} value={a.agent_id}>
                    {a.agent_name} ({a.specialization})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => proposeProtocols.mutate()}
              disabled={!selectedAgent || proposeProtocols.isPending}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {proposeProtocols.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Propose Protocols
                </>
              )}
            </Button>
          </div>
          <div className="flex gap-3 mt-3">
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
              {protocols.length} Total Protocols
            </Badge>
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
              {validatedProtocols.length} Validated
            </Badge>
            <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
              {testingProtocols.length} Testing
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 3D Protocol Network */}
          <div className="h-[400px] bg-black/50 rounded-lg overflow-hidden">
            <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
              <ambientLight intensity={0.3} />
              <pointLight position={[5, 5, 5]} intensity={1} color="#06b6d4" />
              <pointLight position={[-5, -5, -5]} intensity={0.5} color="#3b82f6" />

              {protocols.slice(0, 12).map((protocol, idx) => {
                const angle = (idx / 12) * Math.PI * 2;
                const radius = 4 + (protocol.protocol_maturity * 2);
                const position = [
                  Math.cos(angle) * radius,
                  Math.sin(idx * 0.5) * 1.5,
                  Math.sin(angle) * radius
                ];
                
                return (
                  <ProtocolOrb
                    key={protocol.id}
                    protocol={protocol}
                    position={position}
                  />
                );
              })}

              <OrbitControls enableDamping dampingFactor={0.05} />
            </Canvas>
          </div>

          {/* Protocol Details */}
          <div className="space-y-3">
            {protocols.slice(0, 3).map((protocol) => (
              <div key={protocol.id} className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-white">{protocol.protocol_name}</div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                      {protocol.status}
                    </Badge>
                    <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                      {(protocol.protocol_maturity * 100).toFixed(0)}% mature
                    </Badge>
                  </div>
                </div>

                {protocol.real_time_performance && protocol.real_time_performance.simulations_tested > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="bg-blue-500/10 rounded p-2">
                      <div className="text-blue-400">Success Rate</div>
                      <div className="text-white font-bold">{(protocol.real_time_performance.success_rate * 100).toFixed(0)}%</div>
                    </div>
                    <div className="bg-green-500/10 rounded p-2">
                      <div className="text-green-400">Tests Run</div>
                      <div className="text-white font-bold">{protocol.real_time_performance.simulations_tested}</div>
                    </div>
                  </div>
                )}

                {protocol.learning_iterations && protocol.learning_iterations.length > 0 && (
                  <div className="bg-purple-500/10 rounded p-3">
                    <div className="text-xs text-purple-400 font-semibold mb-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Learning Progress ({protocol.learning_iterations.length} iterations):
                    </div>
                    <div className="text-xs text-gray-300">
                      Latest: {protocol.learning_iterations[protocol.learning_iterations.length - 1]?.learned_insight}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}