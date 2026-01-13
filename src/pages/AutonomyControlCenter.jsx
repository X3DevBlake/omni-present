import React, { useState } from 'react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { motion } from 'framer-motion';
import { Shield, Brain, Zap } from 'lucide-react';
import AutonomousSettings from '../components/settings/AutonomousSettings';
import PersonalizedInsightsEngine from '../components/insights/PersonalizedInsightsEngine';

export default function AutonomyControlCenter() {
  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-12 h-12 text-cyan-400" />
            <h1 className="text-5xl font-bold text-white">Autonomy Control Center</h1>
          </div>
          <p className="text-white/60 text-lg">
            Manage the autonomous capabilities of your AI ecosystem
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <AutonomousSettings />
          </div>
          <div className="space-y-8">
            <PersonalizedInsightsEngine />
            
            <div className="bg-gradient-to-br from-purple-900/40 to-black/40 border border-purple-500/30 rounded-xl p-6">
               <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                 <Brain className="w-5 h-5 text-purple-400" /> System Status
               </h3>
               <div className="space-y-4">
                 <div className="flex justify-between text-sm text-white/80 border-b border-white/10 pb-2">
                   <span>Active Agents</span>
                   <span className="text-green-400 font-mono">24/24</span>
                 </div>
                 <div className="flex justify-between text-sm text-white/80 border-b border-white/10 pb-2">
                   <span>Autonomous Actions/Hr</span>
                   <span className="text-cyan-400 font-mono">1,420</span>
                 </div>
                 <div className="flex justify-between text-sm text-white/80">
                   <span>System Load</span>
                   <span className="text-yellow-400 font-mono">42%</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}