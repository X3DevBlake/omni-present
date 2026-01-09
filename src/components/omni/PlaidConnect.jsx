import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function PlaidConnect({ onSuccess }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    // Simulate Plaid connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockAccount = {
      institution: 'Chase Bank',
      accountNumber: '****1234',
      routingNumber: '*****6789',
      accountType: 'checking'
    };

    setConnectedAccount(mockAccount);
    setIsConnecting(false);
    toast.success('Bank account connected successfully!');
    
    if (onSuccess) {
      onSuccess(mockAccount);
    }
  };

  if (connectedAccount) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black/40 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
            <Check className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-white font-bold">Bank Account Connected</h3>
            <div className="text-green-400 text-sm">{connectedAccount.institution}</div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Account</span>
            <span className="text-white">{connectedAccount.accountNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Routing</span>
            <span className="text-white">{connectedAccount.routingNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Type</span>
            <span className="text-white capitalize">{connectedAccount.accountType}</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-white font-bold text-xl mb-2">Connect Your Bank</h3>
        <p className="text-white/60 text-sm">
          Securely link your bank account for instant deposits and withdrawals
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3 text-sm text-white/80">
          <Check className="w-5 h-5 text-green-400" />
          <span>Bank-level 256-bit encryption</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-white/80">
          <Check className="w-5 h-5 text-green-400" />
          <span>Instant verification</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-white/80">
          <Check className="w-5 h-5 text-green-400" />
          <span>Supports 10,000+ financial institutions</span>
        </div>
      </div>

      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
      >
        {isConnecting ? 'Connecting...' : 'Connect with Plaid'}
      </button>

      <div className="mt-4 text-center text-white/40 text-xs">
        Powered by Plaid • Your credentials are never stored
      </div>
    </div>
  );
}