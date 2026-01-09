import React from 'react';
import { motion } from 'framer-motion';
import { Box, Layers, Wand2, Save } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function EnvironmentDesigner() {
  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Environment Designer</h1>
          <p className="text-white/60">Build immersive 3D worlds for agent testing</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-[600px] flex items-center justify-center">
            <div className="text-center text-white/40">
              <Box className="w-16 h-16 mx-auto mb-4" />
              <p>3D Environment Canvas</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2"><Layers className="w-5 h-5" />Layers</h3>
              <div className="space-y-2 text-sm text-white/60">
                <div className="p-2 bg-white/5 rounded">Terrain</div>
                <div className="p-2 bg-white/5 rounded">Objects</div>
                <div className="p-2 bg-white/5 rounded">Lighting</div>
              </div>
            </div>
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2"><Wand2 className="w-5 h-5" />Tools</h3>
              <div className="grid grid-cols-2 gap-2">
                <button className="p-3 bg-cyan-500/20 border border-cyan-500/40 rounded-lg text-cyan-400 text-sm">Terrain</button>
                <button className="p-3 bg-white/5 border border-white/10 rounded-lg text-white/60 text-sm">Objects</button>
                <button className="p-3 bg-white/5 border border-white/10 rounded-lg text-white/60 text-sm">Paint</button>
                <button className="p-3 bg-white/5 border border-white/10 rounded-lg text-white/60 text-sm">Physics</button>
              </div>
            </div>
            <button className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:opacity-90 flex items-center justify-center gap-2">
              <Save className="w-5 h-5" />
              Save Environment
            </button>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}