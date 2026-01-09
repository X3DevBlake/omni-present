import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, AlertCircle, Loader } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function WithdrawOmni() {
  const [user, setUser] = useState(null);
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState('omni-main');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (err) {
      toast.error('Failed to load user data');
    }
  };

  const networkFees = {
    'omni-main': 0.1,
    'ethereum': 5,
    'bsc': 0.5,
    'polygon': 0.2,
  };

  const currentFee = networkFees[network] || 0;
  const totalAmount = amount ? parseFloat(amount) + currentFee : 0;

  const handleWithdraw = async () => {
    if (!address || !amount) {
      toast.error('Please fill in all fields');
      return;
    }

    if (parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (totalAmount > (user?.omni_balance || 0)) {
      toast.error('Insufficient balance (including network fee)');
      return;
    }

    setIsProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 3000));

    await base44.auth.updateMe({
      omni_balance: (user.omni_balance || 0) - totalAmount
    });

    await base44.entities.OmniTransaction.create({
      user_id: user.id,
      type: 'withdraw',
      amount: parseFloat(amount),
      currency: 'omni',
      status: 'pending',
      to_address: address,
      network: network,
      metadata: { fee: currentFee }
    });

    setIsProcessing(false);
    toast.success('Withdrawal initiated! Transaction is being processed.');
    setAddress('');
    setAmount('');
    loadUser();
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
            Withdraw <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Omni</span>
          </h1>
          <p className="text-white/60 text-lg">Send Omni tokens to an external wallet</p>
        </motion.div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          {/* Balance Display */}
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-6">
            <div className="text-white/60 text-sm mb-1">Available Balance</div>
            <div className="text-cyan-400 text-3xl font-bold">{(user?.omni_balance || 0).toFixed(2)} OMNI</div>
          </div>

          {/* Network Selection */}
          <div className="mb-6">
            <label className="text-white/60 text-sm mb-2 block">Network</label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none"
            >
              <option value="omni-main">Omni Mainnet (Fee: 0.1 OMNI)</option>
              <option value="ethereum">Ethereum (Fee: 5 OMNI)</option>
              <option value="bsc">Binance Smart Chain (Fee: 0.5 OMNI)</option>
              <option value="polygon">Polygon (Fee: 0.2 OMNI)</option>
            </select>
          </div>

          {/* Recipient Address */}
          <div className="mb-6">
            <label className="text-white/60 text-sm mb-2 block">Recipient Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x..."
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none font-mono"
            />
          </div>

          {/* Amount */}
          <div className="mb-6">
            <label className="text-white/60 text-sm mb-2 block">Amount</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none text-lg"
              />
              <button
                onClick={() => setAmount(Math.max(0, (user?.omni_balance || 0) - currentFee).toString())}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Amount</span>
              <span className="text-white">{amount || '0.00'} OMNI</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Network Fee</span>
              <span className="text-white">{currentFee} OMNI</span>
            </div>
            <div className="border-t border-white/10 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-white/60 font-medium">Total</span>
                <span className="text-red-400 text-xl font-bold">
                  {totalAmount.toFixed(2)} OMNI
                </span>
              </div>
            </div>
          </div>

          {/* Warnings */}
          <div className="space-y-3 mb-6">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-red-300 text-sm">
                  <p className="font-medium mb-1">Warning</p>
                  <p className="text-red-300/80">
                    Withdrawals are irreversible. Double-check the recipient address and network.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-yellow-300 text-sm">
                  <ul className="list-disc list-inside space-y-1 text-yellow-300/80">
                    <li>Minimum withdrawal: 1 OMNI</li>
                    <li>Processing time: 5-15 minutes</li>
                    <li>Ensure the recipient address supports the selected network</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Withdraw Button */}
          <button
            onClick={handleWithdraw}
            disabled={isProcessing}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Withdraw Omni
              </>
            )}
          </button>
        </div>
      </div>
    </AuroraBackground>
  );
}