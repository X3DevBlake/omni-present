import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Torus, Html, Float, Trail, Sparkles } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Coins, Zap, TrendingUp, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Liquidity pool orb with yield visualization
function LiquidityPoolOrb3D({ pool, position }) {
  const orbRef = useRef();
  const torusRef = useRef();

  useFrame((state) => {
    if (orbRef.current) {
      orbRef.current.rotation.y = state.clock.elapsedTime * 0.4;
    }
    if (torusRef.current) {
      torusRef.current.rotation.x = state.clock.elapsedTime * 0.6;
      torusRef.current.rotation.z = state.clock.elapsedTime * 0.3;
    }
  });

  const apy = pool.apy || 0;
  const color = apy > 50 ? '#10b981' : apy > 20 ? '#3b82f6' : '#64748b';

  return (
    <group position={position}>
      <Float speed={2} floatIntensity={0.4}>
        <Sphere ref={orbRef} args={[0.2, 24, 24]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
        </Sphere>
      </Float>

      <Torus ref={torusRef} args={[0.3, 0.03, 16, 32]}>
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </Torus>

      <Sparkles count={Math.floor(apy / 5)} scale={0.8} size={2} speed={0.4} color={color} />

      <Html position={[0.4, 0, 0]} center={false}>
        <div className="bg-black/90 px-3 py-2 rounded-lg border-2 min-w-32" style={{ borderColor: color }}>
          <p className="text-white font-bold text-xs">{pool.protocol || 'Pool'}</p>
          <p className="text-lg font-bold" style={{ color }}>{apy}%</p>
          <p className="text-slate-400 text-xs">APY</p>
        </div>
      </Html>
    </group>
  );
}

export default function SentientDeFiController3D() {
  const queryClient = useQueryClient();
  const [strategyResult, setStrategyResult] = useState(null);

  const { data: orchestrator = [] } = useQuery({
    queryKey: ['sentient-defi-orchestrator'],
    queryFn: () => base44.entities.SentientDeFiOrchestrator.list('-created_date', 1),
    initialData: []
  });

  const strategyMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('sentient-defi-strategist', {
        strategy_goal: 'maximize_yield',
        risk_tolerance: 'moderate'
      });
      return response.data;
    },
    onSuccess: (data) => {
      setStrategyResult(data.sentient_strategy);
      toast.success('Sentient DeFi strategy generated');
      queryClient.invalidateQueries(['sentient-defi-orchestrator']);
    }
  });

  const currentOrchestrator = orchestrator[0];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Coins className="w-6 h-6 text-purple-400" />
            Sentient DeFi Orchestrator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => strategyMutation.mutate()}
            disabled={strategyMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-lg py-6"
          >
            {strategyMutation.isPending ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Computing Strategies...</>
            ) : (
              <><Zap className="w-5 h-5 mr-2" /> Generate Omega Strategies</>
            )}
          </Button>

          {strategyResult && (
            <div className="mt-4 space-y-3">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/40">
                <p className="text-green-300 font-bold mb-2">{strategyResult.primary_strategy?.name}</p>
                <p className="text-slate-300 text-sm mb-2">{strategyResult.primary_strategy?.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-green-400 font-bold text-xl">{strategyResult.primary_strategy?.expected_apy}% APY</span>
                  <Badge className="bg-orange-500/30">Risk: {strategyResult.primary_strategy?.risk_score?.toFixed(1)}</Badge>
                </div>
              </div>

              {strategyResult.consciousness_recommendation && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                  <p className="text-purple-300 text-sm italic">💭 {strategyResult.consciousness_recommendation}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardContent className="p-0">
          <div className="h-[450px]">
            <Canvas camera={{ position: [0, 3, 7], fov: 50 }}>
              <ambientLight intensity={0.25} />
              <pointLight position={[5, 8, 5]} intensity={1} color="#a855f7" />
              <pointLight position={[-5, 6, -5]} intensity={0.8} color="#ec4899" />

              <group>
                {strategyResult?.yield_opportunities && (
                  <>
                    {strategyResult.yield_opportunities.slice(0, 6).map((pool, idx) => {
                      const angle = (idx / 6) * Math.PI * 2;
                      const radius = 2;
                      return (
                        <LiquidityPoolOrb3D
                          key={idx}
                          pool={pool}
                          position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
                        />
                      );
                    })}
                  </>
                )}
              </group>

              <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.6} />
            </Canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}