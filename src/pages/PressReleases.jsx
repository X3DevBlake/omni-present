import React from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Calendar } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function PressReleases() {
  const releases = [
    { id: 1, title: 'Omni-Present Secures $50M Series B Funding', date: '2026-01-05', excerpt: 'Investment will accelerate AI platform development and global expansion' },
    { id: 2, title: 'Partnership with Major Tech Companies Announced', date: '2025-12-20', excerpt: 'Strategic alliances to bring AI to enterprise customers' },
    { id: 3, title: 'Omni-Present Campus Launches Globally', date: '2025-12-01', excerpt: 'Free AI education for students worldwide' }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Newspaper className="w-10 h-10 text-cyan-400" />
            Press Releases
          </h1>
          <p className="text-white/60">Official company announcements</p>
        </motion.div>

        <div className="space-y-6">
          {releases.map((release, i) => (
            <motion.div key={release.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-black/50 transition-all cursor-pointer" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-center gap-2 text-white/40 text-sm mb-3">
                <Calendar className="w-4 h-4" />
                {release.date}
              </div>
              <h3 className="text-white font-bold text-xl mb-2">{release.title}</h3>
              <p className="text-white/60">{release.excerpt}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}