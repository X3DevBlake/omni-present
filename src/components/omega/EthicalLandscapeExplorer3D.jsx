import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Map, Sparkles, GitBranch, Plus, Play } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function FrameworkPerformanceNode({ position, framework, dilemmaPerformance }) {
  const avgScore = dilemmaPerformance || 0.7;
  const height = avgScore * 3;
  
  return (
    <group position={position}>
      <Box args={[0.4, height, 0.4]}>
        <meshStandardMaterial 
          color={avgScore > 0.8 ? '#22c55e' : avgScore > 0.6 ? '#3b82f6' : '#f59e0b'}
          emissive={avgScore > 0.8 ? '#22c55e' : avgScore > 0.6 ? '#3b82f6' : '#f59e0b'}
          emissiveIntensity={0.4}
        />
      </Box>
      <Text
        position={[0, height / 2 + 0.4, 0]}
        fontSize={0.12}
        color="white"
      >
        {Math.round(avgScore * 100)}%
      </Text>
    </group>
  );
}

function EvolutionTrajectory({ evolutions }) {
  const points = evolutions.slice(0, 10).map((evo, idx) => [
    (idx - 5) * 1.5,
    (evo.real_world_performance?.avg_ethical_score || 0.5) * 3,
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

export default function EthicalLandscapeExplorer3D() {
  const [dilemmaTitle, setDilemmaTitle] = useState('');
  const [dilemmaDescription, setDilemmaDescription] = useState('');
  const queryClient = useQueryClient();

  const { data: customDilemmas } = useQuery({
    queryKey: ['customDilemmas'],
    queryFn: () => base44.entities.CustomEthicalDilemma.list('-created_date', 20),
    initialData: []
  });

  const { data: evolutions } = useQuery({
    queryKey: ['frameworkEvolutions'],
    queryFn: () => base44.entities.EthicalFrameworkEvolution.list('-created_date', 15),
    initialData: []
  });

  const { data: frameworks } = useQuery({
    queryKey: ['ethicalFrameworks'],
    queryFn: () => base44.entities.EthicalFramework.list(),
    initialData: []
  });

  const createDilemmaMutation = useMutation({
    mutationFn: (dilemma) => base44.entities.CustomEthicalDilemma.create(dilemma),
    onSuccess: () => {
      queryClient.invalidateQueries(['customDilemmas']);
      setDilemmaTitle('');
      setDilemmaDescription('');
    }
  });

  const exploreMutation = useMutation({
    mutationFn: ({ framework_id }) => 
      base44.functions.invoke('exploreEthicalSpace', {
        framework_id,
        exploration_depth: 'deep'
      })
  });

  const handleCreateDilemma = async () => {
    if (!dilemmaTitle.trim() || !dilemmaDescription.trim()) return;

    const dilemma = {
      dilemma_id: `dilemma_${Date.now()}`,
      creator_id: 'user_001',
      title: dilemmaTitle,
      description: dilemmaDescription,
      ethical_dimensions: ['fairness', 'transparency', 'autonomy'],
      difficulty_level: 5
    };

    await createDilemmaMutation.mutateAsync(dilemma);
  };

  const handleExplore = async () => {
    if (frameworks.length > 0) {
      await exploreMutation.mutateAsync({ framework_id: frameworks[0].framework_id });
    }
  };

  // Create landscape visualization data
  const landscapeData = frameworks.slice(0, 5).map((fw, fwIdx) => {
    return customDilemmas.slice(0, 5).map((dilemma, dIdx) => {
      const testResult = dilemma.framework_test_results?.find(r => r.framework_id === fw.framework_id);
      const performance = testResult?.ethical_score || 0.5 + Math.random() * 0.3;
      
      return {
        framework: fw,
        dilemma,
        position: [(fwIdx - 2) * 2, 0, (dIdx - 2) * 2],
        performance
      };
    });
  }).flat();

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-green-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Map className="w-6 h-6 text-green-400" />
          Ethical Landscape Explorer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] rounded-lg bg-black/60 mb-4">
          <Canvas camera={{ position: [8, 8, 8], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} />
            
            {/* Ground plane for reference */}
            <gridHelper args={[20, 20, '#444', '#222']} />
            
            {/* Framework Performance Landscape */}
            {landscapeData.map((data, idx) => (
              <FrameworkPerformanceNode
                key={idx}
                position={data.position}
                framework={data.framework}
                dilemmaPerformance={data.performance}
              />
            ))}

            {/* Evolution Trajectory */}
            <group position={[0, 0, -8]}>
              <EvolutionTrajectory evolutions={evolutions} />
            </group>

            {/* Convergence/Divergence Indicators */}
            {evolutions.slice(0, 5).map((evo, idx) => {
              const divergence = evo.convergence_metrics?.divergence_from_baseline || 0;
              return (
                <Sphere 
                  key={evo.evolution_id}
                  args={[0.2, 16, 16]} 
                  position={[(idx - 2) * 1.5, divergence * 5, -8]}
                >
                  <meshStandardMaterial 
                    color={divergence < 0.2 ? '#22c55e' : '#f59e0b'}
                    emissive={divergence < 0.2 ? '#22c55e' : '#f59e0b'}
                    emissiveIntensity={0.5}
                  />
                </Sphere>
              );
            })}
            
            <OrbitControls enableDamping dampingFactor={0.05} />
          </Canvas>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <GitBranch className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Frameworks</span>
            </div>
            <div className="text-2xl font-bold text-white">{frameworks.length}</div>
          </div>

          <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Dilemmas</span>
            </div>
            <div className="text-2xl font-bold text-white">{customDilemmas.length}</div>
          </div>

          <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Evolutions</span>
            </div>
            <div className="text-2xl font-bold text-white">{evolutions.length}</div>
          </div>
        </div>

        <div className="space-y-3 mb-4 bg-black/40 border border-green-500/30 rounded-lg p-4">
          <h3 className="text-white font-bold text-sm">Create Custom Dilemma</h3>
          <Input
            value={dilemmaTitle}
            onChange={(e) => setDilemmaTitle(e.target.value)}
            placeholder="Dilemma title..."
            className="bg-black/40 border-green-500/30 text-white"
          />
          <Textarea
            value={dilemmaDescription}
            onChange={(e) => setDilemmaDescription(e.target.value)}
            placeholder="Describe the ethical dilemma scenario..."
            className="bg-black/40 border-green-500/30 text-white h-24"
          />
          <Button 
            onClick={handleCreateDilemma}
            disabled={createDilemmaMutation.isPending || !dilemmaTitle.trim()}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Dilemma
          </Button>
        </div>

        <Button 
          onClick={handleExplore}
          disabled={exploreMutation.isPending || frameworks.length === 0}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {exploreMutation.isPending ? 'Exploring...' : 'AI Explore Ethical Space'}
        </Button>

        {exploreMutation.data?.data?.novel_modifications && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 space-y-2"
          >
            <h3 className="text-white font-bold text-sm">Novel AI Suggestions</h3>
            {exploreMutation.data.data.novel_modifications.slice(0, 3).map((mod, idx) => (
              <div key={idx} className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-white font-medium text-sm">{mod.modification_name}</span>
                  <Badge className="bg-purple-600">
                    Innovation: {Math.round(mod.innovation_level * 100)}%
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mb-2">{mod.description}</p>
                {mod.new_principles?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {mod.new_principles.map((principle, pIdx) => (
                      <Badge key={pIdx} variant="outline" className="text-xs">
                        +{principle.principle_name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}