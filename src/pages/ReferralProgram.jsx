import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Users, DollarSign, Share2 } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function ReferralProgram() {
  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="text-center mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Referral Program</h1>
          <p className="text-white/60">Earn rewards by inviting friends</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">12</div>
            <div className="text-white/60 text-sm">Referrals</div>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
            <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">$240</div>
            <div className="text-white/60 text-sm">Earned</div>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
            <Gift className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">$60</div>
            <div className="text-white/60 text-sm">Pending</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Your Referral Link</h3>
          <div className="flex gap-2 mb-4">
            <input type="text" value="https://omnipresent.ai/ref/abc123" readOnly className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white" />
            <button className="px-6 py-3 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 rounded-lg hover:bg-cyan-500/30 flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Copy
            </button>
          </div>
          <p className="text-white/60">Give $20, Get $20 for each successful referral</p>
        </div>
      </div>
    </AuroraBackground>
  );
}