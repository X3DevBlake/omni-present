import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, TrendingUp, Sparkles, Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

function EvolutionPathNode({ evolution, position, isLatest }) {
  const [pulse, setPulse] = useState(1);

  useEffect(() => {
    if (!isLatest) return;
    const interval = setInterval(() => {
      setPulse(p => p === 1 ? 1.4 : 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLatest]);

  const score = evolution.real_world_performance?.avg_ethical_score || 0.75;
  const color = score > 0.8 ? '#22c55e' : score > 0.6 ? '#3b82f6' : '#f59e0b';

  return (
    <group position={position}>
      <Sphere args={[0.3 * pulse, 32, 32]}>
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={isLatest ? 0.8 : 0.4}
          metalness={0.8}
        />
      </Sphere>
      <Text position={[0, 0.5, 0]} fontSize={0.1} color="white">
        {evolution.version}
      </Text>
      <Text position={[0, -0.5, 0]} fontSize={0.08} color={color}>
        {Math.round(score * 100)}%
      </Text>
    </group>
  );
}

function ProposalPathLine({ from, to, approved }) {
  return (
    <Line
      points={[from, to]}
      color={approved ? '#22c55e' : '#ef4444'}
      lineWidth={approved ? 2 : 1}
      opacity={approved ? 0.8 : 0.4}
      dashed={!approved}
    />
  );
}

export default function EthicalEvolutionPathViz3D() {
  const { data: evolutions } = useQuery({
    queryKey: ['frameworkEvolutions'],
    queryFn: () => base44.entities.EthicalFrameworkEvolution.list('-created_date', 20),
    initialData: []
  });

  const { data: proposals } = useQuery({
    queryKey: ['ethicalProposals'],
    queryFn: () => base44.entities.EthicalProposal.list('-created_date', 15),
    initialData: []
  });

  // Create timeline positions
  const evolutionPositions = evolutions.map((evo, idx) => ({
    evolution: evo,
    position: [(idx - evolutions.length / 2) * 2, 
               (evo.real_world_performance?.avg_ethical_score || 0.5) * 4,
               0],
    isLatest: idx === 0
  }));

  const approvedProposals = proposals.filter(p => p.status === 'approved');
  const convergenceScore = evolutions.slice(0, 3).reduce((sum, e) => 
    sum + (e.convergence_metrics?.stability_score || 0), 0) / 3;

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-green-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <GitBranch className="w-6 h-6 text-green-400" />
          Ethical Evolution Paths
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] rounded-lg bg-black/60 mb-4">
          <Canvas camera={{ position: [0, 4, 12], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            
            <gridHelper args={[20, 20, '#444', '#222']} />

            {/* Evolution Timeline */}
            {evolutionPositions.map(({ evolution, position, isLatest }, idx) => (
              <EvolutionPathNode
                key={evolution.evolution_id}
                evolution={evolution}
                position={position}
                isLatest={isLatest}
              />
            ))}

            {/* Connection Lines */}
            {evolutionPositions.slice(0, -1).map((curr, idx) => {
              const next = evolutionPositions[idx + 1];
              return (
                <ProposalPathLine
                  key={idx}
                  from={curr.position}
                  to={next.position}
                  approved={true}
                />
              );
            })}
            
            <OrbitControls enableDamping dampingFactor={0.05} />
          </Canvas>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <GitBranch className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Evolutions</span>
            </div>
            <div className="text-2xl font-bold text-white">{evolutions.length}</div>
          </div>

          <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Converge</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {Math.round(convergenceScore * 100)}%
            </div>
          </div>

          <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Approved</span>
            </div>
            <div className="text-2xl font-bold text-white">{approvedProposals.length}</div>
          </div>
        </div>

        {latestProposal?.impact_simulation_results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-950/30 border border-green-500/30 rounded-lg p-4"
          >
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              Impact Simulation
            </h3>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-gray-400 block mb-1">Swarm:</span>
                <Badge className={latestProposal.impact_simulation_results.swarm_performance_delta > 0 ? 'bg-green-600' : 'bg-red-600'}>
                  {latestProposal.impact_simulation_results.swarm_performance_delta > 0 ? '+' : ''}
                  {Math.round(latestProposal.impact_simulation_results.swarm_performance_delta * 100)}%
                </Badge>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Planetary:</span>
                <Badge className={latestProposal.impact_simulation_results.planetary_ops_delta > 0 ? 'bg-green-600' : 'bg-red-600'}>
                  {latestProposal.impact_simulation_results.planetary_ops_delta > 0 ? '+' : ''}
                  {Math.round(latestProposal.impact_simulation_results.planetary_ops_delta * 100)}%
                </Badge>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Ethics:</span>
                <Badge className="bg-purple-600">
                  +{Math.round(latestProposal.impact_simulation_results.ethical_score_delta * 100)}%
                </Badge>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}