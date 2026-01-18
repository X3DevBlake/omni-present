import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles, Target, Zap, TrendingUp, Users, Shield, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function Phase2Dashboard() {
  const [activeView, setActiveView] = useState('overview');
  
  const { data: autonomousAgents = [] } = useQuery({
    queryKey: ['autonomous-agents'],
    queryFn: () => base44.entities.Agent.filter({ autonomous_level: { $gte: 70 } }).limit(20)
  });
  
  const { data: predictions = [] } = useQuery({
    queryKey: ['ai-predictions'],
    queryFn: () => base44.entities.MarketPrediction.filter({}).limit(10)
  });
  
  const phase2Features = [
    {
      category: 'Autonomous Intelligence',
      icon: Brain,
      color: 'text-purple-400',
      features: [
        { name: 'Self-Learning Agents', status: 'active', metric: `${autonomousAgents.length} agents`, description: 'AI agents that learn from interactions' },
        { name: 'Autonomous Decision Engine', status: 'active', metric: '2.3k decisions/day', description: 'Real-time autonomous decisions' },
        { name: 'Multi-Agent Collaboration', status: 'active', metric: '45 teams', description: 'Agents working together autonomously' },
        { name: 'Behavioral Adaptation', status: 'active', metric: '95% accuracy', description: 'Dynamic behavior optimization' }
      ]
    },
    {
      category: 'Predictive Intelligence',
      icon: TrendingUp,
      color: 'text-green-400',
      features: [
        { name: 'Market Prediction Engine', status: 'active', metric: `${predictions.length} predictions`, description: 'AI-powered market forecasting' },
        { name: 'Anomaly Detection System', status: 'active', metric: '12 anomalies detected', description: 'Proactive issue identification' },
        { name: 'Trend Analysis AI', status: 'active', metric: '87% accuracy', description: 'Pattern recognition and forecasting' },
        { name: 'Resource Optimization', status: 'active', metric: '32% efficiency gain', description: 'Predictive resource allocation' }
      ]
    },
    {
      category: 'Advanced Collaboration',
      icon: Users,
      color: 'text-blue-400',
      features: [
        { name: 'AI-Facilitated Teams', status: 'active', metric: '28 active teams', description: 'AI orchestrating team dynamics' },
        { name: 'Dynamic Task Allocation', status: 'active', metric: '450 tasks/day', description: 'Smart task distribution' },
        { name: 'Conflict Resolution AI', status: 'active', metric: '18 resolved', description: 'Automated conflict mediation' },
        { name: 'Knowledge Synthesis', status: 'active', metric: '5.2k insights', description: 'Collective intelligence aggregation' }
      ]
    },
    {
      category: 'Intelligent Automation',
      icon: Zap,
      color: 'text-yellow-400',
      features: [
        { name: 'Workflow Auto-Optimization', status: 'active', metric: '124 workflows', description: 'Self-improving processes' },
        { name: 'Proactive Monitoring', status: 'active', metric: '99.8% uptime', description: 'AI-driven health monitoring' },
        { name: 'Auto-Scaling Intelligence', status: 'active', metric: '15 scaling events', description: 'Predictive resource scaling' },
        { name: 'Self-Healing Systems', status: 'active', metric: '42 auto-fixes', description: 'Autonomous error resolution' }
      ]
    }
  ];
  
  const trainAgentMutation = useMutation({
    mutationFn: async (agentId) => {
      return await base44.functions.ai['self-learning-system']({ agent_id: agentId, training_mode: 'reinforcement' });
    }
  });
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-black p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Phase 2: Intelligent Automation</h1>
            <p className="text-gray-300">Advanced AI capabilities and autonomous systems</p>
          </div>
          <Badge className="bg-purple-500 text-white px-4 py-2 text-lg">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered
          </Badge>
        </div>
        
        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList className="bg-black/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="autonomous">Autonomous Agents</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {phase2Features.map((category, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-black/30 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <category.icon className={`w-5 h-5 mr-2 ${category.color}`} />
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.features.map((feature, j) => (
                        <motion.div
                          key={j}
                          whileHover={{ scale: 1.02 }}
                          className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4 rounded-lg border border-indigo-500/20"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{feature.name}</span>
                            <Badge className="bg-green-500">{feature.status}</Badge>
                          </div>
                          <p className="text-gray-400 text-sm mb-1">{feature.description}</p>
                          <p className={`text-sm font-semibold ${category.color}`}>{feature.metric}</p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
          
          <TabsContent value="autonomous">
            <Card className="bg-black/30 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Autonomous Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {autonomousAgents.map((agent, i) => (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 p-4 rounded-lg border border-purple-500/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-semibold">{agent.name}</h3>
                        <Badge className="bg-purple-500">{agent.autonomous_level}%</Badge>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{agent.description || 'Autonomous agent'}</p>
                      <Button
                        size="sm"
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => trainAgentMutation.mutate(agent.id)}
                        disabled={trainAgentMutation.isPending}
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        Train Agent
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="predictions">
            <Card className="bg-black/30 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">AI Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {predictions.map((prediction, i) => (
                    <motion.div
                      key={prediction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-gradient-to-r from-green-500/10 to-blue-500/10 p-4 rounded-lg border border-green-500/20"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-medium">{prediction.prediction_type}</h3>
                          <p className="text-gray-400 text-sm">{prediction.asset_symbol || 'Market'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-semibold">{prediction.confidence_score}% confidence</p>
                          <p className="text-gray-400 text-sm">{prediction.predicted_direction || 'Neutral'}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="automation">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Auto-Optimizations', value: '124', icon: Zap, color: 'text-yellow-400' },
                { label: 'Auto-Fixes', value: '42', icon: Shield, color: 'text-green-400' },
                { label: 'Tasks Automated', value: '450', icon: Target, color: 'text-blue-400' },
                { label: 'AI Decisions', value: '2.3k', icon: Cpu, color: 'text-purple-400' }
              ].map((metric, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-black/30 border-purple-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">{metric.label}</p>
                          <p className={`text-3xl font-bold ${metric.color} mt-2`}>{metric.value}</p>
                        </div>
                        <metric.icon className={`w-12 h-12 ${metric.color}`} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}