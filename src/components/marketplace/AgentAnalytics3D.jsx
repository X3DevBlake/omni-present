import React, { useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Text, Sphere } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { TrendingUp, Activity, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

function PerformanceNode({ data, position, index }) {
  const meshRef = React.useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.15;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  const successRate = data.success_rate || 0;
  const color = successRate > 80 ? '#22c55e' : successRate > 50 ? '#eab308' : '#ef4444';

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          metalness={0.8}
        />
      </Sphere>
      <Text position={[0, 0.6, 0]} fontSize={0.15} color="white">
        {successRate.toFixed(0)}%
      </Text>
    </group>
  );
}

function TrendLine({ points, color }) {
  return (
    <Line
      points={points}
      color={color}
      lineWidth={3}
    />
  );
}

export default function AgentAnalytics3D({ agentId }) {
  const [selectedMetric, setSelectedMetric] = useState('success_rate');

  const { data: performanceHistory } = useQuery({
    queryKey: ['agent-deep-dive', agentId],
    queryFn: async () => {
      // Use the new detailed analytics function
      const response = await base44.functions.invoke('analytics/agentDeepDive', {
        agent_id: agentId
      });
      // Map the new data structure to what the component expects, or enhance component to use new data
      return response.data;
    },
    enabled: !!agentId,
    initialData: { history: [], predictions: {}, insights: [], kpis: [], comparative_analysis: {} }
  });

  const trendPoints = performanceHistory.history?.slice(0, 10).map((point, i) => [
    i * 0.8 - 4,
    (point[selectedMetric] || 0) / 20 - 2,
    0
  ]) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gradient-to-br from-indigo-950/40 via-black/60 to-purple-950/40 backdrop-blur-xl border-indigo-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="w-6 h-6 text-indigo-400" />
            Performance Analytics & Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3 mb-6">
            {['success_rate', 'utilization', 'response_time', 'quality_score'].map((metric) => (
              <Button
                key={metric}
                variant={selectedMetric === metric ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMetric(metric)}
                className={selectedMetric === metric ? 'bg-indigo-600' : 'border-white/20'}
              >
                {metric.replace('_', ' ')}
              </Button>
            ))}
          </div>

          <div className="h-[400px] rounded-lg bg-black/60 mb-6 overflow-hidden">
            <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
              <ambientLight intensity={0.6} />
              <pointLight position={[5, 5, 5]} intensity={1.5} color="#6366f1" />
              <pointLight position={[-5, -5, -5]} intensity={0.8} color="#a855f7" />

              {/* Performance nodes */}
              {performanceHistory.history?.slice(0, 10).map((data, i) => {
                const angle = (i / 10) * Math.PI * 2;
                const radius = 4;
                return (
                  <PerformanceNode
                    key={i}
                    data={data}
                    position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
                    index={i}
                  />
                );
              })}

              {/* Trend line */}
              {trendPoints.length > 1 && (
                <TrendLine points={trendPoints} color="#6366f1" />
              )}

              <OrbitControls enableDamping autoRotate autoRotateSpeed={0.5} />
            </Canvas>
          </div>

          {/* AI Predictions */}
          {performanceHistory.predictions && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-4">
                <TrendingUp className="w-5 h-5 text-green-400 mb-2" />
                <div className="text-white text-xs mb-1">Predicted Success</div>
                <div className="text-2xl font-bold text-green-400">
                  {performanceHistory.predictions.next_30_days_success_rate?.toFixed(1)}%
                </div>
              </div>

              <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
                <Target className="w-5 h-5 text-blue-400 mb-2" />
                <div className="text-white text-xs mb-1">Utilization Trend</div>
                <div className="text-2xl font-bold text-blue-400">
                  {performanceHistory.predictions.utilization_trend > 0 ? '+' : ''}
                  {performanceHistory.predictions.utilization_trend?.toFixed(1)}%
                </div>
              </div>

              <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-4">
                <Zap className="w-5 h-5 text-purple-400 mb-2" />
                <div className="text-white text-xs mb-1">Performance Score</div>
                <div className="text-2xl font-bold text-purple-400">
                  {performanceHistory.predictions.overall_score?.toFixed(0)}
                </div>
              </div>
            </div>
          )}

          {/* Detailed KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {performanceHistory.kpis?.map((kpi, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors">
                <div className="text-gray-400 text-xs">{kpi.name}</div>
                <div className="text-xl font-bold text-white mt-1">{kpi.value}</div>
                <div className={`text-xs mt-1 ${kpi.trend === 'up' ? 'text-green-400' : kpi.trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                  {kpi.info}
                </div>
              </div>
            ))}
          </div>

          {/* AI Insights from Deep Dive */}
          {performanceHistory.ai_insights?.length > 0 && (
            <div className="space-y-2">
              <div className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" /> AI-Driven Optimization Insights
              </div>
              {performanceHistory.ai_insights.map((insight, i) => (
                <div key={i} className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-300">{insight.type}</Badge>
                    <span className="text-xs text-gray-400">Impact: {insight.impact}</span>
                  </div>
                  <p className="text-white/80 text-sm">{insight.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}