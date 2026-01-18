import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import OmniTokenContractInfo from '../components/omni/OmniTokenContractInfo';

export default function OmniTokenomics() {
  return (
    <AuroraBackground className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-2 flex items-center gap-3">
            <DollarSign className="w-12 h-12" />
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              OMNI Token
            </span>
          </h1>
          <p className="text-white/60 text-lg">Smart contract, tokenomics & ecosystem</p>
        </motion.div>

        {/* Main Content */}
        <OmniTokenContractInfo />
      </div>
    </AuroraBackground>
  );
}