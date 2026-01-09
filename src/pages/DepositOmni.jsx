import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import DepositAddressCard from '../components/omni/DepositAddressCard';
import TransactionList from '../components/omni/TransactionList';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function DepositOmni() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      // If no deposit address, generate one (in real app, this would be backend)
      if (!userData.deposit_addresses?.omni) {
        const mockAddress = '0xOMNI' + Math.random().toString(36).substring(2, 15).toUpperCase();
        await base44.auth.updateMe({
          deposit_addresses: {
            ...userData.deposit_addresses,
            omni: mockAddress
          }
        });
        userData.deposit_addresses = { ...userData.deposit_addresses, omni: mockAddress };
      }

      const txs = await base44.entities.OmniTransaction.filter(
        { user_id: userData.id, type: 'deposit', currency: 'omni' },
        '-created_date',
        20
      );
      setTransactions(txs);
    } catch (err) {
      toast.error('Failed to load deposit information');
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
            Deposit <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Omni</span>
          </h1>
          <p className="text-white/60 text-lg">Send Omni tokens to your deposit address</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8">
          <DepositAddressCard
            currency="Omni"
            address={user?.deposit_addresses?.omni}
            network="Omni Mainnet"
          />

          <div>
            <h2 className="text-white font-bold text-2xl mb-4">Recent Deposits</h2>
            <TransactionList transactions={transactions} isLoading={loading} />
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}