import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Monitor, Cloud, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function CrossDeviceSyncManager() {
  const [devices, setDevices] = useState([
    { id: 1, name: 'Desktop Chrome', type: 'desktop', lastSync: new Date(Date.now() - 300000), synced: true },
    { id: 2, name: 'iPhone Safari', type: 'mobile', lastSync: new Date(Date.now() - 600000), synced: true }
  ]);
  const [syncStatus, setSyncStatus] = useState('synced');

  const syncAllDevices = async () => {
    setSyncStatus('syncing');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const updated = devices.map(d => ({
      ...d,
      lastSync: new Date(),
      synced: true
    }));
    setDevices(updated);
    setSyncStatus('synced');
  };

  return (
    <div className="bg-black/40 border border-teal-500/30 rounded-2xl p-6 space-y-4">
      <h3 className="text-white font-bold flex items-center gap-2">
        <Cloud className="w-5 h-5 text-teal-400" />
        Cross-Device Sync
      </h3>

      <div className="space-y-2">
        {devices.map(device => (
          <motion.div
            key={device.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-teal-500/20 rounded-lg p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3 flex-1">
              {device.type === 'desktop' ? (
                <Monitor className="w-4 h-4 text-teal-400" />
              ) : (
                <Smartphone className="w-4 h-4 text-teal-400" />
              )}
              <div>
                <p className="text-white font-bold text-sm">{device.name}</p>
                <p className="text-white/60 text-xs">
                  Last sync: {device.lastSync.toLocaleTimeString()}
                </p>
              </div>
            </div>
            {device.synced && (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            )}
          </motion.div>
        ))}
      </div>

      <motion.button
        onClick={syncAllDevices}
        disabled={syncStatus === 'syncing'}
        whileHover={{ scale: 1.05 }}
        className={`w-full py-2 rounded font-medium text-xs transition-all ${
          syncStatus === 'syncing'
            ? 'bg-teal-500/10 border border-teal-500/20 text-teal-300/50 cursor-not-allowed'
            : 'bg-teal-500/20 border border-teal-500/40 text-teal-300 hover:bg-teal-500/30'
        }`}
      >
        {syncStatus === 'syncing' ? '⟳ Syncing...' : '↻ Sync All Devices'}
      </motion.button>

      <p className="text-white/50 text-xs text-center">
        Preferences synchronized across all your devices
      </p>
    </div>
  );
}