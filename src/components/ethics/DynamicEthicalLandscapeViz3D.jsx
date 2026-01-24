import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Compass, TrendingUp, GitMerge, Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

function EvolutionPath({ path, index }) {
  const angle = (index * Math.PI * 2) / 6;
  const radius = 3 + path.convergence_score * 2;
  const pos = [Math.cos(angle) * radius, path.convergence_score * 2, Math.sin(angle) * radius];
  
  const color = path.trajectory_type === 'convergent' ? '#22c55e' :
                path.trajectory_type === 'divergent' ? '#ef4444' : '#eab308';

  return (
    <group position={pos}>
      <Sphere args={[0.25, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          metalness={0.9}
        />
      </Sphere>
      <Text position={[0, 0.5, 0]} fontSize={0.12} color="white">
        {path.trajectory_type}
      </Text>
      <Line points={[[0, 0, 0], [0, -2, 0]]} color={color} lineWidth={2} opacity={0.4} />
    </group>
  );
}

function FeedbackLoop({ loop, index, total }) {
  const [pulse, setPulse] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => p === 1 ? 1.3 : 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const angle = (index * Math.PI * 2) / total;
  const radius = 5;
  const pos = [Math.cos(angle) * radius, -1, Math.sin(angle) * radius];

  return (
    <group position={pos}>
      <Sphere args={[0.2 * pulse, 16, 16]}>
        <meshStandardMaterial
          color={loop.stabilizing ? '#06b6d4' : '#f59e0b'}
          emissive={loop.stabilizing ? '#06b6d4' : '#f59e0b'}
          emissiveIntensity={0.6}
        />
      </Sphere>
    </group>
  );
}

export default function DynamicEthicalLandscapeViz3D() {
  const [simulating, setSimulating] = useState(false);
  const [simulation, setSimulation] = useState(null);

  const { data: frameworks } = useQuery({
    queryKey: ['ethicalFrameworks'],
    queryFn: () => base44.entities.EthicalFrameworkEvolution.list('-created_date', 5),
    initialData: []
  });

  const runSimulation = async () => {
    if (frameworks.length === 0) return;
    
    setSimulating(true);
    try {
      const response = await base44.functions.invoke('ethicalLandscapeSimulation', {
        framework_id: frameworks[0].framework_id,
        proposed_changes: {
          principles: frameworks[0].principles || []
        }
      });
      setSimulation(response.data.simulation_results);
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gradient-to-br from-violet-950/40 via-black/60 to-purple-950/40 backdrop-blur-xl border-violet-500/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Compass className="w-6 h-6 text-violet-400" />
              Dynamic Ethical Landscape
            </div>
            <Button
              onClick={runSimulation}
              disabled={simulating || frameworks.length === 0}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {simulating ? 'Simulating...' : 'Simulate Impact'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[450px] rounded-lg bg-black/60 mb-4 overflow-hidden">
            <Canvas camera={{ position: [0, 5, 12], fov: 60 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[0, 8, 0]} intensity={2} color="#8b5cf6" />
              <pointLight position={[5, 2, 5]} intensity={1} color="#a855f7" />
              
              {/* Central ethical core */}
              <Sphere args={[0.8, 64, 64]} position={[0, 0, 0]}>
                <meshStandardMaterial
                  color="#8b5cf6"
                  emissive="#8b5cf6"
                  emissiveIntensity={1.2}
                  metalness={0.9}
                  transparent
                  opacity={0.9}
                />
              </Sphere>

              {simulation && (
                <>
                  {/* Evolution paths */}
                  {simulation.evolution_paths?.map((path, idx) => (
                    <EvolutionPath key={idx} path={path} index={idx} />
                  ))}

                  {/* Feedback loops */}
                  {simulation.feedback_loops?.map((loop, idx) => (
                    <FeedbackLoop
                      key={idx}
                      loop={loop}
                      index={idx}
                      total={simulation.feedback_loops.length}
                    />
                  ))}
                </>
              )}
              
              <OrbitControls enableDamping autoRotate autoRotateSpeed={0.3} />
            </Canvas>
          </div>

          {simulation && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-white text-xs font-bold">Mission Success</span>
                  </div>
                  <div className="text-xl font-bold text-green-400">
                    {simulation.swarm_impact?.mission_success_rate_delta > 0 ? '+' : ''}
                    {(simulation.swarm_impact?.mission_success_rate_delta * 100)?.toFixed(1)}%
                  </div>
                </div>

                <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-blue-400" />
                    <span className="text-white text-xs font-bold">Compliance</span>
                  </div>
                  <div className="text-xl font-bold text-blue-400">
                    {simulation.planetary_governance_impact?.compliance_score_delta > 0 ? '+' : ''}
                    {(simulation.planetary_governance_impact?.compliance_score_delta * 100)?.toFixed(1)}%
                  </div>
                </div>

                <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <GitMerge className="w-4 h-4 text-purple-400" />
                    <span className="text-white text-xs font-bold">Convergence</span>
                  </div>
                  <div className="text-xl font-bold text-purple-400">
                    {simulation.evolution_paths?.filter(p => p.trajectory_type === 'convergent').length || 0}/{simulation.evolution_paths?.length || 0}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-white font-bold text-sm">Convergence Trends:</div>
                {simulation.convergence_trends?.slice(0, 3).map((trend, idx) => (
                  <div key={idx} className="bg-violet-950/20 border border-violet-500/20 rounded p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-xs font-bold">{trend.principle_cluster}</span>
                      <Badge className={
                        trend.trend_direction === 'converging' ? 'bg-green-600' :
                        trend.trend_direction === 'diverging' ? 'bg-red-600' : 'bg-yellow-600'
                      }>
                        {trend.trend_direction}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Velocity: {trend.convergence_velocity?.toFixed(2)}</span>
                      <span className="text-gray-400">Stability: {Math.round(trend.stability_index * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {simulation.feedback_loops && (
                <div className="space-y-2">
                  <div className="text-white font-bold text-sm">Active Feedback Loops:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {simulation.feedback_loops.slice(0, 4).map((loop, idx) => (
                      <div key={idx} className="bg-cyan-950/20 border border-cyan-500/20 rounded p-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-cyan-300 text-xs font-bold">{loop.loop_type}</span>
                          <Badge className={loop.stabilizing ? 'bg-cyan-600' : 'bg-orange-600'}>
                            {loop.stabilizing ? 'Stabilizing' : 'Destabilizing'}
                          </Badge>
                        </div>
                        <div className="text-gray-300 text-[10px]">{loop.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}