import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import EnhancedNativeWallet from '../components/wallet/EnhancedNativeWallet';
import BackButton from '../components/navigation/BackButton';

export default function Wallet() {
  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-6">
          <BackButton />
        </div>

        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-4">
              Omni <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Wallet</span>
            </h1>
            <p className="text-white/60 text-lg">Native multi-chain wallet for Omni, ETH, and USDT</p>
          </div>
        </motion.div>

        <EnhancedNativeWallet />
      </div>
    </AuroraBackground>
  );
}