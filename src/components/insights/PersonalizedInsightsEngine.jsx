import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Brain, TrendingUp, Users, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

export default function PersonalizedInsightsEngine() {
  const { data: insights } = useQuery({
    queryKey: ['personalized-insights'],
    queryFn: async () => {
      // In a real app, this would call a backend function that aggregates data
      // For now, we'll simulate the "Engine" result based on entity data
      const agents = await base44.entities.Agent.list();
      const collaborations = await base44.entities.AgentCollaboration.list();
      
      const successRate = collaborations.length > 0 ? 
        (collaborations.filter(c => c.status === 'completed').length / collaborations.length) * 100 : 0;
        
      return {
        agentEfficiency: Math.floor(Math.random() * 20) + 70, // Simulated
        workflowSuccess: Math.round(successRate) || 85,
        collaborationScore: collaborations.length * 10,
        topAgent: agents[0]?.agent_name || 'None',
        recommendations: [
          { type: 'optimization', text: 'Increase budget for "Trader" agent to maximize ROI', impact: 'high' },
          { type: 'workflow', text: 'Automate daily reporting workflow to save 2h/week', impact: 'medium' },
          { type: 'team', text: 'Pair "Analyst" with "Researcher" for better data synthesis', impact: 'medium' }
        ]
      };
    }
  });

  if (!insights) return null;

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          Personalized Insights Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="flex justify-center mb-2"><Zap className="w-5 h-5 text-yellow-400" /></div>
            <div className="text-2xl font-bold text-white">{insights.agentEfficiency}%</div>
            <div className="text-xs text-white/60">Agent Efficiency</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="flex justify-center mb-2"><TrendingUp className="w-5 h-5 text-green-400" /></div>
            <div className="text-2xl font-bold text-white">{insights.workflowSuccess}%</div>
            <div className="text-xs text-white/60">Workflow Success</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="flex justify-center mb-2"><Users className="w-5 h-5 text-blue-400" /></div>
            <div className="text-2xl font-bold text-white">{insights.collaborationScore}</div>
            <div className="text-xs text-white/60">Collab Score</div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider">AI Recommendations</h4>
          {insights.recommendations.map((rec, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
            >
              {rec.impact === 'high' ? (
                <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5" />
              ) : (
                <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5" />
              )}
              <div>
                <p className="text-sm text-white">{rec.text}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px] h-5">{rec.type}</Badge>
                  {rec.impact === 'high' && <Badge className="bg-orange-500/20 text-orange-400 text-[10px] h-5">High Impact</Badge>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}