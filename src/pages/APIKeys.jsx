import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Plus, Copy, Eye, EyeOff, Trash2, Calendar } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { toast } from 'sonner';

export default function APIKeys() {
  const [keys, setKeys] = useState([
    { id: 1, name: 'Production Key', key: 'sk_live_abc123...xyz789', created: new Date(2026, 0, 1), lastUsed: new Date(2026, 0, 9), visible: false },
    { id: 2, name: 'Development Key', key: 'sk_test_def456...uvw012', created: new Date(2025, 11, 15), lastUsed: new Date(2026, 0, 8), visible: false }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  const createKey = () => {
    if (!newKeyName) return;
    const newKey = {
      id: keys.length + 1,
      name: newKeyName,
      key: `sk_live_${Math.random().toString(36).substr(2, 9)}...${Math.random().toString(36).substr(2, 9)}`,
      created: new Date(),
      lastUsed: null,
      visible: true
    };
    setKeys([...keys, newKey]);
    setNewKeyName('');
    setShowCreateModal(false);
    toast.success('API key created');
  };

  const toggleVisibility = (id) => {
    setKeys(keys.map(k => k.id === id ? { ...k, visible: !k.visible } : k));
  };

  const copyKey = (key) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard');
  };

  const deleteKey = (id) => {
    setKeys(keys.filter(k => k.id !== id));
    toast.success('API key deleted');
  };

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                <Key className="w-8 h-8 text-orange-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">API Keys</h1>
                <p className="text-white/60">Manage your API access</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-xl hover:opacity-90 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Key
            </button>
          </div>

          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <div className="text-yellow-400 font-semibold mb-1">⚠️ Keep your keys secure</div>
            <p className="text-white/70 text-sm">Never share your API keys publicly or commit them to version control.</p>
          </div>
        </motion.div>

        <div className="space-y-4">
          {keys.map((key, i) => (
            <motion.div
              key={key.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-bold mb-1">{key.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Calendar className="w-4 h-4" />
                    Created {key.created.toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleVisibility(key.id)} className="p-2 text-white/60 hover:text-cyan-400">
                    {key.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => copyKey(key.key)} className="p-2 text-white/60 hover:text-green-400">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteKey(key.id)} className="p-2 text-white/60 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-3 font-mono text-sm text-white">
                {key.visible ? key.key : '••••••••••••••••••••••••••••'}
              </div>

              {key.lastUsed && (
                <div className="mt-3 text-xs text-white/40">
                  Last used: {key.lastUsed.toLocaleString()}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-white mb-4">Create API Key</h3>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key name (e.g. Production, Development)"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={createKey}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-xl hover:opacity-90"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AuroraBackground>
  );
}