import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import Leaderboard from '../components/gamification/Leaderboard';
import Interactive3DBanner from '../components/3d/Interactive3DBanner';

export default function Leaderboards() {
  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Interactive3DBanner
            title="Global Leaderboards"
            subtitle="Compete with the best"
            color="#eab308"
            height="300px"
          />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              XP Leaderboard
            </h2>
            <Leaderboard category="xp" timeframe="all-time" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-purple-400" />
              Achievement Hunters
            </h2>
            <Leaderboard category="achievements" timeframe="all-time" />
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}