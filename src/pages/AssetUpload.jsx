import React from 'react';
import { motion } from 'framer-motion';
import { Upload, DollarSign, Tag } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function AssetUpload() {
  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Upload Asset</h1>
          <p className="text-white/60">Sell your creations to the community</p>
        </motion.div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <div className="space-y-6">
            <div>
              <label className="text-white font-medium mb-2 block">Asset Name</label>
              <input type="text" placeholder="My Awesome Agent" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40" />
            </div>
            <div>
              <label className="text-white font-medium mb-2 block">Category</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white">
                <option>Agent</option>
                <option>Blueprint</option>
                <option>Environment</option>
                <option>Audio</option>
              </select>
            </div>
            <div>
              <label className="text-white font-medium mb-2 block">Price (USD)</label>
              <input type="number" placeholder="29.99" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40" />
            </div>
            <div>
              <label className="text-white font-medium mb-2 block">Upload File</label>
              <div className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center hover:border-cyan-500/40 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-white/40 mx-auto mb-3" />
                <p className="text-white/60">Click to upload or drag and drop</p>
              </div>
            </div>
            <button className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:opacity-90">
              Publish Asset
            </button>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}