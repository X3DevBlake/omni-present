import React from 'react';
import { motion } from 'framer-motion';
import { Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function FirmwareUpdates() {
  const updates = [
    { id: 1, device: 'Omni-Core Pro', version: '2.4.1', status: 'available', size: '45 MB', improvements: 'Performance boost, bug fixes' },
    { id: 2, device: 'Neural Sensor Array', version: '1.8.0', status: 'installed', size: '23 MB', improvements: 'New sensor calibration' },
    { id: 3, device: 'Vision Module', version: '3.1.2', status: 'installing', size: '67 MB', improvements: 'Enhanced object detection', progress: 65 }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Firmware Updates</h1>
          <p className="text-white/60">Keep your devices up to date</p>
        </motion.div>

        <div className="space-y-4">
          {updates.map((update, i) => (
            <motion.div key={update.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">{update.device}</h3>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-white/60">Version {update.version}</span>
                    <span className="text-white/40">•</span>
                    <span className="text-white/60">{update.size}</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${
                  update.status === 'available' ? 'bg-blue-500/20 text-blue-400' :
                  update.status === 'installed' ? 'bg-green-500/20 text-green-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {update.status === 'available' ? <Download className="w-3 h-3" /> :
                   update.status === 'installed' ? <CheckCircle className="w-3 h-3" /> :
                   <Clock className="w-3 h-3" />}
                  {update.status}
                </div>
              </div>
              <p className="text-white/60 text-sm mb-4">{update.improvements}</p>
              {update.status === 'installing' && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/60">Installing...</span>
                    <span className="text-white">{update.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${update.progress}%` }} />
                  </div>
                </div>
              )}
              {update.status === 'available' && (
                <button className="px-4 py-2 bg-blue-500/20 border border-blue-500/40 text-blue-400 rounded-lg hover:bg-blue-500/30">
                  Install Update
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}