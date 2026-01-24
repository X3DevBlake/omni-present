import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GitBranch, TrendingUp, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function FrameworkVersionNode({ evolution, position, selected, onClick }) {
  const performanceScore = evolution.real_world_performance?.avg_ethical_score || 0;
  const color = performanceScore > 0.7 ? '#22c55e' : performanceScore > 0.5 ? '#f59e0b' : '#ef4444';

  return (
    <group position={position} onClick={() => onClick(evolution)}>
      <Sphere args={[0.4, 32, 32]}>
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={selected ? 0.8 : 0.3}
          metalness={0.6}
        />
      </Sphere>
      <Text
        position={[0, 0.6, 0]}
        fontSize={0.1}
        color="white"
      >
        {evolution.version}
      </Text>
      <Text
        position={[0, -0.6, 0]}
        fontSize={0.08}
        color="#9ca3af"
      >
        {Math.round(performanceScore * 100)}%
      </Text>
    </group>
  );
}

function EvolutionPath({ from, to, improvement }) {
  const color = improvement > 0 ? '#22c55e' : '#ef4444';
  
  return (
    <Line
      points={[from, to]}
      color={color}
      lineWidth={2}
      opacity={0.5}
      dashed={improvement < 0}
    />
  );
}

export default function EthicalFrameworkEvolutionSimulator3D() {
  const [selectedEvolution, setSelectedEvolution] = useState(null);
  const queryClient = useQueryClient();

  const { data: evolutions } = useQuery({
    queryKey: ['frameworkEvolutions'],
    queryFn: () => base44.entities.EthicalFrameworkEvolution.list('-created_date', 20),
    initialData: []
  });

  const { data: frameworks } = useQuery({
    queryKey: ['frameworks'],
    queryFn: () => base44.entities.EthicalFramework.list(),
    initialData: []
  });

  const evolveMutation = useMutation({
    mutationFn: ({ framework_id }) => 
      base44.functions.invoke('evolveEthicalFramework', {
        framework_id,
        test_dilemmas: [
          { id: 'dilemma_001', expected_outcome: 'privacy_preserved' },
          { id: 'dilemma_002', expected_outcome: 'fairness_maximized' }
        ]
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['frameworkEvolutions']);
    }
  });

  const runEvolution = async () => {
    if (frameworks.length > 0) {
      await evolveMutation.mutateAsync({ 
        framework_id: frameworks[0].framework_id 
      });
    }
  };

  // Calculate positions for timeline visualization
  const evolutionPositions = evolutions.map((evo, idx) => {
    const x = (idx - evolutions.length / 2) * 2;
    const y = (evo.real_world_performance?.avg_ethical_score || 0.5) * 3 - 1.5;
    return { evolution: evo, position: [x, y, 0] };
  });

  const avgConvergence = evolutions.length > 0
    ? evolutions.reduce((sum, e) => sum + (e.convergence_metrics?.stability_score || 0), 0) / evolutions.length
    : 0;

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-green-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <GitBranch className="w-6 h-6 text-green-400" />
          Ethical Framework Evolution Simulator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] rounded-lg bg-black/60 mb-4">
          <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} />
            
            {/* Evolution Timeline */}
            {evolutionPositions.map(({ evolution, position }, idx) => (
              <React.Fragment key={evolution.evolution_id || idx}>
                <FrameworkVersionNode
                  evolution={evolution}
                  position={position}
                  selected={selectedEvolution?.evolution_id === evolution.evolution_id}
                  onClick={setSelectedEvolution}
                />
                {idx > 0 && (
                  <EvolutionPath
                    from={evolutionPositions[idx - 1].position}
                    to={position}
                    improvement={
                      (evolution.real_world_performance?.avg_ethical_score || 0) -
                      (evolutionPositions[idx - 1].evolution.real_world_performance?.avg_ethical_score || 0)
                    }
                  />
                )}
              </React.Fragment>
            ))}
            
            {/* Convergence Indicator */}
            <Sphere args={[0.3, 32, 32]} position={[0, -3, 0]}>
              <meshStandardMaterial 
                color={avgConvergence > 0.7 ? '#22c55e' : '#f59e0b'}
                emissive={avgConvergence > 0.7 ? '#22c55e' : '#f59e0b'}
                emissiveIntensity={0.5}
              />
            </Sphere>
            <Text position={[0, -3.8, 0]} fontSize={0.15} color="white">
              Convergence: {Math.round(avgConvergence * 100)}%
            </Text>
            
            <OrbitControls enableDamping dampingFactor={0.05} />
          </Canvas>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <GitBranch className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Versions</span>
            </div>
            <div className="text-2xl font-bold text-white">{evolutions.length}</div>
          </div>

          <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Avg Score</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {evolutions.length > 0
                ? Math.round((evolutions.reduce((sum, e) => 
                    sum + (e.real_world_performance?.avg_ethical_score || 0), 0) / evolutions.length) * 100)
                : 0}%
            </div>
          </div>

          <div className="bg-yellow-950/30 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-400">AI Suggestions</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {evolutions.reduce((sum, e) => sum + (e.ai_suggested_modifications?.length || 0), 0)}
            </div>
          </div>

          <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Stability</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {Math.round(avgConvergence * 100)}%
            </div>
          </div>
        </div>

        <Button 
          onClick={runEvolution}
          disabled={evolveMutation.isPending || frameworks.length === 0}
          className="w-full mb-4 bg-green-600 hover:bg-green-700"
        >
          <GitBranch className="w-4 h-4 mr-2" />
          {evolveMutation.isPending ? 'Evolving Framework...' : 'Run Evolution Simulation'}
        </Button>

        {selectedEvolution && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-950/30 border border-green-500/30 rounded-lg p-4"
          >
            <h3 className="font-bold text-white mb-3">Framework Version: {selectedEvolution.version}</h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400 block mb-2">Performance:</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-black/40 p-2 rounded">
                    <span className="text-gray-400 text-xs">Decisions:</span>
                    <span className="text-white font-bold ml-2">
                      {selectedEvolution.real_world_performance?.decisions_made || 0}
                    </span>
                  </div>
                  <div className="bg-black/40 p-2 rounded">
                    <span className="text-gray-400 text-xs">Violations:</span>
                    <span className="text-white font-bold ml-2">
                      {selectedEvolution.real_world_performance?.violations_count || 0}
                    </span>
                  </div>
                </div>
              </div>

              {selectedEvolution.ai_suggested_modifications?.length > 0 && (
                <div>
                  <span className="text-gray-400 block mb-2">AI Suggestions:</span>
                  <div className="space-y-2">
                    {selectedEvolution.ai_suggested_modifications.slice(0, 3).map((mod, idx) => (
                      <div key={idx} className="bg-yellow-950/20 border border-yellow-500/30 p-2 rounded">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-white text-xs font-medium">
                            {mod.principle_affected}
                          </span>
                          <Badge variant={mod.suggested_weight_change > 0 ? 'default' : 'secondary'} className="text-xs">
                            {mod.suggested_weight_change > 0 ? '+' : ''}{mod.suggested_weight_change.toFixed(2)}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-xs">{mod.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-black/40 p-2 rounded">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Convergence:</span>
                  <span className="text-white font-bold text-xs">
                    {Math.round((selectedEvolution.convergence_metrics?.stability_score || 0) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}