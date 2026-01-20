import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import SpecializationTreeVisualizer3D from '../components/specialization/SpecializationTreeVisualizer3D';
import AgentTutoringDashboard from '../components/training/AgentTutoringDashboard';
import { Search, Filter, GraduationCap } from 'lucide-react';

export default function AdvancedAgentTrainingHub() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [skillFilter, setSkillFilter] = useState('');

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.list('', 50)
  });

  const { data: specializations } = useQuery({
    queryKey: ['specializations', selectedAgent],
    queryFn: () => selectedAgent 
      ? base44.entities.AgentSpecialization.filter({ agent_id: selectedAgent }, '', 100)
      : Promise.resolve([]),
    enabled: !!selectedAgent
  });

  const { data: verifications } = useQuery({
    queryKey: ['verifications', selectedAgent],
    queryFn: () => selectedAgent
      ? base44.entities.SkillVerification.filter({ agent_id: selectedAgent }, '', 100)
      : Promise.resolve([]),
    enabled: !!selectedAgent
  });

  const { data: pathSuggestions } = useQuery({
    queryKey: ['path-suggestions', selectedAgent],
    queryFn: () => selectedAgent
      ? base44.entities.SpecializationPathSuggestion.filter({ agent_id: selectedAgent }, '-created_date', 5)
      : Promise.resolve([]),
    enabled: !!selectedAgent
  });

  const filteredSpecs = specializations?.filter(spec =>
    !skillFilter || spec.specialization_area?.toLowerCase().includes(skillFilter.toLowerCase())
  );

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Advanced Agent Training Hub
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            AI-powered skill development, specialization paths & tutoring system
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <Card className="lg:col-span-1 bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Select Agent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {agents?.slice(0, 10).map(agent => (
                <Button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  variant={selectedAgent === agent.id ? 'default' : 'outline'}
                  className="w-full justify-start"
                >
                  {agent.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          <div className="lg:col-span-3">
            {!selectedAgent ? (
              <Card className="bg-white/5 border-white/10 h-full flex items-center justify-center">
                <CardContent className="text-center p-12">
                  <GraduationCap className="w-16 h-16 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60 text-lg">Select an agent to view training data</p>
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="specialization" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 bg-black/30">
                  <TabsTrigger value="specialization">Specialization Tree</TabsTrigger>
                  <TabsTrigger value="tutoring">AI Tutoring</TabsTrigger>
                  <TabsTrigger value="paths">Suggested Paths</TabsTrigger>
                </TabsList>

                <TabsContent value="specialization">
                  <Card className="bg-black/40 border-white/10">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">Skill Specialization Tree</CardTitle>
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Filter skills..."
                            value={skillFilter}
                            onChange={(e) => setSkillFilter(e.target.value)}
                            className="w-48 bg-white/5 border-white/10 text-white"
                          />
                          <Filter className="w-4 h-4 text-white/60" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <SpecializationTreeVisualizer3D
                        specializations={filteredSpecs}
                        verifications={verifications}
                        onSkillClick={(skill) => console.log('Skill clicked:', skill)}
                      />
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        <div className="bg-green-500/20 border border-green-500/30 rounded p-3">
                          <div className="text-green-300 text-sm">Verified Skills</div>
                          <div className="text-white text-2xl font-bold">
                            {verifications?.filter(v => v.status === 'verified').length || 0}
                          </div>
                        </div>
                        <div className="bg-blue-500/20 border border-blue-500/30 rounded p-3">
                          <div className="text-blue-300 text-sm">Total Specializations</div>
                          <div className="text-white text-2xl font-bold">
                            {specializations?.length || 0}
                          </div>
                        </div>
                        <div className="bg-purple-500/20 border border-purple-500/30 rounded p-3">
                          <div className="text-purple-300 text-sm">Avg Proficiency</div>
                          <div className="text-white text-2xl font-bold">
                            {specializations?.length > 0
                              ? (specializations.reduce((sum, s) => sum + (s.proficiency_level || 0), 0) / specializations.length).toFixed(0)
                              : 0}%
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tutoring">
                  <Card className="bg-black/40 border-white/10">
                    <CardContent className="p-6">
                      <AgentTutoringDashboard agentId={selectedAgent} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="paths">
                  <Card className="bg-black/40 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white">AI-Suggested Specialization Paths</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {pathSuggestions?.map(suggestion => (
                        <Card key={suggestion.id} className="bg-white/5 border-white/10">
                          <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="text-white font-bold text-lg">Suggested Path</div>
                              <div className="text-purple-400 text-sm">
                                AI Confidence: {suggestion.ai_confidence?.toFixed(0)}%
                              </div>
                            </div>
                            
                            {suggestion.suggested_specializations?.map((spec, i) => (
                              <div key={i} className="bg-black/30 rounded p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-cyan-300 font-medium">{spec.specialization_name}</div>
                                  <div className="text-green-400">+{spec.potential_impact} impact</div>
                                </div>
                                <p className="text-white/60 text-sm mb-2">{spec.reasoning}</p>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div className="bg-purple-500/20 rounded p-2">
                                    <div className="text-white/60">Current</div>
                                    <div className="text-white">{spec.current_proficiency}%</div>
                                  </div>
                                  <div className="bg-blue-500/20 rounded p-2">
                                    <div className="text-white/60">Target</div>
                                    <div className="text-white">{spec.target_proficiency}%</div>
                                  </div>
                                  <div className="bg-orange-500/20 rounded p-2">
                                    <div className="text-white/60">Time</div>
                                    <div className="text-white">{spec.time_estimate_hours}h</div>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {suggestion.training_modules?.length > 0 && (
                              <div>
                                <div className="text-white/60 text-sm mb-2">Recommended Training Modules</div>
                                <div className="space-y-2">
                                  {suggestion.training_modules.slice(0, 3).map((module, i) => (
                                    <div key={i} className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded p-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-white font-medium">{module.module_name}</span>
                                        <span className="text-sm text-purple-400">{module.difficulty}</span>
                                      </div>
                                      <div className="text-white/60 text-xs mt-1">
                                        {module.estimated_duration}h • {module.skills_taught?.join(', ')}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                      
                      {!pathSuggestions?.length && (
                        <div className="text-center py-12">
                          <p className="text-white/60">No specialization paths suggested yet</p>
                          <Button className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600">
                            Generate AI Suggestions
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}