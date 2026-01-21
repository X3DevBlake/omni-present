import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Line, Html, Trail, Sparkles } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Play, Loader2, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// Financial entity orb
function FinancialEntityOrb3D({ entity, position, type }) {
  const orbRef = useRef();

  useFrame((state) => {
    if (orbRef.current) {
      orbRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      orbRef.current.scale.setScalar(pulse);
    }
  });

  const typeColors = {
    bank: '#10b981',
    crypto: '#3b82f6',
    defi: '#a855f7',
    portfolio: '#ec4899'
  };

  const color = typeColors[type] || '#00f5ff';

  return (
    <group position={position}>
      <Trail width={0.2} length={12} color={color} attenuation={(t) => t * t}>
        <Sphere ref={orbRef} args={[0.15, 24, 24]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
        </Sphere>
      </Trail>
      <Sparkles count={10} scale={0.6} size={1} speed={0.4} color={color} />
    </group>
  );
}

// AI intervention indicator
function InterventionIndicator3D({ intervention, position }) {
  const indicatorRef = useRef();

  useFrame((state) => {
    if (indicatorRef.current) {
      indicatorRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 4) * 0.15;
    }
  });

  return (
    <group ref={indicatorRef} position={position}>
      <Box args={[0.12, 0.12, 0.12]}>
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.9} />
      </Box>
      <Html position={[0.2, 0, 0]} center={false}>
        <div className="bg-orange-500/20 border border-orange-500 px-2 py-1 rounded text-xs text-orange-300 max-w-48">
          {intervention.intervention_type}: {intervention.expected_benefit_usd > 0 ? `+$${intervention.expected_benefit_usd}` : 'Optimize'}
        </div>
      </Html>
    </group>
  );
}

export default function FinancialEcosystemSimulator3D() {
  const [scenario, setScenario] = useState('');
  const [simulationResult, setSimulationResult] = useState(null);

  const adaptiveMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('autonomous-viz-evolution', {
        hub_context: 'financial_ecosystem',
        user_engagement_data: {}
      });
      return response.data;
    }
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      adaptiveMutation.mutate();
    }, 120000);
    return () => clearInterval(interval);
  }, []);

  const simulateMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('financial-ecosystem-simulator', {
        scenario_description: scenario,
        time_horizon_days: 30,
        market_conditions: {}
      });
      return response.data;
    },
    onSuccess: (data) => {
      setSimulationResult(data.simulation);
      toast.success('Ecosystem simulation complete');
    }
  });

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-400" />
            Financial Ecosystem Simulator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            placeholder="Describe scenario (e.g., 'What if Bitcoin crashes 50% while my DeFi positions are leveraged?')"
            className="bg-slate-800 border-slate-600 text-white min-h-24"
          />

          <Button
            onClick={() => simulateMutation.mutate()}
            disabled={!scenario || simulateMutation.isPending}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-lg py-6"
          >
            {simulateMutation.isPending ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Simulating Ecosystem...</>
            ) : (
              <><Play className="w-5 h-5 mr-2" /> Run Omega Simulation</>
            )}
          </Button>

          {simulationResult && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/40">
                <DollarSign className="w-6 h-6 text-green-400 mb-2" />
                <p className="text-white text-sm">Value Change</p>
                <p className={`text-2xl font-bold ${simulationResult.predicted_outcomes?.total_value_change_usd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {simulationResult.predicted_outcomes?.total_value_change_usd >= 0 ? '+' : ''}
                  ${simulationResult.predicted_outcomes?.total_value_change_usd?.toFixed(2)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/40">
                <AlertTriangle className="w-6 h-6 text-orange-400 mb-2" />
                <p className="text-white text-sm">Risk Change</p>
                <p className="text-2xl font-bold text-orange-400">
                  {simulationResult.risk_analysis?.predicted_risk_score >= simulationResult.risk_analysis?.current_risk_score ? '+' : ''}
                  {((simulationResult.risk_analysis?.predicted_risk_score - simulationResult.risk_analysis?.current_risk_score) * 100)?.toFixed(0)}%
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {simulationResult && (
        <>
          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-0">
              <div className="h-[450px]">
                <Canvas camera={{ position: [0, 3, 6], fov: 50 }}>
                  <ambientLight intensity={0.25} />
                  <pointLight position={[5, 8, 5]} intensity={1} />

                  <group>
                    {/* Financial entities */}
                    <FinancialEntityOrb3D entity={{}} position={[-2, 0, 0]} type="bank" />
                    <FinancialEntityOrb3D entity={{}} position={[2, 0, 0]} type="crypto" />
                    <FinancialEntityOrb3D entity={{}} position={[0, 0, -2]} type="defi" />
                    <FinancialEntityOrb3D entity={{}} position={[0, 0, 2]} type="portfolio" />

                    {/* AI interventions */}
                    {simulationResult.ai_interventions?.slice(0, 4).map((intervention, idx) => (
                      <InterventionIndicator3D
                        key={idx}
                        intervention={intervention}
                        position={[idx * 1.5 - 2, 1.5, 0]}
                      />
                    ))}
                  </group>

                  <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.6} />
                </Canvas>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">AI Interventions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {simulationResult.ai_interventions?.map((intervention, idx) => (
                  <div key={idx} className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-bold text-sm">{intervention.intervention_type}</p>
                      {intervention.auto_executable && <Badge className="bg-green-500/30">Auto</Badge>}
                    </div>
                    <p className="text-slate-300 text-xs mb-2">{intervention.action}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-400">+${intervention.expected_benefit_usd}</span>
                      <span className="text-slate-400">{intervention.timing_recommendation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}