import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Share2, Plus, CheckCircle2, AlertCircle, Settings } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function CrossPlatformAgentHub({ agentId, agentName = 'Agent' }) {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [transferHistory, setTransferHistory] = useState([]);
  const [formData, setFormData] = useState({
    platform: 'api',
    api_endpoint: '',
    external_id: ''
  });

  useEffect(() => {
    loadConnections();
  }, [agentId]);

  const loadConnections = async () => {
    try {
      const data = await base44.entities.CrossPlatformAgent.filter({ agent_id: agentId });
      setConnections(data);
      
      // Collect transfer history
      const history = data.flatMap(c => c.transfer_history || []);
      setTransferHistory(history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10));
    } catch (err) {
      console.error('Failed to load connections:', err);
    } finally {
      setLoading(false);
    }
  };

  const connectPlatform = async () => {
    if (!formData.platform || !formData.api_endpoint) {
      toast.error('Platform and endpoint required');
      return;
    }

    try {
      const newConnection = {
        agent_id: agentId,
        ...formData,
        sync_status: 'syncing',
        shared_knowledge: [],
        received_knowledge: [],
        transfer_history: []
      };

      await base44.entities.CrossPlatformAgent.create(newConnection);
      setConnections(prev => [newConnection, ...prev]);
      setFormData({ platform: 'api', api_endpoint: '', external_id: '' });
      setShowForm(false);
      toast.success('Platform connected!');
    } catch (err) {
      toast.error('Failed to connect');
    }
  };

  const shareKnowledge = async (connectionId, knowledgeId) => {
    try {
      const conn = connections.find(c => c.id === connectionId);
      if (conn) {
        const newShared = [...(conn.shared_knowledge || []), knowledgeId];
        const newHistory = [
          ...(conn.transfer_history || []),
          { timestamp: new Date().toISOString(), direction: 'outbound', content_type: 'knowledge', status: 'success' }
        ];

        await base44.entities.CrossPlatformAgent.update(connectionId, {
          shared_knowledge: newShared,
          transfer_history: newHistory
        });

        setConnections(prev => prev.map(c =>
          c.id === connectionId ? { ...c, shared_knowledge: newShared, transfer_history: newHistory } : c
        ));
        
        toast.success('Knowledge shared!');
      }
    } catch (err) {
      toast.error('Failed to share knowledge');
    }
  };

  if (loading) {
    return <div className="text-white/40">Loading connections...</div>;
  }

  return (
    <div className="bg-black/40 border border-indigo-500/30 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Share2 className="w-5 h-5 text-indigo-400" />
          Cross-Platform Integration
        </h3>
        <span className="text-xs text-white/50">{connections.length} connections</span>
      </div>

      {/* Connection Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white/5 border border-indigo-500/30 rounded-lg p-4 space-y-3"
        >
          <select
            value={formData.platform}
            onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
          >
            <option value="discord">Discord</option>
            <option value="slack">Slack</option>
            <option value="github">GitHub</option>
            <option value="external_simulation">External Simulation</option>
            <option value="api">Custom API</option>
          </select>

          <input
            type="text"
            placeholder="API Endpoint..."
            value={formData.api_endpoint}
            onChange={(e) => setFormData({ ...formData, api_endpoint: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-white/40"
          />

          <input
            type="text"
            placeholder="External Agent ID..."
            value={formData.external_id}
            onChange={(e) => setFormData({ ...formData, external_id: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-white/40"
          />

          <div className="flex gap-2">
            <button
              onClick={connectPlatform}
              className="flex-1 py-2 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 rounded font-medium text-xs"
            >
              Connect
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 bg-white/10 border border-white/20 text-white/60 rounded font-medium text-xs"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Active Connections */}
      <div className="space-y-2">
        {connections.length === 0 ? (
          <div className="text-center py-3 text-white/40 text-xs">No connections</div>
        ) : (
          connections.map(conn => (
            <motion.div
              key={conn.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 border border-white/10 rounded-lg p-3"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex-1">
                  <p className="text-white font-bold text-sm capitalize">{conn.platform}</p>
                  <p className="text-white/60 text-xs">{conn.api_endpoint}</p>
                </div>
                <div className="flex items-center gap-1">
                  {conn.sync_status === 'connected' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                  )}
                  <span className={`text-xs font-bold ${
                    conn.sync_status === 'connected' ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {conn.sync_status}
                  </span>
                </div>
              </div>

              <div className="flex gap-1">
                <button className="flex-1 py-1 text-xs bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 rounded hover:bg-indigo-500/30">
                  Share Knowledge
                </button>
                <button className="px-2 py-1 text-xs bg-white/10 border border-white/20 text-white/60 rounded hover:bg-white/20">
                  <Settings className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Transfer History */}
      {transferHistory.length > 0 && (
        <div className="border-t border-white/10 pt-3">
          <p className="text-white/60 text-xs font-bold mb-2">Recent Transfers:</p>
          <div className="space-y-1">
            {transferHistory.slice(0, 3).map((transfer, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-white/70">
                  {transfer.direction === 'outbound' ? '↗' : '↙'} {transfer.content_type}
                </span>
                <span className={transfer.status === 'success' ? 'text-green-400' : 'text-red-400'}>
                  {transfer.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!showForm && (
        <motion.button
          onClick={() => setShowForm(true)}
          whileHover={{ scale: 1.05 }}
          className="w-full py-2 border border-dashed border-indigo-500/40 text-indigo-400 rounded font-medium text-xs hover:bg-indigo-500/10 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Connect Platform
        </motion.button>
      )}
    </div>
  );
}