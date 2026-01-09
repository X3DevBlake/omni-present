import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Plus, Trash2, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AlertAndNotificationManager() {
  const [alerts, setAlerts] = useState([
    { id: 1, trigger: 'BTC > $50k', channel: 'email', enabled: true },
    { id: 2, trigger: 'Large transaction > $5k', channel: 'push', enabled: true }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    trigger: '',
    channel: 'email',
    threshold: ''
  });

  const addAlert = () => {
    if (!formData.trigger) {
      toast.error('Trigger condition required');
      return;
    }
    const newAlert = {
      id: Date.now(),
      trigger: formData.trigger,
      channel: formData.channel,
      enabled: true
    };
    setAlerts(prev => [...prev, newAlert]);
    setFormData({ trigger: '', channel: 'email', threshold: '' });
    setShowForm(false);
    toast.success('Alert created');
  };

  const toggleAlert = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="bg-black/40 border border-yellow-500/30 rounded-2xl p-6 space-y-4">
      <h3 className="text-white font-bold flex items-center gap-2">
        <Bell className="w-5 h-5 text-yellow-400" />
        Alerts & Notifications
      </h3>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white/5 border border-yellow-500/30 rounded-lg p-4 space-y-3"
        >
          <input
            type="text"
            placeholder="Trigger (e.g., 'ETH drops 15%', 'Transaction > $1000')"
            value={formData.trigger}
            onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-white/40"
          />
          <select
            value={formData.channel}
            onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
          >
            <option value="email">Email</option>
            <option value="push">Push Notification</option>
            <option value="sms">SMS</option>
            <option value="inApp">In-App</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={addAlert}
              className="flex-1 py-2 bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 rounded font-medium text-xs"
            >
              Create Alert
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

      <div className="space-y-2">
        {alerts.map(alert => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between"
          >
            <div className="flex-1">
              <p className="text-white font-bold text-sm">{alert.trigger}</p>
              <p className="text-white/60 text-xs capitalize">{alert.channel}</p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => toggleAlert(alert.id)}
                whileHover={{ scale: 1.1 }}
                className={`p-2 rounded ${alert.enabled ? 'text-green-400' : 'text-white/40'}`}
              >
                <ToggleRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={() => removeAlert(alert.id)}
                whileHover={{ scale: 1.1 }}
                className="p-2 hover:bg-red-500/20 text-red-400 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {!showForm && (
        <motion.button
          onClick={() => setShowForm(true)}
          whileHover={{ scale: 1.05 }}
          className="w-full py-2 border border-dashed border-yellow-500/40 text-yellow-400 rounded font-medium text-xs hover:bg-yellow-500/10"
        >
          + New Alert
        </motion.button>
      )}
    </div>
  );
}