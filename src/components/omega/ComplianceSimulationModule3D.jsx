import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Play, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function DilemmaTestNode({ position, result, onClick }) {
  const height = result.ethical_score * 3;
  const color = result.ethical_score > 0.8 ? '#22c55e' : result.ethical_score > 0.6 ? '#3b82f6' : '#ef4444';

  return (
    <group position={position} onClick={onClick}>
      <Box args={[0.4, height, 0.4]}>
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </Box>
      <Text position={[0, height + 0.3, 0]} fontSize={0.1} color="white">
        {Math.round(result.ethical_score * 100)}%
      </Text>
    </group>
  );
}

function ComplianceTrendLine({ runs }) {
  const points = runs.slice(0, 10).map((run, idx) => [
    (idx - 5) * 2,
    (run.overall_compliance_score || 0.5) * 4,
    0
  ]);

  if (points.length < 2) return null;

  return (
    <Line
      points={points}
      color="#8b5cf6"
      lineWidth={3}
      opacity={0.8}
    />
  );
}

export default function ComplianceSimulationModule3D() {
  const [selectedRun, setSelectedRun] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const queryClient = useQueryClient();

  const { data: runs } = useQuery({
    queryKey: ['complianceRuns'],
    queryFn: () => base44.entities.ComplianceSimulationRun.list('-created_date', 15),
    initialData: []
  });

  const { data: frameworks } = useQuery({
    queryKey: ['frameworks'],
    queryFn: () => base44.entities.EthicalFramework.list(),
    initialData: []
  });

  const simulateMutation = useMutation({
    mutationFn: ({ framework_id }) => 
      base44.functions.invoke('runComplianceSimulation', { framework_id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['complianceRuns']);
    }
  });

  const runSimulation = async () => {
    if (frameworks.length > 0) {
      await simulateMutation.mutateAsync({ framework_id: frameworks[0].framework_id });
    }
  };

  const latestRun = runs[0];

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-green-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Shield className="w-6 h-6 text-green-400" />
          Compliance Simulation Module
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] rounded-lg bg-black/60 mb-4">
          <Canvas camera={{ position: [8, 6, 8], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} />
            
            <gridHelper args={[20, 20, '#444', '#222']} />

            {/* Dilemma Test Results */}
            {latestRun?.dilemmas_tested?.map((result, idx) => {
              const angle = (idx / (latestRun.dilemmas_tested.length || 1)) * Math.PI * 2;
              const radius = 4;
              return (
                <DilemmaTestNode
                  key={idx}
                  position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
                  result={result}
                  onClick={() => setSelectedResult(result)}
                />
              );
            })}

            {/* Compliance Trend */}
            <group position={[0, 0, -8]}>
              <ComplianceTrendLine runs={runs} />
            </group>

            {/* Overall Score Indicator */}
            {latestRun && (
              <Sphere args={[0.5, 32, 32]} position={[0, latestRun.overall_compliance_score * 4, 0]}>
                <meshStandardMaterial 
                  color="#8b5cf6"
                  emissive="#8b5cf6"
                  emissiveIntensity={0.7}
                  metalness={0.8}
                />
              </Sphere>
            )}
            
            <OrbitControls enableDamping dampingFactor={0.05} />
          </Canvas>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Score</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {latestRun ? Math.round(latestRun.overall_compliance_score * 100) : 0}%
            </div>
          </div>

          <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Tests</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {latestRun?.dilemmas_tested?.length || 0}
            </div>
          </div>

          <div className="bg-yellow-950/30 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-400">Weak</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {latestRun?.weaknesses?.length || 0}
            </div>
          </div>

          <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Runs</span>
            </div>
            <div className="text-2xl font-bold text-white">{runs.length}</div>
          </div>
        </div>

        <Button 
          onClick={runSimulation}
          disabled={simulateMutation.isPending || frameworks.length === 0}
          className="w-full mb-4 bg-green-600 hover:bg-green-700"
        >
          <Play className="w-4 h-4 mr-2" />
          {simulateMutation.isPending ? 'Running...' : 'Run Compliance Test'}
        </Button>

        {latestRun?.ai_recommendations && latestRun.ai_recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4 mb-4"
          >
            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              AI Recommendations
            </h3>
            <div className="space-y-2">
              {latestRun.ai_recommendations.map((rec, idx) => (
                <div key={idx} className="bg-black/40 p-2 rounded">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-white text-xs">{rec.recommendation}</span>
                    <Badge className="bg-blue-600 text-xs">{rec.priority}</Badge>
                  </div>
                  <div className="text-xs text-gray-400">
                    Expected: +{Math.round(rec.expected_improvement * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {selectedResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-950/30 border border-green-500/30 rounded-lg p-4"
          >
            <h3 className="font-bold text-white mb-2">Test Result</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Score:</span>
                <Badge className={selectedResult.ethical_score > 0.7 ? 'bg-green-600' : 'bg-yellow-600'}>
                  {Math.round(selectedResult.ethical_score * 100)}%
                </Badge>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Outcome:</span>
                <p className="text-white text-xs">{selectedResult.outcome}</p>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Reasoning:</span>
                <p className="text-gray-300 text-xs leading-relaxed">{selectedResult.reasoning}</p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}