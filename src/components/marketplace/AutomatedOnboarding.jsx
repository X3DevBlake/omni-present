import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, CheckCircle, Clock, DollarSign, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AutomatedOnboarding() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [agentData, setAgentData] = useState({
    name: '',
    description: '',
    capabilities: '',
    pastPerformance: ''
  });
  const [aiSuggestions, setAiSuggestions] = useState(null);

  const generateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('generateAgentProfile', {
        agent_data: data
      });
      return response.data;
    },
    onSuccess: (data) => {
      setAiSuggestions(data);
      setStep(2);
    }
  });

  const verifySkillsMutation = useMutation({
    mutationFn: async (profile) => {
      const response = await base44.functions.invoke('verifyAgentSkills', {
        profile_data: profile
      });
      return response.data;
    },
    onSuccess: () => {
      setStep(3);
    }
  });

  const finalizeOnboardingMutation = useMutation({
    mutationFn: async (profileData) => {
      const response = await base44.functions.invoke('finalizeAgentOnboarding', {
        profile: profileData,
        pricing_model: aiSuggestions.pricing_model
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-profiles'] });
      setStep(4);
    }
  });

  const handleGenerateProfile = () => {
    generateProfileMutation.mutate(agentData);
  };

  const handleVerifySkills = () => {
    verifySkillsMutation.mutate(aiSuggestions);
  };

  const handleFinalize = () => {
    finalizeOnboardingMutation.mutate(aiSuggestions);
  };

  const progress = (step / 4) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gradient-to-br from-indigo-950/40 via-black/60 to-purple-950/40 backdrop-blur-xl border-indigo-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            AI-Powered Agent Onboarding
          </CardTitle>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-white/60 mb-2">
              <span>Step {step} of 4</span>
              <span>{progress.toFixed(0)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Input Agent Data */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-lg p-4">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  Agent Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm mb-2 block">Agent Name</label>
                    <Input
                      value={agentData.name}
                      onChange={(e) => setAgentData({...agentData, name: e.target.value})}
                      placeholder="e.g., DataAnalysis-Pro-v2"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-white text-sm mb-2 block">Description</label>
                    <Textarea
                      value={agentData.description}
                      onChange={(e) => setAgentData({...agentData, description: e.target.value})}
                      placeholder="Describe what your agent does..."
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-white text-sm mb-2 block">Key Capabilities (comma separated)</label>
                    <Input
                      value={agentData.capabilities}
                      onChange={(e) => setAgentData({...agentData, capabilities: e.target.value})}
                      placeholder="Machine Learning, Data Analysis, Predictive Modeling"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-white text-sm mb-2 block">Past Performance Data (optional)</label>
                    <Textarea
                      value={agentData.pastPerformance}
                      onChange={(e) => setAgentData({...agentData, pastPerformance: e.target.value})}
                      placeholder="Previous success rates, completed tasks, etc."
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleGenerateProfile}
                  disabled={generateProfileMutation.isPending || !agentData.name}
                  className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600"
                >
                  {generateProfileMutation.isPending ? 'AI Analyzing...' : 'Generate AI Profile'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Review AI Suggestions */}
          {step === 2 && aiSuggestions && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="bg-gradient-to-r from-green-950/30 to-emerald-950/30 border border-green-500/30 rounded-lg p-4">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  AI-Generated Profile
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="text-green-400 text-sm font-bold mb-2">Suggested Specializations:</div>
                    <div className="flex flex-wrap gap-2">
                      {aiSuggestions.specializations?.map((spec, i) => (
                        <Badge key={i} className="bg-green-600">{spec}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-blue-400 text-sm font-bold mb-2">Skill Verification Status:</div>
                    <div className="space-y-2">
                      {aiSuggestions.verified_skills?.map((skill, i) => (
                        <div key={i} className="flex items-center justify-between bg-black/30 rounded p-2">
                          <span className="text-white text-sm">{skill.skill_name}</span>
                          <div className="flex items-center gap-2">
                            <Badge className={skill.verified ? 'bg-green-600' : 'bg-yellow-600'}>
                              {skill.verified ? 'Verified' : 'Pending'}
                            </Badge>
                            <span className="text-cyan-400 text-xs">{skill.confidence_score}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-purple-400 text-sm font-bold mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      AI-Recommended Pricing:
                    </div>
                    <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-white/60 text-xs">Base Rate</div>
                          <div className="text-purple-400 font-bold text-lg">
                            ${aiSuggestions.pricing_model?.base_rate}
                          </div>
                        </div>
                        <div>
                          <div className="text-white/60 text-xs">Suggested Range</div>
                          <div className="text-purple-400 font-bold text-lg">
                            ${aiSuggestions.pricing_model?.min_price} - ${aiSuggestions.pricing_model?.max_price}
                          </div>
                        </div>
                        <div>
                          <div className="text-white/60 text-xs">Market Position</div>
                          <div className="text-purple-400 font-bold text-lg">
                            {aiSuggestions.pricing_model?.market_position}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleVerifySkills}
                  disabled={verifySkillsMutation.isPending}
                  className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  {verifySkillsMutation.isPending ? 'Verifying Skills...' : 'Proceed to Verification'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Skill Verification */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="bg-gradient-to-r from-blue-950/30 to-cyan-950/30 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Automated Skill Verification Complete
                </h3>

                <div className="bg-black/40 rounded-lg p-4 mb-4">
                  <div className="text-cyan-400 text-sm mb-3">Verification Summary:</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-white/60 text-xs">Skills Verified</div>
                      <div className="text-green-400 font-bold text-2xl">
                        {aiSuggestions?.verified_skills?.filter(s => s.verified).length || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/60 text-xs">Avg Confidence</div>
                      <div className="text-blue-400 font-bold text-2xl">
                        {aiSuggestions?.verified_skills?.reduce((sum, s) => sum + s.confidence_score, 0) / aiSuggestions?.verified_skills?.length || 0}%
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleFinalize}
                  disabled={finalizeOnboardingMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                  {finalizeOnboardingMutation.isPending ? 'Finalizing...' : 'Complete Onboarding'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-green-950/30 to-emerald-950/30 border border-green-500/30 rounded-lg p-8 text-center"
            >
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-white font-bold text-2xl mb-2">Onboarding Complete!</h3>
              <p className="text-green-400 mb-6">
                Your agent is now live in the marketplace with AI-optimized pricing and verified skills.
              </p>
              <Button
                onClick={() => {
                  setStep(1);
                  setAgentData({ name: '', description: '', capabilities: '', pastPerformance: '' });
                  setAiSuggestions(null);
                }}
                className="bg-gradient-to-r from-green-600 to-emerald-600"
              >
                Onboard Another Agent
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}