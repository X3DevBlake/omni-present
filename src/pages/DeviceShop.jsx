import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Package, Zap, Eye, Check, AlertCircle } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import Device3DViewer from '../components/devices/Device3DViewer';
import PaymentIntegration from '../components/marketplace/PaymentIntegration';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function DeviceShop() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const data = await base44.entities.PhysicalDevice.list();
      setDevices(data);
    } catch (err) {
      toast.error('Failed to load devices');
    }
  };

  const categories = [
    { id: 'all', label: 'All Devices', icon: '🌐' },
    { id: 'core', label: 'Core Systems', icon: '🧠' },
    { id: 'sensors', label: 'Sensors', icon: '📡' },
    { id: 'display', label: 'Display', icon: '🖥️' },
    { id: 'robotics', label: 'Robotics', icon: '🤖' },
    { id: 'interface', label: 'Interface', icon: '🎮' },
    { id: 'power', label: 'Power', icon: '⚡' },
    { id: 'networking', label: 'Networking', icon: '📶' }
  ];

  const filteredDevices = filter === 'all' 
    ? devices 
    : devices.filter(d => d.category === filter);

  const handlePurchase = async (device) => {
    if (device.stock_quantity <= 0) {
      toast.error('Device out of stock');
      return;
    }
    setSelectedDevice(device);
    setShowPayment(true);
  };

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Omni-Present <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Device Shop</span>
          </h1>
          <p className="text-white/60 text-lg">Bring your AI simulations into the physical world</p>
        </motion.div>

        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap ${
                filter === cat.id
                  ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-300'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map(device => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all"
            >
              <div className="text-6xl mb-4 text-center">{device.thumbnail}</div>
              
              <h3 className="text-white font-bold text-xl mb-2">{device.name}</h3>
              <p className="text-white/60 text-sm mb-4 line-clamp-2">{device.description}</p>

              <div className="flex gap-2 mb-4 flex-wrap">
                {device.features?.slice(0, 3).map((feature, i) => (
                  <span key={i} className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded text-xs">
                    {feature}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="text-green-400 text-2xl font-bold">${device.price}</div>
                <div className={`flex items-center gap-1 text-xs ${
                  device.stock_quantity > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {device.stock_quantity > 0 ? (
                    <><Check className="w-3 h-3" /> In Stock ({device.stock_quantity})</>
                  ) : (
                    <><AlertCircle className="w-3 h-3" /> Out of Stock</>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedDevice(device)}
                  className="flex-1 py-2 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => handlePurchase(device)}
                  disabled={device.stock_quantity <= 0}
                  className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Buy
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Device Detail Modal */}
      <AnimatePresence>
        {selectedDevice && !showPayment && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedDevice(null)} />
            <motion.div
              className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <Device3DViewer 
                device={selectedDevice} 
                onFeatureClick={(feature) => toast.info(feature)}
              />

              <div className="mt-6">
                <h2 className="text-white font-bold text-2xl mb-4">{selectedDevice.name}</h2>
                <p className="text-white/70 mb-6">{selectedDevice.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-cyan-400 font-semibold mb-2">Features</h4>
                    <ul className="space-y-1">
                      {selectedDevice.features?.map((f, i) => (
                        <li key={i} className="text-white/60 text-sm flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-400" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-purple-400 font-semibold mb-2">Specifications</h4>
                    {selectedDevice.specifications && Object.entries(selectedDevice.specifications).map(([key, val]) => (
                      <div key={key} className="text-white/60 text-sm mb-1">
                        <span className="text-white/80">{key}:</span> {val}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(selectedDevice)}
                  disabled={selectedDevice.stock_quantity <= 0}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50"
                >
                  Purchase for ${selectedDevice.price}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PaymentIntegration
        show={showPayment}
        onClose={() => {
          setShowPayment(false);
          setSelectedDevice(null);
        }}
        item={selectedDevice}
        isPhysicalDevice={true}
        onPurchaseComplete={async (order) => {
          toast.success(`Order placed! Order #${order.order_number}`);
          await loadDevices();
          setShowPayment(false);
          setSelectedDevice(null);
        }}
      />
    </AuroraBackground>
  );
}