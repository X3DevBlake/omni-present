import React from 'react';
import { motion } from 'framer-motion';
import { Package, Download } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function SDKsLibraries() {
  const sdks = [
    { id: 1, name: 'JavaScript SDK', version: '2.4.0', downloads: 12400, language: 'JavaScript' },
    { id: 2, name: 'Python SDK', version: '1.8.1', downloads: 8900, language: 'Python' },
    { id: 3, name: 'Go SDK', version: '1.2.0', downloads: 3200, language: 'Go' },
    { id: 4, name: 'Ruby SDK', version: '0.9.5', downloads: 1800, language: 'Ruby' }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">SDKs & Libraries</h1>
          <p className="text-white/60">Client libraries for popular programming languages</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {sdks.map((sdk, i) => (
            <motion.div key={sdk.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{sdk.name}</h3>
                    <p className="text-white/60 text-sm">v{sdk.version}</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-green-500/20 border border-green-500/40 text-green-400 rounded-lg hover:bg-green-500/30 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Install
                </button>
              </div>
              <div className="text-white/60 text-sm">{sdk.downloads.toLocaleString()} downloads</div>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}