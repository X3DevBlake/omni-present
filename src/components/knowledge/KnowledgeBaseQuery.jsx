import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, Filter } from 'lucide-react';

export default function KnowledgeBaseQuery() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    relevance: 'all'
  });

  const performQuery = async () => {
    if (!query.trim()) return;
    setLoading(true);
    
    // Simulate search
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockResults = [
      {
        id: 1,
        source: 'Market Analysis Q1 2026',
        excerpt: 'Market volatility metrics show a 23% increase in the last quarter...',
        relevance: 92,
        citations: 3
      },
      {
        id: 2,
        source: 'Trading Strategies Guide',
        excerpt: 'For volatile markets, recommended strategies include hedging and position sizing...',
        relevance: 78,
        citations: 2
      },
      {
        id: 3,
        source: 'https://tradingdata.com/api',
        excerpt: 'Real-time market data indicates correlation between volatility and volume...',
        relevance: 85,
        citations: 4
      }
    ];

    setResults(mockResults);
    setLoading(false);
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Search Bar */}
      <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-6 h-6 text-purple-400" />
          <h3 className="text-white font-bold text-lg">Query Knowledge Base</h3>
        </div>

        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question or search your knowledge base..."
          className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white text-sm h-20 resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) performQuery();
          }}
        />

        {/* Filters */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-white/70 text-xs mb-2 block">Source Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="all">All Types</option>
              <option value="document">Documents</option>
              <option value="url">URLs</option>
              <option value="data">Structured Data</option>
            </select>
          </div>

          <div>
            <label className="text-white/70 text-xs mb-2 block">Relevance</label>
            <select
              value={filters.relevance}
              onChange={(e) => setFilters({ ...filters, relevance: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="all">All</option>
              <option value="high">High (80%+)</option>
              <option value="medium">Medium (60-80%)</option>
            </select>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={performQuery}
          disabled={loading || !query.trim()}
          className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⚙️</span>
              Searching Knowledge Base...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Search Knowledge Base
            </>
          )}
        </motion.button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-3">
          <h3 className="text-white font-bold text-lg mb-4">
            Found {results.length} result{results.length !== 1 ? 's' : ''}
          </h3>

          {results.map((result) => {
            if (!result) return null;
            return (
              <motion.div
                key={result.id}
                layout
                className="bg-white/5 border border-purple-500/20 rounded-lg p-4 space-y-2 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{result.source || 'Unknown Source'}</p>
                    <p className="text-white/70 text-sm mt-2">{result.excerpt || 'No excerpt available'}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-purple-400 font-bold text-sm">{result.relevance}%</span>
                      <div className="w-12 h-2 bg-black/40 rounded-full overflow-hidden">
                        <motion.div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${result.relevance}%` }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                        />
                      </div>
                    </div>
                    <p className="text-white/50 text-xs mt-2">{result.citations} citations</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center text-white/60">
          Click "Search Knowledge Base" to find relevant information
        </div>
      )}
    </motion.div>
  );
}