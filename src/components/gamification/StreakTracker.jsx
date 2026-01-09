import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Calendar } from 'lucide-react';

export default function StreakTracker({ streak = 0, maxStreak = 0 }) {
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const activeDay = new Date().getDay();

  return (
    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-400" />
          <div>
            <div className="text-white font-bold text-2xl">{streak} Days</div>
            <div className="text-white/60 text-xs">Current Streak</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-orange-400 font-bold">{maxStreak}</div>
          <div className="text-white/60 text-xs">Best</div>
        </div>
      </div>

      <div className="flex justify-between gap-1">
        {weekDays.map((day, index) => {
          const isActive = index <= activeDay && streak > 0;
          return (
            <motion.div
              key={index}
              className={`flex-1 aspect-square rounded-lg flex items-center justify-center text-xs font-bold ${
                isActive
                  ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white'
                  : 'bg-white/5 text-white/40'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              {day}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}