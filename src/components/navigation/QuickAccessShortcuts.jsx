import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Zap, Star } from 'lucide-react';

export default function QuickAccessShortcuts() {
  const location = useLocation();
  const currentPage = location.pathname.split('/').pop() || 'Home';

  const { data: context } = useQuery({
    queryKey: ['nav-shortcuts', currentPage],
    queryFn: async () => {
      const response = await base44.functions.invoke('analyze-navigation-context', {
        current_page: currentPage,
        session_data: {}
      });
      return response.data;
    }
  });

  if (!context?.shortcuts?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40"
    >
      <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-full px-4 py-2 shadow-2xl">
        <Zap className="w-4 h-4 text-yellow-400" />
        <div className="flex items-center gap-2">
          {context.shortcuts.slice(0, 5).map((shortcut, idx) => (
            <Link key={idx} to={createPageUrl(shortcut.path)}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-600/20 hover:bg-purple-600/40 transition-all text-xs text-white border border-purple-500/30"
              >
                {shortcut.frequency > 5 && <Star className="w-3 h-3 text-yellow-400" />}
                <span>{shortcut.name}</span>
              </motion.button>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}