import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Filter, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function RealTimeNewsFeed() {
  const [newsFeed, setNewsFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    sentiment: 'all',
    asset: 'all',
    market: 'crypto'
  });

  const fetchNewsFeed = async () => {
    setLoading(true);
    try {
      const news = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 5 realistic financial news headlines relevant to ${filters.asset || 'crypto'} market. 
        Format as JSON array with {headline, source, sentiment: 'bullish'|'bearish'|'neutral', asset, impact: 1-10}`,
        response_json_schema: {
          type: 'object',
          properties: {
            news: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  headline: { type: 'string' },
                  source: { type: 'string' },
                  sentiment: { type: 'string' },
                  asset: { type: 'string' },
                  impact: { type: 'number' }
                }
              }
            }
          }
        },
        add_context_from_internet: true
      });

      setNewsFeed(news?.news || []);
      toast.success('News feed updated');
    } catch (err) {
      console.error('News fetch error:', err);
      toast.error('Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsFeed();
  }, []);

  const filteredNews = (newsFeed || []).filter(item => {
    if (!item) return false;
    if (filters.sentiment !== 'all' && item.sentiment !== filters.sentiment) return false;
    if (filters.asset !== 'all' && item.asset !== filters.asset) return false;
    return true;
  });

  const getSentimentColor = (sentiment) => {
    if (sentiment === 'bullish') return 'bg-green-500/20 border-green-500/30 text-green-400';
    if (sentiment === 'bearish') return 'bg-red-500/20 border-red-500/30 text-red-400';
    return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
  };

  return (
    <div className="space-y-4">
      <div className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Real-Time Financial News
          </h3>
          <motion.button
            onClick={fetchNewsFeed}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            className="px-3 py-1 text-xs bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded font-medium disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Refresh'}
          </motion.button>
        </div>

        <div className="flex gap-3 flex-wrap">
          <select
            value={filters.sentiment}
            onChange={(e) => setFilters({ ...filters, sentiment: e.target.value })}
            className="px-3 py-1 text-xs bg-white/10 border border-white/20 rounded text-white"
          >
            <option value="all">All Sentiments</option>
            <option value="bullish">Bullish</option>
            <option value="bearish">Bearish</option>
            <option value="neutral">Neutral</option>
          </select>
          <select
            value={filters.asset}
            onChange={(e) => setFilters({ ...filters, asset: e.target.value })}
            className="px-3 py-1 text-xs bg-white/10 border border-white/20 rounded text-white"
          >
            <option value="all">All Assets</option>
            <option value="BTC">Bitcoin</option>
            <option value="ETH">Ethereum</option>
            <option value="crypto">Crypto General</option>
            <option value="stocks">Stocks</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredNews.length === 0 ? (
          <div className="text-white/40 text-sm p-4 text-center">No news matching filters</div>
        ) : (
          filteredNews.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 border border-white/10 rounded-lg p-4 space-y-2"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-white/60 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">{item?.headline || 'No headline'}</p>
                  <p className="text-white/60 text-xs mt-1">Source: {item?.source || 'Unknown'}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-2 py-1 rounded text-xs border font-medium ${getSentimentColor(item?.sentiment || 'neutral')}`}>
                      {item?.sentiment || 'neutral'}
                    </span>
                    <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white/60">
                      Impact: {item?.impact || 0}/10
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}