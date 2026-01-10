import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EnvironmentBuilder() {
  const [environments, setEnvironments] = useState([]);
  const [newEnv, setNewEnv] = useState({
    name: '',
    terrain: 'flat',
    weather: 'clear',
    dataFeeds: [],
  });

  const terrainTypes = ['flat', 'mountainous', 'urban', 'rural', 'mixed'];
  const weatherTypes = ['clear', 'rainy', 'stormy', 'foggy', 'snowy'];
  const availableFeeds = [
    { id: 'market', label: 'Live Market Data' },
    { id: 'weather', label: 'Weather API' },
    { id: 'news', label: 'News Feed' },
    { id: 'social', label: 'Social Sentiment' },
  ];

  const createEnvironment = () => {
    if (newEnv.name) {
      const env = {
        id: Date.now(),
        ...newEnv,
        createdAt: new Date().toISOString(),
      };
      setEnvironments([...environments, env]);
      setNewEnv({ name: '', terrain: 'flat', weather: 'clear', dataFeeds: [] });
    }
  };

  const toggleFeed = (feedId) => {
    setNewEnv({
      ...newEnv,
      dataFeeds: newEnv.dataFeeds.includes(feedId)
        ? newEnv.dataFeeds.filter(f => f !== feedId)
        : [...newEnv.dataFeeds, feedId],
    });
  };

  const deleteEnvironment = (id) => {
    setEnvironments(environments.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-500/30 rounded-xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4">Build Environment</h3>

        <div className="space-y-4">
          <input
            placeholder="Environment Name"
            value={newEnv.name}
            onChange={(e) => setNewEnv({ ...newEnv, name: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white placeholder:text-white/50"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">Terrain</label>
              <select
                value={newEnv.terrain}
                onChange={(e) => setNewEnv({ ...newEnv, terrain: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
              >
                {terrainTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Weather</label>
              <select
                value={newEnv.weather}
                onChange={(e) => setNewEnv({ ...newEnv, weather: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
              >
                {weatherTypes.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-2">Data Feeds</label>
            <div className="space-y-2">
              {availableFeeds.map(feed => (
                <label key={feed.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEnv.dataFeeds.includes(feed.id)}
                    onChange={() => toggleFeed(feed.id)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-white/70">{feed.label}</span>
                </label>
              ))}
            </div>
          </div>

          <Button
            onClick={createEnvironment}
            disabled={!newEnv.name}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Environment
          </Button>
        </div>
      </motion.div>

      {/* Environments List */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white">Your Environments ({environments.length})</h3>
        {environments.length === 0 ? (
          <div className="text-center py-8 text-white/40">No environments created</div>
        ) : (
          environments.map((env, idx) => (
            <motion.div
              key={env.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-bold">{env.name}</h4>
                  <div className="flex gap-3 mt-2 text-xs text-white/60">
                    <span>🏔️ {env.terrain}</span>
                    <span>☁️ {env.weather}</span>
                    <span>📡 {env.dataFeeds.length} feeds</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteEnvironment(env.id)}
                  className="p-2 hover:bg-white/10 rounded text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}