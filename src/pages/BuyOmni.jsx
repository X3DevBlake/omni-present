import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Bitcoin, DollarSign, Loader } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import CryptoCheckout from '../components/crypto/CryptoCheckout';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function BuyOmni() {
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('fiat');
  const [selectedCrypto, setSelectedCrypto] = useState('usdt');
  const [showCryptoCheckout, setShowCryptoCheckout] = useState(false);
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

  const omniPrice = 0.0245; // Price per Omni token in USD
  const estimatedOmni = amount ? (parseFloat(amount) / omniPrice).toFixed(2) : '0.00';

  const handleBuyFiat = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    
    // Simulate purchase
    await new Promise(resolve => setTimeout(resolve, 2000));
    
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
      metadata: { purchase_method: 'fiat', usd_amount: parseFloat(amount) }
    });

    setIsProcessing(false);
    toast.success(`Successfully purchased ${omniAmount.toFixed(2)} OMNI!`);
    setAmount('');
    loadUser();
  };

  const handleBuyCrypto = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setShowCryptoCheckout(true);
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
            Buy <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Omni</span>
          </h1>
          <p className="text-white/60 text-lg">Purchase Omni tokens with fiat or crypto</p>
        </motion.div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          {/* Payment Method Selection */}
          <div className="mb-6">
            <label className="text-white/60 text-sm mb-3 block">Payment Method</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPaymentMethod('fiat')}
                className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                  paymentMethod === 'fiat'
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-white/10 hover:border-white/20 bg-white/5'
                }`}
              >
                <DollarSign className="w-6 h-6 text-green-400" />
                <div className="text-left">
                  <div className="text-white font-medium">Fiat Currency</div>
                  <div className="text-white/60 text-xs">Card or Bank Transfer</div>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('crypto')}
                className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                  paymentMethod === 'crypto'
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-white/10 hover:border-white/20 bg-white/5'
                }`}
              >
                <Bitcoin className="w-6 h-6 text-orange-400" />
                <div className="text-left">
                  <div className="text-white font-medium">Cryptocurrency</div>
                  <div className="text-white/60 text-xs">ETH, USDT, etc.</div>
                </div>
              </button>
            </div>
          </div>

          {paymentMethod === 'crypto' && (
            <div className="mb-6">
              <label className="text-white/60 text-sm mb-2 block">Select Cryptocurrency</label>
              <select
                value={selectedCrypto}
                onChange={(e) => setSelectedCrypto(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none"
              >
                <option value="usdt">USDT (Tether)</option>
                <option value="eth">ETH (Ethereum)</option>
                <option value="btc">BTC (Bitcoin)</option>
              </select>
            </div>
          )}

          {/* Amount Input */}
          <div className="mb-6">
            <label className="text-white/60 text-sm mb-2 block">
              Amount ({paymentMethod === 'fiat' ? 'USD' : selectedCrypto.toUpperCase()})
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none text-lg"
            />
          </div>

          {/* Estimation */}
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/60">You will receive</span>
              <span className="text-cyan-400 text-2xl font-bold">{estimatedOmni} OMNI</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Current Rate</span>
              <span className="text-white">1 OMNI = ${omniPrice}</span>
            </div>
          </div>

          {/* Buy Button */}
          <button
            onClick={paymentMethod === 'fiat' ? handleBuyFiat : handleBuyCrypto}
            disabled={isProcessing}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Buy Omni Now
              </>
            )}
          </button>

          <div className="mt-4 text-center text-white/40 text-xs">
            Minimum purchase: $10 • No maximum limit
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">⚡</div>
            <div className="text-white font-medium text-sm">Instant Delivery</div>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">🔒</div>
            <div className="text-white font-medium text-sm">Secure Payment</div>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">💰</div>
            <div className="text-white font-medium text-sm">Best Rates</div>
          </div>
        </div>
      </div>

      {showCryptoCheckout && (
        <CryptoCheckout
          show={showCryptoCheckout}
          item={{ name: 'Omni Tokens', price: parseFloat(amount) }}
          onClose={() => setShowCryptoCheckout(false)}
          onSuccess={async () => {
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
              metadata: { purchase_method: 'crypto' }
            });
            toast.success(`Successfully purchased ${omniAmount.toFixed(2)} OMNI!`);
            setShowCryptoCheckout(false);
            setAmount('');
            loadUser();
          }}
        />
      )}
    </AuroraBackground>
  );
}