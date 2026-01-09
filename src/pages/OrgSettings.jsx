import React from 'react';
import { motion } from 'framer-motion';
import { Building, Settings, Save } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function OrgSettings() {
  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Organization Settings</h1>
          <p className="text-white/60">Configure company-wide preferences</p>
        </motion.div>

        <div className="space-y-6">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4">Company Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Organization Name</label>
                <input type="text" defaultValue="Acme Corporation" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" />
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">Industry</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white">
                  <option>Technology</option>
                  <option>Healthcare</option>
                  <option>Finance</option>
                </select>
              </div>
            </div>
          </div>

          <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:opacity-90 flex items-center justify-center gap-2">
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </div>
      </div>
    </AuroraBackground>
  );
}