import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Activity, AlertTriangle, CheckCircle, Download, Upload, Play, Settings, Zap, Filter } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function FleetManagement() {
  const [devices, setDevices] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState(new Set());
  const [telemetryData, setTelemetryData] = useState(new Map());
  const [filterStatus, setFilterStatus] = useState('all');
  const [showBatchUpdate, setShowBatchUpdate] = useState(false);
  const [automationRules, setAutomationRules] = useState([]);
  const [diagnostics, setDiagnostics] = useState(new Map());

  useEffect(() => {
    loadDevices();
    const interval = setInterval(updateTelemetry, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadDevices = async () => {
    try {
      const user = await base44.auth.me();
      const orders = await base44.entities.Order.filter({ created_by: user.email, status: 'delivered' });
      setDevices(orders);
    } catch (err) {
      toast.error('Failed to load devices');
    }
  };

  const updateTelemetry = () => {
    setTelemetryData(prev => {
      const updated = new Map(prev);
      devices.forEach(device => {
        const battery = prev.get(device.id)?.battery || Math.random() * 100;
        updated.set(device.id, {
          online: Math.random() > 0.05,
          battery: Math.max(0, battery - Math.random() * 0.5),
          temperature: (20 + Math.random() * 15).toFixed(1),
          cpuUsage: Math.floor(Math.random() * 100),
          memoryUsage: Math.floor(Math.random() * 100),
          errors: Math.random() > 0.95 ? Math.floor(Math.random() * 5) : 0,
          lastSync: new Date()
        });
      });
      return updated;
    });
  };

  const toggleDeviceSelection = (deviceId) => {
    const newSelection = new Set(selectedDevices);
    if (newSelection.has(deviceId)) {
      newSelection.delete(deviceId);
    } else {
      newSelection.add(deviceId);
    }
    setSelectedDevices(newSelection);
  };

  const selectAll = () => {
    const filtered = getFilteredDevices();
    setSelectedDevices(new Set(filtered.map(d => d.id)));
  };

  const deselectAll = () => {
    setSelectedDevices(new Set());
  };

  const batchUpdate = async () => {
    if (selectedDevices.size === 0) {
      toast.error('No devices selected');
      return;
    }

    toast.info(`Updating ${selectedDevices.size} devices...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success('Firmware update initiated on selected devices');
    setShowBatchUpdate(false);
  };

  const runDiagnostics = async (deviceId) => {
    toast.info('Running diagnostics...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const result = {
      status: Math.random() > 0.2 ? 'healthy' : 'warning',
      tests: {
        connectivity: Math.random() > 0.1,
        sensors: Math.random() > 0.1,
        battery: Math.random() > 0.15,
        firmware: Math.random() > 0.05
      },
      recommendations: []
    };

    if (!result.tests.battery) result.recommendations.push('Replace battery soon');
    if (!result.tests.connectivity) result.recommendations.push('Check network connection');

    setDiagnostics(new Map(diagnostics.set(deviceId, result)));
    toast.success('Diagnostics complete');
  };

  const createAutomationRule = () => {
    const rule = {
      id: Date.now().toString(),
      name: 'Low Battery Alert',
      condition: 'battery < 20',
      action: 'send_notification',
      enabled: true
    };
    setAutomationRules([...automationRules, rule]);
    toast.success('Automation rule created');
  };

  const getFilteredDevices = () => {
    return devices.filter(device => {
      const telemetry = telemetryData.get(device.id);
      if (filterStatus === 'all') return true;
      if (filterStatus === 'online') return telemetry?.online;
      if (filterStatus === 'offline') return !telemetry?.online;
      if (filterStatus === 'low_battery') return (telemetry?.battery || 100) < 30;
      if (filterStatus === 'errors') return (telemetry?.errors || 0) > 0;
      return true;
    });
  };

  const filteredDevices = getFilteredDevices();

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Fleet <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Management</span>
          </h1>
          <p className="text-white/60 text-lg">Monitor and manage your entire device fleet</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total', count: devices.length, color: 'cyan', filter: 'all' },
            { label: 'Online', count: Array.from(telemetryData.values()).filter(t => t.online).length, color: 'green', filter: 'online' },
            { label: 'Offline', count: Array.from(telemetryData.values()).filter(t => !t.online).length, color: 'red', filter: 'offline' },
            { label: 'Low Battery', count: Array.from(telemetryData.values()).filter(t => t.battery < 30).length, color: 'yellow', filter: 'low_battery' },
            { label: 'Errors', count: Array.from(telemetryData.values()).filter(t => t.errors > 0).length, color: 'orange', filter: 'errors' }
          ].map(stat => (
            <button
              key={stat.label}
              onClick={() => setFilterStatus(stat.filter)}
              className={`bg-${stat.color}-500/10 border border-${stat.color}-500/30 rounded-xl p-4 hover:bg-${stat.color}-500/20 transition-all ${
                filterStatus === stat.filter ? 'ring-2 ring-cyan-500' : ''
              }`}
            >
              <div className="text-white/60 text-sm mb-1">{stat.label}</div>
              <div className={`text-${stat.color}-400 text-2xl font-bold`}>{stat.count}</div>
            </button>
          ))}
        </div>

        <div className="flex gap-3 mb-6">
          <button onClick={selectAll} className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-xl text-sm hover:bg-cyan-500/30">
            Select All ({filteredDevices.length})
          </button>
          <button onClick={deselectAll} className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-sm hover:bg-white/10">
            Deselect All
          </button>
          {selectedDevices.size > 0 && (
            <>
              <button onClick={() => setShowBatchUpdate(true)} className="px-4 py-2 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-xl text-sm hover:bg-purple-500/30 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Batch Update ({selectedDevices.size})
              </button>
              <button onClick={createAutomationRule} className="px-4 py-2 bg-green-500/20 border border-green-500/40 text-green-300 rounded-xl text-sm hover:bg-green-500/30 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Add Rule
              </button>
            </>
          )}
        </div>

        <div className="grid gap-4">
          {filteredDevices.map(device => {
            const telemetry = telemetryData.get(device.id);
            const diagnostic = diagnostics.get(device.id);
            const isSelected = selectedDevices.has(device.id);

            return (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-black/40 backdrop-blur-xl border rounded-2xl p-6 transition-all ${
                  isSelected ? 'border-cyan-500/50 ring-2 ring-cyan-500/30' : 'border-white/10'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleDeviceSelection(device.id)}
                      className="w-5 h-5"
                    />
                    <div>
                      <h3 className="text-white font-bold flex items-center gap-2">
                        {device.device_name}
                        {telemetry && (
                          <div className={`w-2 h-2 rounded-full ${telemetry.online ? 'bg-green-400' : 'bg-red-400'}`} />
                        )}
                      </h3>
                      <p className="text-white/60 text-sm">Order #{device.order_number}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => runDiagnostics(device.id)}
                    className="px-3 py-1 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded-lg text-sm hover:bg-blue-500/30"
                  >
                    Run Diagnostics
                  </button>
                </div>

                {telemetry && (
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-white/60 text-xs mb-1">Battery</div>
                      <div className={`font-bold ${telemetry.battery < 30 ? 'text-red-400' : 'text-green-400'}`}>
                        {telemetry.battery.toFixed(0)}%
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-white/60 text-xs mb-1">Temp</div>
                      <div className="text-cyan-400 font-bold">{telemetry.temperature}°C</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-white/60 text-xs mb-1">CPU</div>
                      <div className="text-purple-400 font-bold">{telemetry.cpuUsage}%</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-white/60 text-xs mb-1">Memory</div>
                      <div className="text-yellow-400 font-bold">{telemetry.memoryUsage}%</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-white/60 text-xs mb-1">Errors</div>
                      <div className={`font-bold ${telemetry.errors > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {telemetry.errors}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-white/60 text-xs mb-1">Status</div>
                      <div className={`font-bold text-xs ${telemetry.online ? 'text-green-400' : 'text-red-400'}`}>
                        {telemetry.online ? 'ONLINE' : 'OFFLINE'}
                      </div>
                    </div>
                  </div>
                )}

                {diagnostic && (
                  <div className={`bg-${diagnostic.status === 'healthy' ? 'green' : 'yellow'}-500/10 border border-${diagnostic.status === 'healthy' ? 'green' : 'yellow'}-500/30 rounded-xl p-3`}>
                    <div className="flex items-center gap-2 mb-2">
                      {diagnostic.status === 'healthy' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      )}
                      <span className="text-white font-semibold text-sm">Diagnostic Results</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {Object.entries(diagnostic.tests).map(([test, passed]) => (
                        <div key={test} className="text-xs">
                          <span className={passed ? 'text-green-400' : 'text-red-400'}>
                            {passed ? '✓' : '✗'} {test}
                          </span>
                        </div>
                      ))}
                    </div>
                    {diagnostic.recommendations.length > 0 && (
                      <div className="text-yellow-400 text-xs">
                        ⚠️ {diagnostic.recommendations.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {automationRules.length > 0 && (
          <div className="mt-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6">
            <h3 className="text-purple-400 font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Automation Rules ({automationRules.length})
            </h3>
            <div className="space-y-2">
              {automationRules.map(rule => (
                <div key={rule.id} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium text-sm">{rule.name}</div>
                    <div className="text-white/60 text-xs">When {rule.condition} → {rule.action}</div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    rule.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {rule.enabled ? 'Active' : 'Disabled'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showBatchUpdate && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowBatchUpdate(false)} />
            <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-lg w-full" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
              
              <h3 className="text-xl font-bold text-white mb-4">Batch Firmware Update</h3>
              <p className="text-white/60 mb-6">Update {selectedDevices.size} devices to the latest firmware</p>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-white/80 text-sm">
                    Devices will reboot during update. This process may take 5-10 minutes per device.
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowBatchUpdate(false)} className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10">
                  Cancel
                </button>
                <button onClick={batchUpdate} className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90">
                  Update All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuroraBackground>
  );
}