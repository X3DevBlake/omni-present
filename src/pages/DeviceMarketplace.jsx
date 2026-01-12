import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Smartphone, Glasses, ShoppingCart, DollarSign } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DeviceMarketplace() {
  const [userEmail, setUserEmail] = useState(null);
  const [devices, setDevices] = useState([]);
  const [myDevices, setMyDevices] = useState([]);

  useEffect(() => {
    base44.auth.me()
      .then(user => {
        setUserEmail(user?.email);
        loadMarketplace(user?.email);
      })
      .catch(() => setUserEmail(null));
  }, []);

  const loadMarketplace = async (email) => {
    try {
      const allDevices = await base44.entities.HolographicDevice.list({ for_sale: true });
      const owned = await base44.entities.HolographicDevice.list({ owner_email: email });
      setDevices(allDevices);
      setMyDevices(owned);
    } catch (error) {
      console.error('Error loading marketplace:', error);
    }
  };

  const purchaseDevice = async (deviceId) => {
    try {
      await base44.entities.HolographicDevice.update(deviceId, {
        owner_email: userEmail,
        for_sale: false
      });
      alert('Device purchased successfully!');
      await loadMarketplace(userEmail);
    } catch (error) {
      console.error('Purchase error:', error);
    }
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'holographic_projector': return Monitor;
      case 'ar_glasses': return Glasses;
      case 'mobile': return Smartphone;
      default: return Monitor;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0D1A] via-[#1a1a2e] to-[#0D0D1A] p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Holographic Device Marketplace</h1>
          <p className="text-white/60">Purchase devices to run your holographic agents</p>
        </motion.div>

        {/* My Devices */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">My Devices</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {myDevices.map((device, idx) => {
              const Icon = getDeviceIcon(device.device_type);
              return (
                <motion.div
                  key={device.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{device.device_name}</h3>
                      <p className="text-white/60 text-sm">{device.device_type}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-white/70">Status: <span className={`font-semibold ${device.status === 'online' ? 'text-green-400' : 'text-gray-400'}`}>{device.status}</span></p>
                    <p className="text-white/70">Agents: <span className="text-cyan-400">{device.connected_agents?.length || 0}</span></p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Available Devices */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Available Devices</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {devices.map((device, idx) => {
              const Icon = getDeviceIcon(device.device_type);
              return (
                <motion.div
                  key={device.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-cyan-400/50 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{device.device_name}</h3>
                      <p className="text-white/60 text-sm">{device.device_type}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-white/60">Holographic:</span>
                      <span className={device.capabilities?.holographic_projection ? 'text-green-400' : 'text-gray-400'}>
                        {device.capabilities?.holographic_projection ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-white/60">Voice:</span>
                      <span className={device.capabilities?.voice_input ? 'text-green-400' : 'text-gray-400'}>
                        {device.capabilities?.voice_input ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-xs">Price</p>
                      <p className="text-cyan-400 text-2xl font-bold">${device.price}</p>
                    </div>
                    <button
                      onClick={() => purchaseDevice(device.id)}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded font-semibold hover:shadow-lg flex items-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Buy
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}