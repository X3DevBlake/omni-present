import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save } from 'lucide-react';

export default function CommunicationProtocolEditor({ agentId, onSave }) {
  const [protocols, setProtocols] = useState([
    {
      id: 1,
      name: 'Standard JSON',
      format: 'json',
      responseTime: 5000,
      retryAttempts: 3,
      enabled: true
    },
    {
      id: 2,
      name: 'Real-time Stream',
      format: 'stream',
      responseTime: 1000,
      retryAttempts: 1,
      enabled: true
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    format: 'json',
    responseTime: 5000,
    retryAttempts: 3
  });

  const addProtocol = () => {
    setProtocols([
      ...protocols,
      {
        id: Date.now(),
        ...formData,
        enabled: true
      }
    ]);
    setFormData({ name: '', format: 'json', responseTime: 5000, retryAttempts: 3 });
    setShowForm(false);
  };

  const removeProtocol = (id) => {
    setProtocols(protocols.filter(p => p.id !== id));
  };

  const toggleProtocol = (id) => {
    setProtocols(protocols.map(p =>
      p.id === id ? { ...p, enabled: !p.enabled } : p
    ));
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          📡 Communication Protocols
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded text-purple-300 text-sm flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add
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
              placeholder="Protocol name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-white/40"
            />
            <select
              value={formData.format}
              onChange={(e) => setFormData({ ...formData, format: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
            >
              <option value="json">JSON</option>
              <option value="stream">Stream</option>
              <option value="websocket">WebSocket</option>
            </select>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/60 text-xs">Response Time (ms)</label>
                <input
                  type="number"
                  value={formData.responseTime}
                  onChange={(e) => setFormData({ ...formData, responseTime: parseInt(e.target.value) })}
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-white/60 text-xs">Retry Attempts</label>
                <input
                  type="number"
                  value={formData.retryAttempts}
                  onChange={(e) => setFormData({ ...formData, retryAttempts: parseInt(e.target.value) })}
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
                />
              </div>
            </div>
            <button
              onClick={addProtocol}
              className="w-full py-2 bg-purple-500/30 hover:bg-purple-500/40 rounded text-purple-300 text-sm font-semibold"
            >
              Save Protocol
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {protocols.map((protocol) => (
          <motion.div
            key={protocol.id}
            layout
            className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm">{protocol.name}</h4>
                <div className="flex gap-3 mt-2 text-xs text-white/60">
                  <span>Format: {protocol.format}</span>
                  <span>Response: {protocol.responseTime}ms</span>
                  <span>Retries: {protocol.retryAttempts}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={protocol.enabled}
                    onChange={() => toggleProtocol(protocol.id)}
                    className="w-4 h-4"
                  />
                  <span className="text-white/60 text-xs">Enabled</span>
                </label>
                <button
                  onClick={() => removeProtocol(protocol.id)}
                  className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}