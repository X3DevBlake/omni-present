import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function NotificationPreferencesPanel() {
  const [preferences, setPreferences] = useState({
    anomalies: { slack: true, twilio_sms: true, twilio_voice: false, email: false },
    market_changes: { slack: true, twilio_sms: false, twilio_voice: false, email: true },
    consultation_suggestions: { slack: true, twilio_sms: true, twilio_voice: true, email: true },
    price_alerts: { slack: true, twilio_sms: true, twilio_voice: false, email: false },
    portfolio_updates: { slack: false, twilio_sms: false, twilio_voice: false, email: true },
  });

  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const handleToggle = (alertType, channel) => {
    setPreferences(prev => ({
      ...prev,
      [alertType]: {
        ...prev[alertType],
        [channel]: !prev[alertType][channel],
      },
    }));
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      // Save to user profile or database
      await base44.auth.updateMe({
        notificationPreferences: preferences,
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const alertTypes = [
    { id: 'anomalies', label: 'Financial Anomalies', icon: '⚠️' },
    { id: 'market_changes', label: 'Market Changes', icon: '📈' },
    { id: 'consultation_suggestions', label: 'Consultation Suggestions', icon: '📞' },
    { id: 'price_alerts', label: 'Price Alerts', icon: '💰' },
    { id: 'portfolio_updates', label: 'Portfolio Updates', icon: '📊' },
  ];

  const channels = [
    { id: 'slack', label: 'Slack', icon: '💬' },
    { id: 'twilio_sms', label: 'SMS', icon: '📱' },
    { id: 'twilio_voice', label: 'Voice Call', icon: '☎️' },
    { id: 'email', label: 'Email', icon: '📧' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-bold text-lg mb-4">Alert Type Preferences</h3>
        <div className="space-y-3">
          {alertTypes.map(alert => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4"
            >
              <p className="text-white font-semibold mb-3 flex items-center gap-2">
                <span>{alert.icon}</span>
                {alert.label}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {channels.map(channel => (
                  <motion.button
                    key={channel.id}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleToggle(alert.id, channel.id)}
                    className={`p-3 rounded-lg border transition-all ${
                      preferences[alert.id][channel.id]
                        ? 'bg-cyan-500/20 border-cyan-400'
                        : 'bg-white/10 border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">{channel.icon}</span>
                      {preferences[alert.id][channel.id] ? (
                        <ToggleRight className="w-4 h-4 text-cyan-300" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 text-white/40" />
                      )}
                    </div>
                    <p className="text-xs text-white/70 mt-1">{channel.label}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={savePreferences}
        disabled={saving}
        className="w-full px-6 py-3 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold"
      >
        <Save className="w-4 h-4" />
        {saving ? 'Saving...' : 'Save Preferences'}
      </motion.button>

      {/* Preview */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <p className="text-white font-bold text-sm mb-3">Active Channels by Alert Type</p>
        <div className="space-y-2">
          {alertTypes.map(alert => {
            const activeChannels = channels.filter(ch => preferences[alert.id][ch.id]);
            return (
              <div key={alert.id} className="text-xs">
                <p className="text-white/60">{alert.label}:</p>
                <div className="flex gap-1 mt-1">
                  {activeChannels.length > 0 ? (
                    activeChannels.map(ch => (
                      <span key={ch.id} className="px-2 py-1 bg-cyan-500/20 rounded text-cyan-300">
                        {ch.label}
                      </span>
                    ))
                  ) : (
                    <span className="text-white/40">No channels selected</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}