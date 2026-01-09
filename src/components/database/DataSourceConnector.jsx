import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Database, Trash2, Check, AlertCircle } from 'lucide-react';

export default function DataSourceConnector() {
  const [sources, setSources] = useState([
    {
      id: 1,
      name: 'Alpha Vantage',
      type: 'api',
      category: 'financial',
      status: 'connected',
      endpoint: 'https://www.alphavantage.co'
    },
    {
      id: 2,
      name: 'Open Weather Map',
      type: 'api',
      category: 'weather',
      status: 'connected',
      endpoint: 'https://openweathermap.org'
    },
    {
      id: 3,
      name: 'PostgreSQL Demo',
      type: 'sql',
      category: 'database',
      status: 'idle',
      endpoint: 'localhost:5432'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'api',
    category: 'financial',
    endpoint: ''
  });

  const addSource = () => {
    if (formData.name && formData.endpoint) {
      setSources([
        ...sources,
        {
          id: Date.now(),
          ...formData,
          status: 'idle'
        }
      ]);
      setFormData({ name: '', type: 'api', category: 'financial', endpoint: '' });
      setShowForm(false);
    }
  };

  const removeSource = (id) => {
    setSources(sources.filter(s => s.id !== id));
  };

  const getStatusColor = (status) => {
    return status === 'connected' ? 'text-green-400' : 'text-yellow-400';
  };

  const sourceCategories = ['financial', 'weather', 'health', 'social', 'news', 'scientific', 'geospatial'];
  const sourceTypes = ['api', 'sql', 'nosql', 'graphql', 'webhook'];

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-400" />
          Connected Data Sources
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded text-cyan-300 text-sm flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add Source
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-white/5 border border-white/10 rounded-lg space-y-3"
          >
            <input
              type="text"
              placeholder="Data source name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-white/40"
            />
            <input
              type="text"
              placeholder="Endpoint URL"
              value={formData.endpoint}
              onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-white/40"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
              >
                {sourceTypes.map(type => (
                  <option key={type} value={type}>{type.toUpperCase()}</option>
                ))}
              </select>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
              >
                {sourceCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <button
              onClick={addSource}
              className="w-full py-2 bg-cyan-500/30 hover:bg-cyan-500/40 rounded text-cyan-300 text-sm font-semibold"
            >
              Connect Source
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sources.map((source) => (
          <motion.div
            key={source.id}
            layout
            className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-white font-semibold text-sm">{source.name}</h4>
                  <span className={`w-2 h-2 rounded-full ${source.status === 'connected' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                </div>
                <div className="flex gap-3 mt-2 text-xs text-white/60">
                  <span className="bg-black/30 px-2 py-1 rounded">{source.type.toUpperCase()}</span>
                  <span className="bg-black/30 px-2 py-1 rounded">{source.category}</span>
                  <span className="bg-black/30 px-2 py-1 rounded text-ellipsis overflow-hidden max-w-[150px]">{source.endpoint}</span>
                </div>
              </div>
              <button
                onClick={() => removeSource(source.id)}
                className="p-1 text-red-400 hover:bg-red-500/20 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}