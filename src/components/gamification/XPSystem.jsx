import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function XPSystem() {
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: achievements } = useQuery({
    queryKey: ['user-achievements'],
    queryFn: async () => {
      const allAchievements = await base44.entities.OmniAchievement.list();
      return allAchievements.filter(a => a.created_by === user?.email);
    },
    enabled: !!user
  });

  useEffect(() => {
    const totalXP = (achievements?.length || 0) * 100;
    const calculatedLevel = Math.floor(totalXP / 500) + 1;
    setXp(totalXP % 500);
    
    if (calculatedLevel > level) {
      setLevel(calculatedLevel);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [achievements]);

  const unlockedBadges = [
    { icon: Trophy, name: 'Agent Master', color: 'text-yellow-500', unlocked: (achievements?.length || 0) > 5 },
    { icon: Star, name: 'Workflow Wizard', color: 'text-purple-500', unlocked: level > 3 },
    { icon: Zap, name: 'Optimization Pro', color: 'text-blue-500', unlocked: level > 5 },
    { icon: Target, name: 'Goal Crusher', color: 'text-green-500', unlocked: (achievements?.length || 0) > 10 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Your Progress</span>
          <Badge variant="secondary" className="text-lg">Level {level}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>XP Progress</span>
            <span>{xp} / 500</span>
          </div>
          <Progress value={(xp / 500) * 100} className="h-3" />
        </div>

        <div>
          <h3 className="font-semibold mb-3">Unlocked Badges</h3>
          <div className="grid grid-cols-2 gap-3">
            {unlockedBadges.map((badge, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-lg border ${
                  badge.unlocked ? 'bg-gradient-to-br from-blue-50 to-purple-50' : 'bg-gray-50 opacity-50'
                }`}
              >
                <badge.icon className={`w-8 h-8 ${badge.unlocked ? badge.color : 'text-gray-400'} mb-2`} />
                <p className="text-sm font-medium">{badge.name}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Complete more tasks to earn XP and unlock achievements!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}