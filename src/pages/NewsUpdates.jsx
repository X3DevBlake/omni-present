import React from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Calendar, TrendingUp } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function NewsUpdates() {
  const news = [
    { id: 1, title: 'Omni-Present 3.0 Released', date: '2026-01-08', category: 'Product', excerpt: 'Major update brings 500+ new integrations and enhanced AI capabilities' },
    { id: 2, title: 'Campus Reaches 15K Students', date: '2026-01-05', category: 'Milestone', excerpt: 'Our learning platform continues to grow globally' },
    { id: 3, title: 'New Partnership with TechCorp', date: '2026-01-03', category: 'Partnership', excerpt: 'Enterprise AI solutions now available' },
    { id: 4, title: 'Agent Audio Studio Launch', date: '2025-12-28', category: 'Feature', excerpt: 'Create custom voices for your AI agents' }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Newspaper className="w-10 h-10 text-cyan-400" />
            News & Updates
          </h1>
          <p className="text-white/60">Stay informed about the latest developments</p>
        </motion.div>

        <div className="space-y-6">
          {news.map((item, i) => (
            <motion.div key={item.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-black/50 transition-all cursor-pointer" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-start justify-between mb-3">
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs">{item.category}</span>
                <span className="text-white/40 text-sm flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {item.date}
                </span>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">{item.title}</h3>
              <p className="text-white/60">{item.excerpt}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}