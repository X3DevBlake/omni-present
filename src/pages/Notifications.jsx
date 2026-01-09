import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Trash2, Settings, Filter } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function Notifications() {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'device', title: 'Device Offline', message: 'Omni-Core Hub went offline', time: '2 min ago', read: false },
    { id: 2, type: 'agent', title: 'Agent Evolution Complete', message: 'Generation 50 achieved 95% fitness', time: '1 hour ago', read: false },
    { id: 3, type: 'system', title: 'Firmware Update Available', message: 'Version 2.1.0 ready for 5 devices', time: '3 hours ago', read: true },
    { id: 4, type: 'billing', title: 'Payment Successful', message: 'Your Pro plan has been renewed', time: '1 day ago', read: true },
    { id: 5, type: 'team', title: 'New Team Member', message: 'alice@example.com joined your team', time: '2 days ago', read: true }
  ]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getTypeColor = (type) => {
    const colors = {
      device: 'cyan',
      agent: 'purple',
      system: 'blue',
      billing: 'green',
      team: 'yellow'
    };
    return colors[type] || 'white';
  };

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                <Bell className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Notifications</h1>
                <p className="text-white/60">{notifications.filter(n => !n.read).length} unread</p>
              </div>
            </div>
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-xl text-sm hover:bg-cyan-500/30 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Mark All Read
            </button>
          </div>
        </motion.div>

        <div className="space-y-3">
          {notifications.map((notification, i) => {
            const color = getTypeColor(notification.type);
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-black/40 backdrop-blur-xl border rounded-2xl p-6 ${
                  notification.read ? 'border-white/10' : `border-${color}-500/30`
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-lg bg-${color}-500/20 flex items-center justify-center flex-shrink-0`}>
                      <Bell className={`w-5 h-5 text-${color}-400`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold">{notification.title}</h3>
                        {!notification.read && (
                          <div className={`w-2 h-2 rounded-full bg-${color}-400`} />
                        )}
                      </div>
                      <p className="text-white/70 text-sm mb-2">{notification.message}</p>
                      <div className="text-white/40 text-xs">{notification.time}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 text-white/60 hover:text-cyan-400"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 text-white/60 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AuroraBackground>
  );
}