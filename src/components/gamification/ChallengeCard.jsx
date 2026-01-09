import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Clock } from 'lucide-react';

export default function ChallengeCard({ challenge, onAccept }) {
  const timeLeft = challenge.expiresAt ? Math.floor((new Date(challenge.expiresAt) - new Date()) / (1000 * 60 * 60)) : null;

  return (
    <motion.div
      className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-4"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h4 className="text-white font-bold">{challenge.name}</h4>
            <p className="text-white/60 text-xs">{challenge.description}</p>
          </div>
        </div>
        {challenge.difficulty && (
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
            challenge.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' :
            challenge.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-green-500/20 text-green-400'
          }`}>
            {challenge.difficulty}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1 text-cyan-400">
            <Zap className="w-4 h-4" />
            +{challenge.xpReward} XP
          </span>
          {timeLeft && (
            <span className="flex items-center gap-1 text-white/60">
              <Clock className="w-4 h-4" />
              {timeLeft}h left
            </span>
          )}
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-white/60">Progress</span>
          <span className="text-white">{challenge.progress || 0}%</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-red-500"
            initial={{ width: 0 }}
            animate={{ width: `${challenge.progress || 0}%` }}
          />
        </div>
      </div>

      {challenge.progress < 100 && (
        <button
          onClick={() => onAccept(challenge)}
          className="w-full py-2 bg-orange-500/20 border border-orange-500/40 text-orange-400 rounded-lg hover:bg-orange-500/30 font-medium text-sm"
        >
          Continue Challenge
        </button>
      )}
    </motion.div>
  );
}