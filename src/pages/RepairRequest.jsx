import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, Send } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function RepairRequest() {
  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Repair Request</h1>
          <p className="text-white/60">Submit a service request for your devices</p>
        </motion.div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <div className="space-y-6">
            <div>
              <label className="text-white font-medium mb-2 block">Device</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white">
                <option>Omni-Core Pro</option>
                <option>Neural Sensor Array</option>
                <option>Vision Module</option>
              </select>
            </div>
            <div>
              <label className="text-white font-medium mb-2 block">Issue Description</label>
              <textarea className="w-full h-32 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 resize-none" placeholder="Describe the issue..."></textarea>
            </div>
            <div>
              <label className="text-white font-medium mb-2 block">Priority</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
            <button className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:opacity-90 flex items-center justify-center gap-2">
              <Send className="w-5 h-5" />
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}