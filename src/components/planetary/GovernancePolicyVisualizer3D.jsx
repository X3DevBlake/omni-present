import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Text, Line } from '@react-three/drei';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Sparkles, Loader2, TreePine, Database } from 'lucide-react';
import { toast } from 'sonner';

function PolicyNode({ policy, position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const categoryColor = {
    'resource_allocation': '#22c55e',
    'environmental_protection': '#10b981',
    'settlement_expansion': '#3b82f6',
    'infrastructure_development': '#8b5cf6',
    'ethical_guidelines': '#ec4899',
    'trade_regulations': '#f59e0b'
  }[policy.policy_category] || '#3b82f6';

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <dodecahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial
          color={categoryColor}
          emissive={categoryColor}
          emissiveIntensity={1.5}
        />
      </mesh>
      <Html distanceFactor={10}>
        <div className="bg-black/90 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap">
          <div className="font-bold">{policy.policy_name}</div>
          <div className="text-cyan-400">Confidence: {(policy.ai_confidence * 100).toFixed(0)}%</div>
        </div>
      </Html>
    </group>
  );
}

function EvolutionPath({ stages }) {
  const points = stages.map((_, idx) => [
    Math.cos(idx * 0.5) * 3,
    idx * 0.5,
    Math.sin(idx * 0.5) * 3
  ]);

  return <Line points={points} color="#a855f7" linewidth={2} />;
}

export default function GovernancePolicyVisualizer3D() {
  const [selectedPlanet, setSelectedPlanet] = useState('Mars');
  const queryClient = useQueryClient();

  const { data: policies = [] } = useQuery({
    queryKey: ['governance-policies', selectedPlanet],
    queryFn: () => base44.entities.PlanetaryGovernancePolicy.filter({ celestial_body: selectedPlanet }, '-created_date', 10),
    refetchInterval: 5000
  });

  const generatePolicies = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('planetary/governanceAI', {
        celestialBody: selectedPlanet
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`${data.policies_proposed} governance policies proposed for ${selectedPlanet}`);
      queryClient.invalidateQueries({ queryKey: ['governance-policies'] });
    },
    onError: (error) => {
      toast.error(`Policy generation failed: ${error.message}`);
    }
  });

  const planets = ['Mars', 'Venus', 'Mercury', 'Europa', 'Titan', 'Ganymede'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-gray-900 to-green-900/30 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 flex items-center gap-2">
            <Globe className="w-6 h-6 text-green-400" />
            Planetary Governance AI - NASA Integrated
          </CardTitle>
          <div className="flex gap-3 mt-4 items-center">
            <Select value={selectedPlanet} onValueChange={setSelectedPlanet}>
              <SelectTrigger className="w-40 bg-gray-800/50 border-green-500/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {planets.map(planet => (
                  <SelectItem key={planet} value={planet}>{planet}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => generatePolicies.mutate()}
              disabled={generatePolicies.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {generatePolicies.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Generate Policies (NASA Data)
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 3D Policy Network */}
          <div className="h-[450px] bg-black/50 rounded-lg overflow-hidden">
            <Canvas camera={{ position: [0, 3, 10], fov: 60 }}>
              <ambientLight intensity={0.3} />
              <pointLight position={[5, 5, 5]} intensity={1} color="#22c55e" />
              <pointLight position={[-5, -5, -5]} intensity={0.5} color="#10b981" />

              {policies.slice(0, 8).map((policy, idx) => {
                const angle = (idx / 8) * Math.PI * 2;
                const radius = 4;
                const position = [
                  Math.cos(angle) * radius,
                  Math.sin(idx) * 1.5,
                  Math.sin(angle) * radius
                ];
                
                return (
                  <PolicyNode
                    key={policy.id}
                    policy={policy}
                    position={position}
                  />
                );
              })}

              {policies[0]?.evolution_path && (
                <EvolutionPath stages={policies[0].evolution_path} />
              )}

              <OrbitControls enableDamping dampingFactor={0.05} />
            </Canvas>
          </div>

          {/* Policy Details */}
          {policies.length > 0 ? (
            <div className="space-y-3">
              {policies.slice(0, 3).map((policy) => (
                <div key={policy.id} className="bg-gray-800/50 rounded-lg p-4 border border-green-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-white">{policy.policy_name}</div>
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
                      {policy.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-300 mb-3">{policy.policy_details}</p>

                  {/* NASA Data Integration */}
                  {policy.nasa_data_integration && (
                    <div className="bg-blue-500/10 rounded p-3 mb-3">
                      <div className="text-xs text-blue-400 font-semibold mb-2">NASA Data Integrated:</div>
                      <div className="space-y-1 text-xs text-gray-300">
                        <div>• Habitability Score: {policy.nasa_data_integration.habitability_score?.toFixed(2)}</div>
                        <div>• Geological Activity: {policy.nasa_data_integration.geological_activity}</div>
                      </div>
                    </div>
                  )}

                  {/* Simulated Impact */}
                  {policy.simulated_impact && (
                    <div className="bg-green-500/10 rounded p-3 mb-3">
                      <div className="text-xs text-green-400 font-semibold mb-2">Simulated Impact:</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400">Swarm Ops:</span>
                          <span className="text-green-400 ml-1">+{policy.simulated_impact.swarm_operations_delta}%</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Settlement:</span>
                          <span className="text-blue-400 ml-1">+{policy.simulated_impact.settlement_growth_rate}%</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Resources:</span>
                          <span className="text-yellow-400 ml-1">+{policy.simulated_impact.resource_efficiency_gain}%</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Ethics:</span>
                          <span className="text-purple-400 ml-1">{policy.simulated_impact.ethical_compliance_score?.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Omega Reasoning */}
                  {policy.omega_governance_reasoning && (
                    <div className="bg-purple-500/10 rounded p-3">
                      <div className="text-xs text-purple-400 font-semibold mb-1">Omega Governance Reasoning:</div>
                      <p className="text-xs text-gray-300 italic">"{policy.omega_governance_reasoning}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              No policies generated yet. Click "Generate Policies" to let AI analyze {selectedPlanet} using NASA data.
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}