import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function PerformanceMonitor() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleRateLimit = (event) => {
      const { message, type } = event.detail;
      const id = Date.now();
      
      setNotifications(prev => [...prev, { id, message, type }]);
      
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
    };

    window.addEventListener('rateLimitNotification', handleRateLimit);
    return () => window.removeEventListener('rateLimitNotification', handleRateLimit);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`p-4 rounded-lg shadow-lg backdrop-blur-sm border ${
              notif.type === 'error' 
                ? 'bg-red-500/20 border-red-500/50' 
                : notif.type === 'info'
                ? 'bg-blue-500/20 border-blue-500/50'
                : 'bg-green-500/20 border-green-500/50'
            }`}
          >
            <div className="flex items-center gap-2">
              {notif.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
              {notif.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
              {notif.type === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
              <p className="text-white text-sm">{notif.message}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}