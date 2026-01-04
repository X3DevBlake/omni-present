import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Share2, MessageSquare, Clock, X } from 'lucide-react';

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Simulate notifications (replace with actual WebSocket connection)
    const sampleNotifications = [
      { id: 1, type: 'share', message: 'John Doe shared "Enterprise AI Config" with you', time: '2m ago', icon: Share2 },
      { id: 2, type: 'annotation', message: 'Sarah added a question to GPU Array 1', time: '5m ago', icon: MessageSquare },
      { id: 3, type: 'version', message: 'New version available for "Cloud Training Setup"', time: '1h ago', icon: Clock },
    ];

    setTimeout(() => setNotifications(sampleNotifications), 2000);
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-20 right-20 z-50 w-80 max-h-[400px] overflow-y-auto">
      <AnimatePresence>
        {notifications.map((notif) => {
          const Icon = notif.icon;
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="mb-2 p-4 rounded-xl bg-black/90 backdrop-blur-xl border border-white/20 shadow-lg"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm">{notif.message}</p>
                  <p className="text-white/40 text-xs mt-1">{notif.time}</p>
                </div>
                <button
                  onClick={() => removeNotification(notif.id)}
                  className="p-1 rounded hover:bg-white/10"
                >
                  <X className="w-4 h-4 text-white/40" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}