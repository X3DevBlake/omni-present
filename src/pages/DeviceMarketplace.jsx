import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Camera, Wifi, Zap, ShoppingCart, Star } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function DeviceMarketplace() {
  const [devices, setDevices] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    const allDevices = await base44.entities.PhysicalDevice.list();
    setDevices(allDevices);
  };

  const filteredDevices = filter === 'all' 
    ? devices 
    : devices.filter(d => d.category === filter);

  const categories = ['all', 'core', 'sensors', 'display', 'robotics', 'interface', 'power', 'networking'];

  const handlePurchase = async (device) => {
    const user = await base44.auth.me();
    
    await base44.entities.Order.create({
      device_id: device.id,
      device_name: device.name,
      quantity: 1,
      total_price: device.price,
      shipping_address: { name: user.full_name, email: user.email },
      payment_method: 'Omni Token'
    });

    toast.success(`${device.name} ordered successfully!`);
  };

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            Device <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Marketplace</span>
          </h1>
          <p className="text-white/60 text-lg">Discover, purchase, and deploy AI-compatible hardware</p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                filter === cat
                  ? 'bg-cyan-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Featured Banner */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">IoT Integration Ready</h2>
              <p className="text-white/70 mb-4">All devices support real-time data streaming and AI agent control</p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-cyan-400" />
                  <span className="text-white text-sm">Wireless</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-white text-sm">Low Power</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-purple-400" />
                  <span className="text-white text-sm">AI Optimized</span>
                </div>
              </div>
            </div>
            <Camera className="w-24 h-24 text-cyan-400/30" />
          </div>
        </div>

        {/* Device Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map((device, i) => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all group"
            >
              <div className="text-6xl mb-4">{device.thumbnail || '🔌'}</div>
              
              <h3 className="text-white font-bold text-xl mb-2">{device.name}</h3>
              <p className="text-white/60 text-sm mb-4">{device.description}</p>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-white/60 text-sm">(4.8)</span>
              </div>

              {device.features && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {device.features.slice(0, 3).map((feature, i) => (
                    <span key={i} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mt-4">
                <div>
                  <div className="text-2xl font-bold text-white">${device.price}</div>
                  <div className="text-white/60 text-xs">In stock: {device.stock_quantity}</div>
                </div>
                <button
                  onClick={() => handlePurchase(device)}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-all"
                >
                  <ShoppingCart className="w-4 h-4 inline mr-1" />
                  Buy
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredDevices.length === 0 && (
          <div className="text-center py-12">
            <Cpu className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <div className="text-white/60">No devices found in this category</div>
          </div>
        )}
      </div>
    </AuroraBackground>
  );
}