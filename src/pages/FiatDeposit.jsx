import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Building2, Loader } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import PlaidConnect from '../components/omni/PlaidConnect';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function FiatDeposit() {
  const [user, setUser] = useState(null);
  const [depositMethod, setDepositMethod] = useState('card');
  const [amount, setAmount] = useState('');
  const [convertTo, setConvertTo] = useState('omni');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPlaid, setShowPlaid] = useState(false);

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
  const estimatedOmni = amount ? (parseFloat(amount) / omniPrice).toFixed(2) : '0.00';

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) < 10) {
      toast.error('Minimum deposit is $10');
      return;
    }

    setIsProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    if (convertTo === 'omni') {
      const omniAmount = parseFloat(amount) / omniPrice;
      await base44.auth.updateMe({
        omni_balance: (user.omni_balance || 0) + omniAmount
      });

      await base44.entities.OmniTransaction.create({
        user_id: user.id,
        type: 'deposit',
        amount: omniAmount,
        currency: 'omni',
        status: 'confirmed',
        metadata: { fiat_amount: parseFloat(amount), method: depositMethod }
      });
    } else if (convertTo === 'card') {
      // Add to card balance (simulated)
      toast.success('Funds added to Omni Card!');
    }

    setIsProcessing(false);
    toast.success(`Successfully deposited $${amount}!`);
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
            Fiat <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Deposit</span>
          </h1>
          <p className="text-white/60 text-lg">Add funds using traditional payment methods</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Deposit Form */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-white font-bold text-xl mb-6">Deposit Method</h2>

            {/* Method Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setDepositMethod('card')}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  depositMethod === 'card'
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-white/10 hover:border-white/20 bg-white/5'
                }`}
              >
                <CreditCard className="w-8 h-8 text-cyan-400" />
                <div className="text-white font-medium text-sm">Credit/Debit Card</div>
              </button>

              <button
                onClick={() => setShowPlaid(true)}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  depositMethod === 'bank'
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-white/10 hover:border-white/20 bg-white/5'
                }`}
              >
                <Building2 className="w-8 h-8 text-blue-400" />
                <div className="text-white font-medium text-sm">Bank Transfer</div>
              </button>
            </div>

            {/* Amount */}
            <div className="mb-6">
              <label className="text-white/60 text-sm mb-2 block">Amount (USD)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none text-lg"
              />
              <div className="text-white/40 text-xs mt-1">Minimum: $10</div>
            </div>

            {/* Convert To */}
            <div className="mb-6">
              <label className="text-white/60 text-sm mb-2 block">Convert To</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setConvertTo('omni')}
                  className={`p-3 rounded-xl border transition-all ${
                    convertTo === 'omni'
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-white/10 hover:border-white/20 bg-white/5'
                  }`}
                >
                  <div className="text-white font-medium text-sm">Omni Balance</div>
                  <div className="text-white/60 text-xs mt-1">≈ {estimatedOmni} OMNI</div>
                </button>

                <button
                  onClick={() => setConvertTo('card')}
                  className={`p-3 rounded-xl border transition-all ${
                    convertTo === 'card'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-white/10 hover:border-white/20 bg-white/5'
                  }`}
                >
                  <div className="text-white font-medium text-sm">Omni Card</div>
                  <div className="text-white/60 text-xs mt-1">Direct to card</div>
                </button>
              </div>
            </div>

            {/* Deposit Button */}
            <button
              onClick={handleDeposit}
              disabled={isProcessing}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                `Deposit $${amount || '0.00'}`
              )}
            </button>
          </div>

          {/* Plaid Connection */}
          <div>
            <PlaidConnect
              onSuccess={(account) => {
                setDepositMethod('bank');
                toast.success(`Connected: ${account.institution}`);
              }}
            />
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">🔒</div>
            <div className="text-white font-medium text-sm mb-1">Secure Processing</div>
            <div className="text-white/60 text-xs">Bank-level encryption</div>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">⚡</div>
            <div className="text-white font-medium text-sm mb-1">Instant Deposit</div>
            <div className="text-white/60 text-xs">Funds available immediately</div>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">💳</div>
            <div className="text-white font-medium text-sm mb-1">No Hidden Fees</div>
            <div className="text-white/60 text-xs">Transparent pricing</div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}