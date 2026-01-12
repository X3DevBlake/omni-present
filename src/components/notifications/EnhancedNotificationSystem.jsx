import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Settings, Zap, MessageSquare, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function EnhancedNotificationSystem({ userEmail }) {
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({
    trading: true,
    communication: true,
    workflows: true,
    slack: true,
    email: false,
    sms: false
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadNotifications();
    
    // Subscribe to real-time notifications
    const unsubscribe = base44.entities.RealTimeAlert.subscribe((event) => {
      if (event.type === 'create' && shouldNotify(event.data.category)) {
        setNotifications(prev => [event.data, ...prev]);
        showNotificationBanner(event.data);
      }
    });

    return unsubscribe;
  }, []);

  const loadNotifications = async () => {
    try {
      const alerts = await base44.entities.RealTimeAlert.list(
        { user_email: userEmail },
        '-created_date',
        50
      );
      setNotifications(alerts);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const shouldNotify = (category) => {
    return preferences[category] !== false;
  };

  const showNotificationBanner = (notification) => {
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png'
      });
    }

    // Slack notification if enabled
    if (preferences.slack) {
      base44.integrations.Core.InvokeLLM({
        prompt: `Send notification to Slack: "${notification.title} - ${notification.message}"`
      }).catch(console.error);
    }

    // SMS if enabled and critical
    if (preferences.sms && notification.severity === 'critical') {
      base44.integrations.Core.InvokeLLM({
        prompt: `Send SMS alert via Twilio: "${notification.title}"`
      }).catch(console.error);
    }
  };

  const dismissNotification = async (id) => {
    try {
      await base44.entities.RealTimeAlert.update(id, { status: 'read' });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const getIcon = (category) => {
    switch (category) {
      case 'trading': return <TrendingUp className="w-4 h-4" />;
      case 'communication': return <MessageSquare className="w-4 h-4" />;
      case 'workflows': return <Zap className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Bell className="w-5 h-5 text-cyan-400" />
          Notifications ({notifications.length})
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 bg-white/5 rounded hover:bg-white/10"
        >
          <Settings className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/5 border border-white/10 rounded-lg p-4"
          >
            <h4 className="text-white font-semibold mb-3 text-sm">Notification Preferences</h4>
            <div className="space-y-2">
              {Object.entries(preferences).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between">
                  <span className="text-white/70 text-sm capitalize">{key}</span>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setPreferences({ ...preferences, [key]: e.target.checked })}
                    className="w-4 h-4"
                  />
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {notifications.map((notification, idx) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: idx * 0.05 }}
              className={`bg-white/5 border rounded-lg p-3 ${
                notification.severity === 'critical'
                  ? 'border-red-400/50'
                  : notification.severity === 'high'
                  ? 'border-yellow-400/50'
                  : 'border-white/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-cyan-400 mt-1">
                    {getIcon(notification.category)}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{notification.title}</p>
                    <p className="text-white/60 text-xs mt-1">{notification.message}</p>
                    <p className="text-white/40 text-xs mt-2">
                      {new Date(notification.created_date).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  <X className="w-4 h-4 text-white/40" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}