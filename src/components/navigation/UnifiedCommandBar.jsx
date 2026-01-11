import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Command, Search, Zap, ArrowRight, Mic } from 'lucide-react';
import { createPageUrl } from '../../utils';
import { base44 } from '@/api/base44Client';
import { HubRegistry } from './HubRegistry';

export default function UnifiedCommandBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (query.length > 1) {
      searchContent(query);
    } else {
      setResults([]);
    }
  }, [query]);

  const searchContent = async (searchQuery) => {
    const results = [];

    // Search hubs
    const matchingHubs = HubRegistry.filter(hub => 
      hub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hub.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    results.push(...matchingHubs.map(hub => ({ type: 'hub', ...hub })));

    // Search agents
    try {
      const agents = await base44.entities.Agent.list();
      const matchingAgents = agents.filter(agent => 
        agent.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      results.push(...matchingAgents.map(agent => ({ type: 'agent', ...agent })));
    } catch (e) {}

    setResults(results.slice(0, 8));
  };

  const handleSelect = (result) => {
    if (result.type === 'hub') {
      navigate(createPageUrl(result.path));
    } else if (result.type === 'agent') {
      navigate(createPageUrl('AgentManagementHub'));
    }
    setIsOpen(false);
    setQuery('');
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full shadow-lg"
      >
        <Command className="w-6 h-6 text-white" />
      </motion.button>

      {/* Command Bar Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-1/4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-50"
            >
              <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b border-white/10">
                  <Search className="w-5 h-5 text-white/60" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search hubs, agents, data, or execute commands..."
                    className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-lg"
                    autoFocus
                  />
                  <Mic className="w-5 h-5 text-white/40 cursor-pointer hover:text-white/60" />
                </div>

                {/* Results */}
                {results.length > 0 && (
                  <div className="max-h-96 overflow-y-auto">
                    {results.map((result, idx) => (
                      <motion.div
                        key={`${result.type}-${result.id || result.path}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => handleSelect(result)}
                        className="flex items-center gap-4 p-4 hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${
                          result.type === 'hub' ? 'bg-purple-500/20' : 'bg-cyan-500/20'
                        }`}>
                          {result.type === 'hub' && <Zap className="w-5 h-5 text-purple-400" />}
                          {result.type === 'agent' && <Zap className="w-5 h-5 text-cyan-400" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{result.name}</p>
                          <p className="text-white/60 text-sm">{result.type === 'hub' ? result.category : result.agent_type}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-white/40" />
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Quick Tips */}
                {query.length === 0 && (
                  <div className="p-4 text-white/40 text-sm space-y-2">
                    <p>💡 Quick tips:</p>
                    <p>• Press <kbd className="px-2 py-1 bg-white/10 rounded">⌘K</kbd> to open</p>
                    <p>• Type to search hubs and agents</p>
                    <p>• Use voice commands with the mic icon</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}