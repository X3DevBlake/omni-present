import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import DepositAddressCard from '../components/omni/DepositAddressCard';
import TransactionList from '../components/omni/TransactionList';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function DepositUSDT() {
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

      if (!userData.deposit_addresses?.usdt) {
        const mockAddress = '0x' + Math.random().toString(36).substring(2, 15).toUpperCase() + Math.random().toString(36).substring(2, 15).toUpperCase();
        await base44.auth.updateMe({
          deposit_addresses: {
            ...userData.deposit_addresses,
            usdt: mockAddress
          }
        });
        userData.deposit_addresses = { ...userData.deposit_addresses, usdt: mockAddress };
      }

      const txs = await base44.entities.OmniTransaction.filter(
        { user_id: userData.id, type: 'deposit', currency: 'usdt' },
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
            Deposit <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">USDT</span>
          </h1>
          <p className="text-white/60 text-lg">Send USDT to your deposit address</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8">
          <DepositAddressCard
            currency="USDT"
            address={user?.deposit_addresses?.usdt}
            network="Ethereum (ERC-20)"
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