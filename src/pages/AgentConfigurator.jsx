import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Settings, Save, Bot, Target, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function AgentConfigurator() {
  const queryClient = useQueryClient();
  const [selectedAgent, setSelectedAgent] = useState('');
  const [goals, setGoals] = useState('');
  const [personality, setPersonality] = useState('balanced');
  const [learningRate, setLearningRate] = useState([50]);
  const [creativity, setCreativity] = useState([50]);
  const [riskTolerance, setRiskTolerance] = useState([30]);
  const [adaptationSpeed, setAdaptationSpeed] = useState([60]);

  const { data: agents } = useQuery({
    queryKey: ['configurable-agents'],
    queryFn: async () => {
      const agents = await base44.entities.Agent.list();
      return agents;
    },
  });

  const { data: agentConfig } = useQuery({
    queryKey: ['agent-config', selectedAgent],
    queryFn: async () => {
      if (!selectedAgent) return null;
      const agent = await base44.entities.Agent.filter({ id: selectedAgent });
      return agent[0];
    },
    enabled: !!selectedAgent,
  });

  React.useEffect(() => {
    if (agentConfig) {
      setGoals(agentConfig.goals || '');
      setPersonality(agentConfig.personality || 'balanced');
      setLearningRate([agentConfig.learning_rate || 50]);
      setCreativity([agentConfig.creativity || 50]);
      setRiskTolerance([agentConfig.risk_tolerance || 30]);
      setAdaptationSpeed([agentConfig.adaptation_speed || 60]);
    }
  }, [agentConfig]);

  const updateAgent = useMutation({
    mutationFn: async (config) => {
      return await base44.entities.Agent.update(selectedAgent, {
        goals: config.goals,
        personality: config.personality,
        learning_rate: config.learningRate,
        creativity: config.creativity,
        risk_tolerance: config.riskTolerance,
        adaptation_speed: config.adaptationSpeed,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configurable-agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent-config', selectedAgent] });
      alert('Agent configuration updated successfully!');
    },
  });

  const handleSave = () => {
    if (!selectedAgent) {
      alert('Please select an agent');
      return;
    }

    updateAgent.mutate({
      goals,
      personality,
      learningRate: learningRate[0],
      creativity: creativity[0],
      riskTolerance: riskTolerance[0],
      adaptationSpeed: adaptationSpeed[0],
    });
  };

  const personalityProfiles = {
    cautious: 'Conservative decision-making, risk-averse, thorough analysis',
    balanced: 'Moderate approach, balanced risk-reward consideration',
    aggressive: 'Bold decisions, higher risk tolerance, quick action',
    creative: 'Innovative solutions, experimental approaches, unconventional thinking',
    analytical: 'Data-driven, methodical, evidence-based decisions',
  };

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-3">
            Agent Configuration Studio
          </h1>
          <p className="text-xl text-white/70">
            Customize AI agent behavior, goals, and learning parameters
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <Card className="lg:col-span-2 bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-400" />
                Agent Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-white flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  Select Agent
                </Label>
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Choose an agent to configure" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents?.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} - {agent.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedAgent && (
                <>
                  <div>
                    <Label className="text-white flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Goals & Objectives
                    </Label>
                    <Textarea
                      value={goals}
                      onChange={(e) => setGoals(e.target.value)}
                      placeholder="Define specific goals and objectives for this agent..."
                      className="bg-white/5 border-white/10 text-white mt-2"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label className="text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Personality Trait
                    </Label>
                    <Select value={personality} onValueChange={setPersonality}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(personalityProfiles).map(([key, desc]) => (
                          <SelectItem key={key} value={key}>
                            <div>
                              <div className="font-medium capitalize">{key}</div>
                              <div className="text-xs text-gray-400">{desc}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div>
                      <Label className="text-white">
                        <Zap className="w-4 h-4 inline mr-2" />
                        Learning Rate: {learningRate[0]}%
                      </Label>
                      <Slider
                        value={learningRate}
                        onValueChange={setLearningRate}
                        min={0}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                      <p className="text-white/60 text-xs mt-1">
                        How quickly the agent adapts to new information
                      </p>
                    </div>

                    <div>
                      <Label className="text-white">Creativity: {creativity[0]}%</Label>
                      <Slider
                        value={creativity}
                        onValueChange={setCreativity}
                        min={0}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                      <p className="text-white/60 text-xs mt-1">
                        Tendency to explore novel solutions vs. proven strategies
                      </p>
                    </div>

                    <div>
                      <Label className="text-white">Risk Tolerance: {riskTolerance[0]}%</Label>
                      <Slider
                        value={riskTolerance}
                        onValueChange={setRiskTolerance}
                        min={0}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                      <p className="text-white/60 text-xs mt-1">
                        Willingness to take risks for potentially higher rewards
                      </p>
                    </div>

                    <div>
                      <Label className="text-white">Adaptation Speed: {adaptationSpeed[0]}%</Label>
                      <Slider
                        value={adaptationSpeed}
                        onValueChange={setAdaptationSpeed}
                        min={0}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                      <p className="text-white/60 text-xs mt-1">
                        How fast the agent adjusts behavior based on feedback
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleSave}
                    className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Configuration
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Configuration Preview */}
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Configuration Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedAgent && agentConfig ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg p-4 border border-white/10">
                    <h4 className="text-white font-medium mb-2">{agentConfig.name}</h4>
                    <p className="text-white/60 text-sm">{agentConfig.role}</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h5 className="text-white text-sm font-medium mb-2">Behavior Profile</h5>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-white/60">Personality:</span>
                        <span className="text-white capitalize">{personality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Learning:</span>
                        <span className="text-cyan-400">{learningRate[0]}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Creativity:</span>
                        <span className="text-purple-400">{creativity[0]}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Risk:</span>
                        <span className="text-orange-400">{riskTolerance[0]}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Adaptation:</span>
                        <span className="text-green-400">{adaptationSpeed[0]}%</span>
                      </div>
                    </div>
                  </div>

                  {goals && (
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h5 className="text-white text-sm font-medium mb-2">Active Goals</h5>
                      <p className="text-white/60 text-xs">{goals}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bot className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60">Select an agent to configure</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuroraBackground>
  );
}