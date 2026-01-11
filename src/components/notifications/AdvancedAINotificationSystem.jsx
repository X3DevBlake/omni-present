import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, TrendingDown, Zap, Trophy, Clock, Settings, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AdvancedAINotificationSystem() {
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({
    fraud: true,
    taxOptimization: true,
    marketSentiment: true,
    gamification: true,
    urgencyLevel: 'medium',
    channels: ['in-app', 'email'],
  });
  const [showSettings, setShowSettings] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
    
    loadNotifications();
    subscribeToNotifications();
  }, []);

  const loadNotifications = async () => {
    if (!userEmail) return;

    try {
      const [fraudAlerts, anomalies] = await Promise.all([
        base44.entities.FraudAlert.filter({ user_email: userEmail, status: 'pending' }, '-detected_at', 10),
        base44.entities.FinancialHealthScore.filter({ user_email: userEmail }, '-updated_date', 1),
      ]);

      const notificationsList = [];

      // Fraud alerts
      if (preferences.fraud && fraudAlerts?.length > 0) {
        fraudAlerts.forEach(alert => {
          notificationsList.push({
            id: `fraud-${alert.id}`,
            type: 'fraud',
            title: 'Fraud Alert',
            message: alert.description,
            severity: alert.severity,
            timestamp: new Date(alert.detected_at),
            action: 'Review',
          });
        });
      }

      // Tax optimization opportunities
      if (preferences.taxOptimization) {
        notificationsList.push({
          id: 'tax-opportunity',
          type: 'tax',
          title: 'Tax Optimization Opportunity',
          message: 'Potential tax-loss harvesting opportunity in TECH positions. Est. savings: $2,400',
          severity: 'high',
          timestamp: new Date(),
          action: 'Explore',
        });
      }

      // Market sentiment alerts
      if (preferences.marketSentiment) {
        notificationsList.push({
          id: 'market-sentiment',
          type: 'market',
          title: 'Market Sentiment Shift',
          message: 'Tech sector sentiment turned negative. Your portfolio has 42% tech exposure.',
          severity: 'medium',
          timestamp: new Date(),
          action: 'View Analysis',
        });
      }

      // Gamification notifications
      if (preferences.gamification) {
        notificationsList.push({
          id: 'gamification',
          type: 'achievement',
          title: '🏆 Achievement Unlocked',
          message: 'Completed "Tax Expert" badge. You\'re now Level 6!',
          severity: 'low',
          timestamp: new Date(),
          action: 'View Badge',
        });
      }

      setNotifications(notificationsList);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const subscribeToNotifications = () => {
    // Subscribe to real-time updates
    if (!userEmail) return;

    base44.entities.FraudAlert.subscribe((event) => {
      if (event.type === 'create' && event.data.user_email === userEmail && preferences.fraud) {
        setNotifications(prev => [...prev, {
          id: `fraud-${event.id}`,
          type: 'fraud',
          title: 'New Fraud Alert',
          message: event.data.description,
          severity: event.data.severity,
          timestamp: new Date(),
          action: 'Review',
        }]);
      }
    });
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-500/20 border-red-400 text-red-300',
      high: 'bg-orange-500/20 border-orange-400 text-orange-300',
      medium: 'bg-yellow-500/20 border-yellow-400 text-yellow-300',
      low: 'bg-cyan-500/20 border-cyan-400 text-cyan-300',
    };
    return colors[severity] || colors.medium;
  };

  const getIcon = (type) => {
    const icons = {
      fraud: <AlertCircle className="w-5 h-5" />,
      tax: <TrendingDown className="w-5 h-5" />,
      market: <TrendingDown className="w-5 h-5" />,
      achievement: <Trophy className="w-5 h-5" />,
    };
    return icons[type] || <Zap className="w-5 h-5" />;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">AI-Powered Notifications</h3>
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-white/10 rounded-lg transition-all"
        >
          <Settings className="w-5 h-5 text-white/60" />
        </motion.button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4"
          >
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.fraud}
                  onChange={(e) => setPreferences({ ...preferences, fraud: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-white/80">Fraud & Security Alerts</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.taxOptimization}
                  onChange={(e) => setPreferences({ ...preferences, taxOptimization: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-white/80">Tax Optimization Opportunities</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.marketSentiment}
                  onChange={(e) => setPreferences({ ...preferences, marketSentiment: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-white/80">Market Sentiment Alerts</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.gamification}
                  onChange={(e) => setPreferences({ ...preferences, gamification: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-white/80">Gamification & Achievements</span>
              </label>
            </div>

            <div>
              <label className="text-white/80 text-sm block mb-2">Urgency Level</label>
              <select
                value={preferences.urgencyLevel}
                onChange={(e) => setPreferences({ ...preferences, urgencyLevel: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
              >
                <option value="all">All</option>
                <option value="high">High & Critical Only</option>
                <option value="medium">Medium & Above</option>
              </select>
            </div>

            <div>
              <label className="text-white/80 text-sm block mb-2">Notification Channels</label>
              <div className="space-y-2">
                {['in-app', 'email', 'sms'].map((channel) => (
                  <label key={channel} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.channels.includes(channel)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPreferences({ ...preferences, channels: [...preferences.channels, channel] });
                        } else {
                          setPreferences({ ...preferences, channels: preferences.channels.filter(c => c !== channel) });
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-white/80 text-sm capitalize">{channel}</span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`border rounded-lg p-4 flex items-start justify-between ${getSeverityColor(notif.severity)}`}
              >
                <div className="flex items-start gap-3 flex-1">
                  {getIcon(notif.type)}
                  <div className="flex-1">
                    <p className="font-semibold">{notif.title}</p>
                    <p className="text-sm opacity-90 mt-1">{notif.message}</p>
                    <button className="text-xs mt-2 opacity-75 hover:opacity-100 font-semibold">
                      {notif.action}
                    </button>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => dismissNotification(notif.id)}
                  className="flex-shrink-0 ml-2"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-white/60">
              <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No notifications at this moment</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}