import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Activity, TrendingUp, Newspaper, Users } from 'lucide-react';

export default function RealtimeDataFeed({ userEmail }) {
  const { data: streams = [] } = useQuery({
    queryKey: ['marketStreams', userEmail],
    queryFn: () => base44.entities.MarketDataStream.filter({ user_email: userEmail }).catch(() => []),
    refetchInterval: 2000
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-green-400 animate-pulse" />
        <h4 className="text-white font-bold">Live Market Streams</h4>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <motion.div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-3">
          <TrendingUp className="w-4 h-4 text-green-400 mb-1" />
          <p className="text-xs text-white/60">Price Data</p>
          <p className="text-lg font-bold text-green-400">LIVE</p>
        </motion.div>

        <motion.div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg p-3">
          <Newspaper className="w-4 h-4 text-blue-400 mb-1" />
          <p className="text-xs text-white/60">News Stream</p>
          <p className="text-lg font-bold text-blue-400">LIVE</p>
        </motion.div>

        <motion.div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-3">
          <Users className="w-4 h-4 text-purple-400 mb-1" />
          <p className="text-xs text-white/60">Social Trends</p>
          <p className="text-lg font-bold text-purple-400">LIVE</p>
        </motion.div>

        <motion.div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-3">
          <Activity className="w-4 h-4 text-orange-400 mb-1" />
          <p className="text-xs text-white/60">Economic Data</p>
          <p className="text-lg font-bold text-orange-400">LIVE</p>
        </motion.div>
      </div>

      {streams.length > 0 && (
        <div className="bg-white/5 rounded-lg p-2 text-xs">
          <p className="text-white/60 mb-1">Active Streams: {streams.length}</p>
          {streams.slice(0, 3).map((stream, idx) => (
            <p key={idx} className="text-white/70">• {stream.stream_type}: {stream.asset_symbols?.length || 0} assets</p>
          ))}
        </div>
      )}
    </div>
  );
}