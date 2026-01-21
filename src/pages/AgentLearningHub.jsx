import React from 'react';
import AgentLearningHub3D from '../components/omnipresence/AgentLearningHub3D';
import AgentFeedbackLearningPanel from '../components/omnipresence/AgentFeedbackLearningPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, TrendingUp, Zap } from 'lucide-react';

export default function AgentLearningHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3 text-2xl">
              <Brain className="w-7 h-7 text-indigo-400" />
              Agent Learning & Intelligence Hub
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">
              Visualize agent learning processes, thought progressions, skill acquisition, and knowledge growth in real-time 3D environments.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AgentLearningHub3D />
          <AgentFeedbackLearningPanel />
        </div>
      </div>
    </div>
  );
}