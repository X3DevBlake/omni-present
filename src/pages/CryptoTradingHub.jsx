import React from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import CryptoTradingBot from '../components/trading/CryptoTradingBot';
import { TrendingUp } from 'lucide-react';

export default function CryptoTradingHub() {
  const [userEmail, setUserEmail] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <TrendingUp className="w-10 h-10 text-cyan-400" />
            Crypto Trading Bot
          </h1>
          <p className="text-white/60">Automate your crypto trading with AI-powered strategies</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
        >
          {userEmail ? (
            <CryptoTradingBot userEmail={userEmail} />
          ) : (
            <div className="text-center py-12 text-white/40">
              Please log in to access the trading bot
            </div>
          )}
        </motion.div>
      </div>
    </AuroraBackground>
  );
}