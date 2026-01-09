import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Wifi, Battery, Bell, Shield, Zap } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { toast } from 'sonner';

export default function DeviceSettings() {
  const [settings, setSettings] = useState({
    autoUpdate: true,
    lowPowerMode: false,
    telemetrySharing: true,
    notifications: true,
    updateChannel: 'stable',
    dataSync: 'real-time'
  });

  const handleSave = () => {
    toast.success('Device settings saved successfully!');
  };

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Device Settings</h1>
          <p className="text-white/60">Configure global preferences for all devices</p>
        </motion.div>

        <div className="space-y-6">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              Power & Performance
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Low Power Mode</div>
                  <div className="text-white/60 text-sm">Reduce performance to extend battery life</div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, lowPowerMode: !settings.lowPowerMode })}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.lowPowerMode ? 'bg-green-500' : 'bg-gray-600'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.lowPowerMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
              <Wifi className="w-6 h-6 text-blue-400" />
              Updates & Sync
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Automatic Updates</div>
                  <div className="text-white/60 text-sm">Install firmware updates automatically</div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, autoUpdate: !settings.autoUpdate })}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.autoUpdate ? 'bg-green-500' : 'bg-gray-600'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.autoUpdate ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div>
                <div className="text-white font-medium mb-2">Update Channel</div>
                <select
                  value={settings.updateChannel}
                  onChange={(e) => setSettings({ ...settings, updateChannel: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                >
                  <option value="stable">Stable</option>
                  <option value="beta">Beta</option>
                  <option value="dev">Development</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
              <Bell className="w-6 h-6 text-purple-400" />
              Notifications
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Push Notifications</div>
                <div className="text-white/60 text-sm">Receive alerts about device status</div>
              </div>
              <button
                onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
                className={`w-12 h-6 rounded-full transition-colors ${settings.notifications ? 'bg-green-500' : 'bg-gray-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.notifications ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-400" />
              Privacy & Data
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Telemetry Sharing</div>
                <div className="text-white/60 text-sm">Share anonymous usage data to improve products</div>
              </div>
              <button
                onClick={() => setSettings({ ...settings, telemetrySharing: !settings.telemetrySharing })}
                className={`w-12 h-6 rounded-full transition-colors ${settings.telemetrySharing ? 'bg-green-500' : 'bg-gray-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.telemetrySharing ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:opacity-90"
          >
            Save Settings
          </button>
        </div>
      </div>
    </AuroraBackground>
  );
}