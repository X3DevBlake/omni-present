import React from 'react';
import { motion } from 'framer-motion';
import { FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function Terms() {
  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
              <p className="text-white/60">Last updated: January 9, 2026</p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          <motion.div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold text-xl mb-4">Acceptable Use</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-white/70">Use our platform for AI research, agent simulation, and device management</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-white/70">Create and evolve AI agents for educational and commercial purposes</p>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-white/70">Do not use for malicious AI training or harmful agent behaviors</p>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-white/70">Do not attempt to reverse engineer or exploit platform vulnerabilities</p>
              </div>
            </div>
          </motion.div>

          <motion.div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold text-xl mb-4">Service Availability</h3>
            <p className="text-white/70 mb-4">
              We strive for 99.9% uptime but cannot guarantee uninterrupted service. Scheduled maintenance will be announced 48 hours in advance.
            </p>
          </motion.div>

          <motion.div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold text-xl mb-4">Physical Devices</h3>
            <p className="text-white/70">
              Device purchases are subject to availability. We provide 1-year warranty on all Omni-Present hardware. Device returns must be initiated within 30 days of delivery.
            </p>
          </motion.div>

          <motion.div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-yellow-400 font-bold mb-2">AI Agent Liability</h3>
                <p className="text-white/70">
                  You are responsible for the behavior and actions of AI agents you create. Ensure agents comply with all applicable laws and ethical guidelines.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AuroraBackground>
  );
}