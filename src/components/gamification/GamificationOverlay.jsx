import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Star, Flame, Gift } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function GamificationOverlay() {
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const showNotification = (notification) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { ...notification, id }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Listen for gamification events
  useEffect(() => {
    if (!user) return;

    const unsubscribe = base44.entities.OmniAchievement.subscribe((event) => {
      if (event.type === 'create' && event.data.user_email === user.email) {
        showNotification({
          type: 'achievement',
          title: 'Achievement Unlocked!',
          message: event.data.name,
          xp: event.data.xp,
          icon: Trophy
        });
      }
    });

    return unsubscribe;
  }, [user]);

  return (
    <div className="fixed top-24 right-6 z-50 space-y-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => {
          const Icon = notif.icon || Gift;
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              className="bg-gradient-to-r from-purple-900/95 to-pink-900/95 backdrop-blur-xl border-2 border-amber-400 rounded-2xl p-4 min-w-[300px] shadow-2xl pointer-events-auto"
            >
              <div className="flex items-start gap-3">
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6 }}
                >
                  <Icon className="w-8 h-8 text-amber-400" />
                </motion.div>
                <div className="flex-1">
                  <div className="text-amber-400 font-bold text-sm mb-1">{notif.title}</div>
                  <div className="text-white text-lg font-bold mb-2">{notif.message}</div>
                  {notif.xp && (
                    <div className="flex items-center gap-1 text-cyan-400 text-sm">
                      <Zap className="w-4 h-4" />
                      +{notif.xp} XP
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}