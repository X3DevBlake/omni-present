import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, BarChart3, Database } from 'lucide-react';

function ImpactNode({ impact, position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  const color = impact.policy_effectiveness_score > 0.8 ? '#22c55e' : 
                impact.policy_effectiveness_score > 0.6 ? '#eab308' : '#ef4444';

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
        />
      </mesh>
      <Html distanceFactor={10}>
        <div className="bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          <div className="font-bold">{impact.celestial_body}</div>
          <div className="text-green-400">{impact.time_period_months}mo</div>
        </div>
      </Html>
    </group>
  );
}

export default function LongTermImpactDashboard3D() {
  const { data: impacts = [] } = useQuery({
    queryKey: ['governance-long-term-impacts'],
    queryFn: () => base44.entities.GovernanceLongTermImpact.list('-created_date', 15),
    refetchInterval: 10000
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-gray-900 to-emerald-900/30 border-emerald-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            Long-Term Impact Analysis - Continuous Learning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 3D Impact Visualization */}
          <div className="h-[350px] bg-black/50 rounded-lg overflow-hidden">
            <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
              <ambientLight intensity={0.3} />
              <pointLight position={[5, 5, 5]} intensity={1} color="#22c55e" />

              {impacts.map((impact, idx) => {
                const angle = (idx / Math.max(impacts.length, 1)) * Math.PI * 2;
                const radius = 3;
                const position = [
                  Math.cos(angle) * radius,
                  (impact.time_period_months / 12) * 2 - 1,
                  Math.sin(angle) * radius
                ];
                
                return (
                  <ImpactNode
                    key={impact.id}
                    impact={impact}
                    position={position}
                  />
                );
              })}

              <OrbitControls enableDamping dampingFactor={0.05} />
            </Canvas>
          </div>

          {/* Impact Analysis Cards */}
          <div className="space-y-3">
            {impacts.slice(0, 3).map((impact) => (
              <div key={impact.id} className="bg-gray-800/50 rounded-lg p-4 border border-emerald-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-white">{impact.celestial_body}</div>
                    <div className="text-xs text-gray-400">{impact.time_period_months} months of data</div>
                  </div>
                  <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
                    {(impact.policy_effectiveness_score * 100).toFixed(0)}% effective
                  </Badge>
                </div>

                {impact.settlement_metrics && (
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="bg-blue-500/10 rounded p-2">
                      <div className="text-blue-400">Population Growth</div>
                      <div className="text-white font-bold">+{impact.settlement_metrics.population_growth?.toFixed(1)}%</div>
                    </div>
                    <div className="bg-green-500/10 rounded p-2">
                      <div className="text-green-400">Wellbeing Index</div>
                      <div className="text-white font-bold">{impact.settlement_metrics.citizen_wellbeing_index?.toFixed(1)}</div>
                    </div>
                    <div className="bg-purple-500/10 rounded p-2">
                      <div className="text-purple-400">Swarm Efficiency</div>
                      <div className="text-white font-bold">+{impact.swarm_operations_impact?.efficiency_change?.toFixed(1)}%</div>
                    </div>
                    <div className="bg-yellow-500/10 rounded p-2">
                      <div className="text-yellow-400">Resources</div>
                      <div className="text-white font-bold">{impact.settlement_metrics.resource_sustainability_score?.toFixed(1)}</div>
                    </div>
                  </div>
                )}

                {impact.ai_strategic_adjustments && impact.ai_strategic_adjustments.length > 0 && (
                  <div className="bg-emerald-500/10 rounded p-3 mb-2">
                    <div className="text-xs text-emerald-400 font-semibold mb-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      AI Strategic Adjustments ({impact.ai_strategic_adjustments.length}):
                    </div>
                    {impact.ai_strategic_adjustments.slice(0, 2).map((adj, idx) => (
                      <div key={idx} className="text-xs text-gray-300 mb-1">
                        • {adj.adjustment}
                      </div>
                    ))}
                  </div>
                )}

                {impact.omega_continuous_learning && (
                  <div className="bg-purple-500/10 rounded p-3">
                    <div className="text-xs text-purple-400 font-semibold mb-1 flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      Omega Learning:
                    </div>
                    <p className="text-xs text-gray-300 italic">"{impact.omega_continuous_learning}"</p>
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