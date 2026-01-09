import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Bell, Cpu, AlertTriangle, TrendingDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PersonalizedDeviceDashboard() {
  const [fleets, setFleets] = useState([]);
  const [selectedFleet, setSelectedFleet] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [isAddingFleet, setIsAddingFleet] = useState(false);
  const [newFleetName, setNewFleetName] = useState('');
  const [deviceGroups] = useState([
    { id: 'group_1', name: 'Critical Systems', devices: 5, health: 95 },
    { id: 'group_2', name: 'Sensors', devices: 12, health: 88 },
    { id: 'group_3', name: 'IoT Network', devices: 8, health: 92 }
  ]);

  useEffect(() => {
    loadFleets();
    generateAlerts();
  }, []);

  const loadFleets = async () => {
    try {
      // Mock fleet data - in real app, fetch from device management system
      const mockFleets = [
        { id: 'f1', name: 'Production Fleet', deviceCount: 24, status: 'healthy', avgHealth: 97 },
        { id: 'f2', name: 'Testing Fleet', deviceCount: 8, status: 'warning', avgHealth: 82 }
      ];
      setFleets(mockFleets);
    } catch (error) {
      console.error('Error loading fleets:', error);
    }
  };

  const generateAlerts = () => {
    const mockAlerts = [
      {
        id: 'alert_1',
        severity: 'high',
        device: 'Camera-3',
        message: 'Temperature exceeding safe operating range',
        timestamp: new Date(Date.now() - 5 * 60000),
        action: 'Check cooling system'
      },
      {
        id: 'alert_2',
        severity: 'medium',
        device: 'Sensor-7',
        message: 'Battery level below 20%',
        timestamp: new Date(Date.now() - 15 * 60000),
        action: 'Schedule replacement'
      },
      {
        id: 'alert_3',
        severity: 'low',
        device: 'Light-2',
        message: 'Firmware update available',
        timestamp: new Date(Date.now() - 30 * 60000),
        action: 'Review update'
      }
    ];
    setAlerts(mockAlerts);
  };

  const addFleet = () => {
    if (newFleetName.trim()) {
      const newFleet = {
        id: `f_${Date.now()}`,
        name: newFleetName,
        deviceCount: 0,
        status: 'healthy',
        avgHealth: 100
      };
      setFleets([...fleets, newFleet]);
      setNewFleetName('');
      setIsAddingFleet(false);
    }
  };

  const deleteFleet = (id) => {
    setFleets(fleets.filter(f => f.id !== id));
  };

  const timeAgo = (timestamp) => {
    const mins = Math.floor((Date.now() - timestamp) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

  const getAlertColor = (severity) => {
    switch(severity) {
      case 'high': return 'from-red-500/20 to-red-600/10 border-red-500/30';
      case 'medium': return 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30';
      case 'low': return 'from-blue-500/20 to-blue-600/10 border-blue-500/30';
      default: return 'from-white/5 to-white/10 border-white/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Fleet Management */}
      <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-white font-bold text-lg">Custom Device Fleets</h3>
            <p className="text-white/60 text-sm">Organize and manage device groups</p>
          </div>
          <button
            onClick={() => setIsAddingFleet(!isAddingFleet)}
            className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Add Fleet Input */}
        <AnimatePresence>
          {isAddingFleet && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 flex gap-2"
            >
              <input
                type="text"
                placeholder="Fleet name..."
                value={newFleetName}
                onChange={(e) => setNewFleetName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addFleet()}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50"
              />
              <button
                onClick={addFleet}
                className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 font-semibold transition-colors"
              >
                Create
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fleets Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {fleets.map((fleet, idx) => (
            <motion.div
              key={fleet.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedFleet(selectedFleet?.id === fleet.id ? null : fleet)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedFleet?.id === fleet.id
                  ? 'bg-cyan-500/20 border-cyan-500/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-semibold">{fleet.name}</h4>
                  <p className="text-white/60 text-sm">{fleet.deviceCount} devices</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFleet(fleet.id);
                  }}
                  className="p-1 text-white/40 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  fleet.avgHealth > 90 ? 'bg-green-500/20 text-green-400' :
                  fleet.avgHealth > 70 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  Health: {fleet.avgHealth}%
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  fleet.status === 'healthy' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {fleet.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Device Groups within Fleet */}
        {selectedFleet && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 pt-6 border-t border-white/10"
          >
            <h4 className="text-white font-semibold mb-4">Device Groups</h4>
            <div className="space-y-3">
              {deviceGroups.map((group) => (
                <div key={group.id} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-white text-sm font-semibold">{group.name}</div>
                      <div className="text-white/60 text-xs">{group.devices} devices</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold text-sm">{group.health}%</div>
                    <div className="w-16 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${group.health}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Smart Alerts */}
      <div className="bg-black/40 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-orange-400" />
          <div>
            <h3 className="text-white font-bold">Intelligent Alerts</h3>
            <p className="text-white/60 text-sm">AI-powered device health monitoring</p>
          </div>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {alerts.map((alert, idx) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-gradient-to-r ${getAlertColor(alert.severity)} border rounded-lg p-4`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {alert.severity === 'high' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                    {alert.severity === 'medium' && <TrendingDown className="w-4 h-4 text-yellow-400" />}
                    {alert.severity === 'low' && <Cpu className="w-4 h-4 text-blue-400" />}
                    <div>
                      <h4 className="text-white font-semibold text-sm">{alert.device}</h4>
                      <p className="text-white/70 text-xs">{alert.message}</p>
                    </div>
                  </div>
                  <span className="text-white/40 text-xs">{timeAgo(alert.timestamp)}</span>
                </div>
                <div className="ml-7 text-xs text-white/60">
                  Suggested: {alert.action}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}