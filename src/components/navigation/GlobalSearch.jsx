import React, { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    // Simulated search - can be replaced with actual backend function
    const mockResults = [
      { id: 1, type: 'Agent', title: 'Portfolio Manager', page: 'Agent' },
      { id: 2, type: 'Goal', title: 'House Down Payment', page: 'FinancialGoal' },
      { id: 3, type: 'Market', title: 'AAPL Stock', page: 'World' },
      { id: 4, type: 'Pool', title: 'ETH-USDC Pool', page: 'LiquidityPools' }
    ].filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.type.toLowerCase().includes(query.toLowerCase())
    );

    setTimeout(() => {
      setResults(mockResults);
      setIsLoading(false);
    }, 300);
  }, [query]);

  const handleSelect = (result) => {
    navigate(createPageUrl(result.page));
    setIsOpen(false);
    setQuery('');
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        className="fixed top-4 right-4 z-40 px-4 py-2 rounded-full bg-white/10 border border-white/20 flex items-center gap-2 text-white/60 hover:text-white hover:border-cyan-400/50 transition-all"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline text-sm">Search...</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 z-50"
            >
              <div className="bg-black/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl overflow-hidden shadow-2xl">
                {/* Search Input */}
                <div className="p-4 border-b border-white/10 flex items-center gap-3">
                  <Search className="w-5 h-5 text-cyan-400" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search agents, goals, markets..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-transparent text-white outline-none placeholder-white/40"
                  />
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    whileHover={{ rotate: 90 }}
                  >
                    <X className="w-5 h-5 text-white/60" />
                  </motion.button>
                </div>

                {/* Results */}
                <div className="max-h-96 overflow-y-auto">
                  {isLoading && (
                    <div className="p-8 flex items-center justify-center text-white/60 gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching...
                    </div>
                  )}
                  {!isLoading && results.length === 0 && query && (
                    <div className="p-8 text-center text-white/60">
                      No results found
                    </div>
                  )}
                  {!isLoading && results.length > 0 && (
                    <div className="p-2">
                      {results.map((result) => (
                        <motion.button
                          key={result.id}
                          onClick={() => handleSelect(result)}
                          whileHover={{ x: 4 }}
                          className="w-full p-3 rounded-lg hover:bg-white/5 text-left transition-colors mb-1 flex items-center justify-between"
                        >
                          <div>
                            <div className="text-white font-medium">{result.title}</div>
                            <div className="text-xs text-white/40">{result.type}</div>
                          </div>
                          <div className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded">
                            {result.type}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}