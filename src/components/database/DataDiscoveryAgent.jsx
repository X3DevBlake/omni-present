import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Download, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DataDiscoveryAgent() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDatasets, setSelectedDatasets] = useState([]);

  const suggestedDatasets = [
    {
      id: 1,
      name: 'Crypto Market Data',
      provider: 'CoinGecko API',
      description: 'Real-time cryptocurrency prices and market data',
      type: 'API',
      relevance: 95
    },
    {
      id: 2,
      name: 'Stock Market Data',
      provider: 'Alpha Vantage',
      description: 'US equity and forex market data',
      type: 'API',
      relevance: 88
    },
    {
      id: 3,
      name: 'Weather Data',
      provider: 'Open Weather Map',
      description: 'Global weather forecasts and climate data',
      type: 'API',
      relevance: 72
    },
    {
      id: 4,
      name: 'Public Datasets',
      provider: 'Kaggle',
      description: 'Thousands of open-source datasets',
      type: 'Database',
      relevance: 85
    }
  ];

  const discoverDatasets = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const results = await base44.integrations.Core.InvokeLLM({
        prompt: `Find the most relevant public datasets and APIs for: "${query}". Return top 5 matches with name, provider, description, type, and relevance score (0-100).`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            datasets: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  provider: { type: 'string' },
                  description: { type: 'string' },
                  type: { type: 'string' },
                  relevance: { type: 'number' },
                  url: { type: 'string' }
                }
              }
            }
          }
        }
      });

      if (results?.datasets) {
        setSearchResults(results.datasets);
      }
    } catch (error) {
      console.error('Error discovering datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDataset = (id) => {
    setSelectedDatasets(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const displayResults = searchResults.length > 0 ? searchResults : suggestedDatasets;

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-400" />
        AI Dataset Discovery
      </h3>

      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && discoverDatasets()}
            placeholder="Search for datasets (e.g., 'financial data', 'weather APIs')..."
            className="flex-1 bg-white/10 border border-white/20 rounded px-4 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:border-purple-500/50"
          />
          <button
            onClick={discoverDatasets}
            disabled={loading}
            className="px-4 py-2 bg-purple-500/30 hover:bg-purple-500/40 border border-purple-500/50 rounded text-purple-300 font-semibold text-sm disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {displayResults.map((dataset, idx) => (
            <motion.div
              key={dataset.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-3 hover:border-purple-500/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedDatasets.includes(dataset.id)}
                  onChange={() => toggleDataset(dataset.id)}
                  className="w-4 h-4 mt-1 cursor-pointer"
                />
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-sm">{dataset.name}</h4>
                  <p className="text-white/60 text-xs mt-1">{dataset.description}</p>
                  <div className="flex gap-2 mt-2 text-xs">
                    <span className="bg-black/30 px-2 py-1 rounded text-purple-300">{dataset.provider}</span>
                    <span className="bg-black/30 px-2 py-1 rounded text-cyan-300">{dataset.type}</span>
                    <span className="bg-black/30 px-2 py-1 rounded text-green-300">
                      {dataset.relevance}% relevance
                    </span>
                  </div>
                </div>
                {dataset.url && (
                  <a
                    href={dataset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-purple-400 hover:bg-purple-500/20 rounded"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {selectedDatasets.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mt-4 py-2 bg-gradient-to-r from-purple-500/30 to-pink-500/30 hover:from-purple-500/40 hover:to-pink-500/40 border border-purple-500/50 rounded text-purple-300 font-semibold text-sm flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Onboard {selectedDatasets.length} Dataset{selectedDatasets.length !== 1 ? 's' : ''}
        </motion.button>
      )}
    </div>
  );
}