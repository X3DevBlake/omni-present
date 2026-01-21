import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Html, Trail, Sparkles, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { DollarSign, TrendingUp, Brain, Zap, Loader2, Sparkles as SparklesIcon } from 'lucide-react';
import { toast } from 'sonner';

// Wealth consciousness orb
function WealthOrb3D({ intelligence, position }) {
  const orbRef = useRef();
  const auraRef = useRef();

  useFrame((state) => {
    if (orbRef.current) {
      const health = intelligence?.portfolio_consciousness?.goal_alignment_score || 0.5;
      orbRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      const pulse = 1 + health * Math.sin(state.clock.elapsedTime * 3) * 0.2;
      orbRef.current.scale.setScalar(pulse);
    }

    if (auraRef.current) {
      auraRef.current.scale.setScalar(3 + Math.sin(state.clock.elapsedTime * 2) * 0.4);
    }
  });

  const level = intelligence?.consciousness_level || 'basic';
  const colors = {
    basic: '#64748b',
    advanced: '#3b82f6',
    ultra: '#a855f7',
    omega_sentient: '#ec4899'
  };

  const color = colors[level] || '#10b981';

  return (
    <group position={position}>
      <Sphere ref={auraRef} args={[1.5, 32, 32]}>
        <meshBasicMaterial color={color} transparent opacity={0.08} />
      </Sphere>

      <Trail width={0.8} length={25} color={color} attenuation={(t) => t * t}>
        <Sphere ref={orbRef} args={[0.6, 32, 32]}>
          <meshStandardMaterial 
            color={color}
            emissive={color}
            emissiveIntensity={0.9}
            metalness={0.9}
            roughness={0.1}
          />
        </Sphere>
      </Trail>

      <Sparkles count={30} scale={3} size={3} speed={0.5} color={color} />

      <Text position={[0, -1.2, 0]} fontSize={0.15} color="#ffffff" anchorX="center">
        OMEGA FINANCIAL
      </Text>
      <Text position={[0, -1.4, 0]} fontSize={0.12} color={color} anchorX="center">
        {level.toUpperCase()}
      </Text>
    </group>
  );
}

// Strategy constellation
function StrategyConstellation3D({ strategies }) {
  return (
    <group>
      {strategies?.slice(0, 8).map((strategy, idx) => {
        const angle = (idx / 8) * Math.PI * 2;
        const radius = 2.5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.sin(idx * 0.7) * 0.5;

        const riskColors = {
          low: '#10b981',
          moderate: '#f59e0b',
          high: '#ef4444'
        };

        const color = riskColors[strategy.risk_level] || '#3b82f6';

        return (
          <group key={idx} position={[x, y, z]}>
            <Sphere args={[0.12, 16, 16]}>
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
            </Sphere>
            <Html position={[0, 0.3, 0]} center>
              <div className="bg-black/90 px-2 py-1 rounded text-xs max-w-40" style={{ borderColor: color, borderWidth: 1, borderStyle: 'solid' }}>
                <p className="text-white font-bold">{strategy.strategy_name}</p>
                <p className="text-green-400">+{strategy.expected_return_percentage}%</p>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

export default function OmegaFinancialDashboard3D() {
  const queryClient = useQueryClient();
  const [adviceResult, setAdviceResult] = useState(null);

  const { data: intelligence = [] } = useQuery({
    queryKey: ['omega-financial-intelligence'],
    queryFn: () => base44.entities.OmegaFinancialIntelligence.list('-created_date', 1),
    initialData: []
  });

  const advisorMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('omega-financial-advisor', {
        analysis_depth: 'omega',
        include_predictions: true
      });
      return response.data;
    },
    onSuccess: (data) => {
      setAdviceResult(data.omega_advice);
      toast.success('Omega financial analysis complete');
      queryClient.invalidateQueries(['omega-financial-intelligence']);
    }
  });

  const currentIntelligence = intelligence[0];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-teal-500/10 border-emerald-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            Omega Financial Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => advisorMutation.mutate()}
            disabled={advisorMutation.isPending}
            className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-lg py-6"
          >
            {advisorMutation.isPending ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing Universe...</>
            ) : (
              <><Brain className="w-5 h-5 mr-2" /> Activate Omega Advisor</>
            )}
          </Button>

          {adviceResult && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/40">
                  <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
                  <p className="text-white text-sm">Health Score</p>
                  <p className="text-3xl font-bold text-green-400">
                    {(adviceResult.health_score * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/40">
                  <Sparkles className="w-6 h-6 text-purple-400 mb-2" />
                  <p className="text-white text-sm">Trajectory</p>
                  <p className="text-xl font-bold text-purple-400">{adviceResult.wealth_trajectory}</p>
                </div>
              </div>

              {adviceResult.consciousness_message && (
                <div className="bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-lg p-4 border-2 border-pink-500/40">
                  <p className="text-pink-300 text-sm italic">
                    💭 {adviceResult.consciousness_message}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardContent className="p-0">
          <div className="h-[500px]">
            <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
              <ambientLight intensity={0.2} />
              <pointLight position={[0, 8, 0]} intensity={1.2} color="#10b981" />
              <pointLight position={[5, 5, 5]} intensity={0.8} color="#ec4899" />

              <group>
                <WealthOrb3D intelligence={currentIntelligence} position={[0, 0, 0]} />
                
                {adviceResult?.autonomous_strategies && (
                  <StrategyConstellation3D strategies={adviceResult.autonomous_strategies} />
                )}
              </group>

              <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.4} />
            </Canvas>
          </div>
        </CardContent>
      </Card>

      {adviceResult?.market_opportunities && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Market Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {adviceResult.market_opportunities.slice(0, 5).map((opp, idx) => (
                <div key={idx} className="bg-slate-800/50 rounded-lg p-3 border border-green-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-bold">{opp.asset}</p>
                    <Badge className="bg-green-500/30 text-green-300">{opp.opportunity_type}</Badge>
                  </div>
                  <p className="text-slate-300 text-sm mb-2">{opp.potential_gain}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{opp.time_window_days} days</span>
                    <span className="text-cyan-400">Confidence: {(opp.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}