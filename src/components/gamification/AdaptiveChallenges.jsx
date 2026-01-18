import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Zap, Target, Clock } from 'lucide-react';

export default function AdaptiveChallenges() {
  const [challenges, setChallenges] = useState([]);
  const [userLevel, setUserLevel] = useState(5);

  useEffect(() => {
    generateAdaptiveChallenges();
  }, [userLevel]);

  const generateAdaptiveChallenges = () => {
    const mockChallenges = [
      {
        id: 1,
        title: 'Deploy 3 New Agents',
        description: 'Successfully deploy 3 AI agents to production',
        difficulty: userLevel,
        reward: 500,
        timeLimit: '7 days',
        progress: 2,
        total: 3,
        icon: Zap
      },
      {
        id: 2,
        title: 'Build a Workflow',
        description: 'Create and execute a multi-step workflow',
        difficulty: userLevel + 1,
        reward: 750,
        timeLimit: '5 days',
        progress: 0,
        total: 1,
        icon: Target
      },
      {
        id: 3,
        title: 'Collaborate with Peers',
        description: 'Share 2 agents or workflows with your team',
        difficulty: userLevel - 1,
        reward: 300,
        timeLimit: '14 days',
        progress: 1,
        total: 2,
        icon: Trophy
      }
    ];
    setChallenges(mockChallenges);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h2 className="text-3xl font-bold text-white mb-2">Adaptive Challenges</h2>
        <p className="text-white/60">Challenges tailored to your skill level</p>
      </motion.div>

      <div className="grid gap-6">
        {challenges.map((challenge, idx) => {
          const Icon = challenge.icon;
          const percentage = (challenge.progress / challenge.total) * 100;

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-black/40 border-white/10 p-6 hover:border-white/30 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-white">{challenge.title}</h3>
                        <p className="text-white/60 text-sm">{challenge.description}</p>
                      </div>
                      <Badge 
                        className={`${
                          challenge.difficulty <= userLevel ? 'bg-green-500/20 text-green-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}
                      >
                        Level {challenge.difficulty}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                        <span>Progress</span>
                        <span>{challenge.progress}/{challenge.total}</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex items-center gap-4 text-sm mb-4">
                      <span className="flex items-center gap-1 text-yellow-400">
                        <Trophy className="w-4 h-4" />
                        {challenge.reward} XP
                      </span>
                      <span className="flex items-center gap-1 text-white/60">
                        <Clock className="w-4 h-4" />
                        {challenge.timeLimit}
                      </span>
                    </div>

                    <Button 
                      size="sm" 
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      Start Challenge
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}