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
import { BarChart3, Loader2, TrendingUp, Database } from 'lucide-react';
import { toast } from 'sonner';

function TimelineNode({ year, data, position }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const height = (data?.wellbeing_index || 50) / 20;

  return (
    <group position={position}>
      <mesh ref={meshRef} position={[0, height / 2, 0]}>
        <boxGeometry args={[0.5, height, 0.5]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
      </mesh>
      <Html distanceFactor={15}>
        <div className="bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          <div className="font-bold text-green-400">Year {year}</div>
        </div>
      </Html>
    </group>
  );
}

export default function PolicyImpactSimulator3D() {
  const [selectedPolicy, setSelectedPolicy] = useState('');
  const [timespan, setTimespan] = useState('10');
  const queryClient = useQueryClient();

  const { data: policies = [] } = useQuery({
    queryKey: ['all-policies'],
    queryFn: () => base44.entities.PlanetaryGovernancePolicy.list('-created_date', 20)
  });

  const { data: simulations = [] } = useQuery({
    queryKey: ['policy-simulations'],
    queryFn: () => base44.entities.PolicyImpactSimulation.list('-created_date', 10),
    refetchInterval: 5000
  });

  const simulate = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('planetary/policyImpactSimulator', {
        policyId: selectedPolicy,
        timespan: parseInt(timespan)
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Simulation complete with NASA data! ${data.risk_count} risks identified.`);
      queryClient.invalidateQueries({ queryKey: ['policy-simulations'] });
    }
  });

  const latestSim = simulations[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-gray-900 to-green-900/30 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-green-400" />
            Policy Impact Simulator - NASA Integrated
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="space-y-3 bg-gray-800/50 rounded-lg p-4">
            <Select value={selectedPolicy} onValueChange={setSelectedPolicy}>
              <SelectTrigger className="bg-gray-900/50 border-green-500/30">
                <SelectValue placeholder="Select policy to simulate" />
              </SelectTrigger>
              <SelectContent>
                {policies.map(p => (
                  <SelectItem key={p.policy_id} value={p.policy_id}>
                    {p.policy_name} ({p.celestial_body})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={timespan} onValueChange={setTimespan}>
              <SelectTrigger className="bg-gray-900/50 border-green-500/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Years</SelectItem>
                <SelectItem value="10">10 Years</SelectItem>
                <SelectItem value="20">20 Years</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => simulate.mutate()}
              disabled={!selectedPolicy || simulate.isPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {simulate.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Run Impact Simulation
                </>
              )}
            </Button>
          </div>

          {/* 3D Timeline */}
          {latestSim && (
            <div className="h-[400px] bg-black/50 rounded-lg overflow-hidden">
              <Canvas camera={{ position: [8, 5, 8], fov: 60 }}>
                <ambientLight intensity={0.3} />
                <pointLight position={[5, 5, 5]} intensity={1} color="#22c55e" />

                {latestSim.predicted_settlement_impact?.year_1 && (
                  <TimelineNode year={1} data={latestSim.predicted_settlement_impact.year_1} position={[-3, 0, 0]} />
                )}
                {latestSim.predicted_settlement_impact?.year_3 && (
                  <TimelineNode year={3} data={latestSim.predicted_settlement_impact.year_3} position={[-1, 0, 0]} />
                )}
                {latestSim.predicted_settlement_impact?.year_5 && (
                  <TimelineNode year={5} data={latestSim.predicted_settlement_impact.year_5} position={[1, 0, 0]} />
                )}
                {latestSim.predicted_settlement_impact?.year_10 && (
                  <TimelineNode year={10} data={latestSim.predicted_settlement_impact.year_10} position={[3, 0, 0]} />
                )}

                <OrbitControls enableDamping dampingFactor={0.05} />
              </Canvas>
            </div>
          )}

          {/* Simulation Results */}
          <div className="space-y-3">
            {simulations.slice(0, 2).map((sim) => (
              <div key={sim.id} className="bg-gray-800/50 rounded-lg p-4 border border-green-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-white">{sim.celestial_body}</div>
                  <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                    {sim.simulation_timespan_years} years
                  </Badge>
                </div>

                {sim.resource_management_forecast && (
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="bg-blue-500/10 rounded p-2">
                      <div className="text-blue-400">Water</div>
                      <div className="text-white font-bold">{sim.resource_management_forecast.water_sustainability?.toFixed(0)}%</div>
                    </div>
                    <div className="bg-green-500/10 rounded p-2">
                      <div className="text-green-400">Energy</div>
                      <div className="text-white font-bold">{sim.resource_management_forecast.energy_availability?.toFixed(0)}%</div>
                    </div>
                  </div>
                )}

                {sim.risk_factors && sim.risk_factors.length > 0 && (
                  <div className="bg-red-500/10 rounded p-3">
                    <div className="text-xs text-red-400 font-semibold mb-2">Risk Factors ({sim.risk_factors.length}):</div>
                    {sim.risk_factors.slice(0, 2).map((risk, idx) => (
                      <div key={idx} className="text-xs text-gray-300 mb-1">
                        • {risk.risk} ({risk.severity}, {(risk.probability * 100).toFixed(0)}%)
                      </div>
                    ))}
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