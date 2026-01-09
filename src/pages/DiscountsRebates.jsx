import React from 'react';
import { motion } from 'framer-motion';
import { Tag, Percent, Gift } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function DiscountsRebates() {
  const offers = [
    { id: 1, title: 'Student Device Discount', discount: '30% OFF', description: 'All physical devices', code: 'STUDENT30' },
    { id: 2, title: 'Campus Premium Rebate', discount: '$10/month', description: 'Annual subscription discount', code: 'CAMPUS10' },
    { id: 3, title: 'Bulk Purchase Discount', discount: '40% OFF', description: 'Orders of 10+ devices', code: 'BULK40' },
    { id: 4, title: 'First-Time Buyer', discount: '20% OFF', description: 'Your first device purchase', code: 'WELCOME20' }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Discounts & Rebates</h1>
          <p className="text-white/60">Exclusive student pricing on devices and services</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {offers.map((offer, i) => (
            <motion.div key={offer.id} className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Tag className="w-6 h-6 text-green-400" />
                </div>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full font-bold">{offer.discount}</span>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{offer.title}</h3>
              <p className="text-white/60 text-sm mb-4">{offer.description}</p>
              <div className="flex items-center gap-2 bg-black/40 rounded-lg p-3">
                <span className="text-white/60 text-sm">Code:</span>
                <code className="text-green-400 font-mono font-bold">{offer.code}</code>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}