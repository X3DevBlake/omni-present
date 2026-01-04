import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, User, GitMerge, MessageCircle, CheckSquare, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationSystem({ blueprintId }) {
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Simulate real-time notifications
    const interval = setInterval(() => {
      const mockNotifications = [
        {
          id: Date.now(),
          type: 'mention',
          title: 'You were mentioned',
          message: 'Alice Chen mentioned you in a comment on GPU Array 1',
          timestamp: new Date(),
          read: false,
          icon: MessageCircle,
          color: 'cyan'
        },
        {
          id: Date.now() + 1,
          type: 'task',
          title: 'New task assigned',
          message: 'Review and approve memory pool configuration changes',
          timestamp: new Date(),
          read: false,
          icon: CheckSquare,
          color: 'purple'
        },
        {
          id: Date.now() + 2,
          type: 'merge-conflict',
          title: 'Merge conflict detected',
          message: '3 conflicts found when merging feature/optimization branch',
          timestamp: new Date(),
          read: false,
          icon: GitMerge,
          color: 'yellow'
        },
        {
          id: Date.now() + 3,
          type: 'alert',
          title: 'Performance alert',
          message: 'CPU utilization exceeded 90% threshold',
          timestamp: new Date(),
          read: false,
          icon: AlertCircle,
          color: 'red'
        }
      ];

      if (Math.random() > 0.7) {
        const newNotif = mockNotifications[Math.floor(Math.random() * mockNotifications.length)];
        setNotifications(prev => [newNotif, ...prev].slice(0, 20));
        setUnreadCount(prev => prev + 1);
        
        // Show toast for important notifications
        if (newNotif.type === 'merge-conflict' || newNotif.type === 'alert') {
          toast.error(newNotif.title, { description: newNotif.message });
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [blueprintId]);

  const markAsRead = (notificationId) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getColorClass = (color) => {
    const colors = {
      cyan: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
      purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
      yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
      red: 'bg-red-500/10 border-red-500/30 text-red-400'
    };
    return colors[color] || colors.cyan;
  };

  return (
    <>
      <motion.button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed top-6 right-20 z-50 p-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-20 z-50 w-96 max-h-[70vh] overflow-hidden bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-white font-semibold">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={() => setShowPanel(false)} className="text-white/60 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(70vh-80px)]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-white/40">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notif) => {
                  const Icon = notif.icon;
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 border-b border-white/5 cursor-pointer transition-colors ${
                        notif.read ? 'bg-transparent' : 'bg-white/5'
                      } hover:bg-white/10`}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg border ${getColorClass(notif.color)}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white text-sm font-medium">{notif.title}</h4>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-cyan-400" />
                            )}
                          </div>
                          <p className="text-white/60 text-xs mb-2">{notif.message}</p>
                          <span className="text-white/40 text-xs">
                            {notif.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}