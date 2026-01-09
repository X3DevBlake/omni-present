import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, ShoppingCart, Settings, Zap, Activity, Wrench, Shield, BarChart3, Wifi } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function DeviceHome() {
  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-full">
            <span className="text-cyan-400 text-sm font-semibold">⚡ Device Hub</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Physical Device
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Management</span>
          </h1>
          <p className="text-white/60 text-lg max-w-3xl mx-auto">
            Control, monitor, and optimize your Omni-Present hardware fleet
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Devices', value: '24', icon: Cpu, color: 'cyan' },
            { label: 'Fleet Health', value: '98%', icon: Activity, color: 'green' },
            { label: 'Pending Updates', value: '3', icon: Zap, color: 'yellow' },
            { label: 'Total Uptime', value: '99.9%', icon: Shield, color: 'blue' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <stat.icon className={`w-6 h-6 text-${stat.color}-400 mb-2`} />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Device Shop',
              description: 'Browse and purchase Omni-Present hardware',
              icon: ShoppingCart,
              page: 'DeviceShop',
              gradient: 'from-cyan-500/20 to-blue-500/20',
              border: 'border-cyan-500/30'
            },
            {
              title: 'My Devices',
              description: 'View and manage your device inventory',
              icon: Cpu,
              page: 'Profile',
              gradient: 'from-purple-500/20 to-pink-500/20',
              border: 'border-purple-500/30'
            },
            {
              title: 'Device Interaction',
              description: 'Real-time control and monitoring',
              icon: Zap,
              page: 'DeviceInteraction',
              gradient: 'from-yellow-500/20 to-orange-500/20',
              border: 'border-yellow-500/30'
            },
            {
              title: 'Fleet Management',
              description: 'Orchestrate multiple devices',
              icon: BarChart3,
              page: 'FleetManagement',
              gradient: 'from-green-500/20 to-emerald-500/20',
              border: 'border-green-500/30'
            },
            {
              title: 'Device Settings',
              description: 'Configure global device preferences',
              icon: Settings,
              page: 'DeviceSettings',
              gradient: 'from-indigo-500/20 to-purple-500/20',
              border: 'border-indigo-500/30'
            },
            {
              title: 'Firmware Updates',
              description: 'Keep your devices up to date',
              icon: Zap,
              page: 'FirmwareUpdates',
              gradient: 'from-blue-500/20 to-cyan-500/20',
              border: 'border-blue-500/30'
            },
            {
              title: 'Device Health',
              description: 'Monitor performance and diagnostics',
              icon: Activity,
              page: 'DeviceHealth',
              gradient: 'from-red-500/20 to-pink-500/20',
              border: 'border-red-500/30'
            },
            {
              title: 'Maintenance Schedule',
              description: 'Plan and track service intervals',
              icon: Wrench,
              page: 'MaintenanceSchedule',
              gradient: 'from-orange-500/20 to-yellow-500/20',
              border: 'border-orange-500/30'
            },
            {
              title: 'Device Telemetry',
              description: 'Real-time sensor data streams',
              icon: BarChart3,
              page: 'DeviceTelemetry',
              gradient: 'from-teal-500/20 to-cyan-500/20',
              border: 'border-teal-500/30'
            },
            {
              title: 'IoT Device Control',
              description: 'AI-powered IoT device management',
              icon: Wifi,
              page: 'IoTDeviceControl',
              gradient: 'from-purple-500/20 to-indigo-500/20',
              border: 'border-purple-500/30'
            }
          ].map((item, i) => (
            <Link key={i} to={createPageUrl(item.page)}>
              <motion.div
                className={`bg-gradient-to-br ${item.gradient} border ${item.border} rounded-2xl p-6 hover:scale-105 transition-all cursor-pointer group`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm">{item.description}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}