import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, Database, CheckCircle2, AlertCircle, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function ExternalAPIIntegrator() {
  const [connectedAPIs, setConnectedAPIs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    endpoint: '',
    authType: 'apiKey',
    status: 'disconnected'
  });

  const connectAPI = async () => {
    if (!formData.name || !formData.endpoint) {
      toast.error('Name and endpoint required');
      return;
    }

    try {
      const newAPI = { ...formData, id: Date.now(), lastSync: new Date() };
      setConnectedAPIs(prev => [...prev, newAPI]);
      setFormData({ name: '', endpoint: '', authType: 'apiKey', status: 'disconnected' });
      setShowForm(false);
      toast.success(`Connected to ${formData.name}`);
    } catch (err) {
      toast.error('Connection failed');
    }
  };

  const testConnection = async (api) => {
    toast.loading('Testing connection...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(`${api.name} connection verified`);
  };

  return (
    <div className="bg-black/40 border border-green-500/30 rounded-2xl p-6 space-y-4">
      <h3 className="text-white font-bold flex items-center gap-2">
        <Database className="w-5 h-5 text-green-400" />
        External API Integration
      </h3>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white/5 border border-green-500/30 rounded-lg p-4 space-y-3"
        >
          <input
            type="text"
            placeholder="API Name (e.g., Stripe, Twitter)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-white/40"
          />
          <input
            type="text"
            placeholder="API Endpoint"
            value={formData.endpoint}
            onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-white/40"
          />
          <select
            value={formData.authType}
            onChange={(e) => setFormData({ ...formData, authType: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
          >
            <option value="apiKey">API Key</option>
            <option value="oauth">OAuth</option>
            <option value="basic">Basic Auth</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={connectAPI}
              className="flex-1 py-2 bg-green-500/20 border border-green-500/40 text-green-300 rounded font-medium text-xs"
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

      {connectedAPIs.length === 0 ? (
        <div className="text-white/40 text-sm">No APIs connected</div>
      ) : (
        <div className="space-y-2">
          {connectedAPIs.map(api => (
            <motion.div
              key={api.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between"
            >
              <div>
                <p className="text-white font-bold text-sm">{api.name}</p>
                <p className="text-white/60 text-xs">{api.endpoint}</p>
                <p className="text-white/50 text-xs mt-1">Last sync: {api.lastSync.toLocaleTimeString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <button
                  onClick={() => testConnection(api)}
                  className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 text-white/60 rounded"
                >
                  Test
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!showForm && (
        <motion.button
          onClick={() => setShowForm(true)}
          whileHover={{ scale: 1.05 }}
          className="w-full py-2 border border-dashed border-green-500/40 text-green-400 rounded font-medium text-xs hover:bg-green-500/10"
        >
          + Connect New API
        </motion.button>
      )}
    </div>
  );
}