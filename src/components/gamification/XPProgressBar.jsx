import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Zap } from 'lucide-react';

export default function XPProgressBar({ currentXP, level, showDetails = true }) {
  const xpForCurrentLevel = Math.pow(level - 1, 2) * 100;
  const xpForNextLevel = Math.pow(level, 2) * 100;
  const xpInCurrentLevel = currentXP - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  const progress = (xpInCurrentLevel / xpNeededForLevel) * 100;

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="text-white font-bold">Level {level}</div>
            {showDetails && (
              <div className="text-white/60 text-xs">{currentXP.toLocaleString()} Total XP</div>
            )}
          </div>
        </div>
        {showDetails && (
          <div className="text-right">
            <div className="text-white font-semibold">{xpInCurrentLevel}/{xpNeededForLevel}</div>
            <div className="text-white/60 text-xs">XP to Level {level + 1}</div>
          </div>
        )}
      </div>

      <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
      </div>

      {showDetails && (
        <div className="flex items-center justify-center gap-1 mt-2">
          <TrendingUp className="w-3 h-3 text-green-400" />
          <span className="text-green-400 text-xs font-semibold">{progress.toFixed(1)}% Complete</span>
        </div>
      )}
    </div>
  );
}