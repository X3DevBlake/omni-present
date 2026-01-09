import React from 'react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import PlaidConnect from '../components/omni/PlaidConnect';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function LinkBankAccount() {
  const handlePlaidSuccess = async (account) => {
    try {
      const user = await base44.auth.me();
      const linkedAccounts = user.linked_bank_accounts || [];
      linkedAccounts.push(account);
      
      await base44.auth.updateMe({
        linked_bank_accounts: linkedAccounts
      });

      toast.success('Bank account linked successfully!');
    } catch (err) {
      toast.error('Failed to save account');
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
            Link <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Bank Account</span>
          </h1>
          <p className="text-white/60 text-lg">Securely connect your bank account for instant deposits</p>
        </motion.div>

        <PlaidConnect onSuccess={handlePlaidSuccess} />
      </div>
    </AuroraBackground>
  );
}