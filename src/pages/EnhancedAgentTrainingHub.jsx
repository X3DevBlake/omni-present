import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, Shield, Brain, Award } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import AgentTutoringHub from '../components/training/AgentTutoringHub';
import SkillVerification3D from '../components/training/SkillVerification3D';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function EnhancedAgentTrainingHub() {
  const [selectedAgentId, setSelectedAgentId] = useState(null);

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.list('', 20),
  });

  const { data: verifications } = useQuery({
    queryKey: ['skill-verifications', selectedAgentId],
    queryFn: () => base44.entities.SkillVerification.filter(
      { agent_id: selectedAgentId },
      '-created_date',
      50
    ),
    enabled: !!selectedAgentId
  });

  const { data: pathSuggestions } = useQuery({
    queryKey: ['path-suggestions', selectedAgentId],
    queryFn: () => base44.entities.SpecializationPathSuggestion.filter(
      { agent_id: selectedAgentId },
      '-created_date',
      10
    ),
    enabled: !!selectedAgentId
  });

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              AI Training & Development Hub
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            AI-powered tutoring, skill verification, and personalized learning paths
          </p>
        </motion.div>

        {/* Agent Selection */}
        <Card className="bg-black/40 border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Select Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {agents?.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedAgentId === agent.id
                      ? 'bg-purple-500/30 border-purple-500'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="text-white font-medium text-sm">{agent.name}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedAgentId ? (
          <Tabs defaultValue="tutoring" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-black/30 p-1">
              <TabsTrigger value="tutoring">
                <GraduationCap className="w-4 h-4 mr-2" />
                Tutoring
              </TabsTrigger>
              <TabsTrigger value="verification">
                <Shield className="w-4 h-4 mr-2" />
                Verification
              </TabsTrigger>
              <TabsTrigger value="paths">
                <Brain className="w-4 h-4 mr-2" />
                Career Paths
              </TabsTrigger>
              <TabsTrigger value="achievements">
                <Award className="w-4 h-4 mr-2" />
                Achievements
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tutoring">
              <AgentTutoringHub agentId={selectedAgentId} />
            </TabsContent>

            <TabsContent value="verification">
              <Card className="bg-black/40 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Skill Verification Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <SkillVerification3D verifications={verifications || []} />
                  
                  <div className="mt-6 space-y-3">
                    {verifications?.slice(0, 10).map((verification) => (
                      <div key={verification.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{verification.skill_name}</span>
                          <Badge className={`${
                            verification.status === 'verified' ? 'bg-green-500' :
                            verification.status === 'pending' ? 'bg-yellow-500' :
                            verification.status === 'expired' ? 'bg-orange-500' :
                            'bg-red-500'
                          }`}>
                            {verification.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-white/60">Proficiency: </span>
                            <span className="text-cyan-400">{verification.proficiency_level}%</span>
                          </div>
                          <div>
                            <span className="text-white/60">Method: </span>
                            <span className="text-purple-400">{verification.verification_method}</span>
                          </div>
                          <div>
                            <span className="text-white/60">Confidence: </span>
                            <span className="text-green-400">{verification.confidence_score}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="paths">
              <Card className="bg-black/40 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">AI-Recommended Specialization Paths</CardTitle>
                </CardHeader>
                <CardContent>
                  {pathSuggestions && pathSuggestions.length > 0 ? (
                    <div className="space-y-6">
                      {pathSuggestions.map((suggestion) => (
                        <div key={suggestion.id} className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-white font-bold text-lg">Specialization Path</div>
                            <div className="flex gap-2">
                              <Badge className="bg-green-500">{suggestion.ai_confidence}% AI Confidence</Badge>
                              <Badge className="bg-purple-500">Priority: {suggestion.priority_score}</Badge>
                            </div>
                          </div>

                          {suggestion.suggested_specializations?.map((spec, i) => (
                            <div key={i} className="bg-black/30 rounded-lg p-4 mb-3">
                              <h4 className="text-white font-bold mb-2">{spec.specialization_name}</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                <div>
                                  <div className="text-white/60 text-xs">Current</div>
                                  <div className="text-orange-400 font-bold">{spec.current_proficiency}%</div>
                                </div>
                                <div>
                                  <div className="text-white/60 text-xs">Target</div>
                                  <div className="text-green-400 font-bold">{spec.target_proficiency}%</div>
                                </div>
                                <div>
                                  <div className="text-white/60 text-xs">Impact</div>
                                  <div className="text-cyan-400 font-bold">{spec.potential_impact}%</div>
                                </div>
                                <div>
                                  <div className="text-white/60 text-xs">Time</div>
                                  <div className="text-purple-400 font-bold">{spec.time_estimate_hours}h</div>
                                </div>
                              </div>
                              <div className="text-white/80 text-sm mb-2">{spec.reasoning}</div>
                              {spec.prerequisite_skills && spec.prerequisite_skills.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {spec.prerequisite_skills.map((skill, j) => (
                                    <Badge key={j} className="bg-yellow-500/20 text-yellow-300 text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}

                          {suggestion.training_modules && suggestion.training_modules.length > 0 && (
                            <div className="mt-4">
                              <div className="text-white font-medium mb-2">Recommended Training Modules:</div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {suggestion.training_modules.slice(0, 4).map((module, i) => (
                                  <div key={i} className="bg-white/5 rounded p-3 border border-white/10">
                                    <div className="text-white font-medium text-sm">{module.module_name}</div>
                                    <div className="flex items-center gap-3 mt-2 text-xs">
                                      <Badge className="bg-cyan-500/20 text-cyan-300">{module.difficulty}</Badge>
                                      <span className="text-white/60">{module.estimated_duration}h</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-white/60 text-center py-8">
                      No specialization paths suggested yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements">
              <Card className="bg-black/40 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Learning Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-white/60 text-center py-8">
                    Achievement system coming soon
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="bg-black/40 border-white/10">
            <CardContent className="py-12">
              <div className="text-white/60 text-center">
                Select an agent to view training details
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AuroraBackground>
  );
}