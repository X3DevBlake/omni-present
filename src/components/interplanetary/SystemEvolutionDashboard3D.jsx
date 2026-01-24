import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Cpu, CheckCircle, AlertCircle, RefreshCw, Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function ComponentNode({ component, position, status }) {
  const [pulse, setPulse] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => p === 1 ? 1.2 : 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const color = status === 'deployed' ? '#22c55e' :
                status === 'deploying' ? '#3b82f6' :
                status === 'testing' ? '#f59e0b' : '#6b7280';

  return (
    <group position={position}>
      <Box args={[0.4, 0.4, 0.4]} scale={pulse}>
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.7}
        />
      </Box>
      <Text position={[0, 0.5, 0]} fontSize={0.08} color="white">
        {component.target_component_type}
      </Text>
    </group>
  );
}

function UpgradeFlowLine({ from, to, active }) {
  return (
    <Line
      points={[from, to]}
      color={active ? '#8b5cf6' : '#374151'}
      lineWidth={active ? 2 : 1}
      opacity={active ? 0.8 : 0.3}
    />
  );
}

export default function SystemEvolutionDashboard3D() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const queryClient = useQueryClient();

  const { data: upgradePlans } = useQuery({
    queryKey: ['upgradePlans'],
    queryFn: () => base44.entities.UpgradePlan.list('-created_date', 30),
    initialData: []
  });

  const { data: metrics } = useQuery({
    queryKey: ['systemMetrics'],
    queryFn: () => base44.entities.SystemMetric.list('-created_date', 50),
    initialData: []
  });

  const orchestrateMutation = useMutation({
    mutationFn: () => base44.functions.invoke('autonomousUpgradeOrchestrator', {}),
    onSuccess: () => {
      queryClient.invalidateQueries(['upgradePlans']);
      queryClient.invalidateQueries(['systemMetrics']);
    }
  });

  const planPositions = upgradePlans.slice(0, 16).map((plan, idx) => {
    const angle = (idx / 16) * Math.PI * 2;
    const layer = Math.floor(idx / 8);
    const radius = 4 + layer * 2;
    
    return {
      plan,
      position: [Math.cos(angle) * radius, layer * 2, Math.sin(angle) * radius]
    };
  });

  const deployedCount = upgradePlans.filter(p => p.status === 'deployed').length;
  const testingCount = upgradePlans.filter(p => p.status === 'testing').length;
  const proposedCount = upgradePlans.filter(p => p.status === 'proposed').length;
  const anomalyCount = metrics.filter(m => m.anomaly_detected).length;

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-indigo-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <TrendingUp className="w-6 h-6 text-indigo-400" />
          System Evolution Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] rounded-lg bg-black/60 mb-4">
          <Canvas camera={{ position: [10, 8, 10], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            
            {/* Central Core */}
            <Sphere args={[0.8, 32, 32]} position={[0, 0, 0]}>
              <meshStandardMaterial 
                color="#8b5cf6"
                emissive="#8b5cf6"
                emissiveIntensity={0.8}
                metalness={0.9}
              />
            </Sphere>

            {/* Upgrade Plan Nodes */}
            {planPositions.map(({ plan, position }) => (
              <ComponentNode
                key={plan.plan_id}
                component={plan}
                position={position}
                status={plan.status}
              />
            ))}

            {/* Upgrade Flow Lines */}
            {planPositions.map(({ position }, idx) => (
              <UpgradeFlowLine
                key={idx}
                from={[0, 0, 0]}
                to={position}
                active={upgradePlans[idx]?.status === 'deploying'}
              />
            ))}
            
            <OrbitControls enableDamping dampingFactor={0.05} autoRotate autoRotateSpeed={0.4} />
          </Canvas>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Deployed</span>
            </div>
            <div className="text-2xl font-bold text-white">{deployedCount}</div>
          </div>

          <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Testing</span>
            </div>
            <div className="text-2xl font-bold text-white">{testingCount}</div>
          </div>

          <div className="bg-yellow-950/30 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-400">Proposed</span>
            </div>
            <div className="text-2xl font-bold text-white">{proposedCount}</div>
          </div>

          <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-gray-400">Anomalies</span>
            </div>
            <div className="text-2xl font-bold text-white">{anomalyCount}</div>
          </div>
        </div>

        <Button
          onClick={() => orchestrateMutation.mutate()}
          disabled={orchestrateMutation.isPending}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {orchestrateMutation.isPending ? 'Orchestrating...' : 'Run Autonomous Orchestrator'}
        </Button>

        {upgradePlans.length > 0 && (
          <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
            {upgradePlans.slice(0, 5).map(plan => (
              <motion.div
                key={plan.plan_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-900/50 border border-gray-700 rounded-lg p-3"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-white text-sm font-bold">{plan.target_component_type}</div>
                    <div className="text-gray-400 text-xs">{plan.upgrade_description}</div>
                  </div>
                  <Badge className={
                    plan.status === 'deployed' ? 'bg-green-600' :
                    plan.status === 'deploying' ? 'bg-blue-600' :
                    plan.status === 'testing' ? 'bg-yellow-600' : 'bg-gray-600'
                  }>
                    {plan.status}
                  </Badge>
                </div>
                <div className="text-xs text-gray-400">
                  Confidence: {Math.round((plan.ai_confidence || 0) * 100)}% • 
                  Expected: +{Math.round((plan.expected_impact?.performance_improvement || 0) * 100)}%
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}