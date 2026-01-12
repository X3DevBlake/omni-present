import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hand, Zap, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function GestureControlPanel({ agent, devices }) {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [gestureType, setGestureType] = useState('tap');
  const [executing, setExecuting] = useState(false);

  const gestures = [
    { type: 'tap', icon: '👆', label: 'Tap' },
    { type: 'swipe', icon: '👉', label: 'Swipe' },
    { type: 'pinch', icon: '🤏', label: 'Pinch' },
    { type: 'rotate', icon: '🔄', label: 'Rotate' },
    { type: 'hold', icon: '✊', label: 'Hold' },
    { type: 'wave', icon: '👋', label: 'Wave' }
  ];

  const executeGesture = async (command) => {
    if (!selectedDevice) return;
    
    setExecuting(true);
    try {
      await base44.integrations.Core.InvokeLLM({
        prompt: `Agent ${agent.name} executes ${gestureType} gesture on device ${selectedDevice}.
Command: ${command}
Provide voice feedback via ElevenLabs.`
      });
      alert('Gesture executed successfully!');
    } catch (error) {
      console.error('Gesture error:', error);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-black/80 backdrop-blur-sm border border-cyan-400/50 rounded-lg p-4"
    >
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Hand className="w-5 h-5 text-cyan-400" />
        Gesture Control
      </h3>

      {/* Device Selection */}
      <div className="mb-4">
        <label className="text-white/60 text-xs mb-2 block">Target Device</label>
        <select
          value={selectedDevice || ''}
          onChange={(e) => setSelectedDevice(e.target.value)}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
        >
          <option value="">Select Device</option>
          {devices?.map(device => (
            <option key={device.id} value={device.id}>
              {device.device_name} ({device.device_type})
            </option>
          ))}
        </select>
      </div>

      {/* Gesture Type Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {gestures.map((g) => (
          <button
            key={g.type}
            onClick={() => setGestureType(g.type)}
            className={`p-3 rounded text-center transition-all ${
              gestureType === g.type
                ? 'bg-cyan-500/20 border-2 border-cyan-400'
                : 'bg-white/5 border border-white/20 hover:bg-white/10'
            }`}
          >
            <div className="text-2xl mb-1">{g.icon}</div>
            <p className="text-white/80 text-xs">{g.label}</p>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <button
          onClick={() => executeGesture('activate')}
          disabled={!selectedDevice || executing}
          className="w-full px-4 py-2 bg-green-500/20 border border-green-400 text-green-300 rounded hover:bg-green-500/30 disabled:opacity-50 text-sm"
        >
          <Zap className="w-4 h-4 inline mr-2" />
          Activate Device
        </button>
        <button
          onClick={() => executeGesture('settings')}
          disabled={!selectedDevice || executing}
          className="w-full px-4 py-2 bg-purple-500/20 border border-purple-400 text-purple-300 rounded hover:bg-purple-500/30 disabled:opacity-50 text-sm"
        >
          Open Settings
        </button>
        <button
          onClick={() => executeGesture('status')}
          disabled={!selectedDevice || executing}
          className="w-full px-4 py-2 bg-cyan-500/20 border border-cyan-400 text-cyan-300 rounded hover:bg-cyan-500/30 disabled:opacity-50 text-sm"
        >
          Check Status
        </button>
      </div>
    </motion.div>
  );
}