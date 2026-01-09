import React from 'react';
import { motion } from 'framer-motion';
import { Target, Trophy, Flame } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import DailyChallenges from '../components/challenges/DailyChallenges';
import ChallengeCard from '../components/gamification/ChallengeCard';
import { useGamification } from '../components/gamification/GamificationContext';
import { toast } from 'sonner';

export default function Challenges() {
  const { addXP } = useGamification();

  const weeklyChallenges = [
    { id: 'weekly_1', name: 'Agent Army', description: 'Create 10 agents this week', xpReward: 500, progress: 40, difficulty: 'medium', expiresAt: '2026-01-12' },
    { id: 'weekly_2', name: 'Social Butterfly', description: 'Make 50 community posts', xpReward: 750, progress: 20, difficulty: 'hard', expiresAt: '2026-01-12' },
    { id: 'weekly_3', name: 'Blueprint Pro', description: 'Design 5 complex blueprints', xpReward: 600, progress: 60, difficulty: 'medium', expiresAt: '2026-01-12' }
  ];

  const monthlyChallenge = {
    id: 'monthly_1',
    name: 'Ultimate AI Master',
    description: 'Complete 100 learning modules, create 25 agents, and earn 5 certifications',
    xpReward: 5000,
    progress: 35,
    difficulty: 'hard',
    expiresAt: '2026-01-31'
  };

  const handleAcceptChallenge = async (challenge) => {
    toast.info(`Tracking progress for: ${challenge.name}`);
  };

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Target className="w-10 h-10 text-orange-400" />
            Challenges
          </h1>
          <p className="text-white/60">Complete challenges to earn massive XP rewards</p>
        </motion.div>

        {/* Daily Challenges */}
        <div className="mb-8">
          <DailyChallenges />
        </div>

        {/* Weekly Challenges */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-blue-400" />
            Weekly Challenges
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {weeklyChallenges.map((challenge, i) => (
              <motion.div key={challenge.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <ChallengeCard challenge={challenge} onAccept={handleAcceptChallenge} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Monthly Challenge */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Flame className="w-6 h-6 text-red-400" />
            Monthly Epic Challenge
          </h2>
          <ChallengeCard challenge={monthlyChallenge} onAccept={handleAcceptChallenge} />
        </div>
      </div>
    </AuroraBackground>
  );
}