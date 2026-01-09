import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, DollarSign, Loader, AlertCircle } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function SellOmni() {
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [swapTo, setSwapTo] = useState('usdt');
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

  const omniPrice = 0.0245;
  const estimatedReceive = amount ? (parseFloat(amount) * omniPrice).toFixed(4) : '0.0000';

  const handleSellSwap = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > (user?.omni_balance || 0)) {
      toast.error('Insufficient Omni balance');
      return;
    }

    setIsProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const receiveAmount = parseFloat(amount) * omniPrice;
    const updates = {
      omni_balance: (user.omni_balance || 0) - parseFloat(amount)
    };

    if (swapTo === 'usdt') updates.usdt_balance = (user.usdt_balance || 0) + receiveAmount;
    else if (swapTo === 'eth') updates.eth_balance = (user.eth_balance || 0) + (receiveAmount / 2000); // Mock ETH price
    
    await base44.auth.updateMe(updates);

    await base44.entities.OmniTransaction.create({
      user_id: user.id,
      type: 'swap',
      amount: parseFloat(amount),
      currency: 'omni',
      status: 'confirmed',
      metadata: { swap_to: swapTo, received_amount: receiveAmount }
    });

    setIsProcessing(false);
    toast.success(`Successfully swapped ${amount} OMNI for ${estimatedReceive} ${swapTo.toUpperCase()}!`);
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
            Sell/Swap <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Omni</span>
          </h1>
          <p className="text-white/60 text-lg">Exchange your Omni tokens for other cryptocurrencies</p>
        </motion.div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          {/* Balance Display */}
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-6">
            <div className="text-white/60 text-sm mb-1">Available Omni Balance</div>
            <div className="text-cyan-400 text-3xl font-bold">{(user?.omni_balance || 0).toFixed(2)} OMNI</div>
          </div>

          {/* Amount to Sell */}
          <div className="mb-6">
            <label className="text-white/60 text-sm mb-2 block">Amount to Sell</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none text-lg"
              />
              <button
                onClick={() => setAmount((user?.omni_balance || 0).toString())}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Swap To Selection */}
          <div className="mb-6">
            <label className="text-white/60 text-sm mb-2 block">Swap To</label>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setSwapTo('usdt')}
                className={`p-4 rounded-xl border transition-all ${
                  swapTo === 'usdt'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-white/10 hover:border-white/20 bg-white/5'
                }`}
              >
                <div className="text-2xl mb-1">₮</div>
                <div className="text-white font-medium text-sm">USDT</div>
              </button>

              <button
                onClick={() => setSwapTo('eth')}
                className={`p-4 rounded-xl border transition-all ${
                  swapTo === 'eth'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-white/10 hover:border-white/20 bg-white/5'
                }`}
              >
                <div className="text-2xl mb-1">◆</div>
                <div className="text-white font-medium text-sm">ETH</div>
              </button>

              <button
                onClick={() => setSwapTo('usd')}
                className={`p-4 rounded-xl border transition-all ${
                  swapTo === 'usd'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/10 hover:border-white/20 bg-white/5'
                }`}
              >
                <div className="text-2xl mb-1">$</div>
                <div className="text-white font-medium text-sm">USD</div>
              </button>
            </div>
          </div>

          {/* Swap Details */}
          <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Exchange Rate</span>
              <span className="text-white">1 OMNI = ${omniPrice}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Network Fee</span>
              <span className="text-white">0.5%</span>
            </div>
            <div className="border-t border-white/10 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-white/60">You will receive</span>
                <span className="text-green-400 text-xl font-bold">
                  {estimatedReceive} {swapTo.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-yellow-300 text-sm">
                This transaction is irreversible. Please verify the details before proceeding.
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSellSwap}
            disabled={isProcessing}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ArrowRightLeft className="w-5 h-5" />
                Swap Now
              </>
            )}
          </button>
        </div>
      </div>
    </AuroraBackground>
  );
}