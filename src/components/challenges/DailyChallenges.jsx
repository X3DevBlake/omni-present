import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle, Lock } from 'lucide-react';
import { useGamification } from '../gamification/GamificationContext';
import { toast } from 'sonner';

export default function DailyChallenges() {
  const { addXP, unlockBadge } = useGamification();
  const [challenges, setChallenges] = useState([
    {
      id: 'daily_1',
      name: 'Create Your First Agent',
      description: 'Build an agent in the Labs hub',
      xpReward: 100,
      progress: 0,
      target: 1,
      completed: false,
      type: 'create_agent'
    },
    {
      id: 'daily_2',
      name: 'Complete a Course Module',
      description: 'Finish any course lesson in Campus',
      xpReward: 150,
      progress: 0,
      target: 1,
      completed: false,
      type: 'complete_course'
    },
    {
      id: 'daily_3',
      name: 'Join the Community',
      description: 'Post in Student Lounge',
      xpReward: 75,
      progress: 0,
      target: 1,
      completed: false,
      type: 'community_post'
    }
  ]);

  const completeChallenge = async (challengeId) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge || challenge.completed) return;

    setChallenges(prev =>
      prev.map(c =>
        c.id === challengeId ? { ...c, completed: true, progress: c.target } : c
      )
    );

    const result = await addXP(challenge.xpReward, challenge.name);
    toast.success(`+${challenge.xpReward} XP! ${result?.levelUp ? '🎉 Level Up!' : ''}`);

    // Check for streak badge
    const completedCount = challenges.filter(c => c.completed).length + 1;
    if (completedCount === 3) {
      await unlockBadge('daily_champion', {
        name: 'Daily Champion',
        description: 'Complete all daily challenges',
        color: '#eab308',
        rarity: 'rare'
      });
      toast.success('🏆 Badge Unlocked: Daily Champion!');
    }
  };

  return (
    <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-white font-bold">Daily Challenges</h3>
            <p className="text-white/60 text-xs">Resets in 8h 24m</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-yellow-400 font-bold">{challenges.filter(c => c.completed).length}/3</div>
          <div className="text-white/60 text-xs">Complete</div>
        </div>
      </div>

      <div className="space-y-3">
        {challenges.map((challenge, index) => (
          <motion.div
            key={challenge.id}
            className={`bg-black/40 backdrop-blur-xl border rounded-xl p-4 ${
              challenge.completed ? 'border-green-500/40' : 'border-white/10'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className={`font-semibold mb-1 ${challenge.completed ? 'text-white/60 line-through' : 'text-white'}`}>
                  {challenge.name}
                </h4>
                <p className="text-white/60 text-xs mb-2">{challenge.description}</p>
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span className="text-yellow-400 text-xs font-semibold">+{challenge.xpReward} XP</span>
                </div>
              </div>
              {challenge.completed ? (
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              ) : (
                <button
                  onClick={() => completeChallenge(challenge.id)}
                  className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 rounded-lg hover:bg-yellow-500/30 text-xs font-medium"
                >
                  Claim
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}