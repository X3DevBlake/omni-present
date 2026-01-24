import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, MeshDistortMaterial, Torus } from '@react-three/drei';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Play, Loader2, Orbit, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

function WormholeVisualizer({ stability }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
    }
  });

  const color = stability > 0.7 ? '#22c55e' : stability > 0.4 ? '#eab308' : '#ef4444';

  return (
    <mesh ref={meshRef}>
      <Torus args={[2, 0.5, 16, 100]}>
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          distort={1 - stability}
          speed={5}
        />
      </Torus>
    </mesh>
  );
}

function RelativisticParticle({ velocity }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const speed = velocity * 10;
      meshRef.current.position.x = Math.sin(state.clock.elapsedTime * speed) * 3;
      meshRef.current.position.z = Math.cos(state.clock.elapsedTime * speed) * 3;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial
        color="#06b6d4"
        emissive="#06b6d4"
        emissiveIntensity={2}
      />
    </mesh>
  );
}

export default function InterstellarSimulationStudio3D() {
  const [scenarioName, setScenarioName] = useState('Wormhole Instability Test');
  const [wormholeStability, setWormholeStability] = useState([70]);
  const [relativisticVelocity, setRelativisticVelocity] = useState([30]);
  const [timeDilation, setTimeDilation] = useState([15]);
  const [gravLensing, setGravLensing] = useState([40]);
  const [cosmicRayFlux, setCosmicRayFlux] = useState([50]);

  const queryClient = useQueryClient();

  const { data: simulations = [] } = useQuery({
    queryKey: ['interstellar-simulations'],
    queryFn: () => base44.entities.InterstellarSimulation.list('-created_date', 10),
    refetchInterval: 5000
  });

  const { data: interstellarLinks = [] } = useQuery({
    queryKey: ['interstellar-links'],
    queryFn: () => base44.entities.InterstellarLink.list('-created_date', 5)
  });

  const runSimulation = useMutation({
    mutationFn: async () => {
      // Create simulation
      const simulation = await base44.entities.InterstellarSimulation.create({
        simulation_id: `ISIM_${Date.now()}`,
        simulation_name: scenarioName,
        interstellar_conditions: {
          wormhole_stability: wormholeStability[0] / 100,
          relativistic_velocity: relativisticVelocity[0] / 100,
          time_dilation_factor: 1 + (timeDilation[0] / 10),
          gravitational_lensing_severity: gravLensing[0] / 10,
          interstellar_dust_density: 0.5,
          cosmic_ray_flux: cosmicRayFlux[0]
        },
        tested_links: interstellarLinks.slice(0, 3).map(l => l.link_id),
        status: "configured"
      });

      // Run simulation
      const response = await base44.functions.invoke('interstellar/interstellarSimulationEngine', {
        simulationId: simulation.simulation_id
      });
      
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Interstellar simulation complete! Signal integrity: ${data.signal_integrity.toFixed(1)}%`);
      queryClient.invalidateQueries({ queryKey: ['interstellar-simulations'] });
    },
    onError: (error) => {
      toast.error(`Simulation failed: ${error.message}`);
    }
  });

  const completedSims = simulations.filter(s => s.status === 'completed');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-gray-900 to-blue-900/30 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center gap-2">
            <Orbit className="w-6 h-6 text-blue-400" />
            Interstellar Network Simulation Studio
          </CardTitle>
          <p className="text-sm text-gray-400 mt-2">
            Test AI adaptive systems under extreme interstellar conditions
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration */}
          <div className="space-y-4">
            <Input
              placeholder="Simulation Name"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="bg-gray-800/50 border-blue-500/30 text-white"
            />

            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400">Wormhole Stability: {wormholeStability}%</label>
                <Slider value={wormholeStability} onValueChange={setWormholeStability} max={100} step={5} className="mt-2" />
              </div>

              <div>
                <label className="text-sm text-gray-400">Relativistic Velocity: {relativisticVelocity}% c</label>
                <Slider value={relativisticVelocity} onValueChange={setRelativisticVelocity} max={99} step={1} className="mt-2" />
              </div>

              <div>
                <label className="text-sm text-gray-400">Time Dilation Factor: {(1 + timeDilation[0] / 10).toFixed(2)}x</label>
                <Slider value={timeDilation} onValueChange={setTimeDilation} max={50} step={1} className="mt-2" />
              </div>

              <div>
                <label className="text-sm text-gray-400">Gravitational Lensing: {gravLensing[0] / 10}</label>
                <Slider value={gravLensing} onValueChange={setGravLensing} max={100} step={5} className="mt-2" />
              </div>

              <div>
                <label className="text-sm text-gray-400">Cosmic Ray Flux: {cosmicRayFlux}</label>
                <Slider value={cosmicRayFlux} onValueChange={setCosmicRayFlux} max={100} step={5} className="mt-2" />
              </div>
            </div>

            <Button
              onClick={() => runSimulation.mutate()}
              disabled={runSimulation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {runSimulation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Interstellar Simulation
                </>
              )}
            </Button>
          </div>

          {/* 3D Preview */}
          <div className="h-[400px] bg-black/50 rounded-lg overflow-hidden">
            <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
              <ambientLight intensity={0.2} />
              <pointLight position={[5, 5, 5]} intensity={1} color="#06b6d4" />
              <pointLight position={[-5, -5, -5]} intensity={0.5} color="#3b82f6" />

              <WormholeVisualizer stability={wormholeStability[0] / 100} />
              
              {Array.from({ length: 5 }).map((_, idx) => (
                <RelativisticParticle key={idx} velocity={relativisticVelocity[0] / 100} />
              ))}

              <OrbitControls enableDamping dampingFactor={0.05} />
            </Canvas>
          </div>

          {/* Results */}
          {completedSims.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                Simulation Results
              </h3>
              {completedSims.slice(0, 3).map((sim) => (
                <div key={sim.id} className="bg-gray-800/50 rounded-lg p-4 border border-blue-500/20">
                  <div className="font-semibold text-white mb-2">{sim.simulation_name}</div>
                  
                  {sim.simulation_results && (
                    <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                      <div>
                        <span className="text-gray-400">Signal Integrity:</span>
                        <span className="text-green-400 font-semibold ml-2">
                          {sim.simulation_results.signal_integrity_score?.toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Latency:</span>
                        <span className="text-blue-400 font-semibold ml-2">
                          {sim.simulation_results.effective_latency_ms?.toFixed(0)}ms
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Data Loss:</span>
                        <span className="text-yellow-400 font-semibold ml-2">
                          {(sim.simulation_results.data_loss_rate * 100)?.toFixed(2)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">FTL Achieved:</span>
                        <span className={`font-semibold ml-2 ${sim.simulation_results.ftl_communication_achieved ? 'text-green-400' : 'text-red-400'}`}>
                          {sim.simulation_results.ftl_communication_achieved ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  )}

                  {sim.omega_interstellar_insights && (
                    <div className="bg-purple-500/10 rounded p-2">
                      <p className="text-xs text-gray-300 italic">"{sim.omega_interstellar_insights}"</p>
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