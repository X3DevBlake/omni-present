import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Power, RefreshCw, Settings, Zap, Radio, Thermometer, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DeviceControlPanel({ show, onClose, device, onCommandSend }) {
  const [selectedCommand, setSelectedCommand] = useState(null);
  const [commandParams, setCommandParams] = useState({});

  if (!show || !device) return null;

  const availableCommands = [
    { id: 'reboot', name: 'Reboot Device', icon: RefreshCw, color: 'blue', params: [] },
    { id: 'calibrate', name: 'Calibrate Sensors', icon: Settings, color: 'purple', params: [] },
    { id: 'power_mode', name: 'Set Power Mode', icon: Power, color: 'green', params: [
      { name: 'mode', type: 'select', options: ['high_performance', 'balanced', 'power_saver'] }
    ]},
    { id: 'activate_feature', name: 'Activate Feature', icon: Zap, color: 'yellow', params: [
      { name: 'feature', type: 'select', options: ['advanced_detection', 'night_mode', 'turbo_processing'] }
    ]},
    { id: 'set_sensitivity', name: 'Set Sensor Sensitivity', icon: Radio, color: 'cyan', params: [
      { name: 'level', type: 'range', min: 0, max: 100, default: 50 }
    ]},
    { id: 'update_firmware', name: 'Update Firmware', icon: RefreshCw, color: 'orange', params: [] }
  ];

  const executeCommand = async () => {
    if (!selectedCommand) return;
    
    await onCommandSend(device.device_id, selectedCommand.id, commandParams);
    setSelectedCommand(null);
    setCommandParams({});
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10">
            <X className="w-5 h-5 text-white/70" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
              <Settings className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Device Control</h3>
              <p className="text-white/60 text-sm">{device.device_name}</p>
            </div>
          </div>

          {device.telemetry && (
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
              <h4 className="text-green-400 font-semibold mb-3 text-sm">Current Status</h4>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="text-white/70">
                  <div className="text-white/50 mb-1">Battery</div>
                  <div className="text-green-400 font-bold">{device.telemetry.battery}%</div>
                </div>
                <div className="text-white/70">
                  <div className="text-white/50 mb-1">Temp</div>
                  <div className="text-cyan-400 font-bold">{device.telemetry.temperature}°C</div>
                </div>
                <div className="text-white/70">
                  <div className="text-white/50 mb-1">Uptime</div>
                  <div className="text-purple-400 font-bold">{Math.floor(device.telemetry.uptime / 3600)}h</div>
                </div>
              </div>
            </div>
          )}

          <h4 className="text-white font-semibold mb-3">Available Commands</h4>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {availableCommands.map(cmd => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={() => setSelectedCommand(cmd)}
                  className={`p-4 rounded-xl border transition-all ${
                    selectedCommand?.id === cmd.id
                      ? `bg-${cmd.color}-500/20 border-${cmd.color}-500/40`
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-6 h-6 text-${cmd.color}-400 mb-2`} />
                  <div className="text-white text-sm font-medium">{cmd.name}</div>
                </button>
              );
            })}
          </div>

          {selectedCommand && selectedCommand.params.length > 0 && (
            <div className="bg-white/5 rounded-xl p-4 mb-4">
              <h4 className="text-white font-semibold mb-3 text-sm">Command Parameters</h4>
              {selectedCommand.params.map(param => (
                <div key={param.name} className="mb-3">
                  <label className="text-white/70 text-sm mb-2 block capitalize">
                    {param.name.replace('_', ' ')}
                  </label>
                  {param.type === 'select' ? (
                    <select
                      value={commandParams[param.name] || param.options[0]}
                      onChange={(e) => setCommandParams({ ...commandParams, [param.name]: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    >
                      {param.options.map(opt => (
                        <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>
                      ))}
                    </select>
                  ) : param.type === 'range' ? (
                    <div>
                      <input
                        type="range"
                        min={param.min}
                        max={param.max}
                        value={commandParams[param.name] || param.default}
                        onChange={(e) => setCommandParams({ ...commandParams, [param.name]: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="text-white text-sm mt-1">{commandParams[param.name] || param.default}</div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={executeCommand}
              disabled={!selectedCommand}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50"
            >
              Execute Command
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}