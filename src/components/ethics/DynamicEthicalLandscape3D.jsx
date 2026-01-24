import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, GitMerge, Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

function FrameworkEvolutionNode({ evolution, position, onClick }) {
  const performance = evolution.real_world_performance?.avg_ethical_score || 0.5;
  const height = performance * 4;
  const color = performance > 0.8 ? '#22c55e' : performance > 0.6 ? '#3b82f6' : '#f59e0b';

  return (
    <group position={position} onClick={() => onClick(evolution)}>
      <mesh>
        <cylinderGeometry args={[0.2, 0.2, height, 32]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>
      <Text position={[0, height / 2 + 0.3, 0]} fontSize={0.08} color="white">
        {evolution.version}
      </Text>
    </group>
  );
}

function EvolutionPath({ from, to, converging }) {
  return (
    <Line
      points={[from, to]}
      color={converging ? '#22c55e' : '#ef4444'}
      lineWidth={2}
      opacity={0.6}
    />
  );
}

export default function DynamicEthicalLandscape3D() {
  const [selectedEvolution, setSelectedEvolution] = useState(null);

  const { data: evolutions } = useQuery({
    queryKey: ['frameworkEvolutions'],
    queryFn: () => base44.entities.EthicalFrameworkEvolution.list('-created_date', 20),
    initialData: []
  });

  const { data: proposals } = useQuery({
    queryKey: ['councilProposals'],
    queryFn: () => base44.entities.AICouncilProposal.list('-created_date', 10),
    initialData: []
  });

  const evolutionPositions = evolutions.slice(0, 16).map((evo, idx) => {
    const angle = (idx / 16) * Math.PI * 2;
    const radius = 3 + (evo.convergence_metrics?.stability_score || 0) * 2;
    return {
      evolution: evo,
      position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius]
    };
  });

  const approvedProposals = proposals.filter(p => p.status === 'approved');

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-violet-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <TrendingUp className="w-6 h-6 text-violet-400" />
          Dynamic Ethical Landscape
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] rounded-lg bg-black/60 mb-4">
          <Canvas camera={{ position: [8, 8, 8], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            
            <gridHelper args={[20, 20, '#333333', '#1a1a1a']} />

            {/* Framework Evolution Nodes */}
            {evolutionPositions.map(({ evolution, position }) => (
              <FrameworkEvolutionNode
                key={evolution.evolution_id}
                evolution={evolution}
                position={position}
                onClick={setSelectedEvolution}
              />
            ))}

            {/* Evolution Paths */}
            {evolutionPositions.map(({ evolution, position: pos1 }, idx) => {
              if (evolution.parent_framework_id) {
                const parentPos = evolutionPositions.find(ep => 
                  ep.evolution.framework_id === evolution.parent_framework_id
                )?.position;
                
                if (parentPos) {
                  const converging = (evolution.convergence_metrics?.stability_score || 0) > 0.7;
                  return (
                    <EvolutionPath
                      key={`path_${idx}`}
                      from={parentPos}
                      to={pos1}
                      converging={converging}
                    />
                  );
                }
              }
              return null;
            })}

            {/* AI Council Proposed Evolution Paths */}
            {approvedProposals.slice(0, 3).map((prop, idx) => (
              <Sphere 
                key={prop.proposal_id}
                args={[0.15, 32, 32]} 
                position={[idx * 2 - 2, 3, 0]}
              >
                <meshStandardMaterial 
                  color="#a855f7"
                  emissive="#a855f7"
                  emissiveIntensity={0.9}
                  transparent
                  opacity={0.8}
                />
              </Sphere>
            ))}
            
            <OrbitControls enableDamping dampingFactor={0.05} />
          </Canvas>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-violet-950/30 border border-violet-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <GitMerge className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-gray-400">Versions</span>
            </div>
            <div className="text-2xl font-bold text-white">{evolutions.length}</div>
          </div>

          <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">AI Proposals</span>
            </div>
            <div className="text-2xl font-bold text-white">{approvedProposals.length}</div>
          </div>

          <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Avg Score</span>
            </div>
            <div className="text-xl font-bold text-white">
              {evolutions.length > 0 ? 
                Math.round((evolutions.reduce((sum, e) => sum + (e.real_world_performance?.avg_ethical_score || 0), 0) / evolutions.length) * 100) : 0}%
            </div>
          </div>
        </div>

        {selectedEvolution && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-violet-950/30 border border-violet-500/30 rounded-lg p-4"
          >
            <h3 className="font-bold text-white mb-3">{selectedEvolution.version}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Ethical Score:</span>
                <Badge className="bg-green-600">
                  {Math.round((selectedEvolution.real_world_performance?.avg_ethical_score || 0) * 100)}%
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Stability:</span>
                <Badge className="bg-blue-600">
                  {Math.round((selectedEvolution.convergence_metrics?.stability_score || 0) * 100)}%
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Decisions Made:</span>
                <span className="text-white">
                  {selectedEvolution.real_world_performance?.decisions_made || 0}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}