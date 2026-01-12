import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Hand, Search, Vibrate } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import HapticFeedbackController from '../components/devices/HapticFeedbackController';
import GestureSequenceBuilder from '../components/devices/GestureSequenceBuilder';
import DynamicDeviceDiscovery from '../components/devices/DynamicDeviceDiscovery';
import HapticCustomizer from '../components/haptics/HapticCustomizer';
import MultiModalInteractionPanel from '../components/devices/MultiModalInteractionPanel';
import AutonomousDeviceLearning from '../components/devices/AutonomousDeviceLearning';

export default function DeviceIntegrationHub() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    const data = await base44.entities.RealWorldDevice.list();
    setDevices(data);
    if (data.length > 0) setSelectedDevice(data[0].id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0D1A] via-[#1a1a2e] to-[#0D0D1A] p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Smartphone className="w-10 h-10 text-cyan-400" />
            Device Integration Hub
          </h1>
          <p className="text-white/60">Advanced haptic control and gesture interpretation</p>
        </motion.div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          {devices.slice(0, 3).map(device => (
            <div
              key={device.id}
              onClick={() => setSelectedDevice(device.id)}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedDevice === device.id
                  ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-2 border-cyan-400'
                  : 'bg-white/5 border border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Smartphone className="w-6 h-6 text-cyan-400" />
                {device.haptic_capable && <Vibrate className="w-4 h-4 text-green-400" />}
              </div>
              <p className="text-white font-semibold">{device.device_name}</p>
              <p className="text-white/60 text-xs">{device.os_type}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <HapticFeedbackController deviceId={selectedDevice} agentId={selectedAgent} />
          <GestureSequenceBuilder agentId={selectedAgent} deviceId={selectedDevice} />
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <MultiModalInteractionPanel deviceId={selectedDevice} agentId={selectedAgent} />
          <AutonomousDeviceLearning agentId={selectedAgent} />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <DynamicDeviceDiscovery agentId={selectedAgent} />
          <HapticCustomizer agentId={selectedAgent} />
        </div>
      </div>
    </div>
  );
}