import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import BridgeInterface from '../components/omni/BridgeInterface';
import TransactionList from '../components/omni/TransactionList';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function BridgeOmni() {
  const [user, setUser] = useState(null);
  const [bridgeTransactions, setBridgeTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const txs = await base44.entities.OmniTransaction.filter(
        { user_id: userData.id, type: 'bridge' },
        '-created_date',
        20
      );
      setBridgeTransactions(txs);
    } catch (err) {
      toast.error('Failed to load bridge data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Bridge <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Omni</span>
          </h1>
          <p className="text-white/60 text-lg">Transfer Omni tokens across different blockchain networks</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8">
          <BridgeInterface userBalance={user?.omni_balance || 0} />

          <div>
            <h2 className="text-white font-bold text-2xl mb-4">Bridge History</h2>
            <TransactionList transactions={bridgeTransactions} isLoading={loading} />
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}