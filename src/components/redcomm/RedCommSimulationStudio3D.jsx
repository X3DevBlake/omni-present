import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Play, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function SimulatedNetworkNode({ position, health, isFailing }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      if (isFailing) {
        const flicker = Math.random() > 0.7 ? 1 : 0.3;
        meshRef.current.scale.setScalar(flicker);
      }
    }
  });

  const color = isFailing ? '#ef4444' : health > 70 ? '#22c55e' : health > 40 ? '#eab308' : '#f97316';

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isFailing ? 2 : 1}
        />
      </mesh>
      {isFailing && (
        <Html distanceFactor={10}>
          <div className="bg-red-500/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            FAILURE
          </div>
        </Html>
      )}
    </group>
  );
}

export default function RedCommSimulationStudio3D() {
  const [scenarioName, setScenarioName] = useState('High Interference Test');
  const [interferenceLevel, setInterferenceLevel] = useState([50]);
  const [failureRate, setFailureRate] = useState([10]);
  const [bandwidthConstraint, setBandwidthConstraint] = useState([80]);
  const [latencyMultiplier, setLatencyMultiplier] = useState([2]);
  const [solarStorm, setSolarStorm] = useState([5]);
  
  const queryClient = useQueryClient();

  const { data: scenarios = [] } = useQuery({
    queryKey: ['redcomm-simulations'],
    queryFn: () => base44.entities.RedCommSimulationScenario.list('-created_date', 10),
    refetchInterval: 5000
  });

  const { data: devices = [] } = useQuery({
    queryKey: ['redcomm-sim-devices'],
    queryFn: () => base44.entities.RedCommDevice.list('-created_date', 10)
  });

  const createAndRunSimulation = useMutation({
    mutationFn: async () => {
      // Create scenario
      const scenario = await base44.entities.RedCommSimulationScenario.create({
        scenario_id: `SIM_${Date.now()}`,
        scenario_name: scenarioName,
        network_conditions: {
          interference_level: interferenceLevel[0] / 100,
          device_failure_rate: failureRate[0] / 100,
          bandwidth_constraint: bandwidthConstraint[0],
          latency_multiplier: latencyMultiplier[0],
          solar_storm_severity: solarStorm[0]
        },
        affected_devices: devices.slice(0, 3).map(d => d.device_id),
        duration_seconds: 300,
        status: "configured"
      });

      // Run simulation
      const response = await base44.functions.invoke('redcomm/simulationEngine', {
        scenarioId: scenario.scenario_id
      });
      
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Simulation completed! Network uptime: ${data.network_performance.uptime.toFixed(1)}%`);
      queryClient.invalidateQueries({ queryKey: ['redcomm-simulations'] });
    },
    onError: (error) => {
      toast.error(`Simulation failed: ${error.message}`);
    }
  });

  const runningScenario = scenarios.find(s => s.status === 'running');
  const completedScenarios = scenarios.filter(s => s.status === 'completed');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-gray-900 to-purple-900/30 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            RedComm Network Simulation Studio
          </CardTitle>
          <p className="text-sm text-gray-400 mt-2">
            Test AI adaptive control and anomaly detection under extreme conditions
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Simulation Configuration */}
          <div className="space-y-4">
            <Input
              placeholder="Scenario Name"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="bg-gray-800/50 border-purple-500/30 text-white"
            />

            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400">Interference Level: {interferenceLevel}%</label>
                <Slider
                  value={interferenceLevel}
                  onValueChange={setInterferenceLevel}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Device Failure Rate: {failureRate}%</label>
                <Slider
                  value={failureRate}
                  onValueChange={setFailureRate}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Bandwidth Constraint: {bandwidthConstraint}%</label>
                <Slider
                  value={bandwidthConstraint}
                  onValueChange={setBandwidthConstraint}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Latency Multiplier: {latencyMultiplier}x</label>
                <Slider
                  value={latencyMultiplier}
                  onValueChange={setLatencyMultiplier}
                  min={1}
                  max={10}
                  step={0.5}
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Solar Storm Severity: {solarStorm}/10</label>
                <Slider
                  value={solarStorm}
                  onValueChange={setSolarStorm}
                  max={10}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>

            <Button
              onClick={() => createAndRunSimulation.mutate()}
              disabled={createAndRunSimulation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {createAndRunSimulation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Simulation...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Simulation
                </>
              )}
            </Button>
          </div>

          {/* 3D Preview */}
          <div className="h-[350px] bg-black/50 rounded-lg overflow-hidden">
            <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
              <ambientLight intensity={0.3} />
              <pointLight position={[5, 5, 5]} intensity={1} color="#a855f7" />

              {devices.slice(0, 5).map((device, idx) => {
                const angle = (idx / 5) * Math.PI * 2;
                const radius = 3;
                const position = [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
                const isFailing = Math.random() < (failureRate[0] / 100);
                const health = 100 - interferenceLevel[0];
                
                return (
                  <SimulatedNetworkNode
                    key={device.id}
                    position={position}
                    health={health}
                    isFailing={isFailing}
                  />
                );
              })}

              <OrbitControls enableDamping dampingFactor={0.05} />
            </Canvas>
          </div>

          {/* Completed Simulations Results */}
          {completedScenarios.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Recent Simulation Results</h3>
              {completedScenarios.slice(0, 3).map((scenario) => (
                <div key={scenario.id} className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-white">{scenario.scenario_name}</div>
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
                      <Check className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  </div>
                  
                  {scenario.simulation_results && (
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <div className="text-gray-400">Uptime</div>
                        <div className="text-green-400 font-semibold">
                          {scenario.simulation_results.network_uptime_percentage?.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">AI Interventions</div>
                        <div className="text-purple-400 font-semibold">
                          {scenario.simulation_results.ai_interventions_count}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Self-Healing</div>
                        <div className="text-cyan-400 font-semibold">
                          {(scenario.simulation_results.self_healing_success_rate * 100)?.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  )}

                  {scenario.omega_sentient_insights && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-xs text-gray-400 italic">{scenario.omega_sentient_insights}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}