import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Brain, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TeamSynergyAnalyzer() {
  const { data: synergyData, isLoading } = useQuery({
    queryKey: ['team-synergy'],
    queryFn: async () => Promise.resolve([
      { agent1: 'Agent Alpha', agent2: 'Agent Beta', score: 92, reason: 'Complementary skill sets enhance problem-solving' },
      { agent1: 'Agent Beta', agent2: 'Agent Gamma', score: 88, reason: 'Communication patterns show high collaboration efficiency' },
      { agent1: 'Agent Alpha', agent2: 'Agent Gamma', score: 85, reason: 'Past projects together yielded 40% faster completion' }
    ]),
    staleTime: Infinity,
    gcTime: Infinity
  });

  const getSynergyReason = (agent1, agent2) => {
    const reasons = [
      'Complementary skill sets enhance problem-solving',
      'Communication patterns show high collaboration efficiency',
      'Past projects together yielded 40% faster completion',
      'Diverse perspectives drive innovative solutions',
      'Balanced workload distribution optimizes output'
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  };

  if (isLoading) return <div>Analyzing team dynamics...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-500" />
          Team Synergy Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {synergyData?.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Create more agent collaborations to see synergy insights
          </p>
        ) : (
          synergyData?.map((pair, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold">{pair.agent1} + {pair.agent2}</span>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {pair.score}% Synergy
                </Badge>
              </div>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                {pair.reason}
              </p>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
}