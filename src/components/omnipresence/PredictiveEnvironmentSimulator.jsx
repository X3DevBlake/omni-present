import React, { useState, useMemo } from 'react';
import { Canvas, useFrame, useRef } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Play, Loader2, Thermometer, Wind, Sun, Activity, TrendingUp, AlertTriangle } from 'lucide-react';

// Temporal heatmap (showing future state)
function TemporalHeatmap3D({ sensorPrediction, timeOffset = 0 }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2 + timeOffset) * 0.05;
      meshRef.current.scale.setScalar(pulse);
      meshRef.current.material.opacity = 0.2 + Math.sin(state.clock.elapsedTime + timeOffset) * 0.05;
    }
  });

  const value = sensorPrediction.predicted_value || 50;
  const color = value > 75 ? '#ef4444' : value > 50 ? '#f59e0b' : '#3b82f6';

  return (
    <mesh ref={meshRef} position={[0, 0.02 + timeOffset * 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[1.5, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.25} />
    </mesh>
  );
}

// Predicted agent path
function PredictedAgentPath3D({ agentState, timeOffset }) {
  const pathRef = useRef();
  const pos = agentState.predicted_position || { x: 0, y: 0, z: 0 };

  useFrame((state) => {
    if (pathRef.current) {
      pathRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  const batteryColor = (agentState.battery_remaining || 100) > 30 ? '#10b981' : '#ef4444';

  return (
    <group position={[pos.x, 0.3, pos.z]}>
      <Sphere ref={pathRef} args={[0.12, 16, 16]}>
        <meshBasicMaterial color={batteryColor} transparent opacity={0.6} />
      </Sphere>
      
      <Html position={[0, 0.4, 0]} center>
        <div className="bg-black/80 px-2 py-1 rounded text-xs">
          <p className="text-white">+{timeOffset}min</p>
          <p className="text-slate-400">{agentState.predicted_activity}</p>
          <p style={{ color: batteryColor }}>{agentState.battery_remaining}%</p>
        </div>
      </Html>
    </group>
  );
}

// Simulation results scene
function SimulationScene({ prediction, selectedTimeStep }) {
  if (!prediction || !prediction.time_steps) return null;

  const timeStep = prediction.time_steps[selectedTimeStep] || prediction.time_steps[0];

  return (
    <group>
      <Box args={[12, 0.05, 10]} position={[4, 0, 3]}>
        <meshStandardMaterial color="#0a0520" />
      </Box>
      <gridHelper args={[12, 24, '#1a2a50', '#0a1530']} position={[4, 0.03, 3]} />

      {/* Temporal heatmaps */}
      {timeStep.predicted_sensors?.map((sensor, idx) => (
        <group key={idx} position={[idx * 1.5, 0, idx * 1.5]}>
          <TemporalHeatmap3D sensorPrediction={sensor} timeOffset={timeStep.time_offset_minutes} />
        </group>
      ))}

      {/* Predicted agent states */}
      {timeStep.agent_states?.map((agentState, idx) => (
        <PredictedAgentPath3D
          key={idx}
          agentState={agentState}
          timeOffset={timeStep.time_offset_minutes}
        />
      ))}

      {/* Collision risk indicators */}
      {timeStep.collision_risks?.map((risk, idx) => (
        <group key={idx} position={[idx * 2, 0.5, idx]}>
          <Sphere args={[0.1, 16, 16]}>
            <meshBasicMaterial color="#ef4444" transparent opacity={risk.probability} />
          </Sphere>
        </group>
      ))}
    </group>
  );
}

export default function PredictiveEnvironmentSimulator() {
  const [scenario, setScenario] = useState('');
  const [timeHorizon, setTimeHorizon] = useState(30);
  const [envChanges, setEnvChanges] = useState({ temperature: 0, humidity: 0, light: 0 });
  const [prediction, setPrediction] = useState(null);
  const [selectedTimeStep, setSelectedTimeStep] = useState(0);

  const simulateMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('predictive-environment-simulation', {
        simulation_scenario: scenario,
        time_horizon_minutes: timeHorizon,
        environmental_changes: envChanges,
        include_obstacles: true
      });
      return response.data;
    },
    onSuccess: (data) => {
      setPrediction(data.prediction);
      toast.success('Simulation complete');
    }
  });

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Predictive Environment Simulator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            placeholder="Describe scenario (e.g., 'What happens if temperature rises during dinner prep?')"
            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white text-sm min-h-20"
          />

          <div>
            <p className="text-slate-300 text-sm mb-2">Time Horizon: {timeHorizon} minutes</p>
            <Slider value={[timeHorizon]} onValueChange={([v]) => setTimeHorizon(v)} min={10} max={120} step={10} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-slate-300 text-xs mb-1">Temp Change</p>
              <Slider 
                value={[envChanges.temperature + 10]} 
                onValueChange={([v]) => setEnvChanges(prev => ({ ...prev, temperature: v - 10 }))} 
                min={0} 
                max={20} 
                step={1} 
              />
              <p className="text-cyan-400 text-xs mt-1">{envChanges.temperature > 0 ? '+' : ''}{envChanges.temperature}°F</p>
            </div>
            <div>
              <p className="text-slate-300 text-xs mb-1">Humidity</p>
              <Slider 
                value={[envChanges.humidity + 20]} 
                onValueChange={([v]) => setEnvChanges(prev => ({ ...prev, humidity: v - 20 }))} 
                min={0} 
                max={40} 
                step={5} 
              />
              <p className="text-cyan-400 text-xs mt-1">{envChanges.humidity > 0 ? '+' : ''}{envChanges.humidity}%</p>
            </div>
            <div>
              <p className="text-slate-300 text-xs mb-1">Light</p>
              <Slider 
                value={[envChanges.light + 50]} 
                onValueChange={([v]) => setEnvChanges(prev => ({ ...prev, light: v - 50 }))} 
                min={0} 
                max={100} 
                step={10} 
              />
              <p className="text-cyan-400 text-xs mt-1">{envChanges.light > 0 ? '+' : ''}{envChanges.light}%</p>
            </div>
          </div>

          <Button
            onClick={() => simulateMutation.mutate()}
            disabled={!scenario || simulateMutation.isPending}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600"
          >
            {simulateMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Simulating</>
            ) : (
              <><Play className="w-4 h-4 mr-2" /> Run Simulation</>
            )}
          </Button>
        </CardContent>
      </Card>

      {prediction && (
        <>
          <Card className="bg-slate-900/60 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Simulation Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                {prediction.time_steps?.map((step, idx) => (
                  <Button
                    key={idx}
                    size="sm"
                    variant={selectedTimeStep === idx ? 'default' : 'outline'}
                    onClick={() => setSelectedTimeStep(idx)}
                  >
                    +{step.time_offset_minutes}min
                  </Button>
                ))}
              </div>

              {prediction.time_steps?.[selectedTimeStep] && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <Activity className="w-5 h-5 text-green-400 mb-1" />
                    <p className="text-white text-xl font-bold">
                      {(prediction.time_steps[selectedTimeStep].task_success_probability * 100).toFixed(0)}%
                    </p>
                    <p className="text-slate-400 text-xs">Task Success</p>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <Sun className="w-5 h-5 text-blue-400 mb-1" />
                    <p className="text-white text-xl font-bold">
                      {(prediction.time_steps[selectedTimeStep].comfort_score * 100).toFixed(0)}%
                    </p>
                    <p className="text-slate-400 text-xs">Comfort</p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 mb-1" />
                    <p className="text-white text-xl font-bold">
                      {(prediction.time_steps[selectedTimeStep].safety_score * 100).toFixed(0)}%
                    </p>
                    <p className="text-slate-400 text-xs">Safety</p>
                  </div>
                </div>
              )}

              <div className="h-[400px]">
                <Canvas camera={{ position: [8, 6, 8], fov: 50 }}>
                  <ambientLight intensity={0.25} />
                  <pointLight position={[8, 10, 8]} intensity={0.8} />

                  <SimulationScene prediction={prediction} selectedTimeStep={selectedTimeStep} />

                  <OrbitControls />
                </Canvas>
              </div>
            </CardContent>
          </Card>

          {prediction.recommended_interventions?.length > 0 && (
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recommended Interventions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {prediction.recommended_interventions.map((intervention, idx) => (
                    <div key={idx} className="bg-slate-800/50 rounded-lg p-3 border border-slate-600">
                      <p className="text-white font-bold text-sm mb-1">{intervention.intervention_type}</p>
                      <p className="text-slate-300 text-xs mb-2">{intervention.description}</p>
                      <p className="text-green-400 text-xs">✓ {intervention.expected_benefit}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}