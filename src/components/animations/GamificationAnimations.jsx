import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Award, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AchievementUnlock = ({ achievement, onComplete }) => {
  React.useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00ffff', '#ff00ff', '#ffaa00']
    });
    setTimeout(onComplete, 3000);
  }, []);

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      exit={{ scale: 0, rotate: 180, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
    >
      <div className="bg-gradient-to-br from-yellow-500/90 to-orange-500/90 p-8 rounded-2xl border-4 border-white shadow-2xl">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="flex justify-center mb-4"
        >
          <Trophy className="w-24 h-24 text-white" />
        </motion.div>
        <h2 className="text-white text-3xl font-bold text-center mb-2">Achievement Unlocked!</h2>
        <p className="text-white/90 text-lg text-center">{achievement}</p>
      </div>
    </motion.div>
  );
};

export const LevelUpAnimation = ({ newLevel }) => (
  <motion.div
    initial={{ y: 100, opacity: 0, scale: 0.5 }}
    animate={{ y: 0, opacity: 1, scale: 1 }}
    exit={{ y: -100, opacity: 0, scale: 0.5 }}
    className="fixed bottom-8 right-8 z-50"
  >
    <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-xl border-2 border-white shadow-2xl">
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        <Star className="w-16 h-16 text-yellow-300 mx-auto mb-2" />
      </motion.div>
      <p className="text-white text-xl font-bold text-center">Level {newLevel}!</p>
    </div>
  </motion.div>
);

export const CurrencyGainEffect = ({ amount, currency = 'OMNI' }) => (
  <motion.div
    initial={{ y: 0, opacity: 1, scale: 1 }}
    animate={{ y: -100, opacity: 0, scale: 1.5 }}
    transition={{ duration: 2 }}
    className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
  >
    <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 rounded-full border-2 border-white shadow-xl">
      <p className="text-white text-2xl font-bold">+{amount} {currency}</p>
    </div>
  </motion.div>
);

export const BadgePopup = ({ badge }) => (
  <motion.div
    initial={{ scale: 0, rotate: -360 }}
    animate={{ scale: 1, rotate: 0 }}
    exit={{ scale: 0, rotate: 360 }}
    transition={{ type: 'spring', stiffness: 150 }}
  >
    <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-4 rounded-xl">
      <Award className="w-12 h-12 text-yellow-300 mx-auto mb-2" />
      <p className="text-white font-bold text-center">{badge.name}</p>
    </div>
  </motion.div>
);

export const XPGainAnimation = ({ xp }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: -20, opacity: 0 }}
    className="text-green-400 font-bold text-xl"
  >
    +{xp} XP
  </motion.div>
);