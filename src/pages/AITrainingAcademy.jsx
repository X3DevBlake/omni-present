import React from 'react';
import UniversalHolographicOverlay from '../components/holographic/UniversalHolographicOverlay';
import PersonalityTraitNetwork3D from '../components/personality/PersonalityTraitNetwork3D';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, Brain, Target, TrendingUp } from 'lucide-react';
import AgentTrainingModule3D from '../components/training/AgentTrainingModule3D';
import EthicalDilemmaTrainer3D from '../components/agents/EthicalDilemmaTrainer3D';
import MultiAgentSimulation3D from '../components/training/MultiAgentSimulation3D';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function AITrainingAcademy() {
  const queryClient = useQueryClient();

  const { data: scenarios = [] } = useQuery({
    queryKey: ['training-scenarios'],
    queryFn: () => base44.entities.AgentTrainingScenario.list('-created_date', 20),
    initialData: []
  });

  const { data: multiAgentSessions = [] } = useQuery({
    queryKey: ['multi-agent-sessions'],
    queryFn: () => base44.entities.MultiAgentTrainingSession.list('-created_date', 10),
    initialData: []
  });

  const avgScore = scenarios.length > 0
    ? scenarios.reduce((sum, s) => sum + (s.ai_feedback?.overall_score || 0), 0) / scenarios.length
    : 0;

  const analyzeTrainingMutation = useMutation({
    mutationFn: async (scenario_id) => {
      const response = await base44.functions.invoke('agentTrainingOrchestrator', {
        action: 'analyze_training_results',
        scenario_id
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['training-scenarios'] });
      toast.success(`Analysis complete! Score: ${(data.ethical_score * 100).toFixed(0)}%`);
    }
  });

  return (
    <>
      <UniversalHolographicOverlay 
        enabled={true}
        contentTypes={['agent_avatar', 'data_visualization']}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-3 flex items-center gap-4">
            <GraduationCap className="w-12 h-12 text-purple-400 animate-pulse" />
            AI Training Academy
          </h1>
          <p className="text-white/60 text-lg">
            Train agents with complex scenarios, ethical dilemmas, and decision-making tests
          </p>
        </motion.div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/50">
            <CardContent className="pt-6">
              <Brain className="w-8 h-8 text-purple-400 mb-2" />
              <div className="text-3xl font-bold text-white">{scenarios.length}</div>
              <div className="text-white/60 text-sm">Training Scenarios</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500/20 to-orange-500/20 border-pink-500/50">
            <CardContent className="pt-6">
              <Target className="w-8 h-8 text-pink-400 mb-2" />
              <div className="text-3xl font-bold text-white">{(avgScore * 100).toFixed(0)}%</div>
              <div className="text-white/60 text-sm">Avg Performance</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border-orange-500/50">
            <CardContent className="pt-6">
              <TrendingUp className="w-8 h-8 text-orange-400 mb-2" />
              <div className="text-3xl font-bold text-white">
                {scenarios.filter(s => s.ai_feedback?.overall_score > 0.8).length}
              </div>
              <div className="text-white/60 text-sm">High Performers</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50">
            <CardContent className="pt-6">
              <GraduationCap className="w-8 h-8 text-green-400 mb-2" />
              <div className="text-3xl font-bold text-white">
                {scenarios.reduce((sum, s) => sum + (s.training_outcomes?.skills_acquired?.length || 0), 0)}
              </div>
              <div className="text-white/60 text-sm">Skills Acquired</div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          {scenarios.slice(0, 3).map((scenario) => (
            <Card key={scenario.id} className="bg-black/40 border-purple-500/30 mb-3">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold">{scenario.scenario_name}</div>
                    <div className="text-white/60 text-xs">Complexity: {scenario.complexity_level}/10</div>
                  </div>
                  <Button
                    onClick={() => analyzeTrainingMutation.mutate(scenario.scenario_id)}
                    disabled={analyzeTrainingMutation.isPending}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Analyze Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="training" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/60 border-purple-500/30">
            <TabsTrigger value="training">Training Module</TabsTrigger>
            <TabsTrigger value="multiagent">Multi-Agent</TabsTrigger>
            <TabsTrigger value="ethical">Ethical Dilemmas</TabsTrigger>
          </TabsList>

          <TabsContent value="training" className="mt-6">
            <PersonalityTraitNetwork3D agentId="training_agent_001" />
            <div className="mt-6">
              <AgentTrainingModule3D />
            </div>
          </TabsContent>

          <TabsContent value="multiagent" className="mt-6">
            {multiAgentSessions[0] ? (
              <MultiAgentSimulation3D session={multiAgentSessions[0]} />
            ) : (
              <Card className="bg-black/40 border-purple-500/50">
                <CardContent className="pt-6 text-center">
                  <div className="text-white/60 mb-4">No multi-agent sessions yet</div>
                  <Button onClick={async () => {
                    const agents = await base44.entities.Agent.list('-created_date', 5);
                    const response = await base44.functions.invoke('multiAgentTrainingOrchestrator', {
                      action: 'create_session',
                      scenario_name: 'Collaborative Problem Solving',
                      agent_ids: agents.slice(0, 4).map(a => a.id),
                      complexity: 6
                    });
                    queryClient.invalidateQueries({ queryKey: ['multi-agent-sessions'] });
                    toast.success('Multi-agent session created!');
                  }} className="bg-purple-600 hover:bg-purple-700">
                    Create Multi-Agent Session
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ethical" className="mt-6">
            <EthicalDilemmaTrainer3D />
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
}