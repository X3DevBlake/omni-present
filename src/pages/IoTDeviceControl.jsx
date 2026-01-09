import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Camera, Thermometer, Activity, Zap, AlertCircle } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import HubNav from '../components/navigation/HubNav';
import IoTDataStream from '../components/devices/IoTDataStream';
import AgentPermissionsManager from '../components/devices/AgentPermissionsManager';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function IoTDeviceControl() {
  const [devices, setDevices] = useState([
    { id: 1, name: 'Living Room Camera', type: 'camera', status: 'online', data: 0, icon: Camera },
    { id: 2, name: 'Temperature Sensor', type: 'sensor', status: 'online', data: 22.5, icon: Thermometer },
    { id: 3, name: 'Motion Detector', type: 'sensor', status: 'offline', data: 0, icon: Activity },
    { id: 4, name: 'Smart Light', type: 'actuator', status: 'online', data: 100, icon: Zap }
  ]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [sensorData, setSensorData] = useState([]);
  const [agentControl, setAgentControl] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedDevice?.type === 'sensor') {
        const newData = {
          time: new Date().toLocaleTimeString(),
          value: (Math.random() * 10 + 20).toFixed(1)
        };
        setSensorData(prev => [...prev.slice(-20), newData]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedDevice]);

  const toggleDevice = async (deviceId) => {
    const device = devices.find(d => d.id === deviceId);
    
    try {
      const newStatus = device.status === 'online' ? 'offline' : 'online';
      setDevices(devices.map(d => 
        d.id === deviceId ? { ...d, status: newStatus } : d
      ));

      const user = await base44.auth.me();
      await base44.entities.OmniTransaction.create({
        user_id: user.id,
        type: 'spend',
        amount: 0,
        currency: 'omni',
        metadata: {
          action: 'device_control',
          device_id: deviceId,
          device_name: device.name,
          new_status: newStatus
        }
      });

      toast.success(`${device.name} ${newStatus}`);
    } catch (error) {
      toast.error('Failed to control device');
      console.error(error);
    }
  };

  const assignToAgent = async (deviceId) => {
    try {
      const agents = await base44.entities.Agent.list();
      if (agents.length === 0) {
        toast.error('No agents available');
        return;
      }

      const device = devices.find(d => d.id === deviceId);
      toast.success(`${device.name} assigned to ${agents[0].name}`);
    } catch (error) {
      toast.error('Failed to assign device');
      console.error(error);
    }
  };

  return (
    <>
      <EnhancedHubNav currentHub="DeviceHome" />
      <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            IoT Device <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Control</span>
          </h1>
          <p className="text-white/60 text-lg">Real-time device management and AI agent integration</p>
        </motion.div>

        {/* Agent Control Toggle */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold text-lg mb-1">AI Agent Control</h3>
              <p className="text-white/60 text-sm">Allow AI agents to control your devices</p>
            </div>
            <button
              onClick={() => setAgentControl(!agentControl)}
              className={`relative w-16 h-8 rounded-full transition-colors ${
                agentControl ? 'bg-green-500' : 'bg-white/20'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  agentControl ? 'translate-x-8' : ''
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Device List */}
          <div className="lg:col-span-1">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold text-xl mb-4">Devices</h3>
              <div className="space-y-3">
                {devices.map((device) => (
                  <motion.div
                    key={device.id}
                    onClick={() => setSelectedDevice(device)}
                    className={`bg-gradient-to-r ${
                      selectedDevice?.id === device.id
                        ? 'from-cyan-500/30 to-purple-500/30 border-cyan-500/50'
                        : 'from-white/5 to-white/5 border-white/10'
                    } border rounded-xl p-4 cursor-pointer hover:scale-102 transition-all`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${
                          device.status === 'online' ? 'bg-green-500/20' : 'bg-red-500/20'
                        } flex items-center justify-center`}>
                          <device.icon className={`w-5 h-5 ${
                            device.status === 'online' ? 'text-green-400' : 'text-red-400'
                          }`} />
                        </div>
                        <div>
                          <div className="text-white font-semibold">{device.name}</div>
                          <div className="text-white/60 text-xs capitalize">{device.type}</div>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        device.status === 'online' ? 'bg-green-400' : 'bg-red-400'
                      } animate-pulse`} />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDevice(device.id);
                        }}
                        className="flex-1 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
                      >
                        Toggle
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          assignToAgent(device.id);
                        }}
                        className="flex-1 px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-400 text-sm transition-colors"
                      >
                        Assign AI
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Device Details */}
          <div className="lg:col-span-2">
            {selectedDevice ? (
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-white font-bold text-2xl mb-1">{selectedDevice.name}</h3>
                    <div className="flex items-center gap-2">
                      <Wifi className={`w-4 h-4 ${
                        selectedDevice.status === 'online' ? 'text-green-400' : 'text-red-400'
                      }`} />
                      <span className={`text-sm ${
                        selectedDevice.status === 'online' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {selectedDevice.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-white">
                      {selectedDevice.data}
                      {selectedDevice.type === 'sensor' ? '°C' : '%'}
                    </div>
                    <div className="text-white/60 text-sm">Current Value</div>
                  </div>
                </div>

                {selectedDevice.type === 'sensor' && sensorData.length > 0 && (
                  <div className="bg-white/5 rounded-xl p-4 mb-4">
                    <h4 className="text-white font-semibold mb-3">Real-Time Data Stream</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={sensorData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                        <XAxis dataKey="time" stroke="#ffffff60" />
                        <YAxis stroke="#ffffff60" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#000000', border: '1px solid #ffffff20' }}
                          labelStyle={{ color: '#ffffff' }}
                        />
                        <Line type="monotone" dataKey="value" stroke="#00f5ff" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-white/60 text-sm mb-1">Device Type</div>
                    <div className="text-white font-semibold capitalize">{selectedDevice.type}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-white/60 text-sm mb-1">Connection</div>
                    <div className="text-white font-semibold">WiFi 2.4GHz</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-white/60 text-sm mb-1">Last Update</div>
                    <div className="text-white font-semibold">{new Date().toLocaleTimeString()}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-white/60 text-sm mb-1">AI Control</div>
                    <div className={`font-semibold ${agentControl ? 'text-green-400' : 'text-red-400'}`}>
                      {agentControl ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full flex items-center justify-center">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-white/40 mx-auto mb-3" />
                  <div className="text-white/60">Select a device to view details</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* IoT Data Stream */}
        {selectedDevice && (
          <div className="mt-6">
            <IoTDataStream deviceId={selectedDevice.id} deviceType={selectedDevice.type} />
          </div>
        )}

        {/* Agent Permissions Manager */}
        <div className="mt-6">
          <AgentPermissionsManager deviceId={selectedDevice?.id} />
        </div>
      </div>
    </AuroraBackground>
    </>
  );
}