import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AuroraBackground from '@/components/omni/AuroraBackground';
import SpecializationTree3D from '@/components/training/SpecializationTree3D';
import LearningProgress3D from '@/components/training/LearningProgress3D';
import { GraduationCap, Target, TrendingUp, Zap } from 'lucide-react';

export default function AgentTrainingAcademy() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const queryClient = useQueryClient();

  const { data: specializations = [] } = useQuery({
    queryKey: ['agent-specializations'],
    queryFn: () => base44.entities.AgentSpecialization.list()
  });

  const { data: journalEntries = [] } = useQuery({
    queryKey: ['learning-journals'],
    queryFn: () => base44.entities.AgentLearningJournal.list()
  });

  const { data: skillGaps = [] } = useQuery({
    queryKey: ['skill-gaps'],
    queryFn: () => base44.entities.SkillGapAnalysis.list()
  });

  const analyzeGapsMutation = useMutation({
    mutationFn: async (agentId) => {
      const response = await base44.functions.invoke('analyzeSkillGaps', {
        agent_id: agentId
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['skill-gaps']);
    }
  });

  const generateTrainingMutation = useMutation({
    mutationFn: async ({ agent_id, skill, proficiency }) => {
      const response = await base44.functions.invoke('generatePersonalizedTraining', {
        agent_id,
        skill_target: skill,
        current_proficiency: proficiency
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['learning-journals']);
    }
  });

  const totalTrainingSessions = journalEntries.length;
  const avgImprovement = journalEntries.length > 0
    ? journalEntries.reduce((sum, j) => sum + (j.improvement_percentage || 0), 0) / journalEntries.length
    : 0;

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-5xl font-bold text-white flex items-center justify-center gap-3">
            <GraduationCap className="w-12 h-12 text-cyan-400" />
            Agent Training Academy
          </h1>
          <p className="text-xl text-gray-300">
            AI-powered skill development and personalized learning paths
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Training Sessions</p>
                  <p className="text-3xl font-bold text-white">{totalTrainingSessions}</p>
                </div>
                <GraduationCap className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg Improvement</p>
                  <p className="text-3xl font-bold text-white">{avgImprovement.toFixed(1)}%</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Skill Gaps</p>
                  <p className="text-3xl font-bold text-white">{skillGaps.length}</p>
                </div>
                <Target className="w-10 h-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Specializations</p>
                  <p className="text-3xl font-bold text-white">{specializations.length}</p>
                </div>
                <Zap className="w-10 h-10 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tree" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/50">
            <TabsTrigger value="tree">Specialization Tree</TabsTrigger>
            <TabsTrigger value="progress">Learning Progress</TabsTrigger>
            <TabsTrigger value="gaps">Skill Gaps</TabsTrigger>
          </TabsList>

          <TabsContent value="tree">
            <Card className="bg-slate-900/50 border-slate-700 h-[600px]">
              <CardContent className="p-0 h-full">
                <SpecializationTree3D specializationData={specializations[0]} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card className="bg-slate-900/50 border-slate-700 h-[600px]">
              <CardContent className="p-0 h-full">
                <LearningProgress3D journalEntries={journalEntries} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gaps">
            <div className="space-y-4">
              {skillGaps.map((gap) => (
                <Card key={gap.id} className="bg-slate-900/50 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-3">Skill Gap Analysis</h3>
                        <div className="space-y-3">
                          {gap.identified_gaps?.slice(0, 5).map((g, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-800 rounded">
                              <div>
                                <p className="text-white font-medium">{g.skill_name}</p>
                                <p className="text-sm text-gray-400">
                                  Current: {g.current_level} → Required: {g.required_level}
                                </p>
                              </div>
                              <Badge className={
                                g.gap_severity === 'critical' ? 'bg-red-600' :
                                g.gap_severity === 'moderate' ? 'bg-yellow-600' :
                                'bg-blue-600'
                              }>
                                {g.gap_severity}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button
                        onClick={() => analyzeGapsMutation.mutate(gap.agent_id)}
                        disabled={analyzeGapsMutation.isPending}
                        className="bg-gradient-to-r from-blue-600 to-purple-600"
                      >
                        Re-analyze
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}