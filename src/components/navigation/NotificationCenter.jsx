import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { base44 } from '@/api/base44Client';

export default function NotificationCenter({ userEmail }) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notifData, refetch } = useNotifications(userEmail);
  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unreadCount || 0;

  if (!userEmail) return null;

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        className="fixed top-4 right-16 z-40 w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:border-purple-400/50 transition-all relative"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center"
          >
            {unreadCount}
          </motion.div>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-20 right-4 w-96 z-50 bg-black/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl max-h-96 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-white font-bold">Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-white/60">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer last:border-b-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.read ? 'bg-gray-500' : 'bg-cyan-400 animate-pulse'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium">{notif.title}</p>
                          <p className="text-white/60 text-xs mt-1">
                            {new Date(notif.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}