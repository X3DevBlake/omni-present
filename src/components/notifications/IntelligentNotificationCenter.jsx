import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { routeNotification, smartGroupNotifications } from '../../functions/notifications/intelligent-routing-engine';

export default function IntelligentNotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [userEmail, setUserEmail] = useState(null);
  const [testAlert, setTestAlert] = useState({ type: 'anomalies', content: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));

    subscribeToAlerts();
  }, []);

  const subscribeToAlerts = () => {
    // Subscribe to real-time alerts
    const unsubscribe = base44.entities.FraudAlert?.subscribe?.((event) => {
      if (event.type === 'create') {
        handleIncomingAlert(event.data);
      }
    });

    return unsubscribe;
  };

  const handleIncomingAlert = async (alertData) => {
    const alert = {
      id: alertData.id,
      type: alertData.alert_type,
      content: alertData.description,
      severity: alertData.severity,
      timestamp: new Date(),
      status: 'routing',
    };

    setNotifications(prev => [alert, ...prev]);

    // Route using intelligent system
    try {
      const result = await routeNotification(alert, userEmail, preferences);
      setNotifications(prev =>
        prev.map(n => n.id === alert.id ? { ...n, status: 'delivered', routes: result.routes } : n)
      );
    } catch (error) {
      setNotifications(prev =>
        prev.map(n => n.id === alert.id ? { ...n, status: 'error' } : n)
      );
    }
  };

  const sendTestAlert = async () => {
    if (!testAlert.content) return;

    setSending(true);
    try {
      const alert = {
        id: `test_${Date.now()}`,
        type: testAlert.type,
        content: testAlert.content,
        severity: 'high',
        timestamp: new Date(),
        status: 'routing',
      };

      setNotifications(prev => [alert, ...prev]);

      const result = await routeNotification(alert, userEmail, preferences);
      setNotifications(prev =>
        prev.map(n => n.id === alert.id ? { ...n, status: 'delivered', routes: result.routes } : n)
      );

      setTestAlert({ type: 'anomalies', content: '' });
    } catch (error) {
      console.error('Error sending test alert:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Test Alert Sender */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3"
      >
        <p className="text-white font-bold text-sm">Test Notification</p>

        <select
          value={testAlert.type}
          onChange={(e) => setTestAlert(prev => ({ ...prev, type: e.target.value }))}
          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
          disabled={sending}
        >
          <option value="anomalies">Financial Anomalies</option>
          <option value="market_changes">Market Changes</option>
          <option value="consultation_suggestions">Consultation Suggestions</option>
          <option value="price_alerts">Price Alerts</option>
          <option value="portfolio_updates">Portfolio Updates</option>
        </select>

        <input
          type="text"
          value={testAlert.content}
          onChange={(e) => setTestAlert(prev => ({ ...prev, content: e.target.value }))}
          placeholder="Enter test notification content..."
          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-white/40 text-sm"
          disabled={sending}
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={sendTestAlert}
          disabled={!testAlert.content || sending}
          className="w-full px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
        >
          <Send className="w-4 h-4" />
          {sending ? 'Routing...' : 'Send Test Alert'}
        </motion.button>
      </motion.div>

      {/* Notification History */}
      <div className="space-y-2">
        <p className="text-white font-bold text-sm flex items-center gap-2">
          <Bell className="w-4 h-4" /> Recent Notifications
        </p>

        <AnimatePresence>
          {notifications.length === 0 ? (
            <p className="text-white/40 text-sm">No notifications yet</p>
          ) : (
            notifications.map((notif, idx) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`border rounded-lg p-3 ${
                  notif.status === 'delivered'
                    ? 'bg-green-500/10 border-green-400/30'
                    : notif.status === 'error'
                    ? 'bg-red-500/10 border-red-400/30'
                    : 'bg-yellow-500/10 border-yellow-400/30'
                }`}
              >
                <div className="flex items-start gap-2">
                  {notif.status === 'delivered' && (
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />
                  )}
                  {notif.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
                  )}

                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold">{notif.content}</p>
                    <p className="text-white/60 text-xs mt-1">
                      Type: {notif.type} • Severity: {notif.severity}
                    </p>

                    {notif.routes && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {notif.routes.map((route, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-0.5 bg-white/10 rounded text-white/70"
                          >
                            {route.channel}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}