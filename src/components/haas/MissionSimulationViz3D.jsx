import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, AlertTriangle, TrendingUp, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

function SimulatedOutcome({ position, outcome, index }) {
  const color = outcome.success_probability > 0.7 ? '#22c55e' : 
                outcome.success_probability > 0.4 ? '#eab308' : '#ef4444';
  
  return (
    <group position={position}>
      <Sphere args={[0.3 + outcome.success_probability * 0.5, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.8}
        />
      </Sphere>
      <Text position={[0, 0.8, 0]} fontSize={0.15} color="white">
        {Math.round(outcome.success_probability * 100)}%
      </Text>
    </group>
  );
}

export default function MissionSimulationViz3D() {
  const [simulating, setSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);

  const { data: missions } = useQuery({
    queryKey: ['activeMissions'],
    queryFn: () => base44.entities.MissionCommand.filter({ mission_status: 'active' }),
    initialData: []
  });

  const runSimulation = async () => {
    if (missions.length === 0) return;
    
    setSimulating(true);
    try {
      const response = await base44.functions.invoke('missionOutcomeSimulator', {
        mission_id: missions[0].command_id,
        proposed_tasks: missions[0].task_assignments || [],
        environmental_conditions: missions[0].environmental_analysis || {}
      });
      setSimulationResults(response.data.simulation_results);
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
      <Card className="bg-gradient-to-br from-orange-950/40 via-black/60 to-red-950/40 backdrop-blur-xl border-orange-500/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <PlayCircle className="w-6 h-6 text-orange-400" />
              Mission Outcome Simulator
            </div>
            <Button
              onClick={runSimulation}
              disabled={simulating || missions.length === 0}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {simulating ? 'Simulating...' : 'Run Simulation'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] rounded-lg bg-black/60 mb-4 overflow-hidden">
            <Canvas camera={{ position: [0, 3, 10], fov: 60 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[5, 5, 5]} intensity={1.5} color="#f97316" />
              
              {simulationResults && (
                <>
                  {/* Central mission node */}
                  <Sphere args={[0.6, 64, 64]} position={[0, 0, 0]}>
                    <meshStandardMaterial
                      color="#f97316"
                      emissive="#f97316"
                      emissiveIntensity={1}
                      metalness={0.9}
                    />
                  </Sphere>
                  
                  {/* Simulated outcomes */}
                  {[
                    { success_probability: simulationResults.success_probability, label: 'Optimal' },
                    { success_probability: simulationResults.success_probability * 0.85, label: 'Degraded' },
                    { success_probability: simulationResults.success_probability * 0.6, label: 'Risk' }
                  ].map((outcome, idx) => {
                    const angle = (idx * Math.PI * 2) / 3;
                    const pos = [Math.cos(angle) * 4, Math.sin(angle * 0.5), Math.sin(angle) * 4];
                    return (
                      <React.Fragment key={idx}>
                        <SimulatedOutcome position={pos} outcome={outcome} index={idx} />
                        <Line points={[[0, 0, 0], pos]} color="#f97316" lineWidth={2} opacity={0.5} />
                      </React.Fragment>
                    );
                  })}
                </>
              )}
              
              <OrbitControls enableDamping autoRotate autoRotateSpeed={0.5} />
            </Canvas>
          </div>

          {simulationResults && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-white text-xs font-bold">Success Probability</span>
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    {Math.round(simulationResults.success_probability * 100)}%
                  </div>
                </div>

                <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-white text-xs font-bold">Risk Factors</span>
                  </div>
                  <div className="text-2xl font-bold text-red-400">
                    {simulationResults.risk_factors?.length || 0}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-white font-bold text-sm">Top Risks:</div>
                {simulationResults.risk_factors?.slice(0, 3).map((risk, idx) => (
                  <div key={idx} className="bg-red-950/20 border border-red-500/20 rounded p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-xs font-bold">{risk.risk_type}</span>
                      <Badge className="bg-red-600 text-[10px]">
                        {Math.round(risk.severity * 100)}% severity
                      </Badge>
                    </div>
                    <div className="text-gray-300 text-xs">{risk.mitigation}</div>
                  </div>
                ))}
              </div>

              {simulationResults.contingency_plans && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Shield className="w-4 h-4 text-blue-400" />
                    Contingency Plans:
                  </div>
                  {simulationResults.contingency_plans.slice(0, 2).map((plan, idx) => (
                    <div key={idx} className="bg-blue-950/20 border border-blue-500/20 rounded p-2">
                      <div className="text-blue-300 text-xs font-bold mb-1">
                        {plan.trigger_condition}
                      </div>
                      <div className="text-gray-300 text-xs">{plan.action_plan}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}