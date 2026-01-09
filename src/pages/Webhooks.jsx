import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Webhook, Plus, Trash2, Edit, Activity, AlertCircle } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { toast } from 'sonner';

export default function Webhooks() {
  const [webhooks, setWebhooks] = useState([
    { id: 1, url: 'https://api.example.com/webhooks/devices', events: ['device.online', 'device.offline'], status: 'active', lastTriggered: new Date() },
    { id: 2, url: 'https://api.example.com/webhooks/agents', events: ['agent.created', 'agent.evolved'], status: 'active', lastTriggered: new Date(Date.now() - 3600000) }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ url: '', events: [] });

  const availableEvents = [
    'device.online', 'device.offline', 'device.error',
    'agent.created', 'agent.evolved', 'agent.deleted',
    'simulation.started', 'simulation.completed',
    'order.created', 'order.delivered'
  ];

  const createWebhook = () => {
    if (!newWebhook.url || newWebhook.events.length === 0) return;
    setWebhooks([...webhooks, { ...newWebhook, id: Date.now(), status: 'active', lastTriggered: null }]);
    setNewWebhook({ url: '', events: [] });
    setShowCreateModal(false);
    toast.success('Webhook created');
  };

  const toggleEvent = (event) => {
    if (newWebhook.events.includes(event)) {
      setNewWebhook({ ...newWebhook, events: newWebhook.events.filter(e => e !== event) });
    } else {
      setNewWebhook({ ...newWebhook, events: [...newWebhook.events, event] });
    }
  };

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <Webhook className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Webhooks</h1>
                <p className="text-white/60">Real-time event notifications</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Webhook
            </button>
          </div>
        </motion.div>

        <div className="space-y-4">
          {webhooks.map((webhook, i) => (
            <motion.div
              key={webhook.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-bold">{webhook.url}</h3>
                    <div className={`px-3 py-1 rounded-full text-xs ${
                      webhook.status === 'active'
                        ? 'bg-green-500/20 border border-green-500/40 text-green-300'
                        : 'bg-red-500/20 border border-red-500/40 text-red-300'
                    }`}>
                      {webhook.status}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {webhook.events.map(event => (
                      <div key={event} className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-lg text-xs">
                        {event}
                      </div>
                    ))}
                  </div>
                  {webhook.lastTriggered && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Activity className="w-4 h-4" />
                      Last triggered: {webhook.lastTriggered.toLocaleString()}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-white/60 hover:text-cyan-400">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setWebhooks(webhooks.filter(w => w.id !== webhook.id))}
                    className="p-2 text-white/60 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold text-white mb-4">Create Webhook</h3>
              
              <div className="mb-4">
                <label className="text-white/70 text-sm mb-2 block">Endpoint URL</label>
                <input
                  type="url"
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                  placeholder="https://api.example.com/webhooks"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40"
                />
              </div>

              <div className="mb-6">
                <label className="text-white/70 text-sm mb-2 block">Events to Subscribe</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableEvents.map(event => (
                    <button
                      key={event}
                      onClick={() => toggleEvent(event)}
                      className={`px-4 py-2 rounded-lg text-sm transition-all ${
                        newWebhook.events.includes(event)
                          ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
                          : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {event}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={createWebhook}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90"
                >
                  Create Webhook
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AuroraBackground>
  );
}