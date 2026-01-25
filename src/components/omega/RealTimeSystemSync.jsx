import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, Globe, Database } from 'lucide-react';

const RealTimeSystemSync = () => {
  const [syncStatus, setSyncStatus] = useState('Initializing...');
  const [activeMetrics, setActiveMetrics] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [pulseActive, setPulseActive] = useState(true);

  useEffect(() => {
    // Simulate initial sync only
    setSyncStatus('All systems synchronized.');
    setActiveMetrics(12);
    setLastUpdate(new Date());
    
    const pulseInterval = setInterval(() => {
      setPulseActive(prev => !prev);
    }, 3000);

    return () => {
      clearInterval(pulseInterval);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-4 right-4 z-50"
    >
      <div className="bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-pink-900/90 backdrop-blur-xl rounded-xl p-3 border border-indigo-500/30 shadow-2xl min-w-[280px]">
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ rotate: pulseActive ? 360 : 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <Activity className="w-5 h-5 text-green-400" />
            <motion.div
              animate={{ scale: pulseActive ? [1, 1.5, 1] : 1, opacity: pulseActive ? [1, 0] : 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 rounded-full bg-green-400"
            />
          </motion.div>
          
          <div className="flex-1">
            <div className="text-xs font-semibold text-white/90 mb-0.5">System Sync</div>
            <AnimatePresence mode="wait">
              <motion.div
                key={syncStatus}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
                className="text-[10px] text-gray-300"
              >
                {syncStatus}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center space-x-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400 border-t border-white/10 pt-2">
          <div className="flex items-center space-x-1">
            <Database className="w-3 h-3" />
            <span>{activeMetrics} metrics</span>
          </div>
          {lastUpdate && (
            <div className="flex items-center space-x-1">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span>{lastUpdate.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RealTimeSystemSync;