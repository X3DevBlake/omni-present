import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Home, Car, Watch, Wifi, Zap } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { toast } from 'sonner';

export default function PhysicalWorldIntegration() {
  const [connectedDevices, setConnectedDevices] = useState([
    {
      id: '1',
      name: 'Smart Home Hub',
      type: 'home',
      icon: Home,
      status: 'connected',
      omniEnabled: true,
      lastTransaction: 15.5,
      color: 'from-blue-500 to-indigo-500'
    },
    {
      id: '2',
      name: 'Smart Watch',
      type: 'wearable',
      icon: Watch,
      status: 'connected',
      omniEnabled: true,
      lastTransaction: 5.2,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: '3',
      name: 'Mobile Phone',
      type: 'phone',
      icon: Smartphone,
      status: 'connected',
      omniEnabled: true,
      lastTransaction: 32.0,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: '4',
      name: 'Connected Car',
      type: 'vehicle',
      icon: Car,
      status: 'offline',
      omniEnabled: false,
      lastTransaction: 0,
      color: 'from-orange-500 to-red-500'
    },
  ]);

  const toggleOmni = (deviceId) => {
    setConnectedDevices(devices =>
      devices.map(d =>
        d.id === deviceId ? { ...d, omniEnabled: !d.omniEnabled } : d
      )
    );
    toast.success('Device Omni settings updated!');
  };

  const useCases = [
    {
      icon: '🏪',
      title: 'In-Store Payments',
      description: 'Tap your physical Omni Card or device to pay in any store'
    },
    {
      icon: '🚗',
      title: 'Autonomous Vehicle Payments',
      description: 'Your car pays for parking, tolls, and charging automatically'
    },
    {
      icon: '🏠',
      title: 'Smart Home Automation',
      description: 'Devices order supplies and pay for services autonomously'
    },
    {
      icon: '⌚',
      title: 'Wearable Transactions',
      description: 'Pay with a gesture using your smartwatch'
    },
    {
      icon: '🤖',
      title: 'IoT Device Economy',
      description: 'Your devices trade resources and services with each other'
    },
    {
      icon: '🎮',
      title: 'Gaming Integration',
      description: 'Earn and spend Omni in physical AR/VR gaming experiences'
    },
  ];

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Physical World <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Integration</span>
          </h1>
          <p className="text-white/60 text-lg">Connect your real-world devices to the Omni economy</p>
        </motion.div>

        {/* Connected Devices */}
        <div className="mb-12">
          <h2 className="text-white font-bold text-2xl mb-6">Connected Devices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {connectedDevices.map((device, index) => {
              const DeviceIcon = device.icon;
              return (
                <motion.div
                  key={device.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all"
                >
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${device.color} flex items-center justify-center mb-4`}>
                    <DeviceIcon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-white font-bold mb-2">{device.name}</h3>

                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-2 h-2 rounded-full ${
                      device.status === 'connected' ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    <span className={`text-sm ${
                      device.status === 'connected' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {device.status}
                    </span>
                  </div>

                  {device.status === 'connected' && (
                    <>
                      <div className="bg-white/5 rounded-lg p-3 mb-4">
                        <div className="text-white/60 text-xs mb-1">Last Transaction</div>
                        <div className="text-cyan-400 font-bold">{device.lastTransaction} OMNI</div>
                      </div>

                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-white/60 text-sm">Omni Enabled</span>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={device.omniEnabled}
                            onChange={() => toggleOmni(device.id)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                        </div>
                      </label>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-12">
          <h2 className="text-white font-bold text-2xl mb-6">Physical World Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-500/40 transition-all"
              >
                <div className="text-5xl mb-4">{useCase.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{useCase.title}</h3>
                <p className="text-white/60 text-sm">{useCase.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Integration Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Wifi className="w-8 h-8 text-cyan-400" />
              <div>
                <div className="text-white/60 text-sm">Connected Devices</div>
                <div className="text-white text-3xl font-bold">
                  {connectedDevices.filter(d => d.status === 'connected').length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-white/60 text-sm">Active Integrations</div>
                <div className="text-white text-3xl font-bold">
                  {connectedDevices.filter(d => d.omniEnabled).length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="w-8 h-8 text-purple-400" />
              <div>
                <div className="text-white/60 text-sm">Total Transactions</div>
                <div className="text-white text-3xl font-bold">
                  {connectedDevices.reduce((sum, d) => sum + d.lastTransaction, 0).toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}