import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, CheckCircle, AlertCircle, Loader, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export default function CryptoCheckout({ item, onClose, onSuccess }) {
  const [step, setStep] = useState('select'); // select, connect, confirm, processing, success
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [cryptoPrices, setCryptoPrices] = useState({
    ETH: 0.015,
    BTC: 0.00042,
    USDC: 49.99,
    USDT: 49.99
  });

  const cryptoOptions = [
    { id: 'ETH', name: 'Ethereum', icon: '⟠', color: 'from-purple-500 to-blue-500' },
    { id: 'BTC', name: 'Bitcoin', icon: '₿', color: 'from-orange-500 to-yellow-500' },
    { id: 'USDC', name: 'USD Coin', icon: '💵', color: 'from-blue-500 to-cyan-500' },
    { id: 'USDT', name: 'Tether', icon: '💲', color: 'from-green-500 to-emerald-500' }
  ];

  const connectWallet = async (type) => {
    try {
      // Mock wallet connection - integrate with Web3 providers
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setWalletConnected(true);
        setStep('confirm');
        toast.success('Wallet connected!');
      } else {
        toast.error('Please install MetaMask or another Web3 wallet');
      }
    } catch (error) {
      toast.error('Failed to connect wallet');
      console.error(error);
    }
  };

  const processPayment = async () => {
    setStep('processing');
    
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setStep('success');
    toast.success('Payment successful!');
    
    setTimeout(() => {
      onSuccess && onSuccess();
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
        
        <motion.div
          className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-2xl w-full"
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10">
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Crypto Checkout</h2>
              <p className="text-white/60 text-sm">Secure blockchain payment</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60">Item</span>
              <span className="text-white font-semibold">{item.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Price (USD)</span>
              <span className="text-white font-bold text-xl">${item.price}</span>
            </div>
          </div>

          {/* Step 1: Select Cryptocurrency */}
          {step === 'select' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="text-white font-semibold mb-4">Select Cryptocurrency</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {cryptoOptions.map((crypto) => (
                  <button
                    key={crypto.id}
                    onClick={() => {
                      setSelectedCrypto(crypto);
                      setStep('connect');
                    }}
                    className={`bg-gradient-to-r ${crypto.color} bg-opacity-10 border border-white/20 rounded-xl p-4 hover:scale-105 transition-all text-left`}
                  >
                    <div className="text-3xl mb-2">{crypto.icon}</div>
                    <div className="text-white font-bold mb-1">{crypto.name}</div>
                    <div className="text-white/60 text-sm">
                      {cryptoPrices[crypto.id]} {crypto.id}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Connect Wallet */}
          {step === 'connect' && selectedCrypto && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <button
                onClick={() => setStep('select')}
                className="text-cyan-400 text-sm mb-4 hover:text-cyan-300"
              >
                ← Back to crypto selection
              </button>
              
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 mb-6 text-center">
                <div className="text-4xl mb-3">{selectedCrypto.icon}</div>
                <div className="text-white font-bold text-lg mb-1">{selectedCrypto.name}</div>
                <div className="text-white/60 text-sm">
                  Pay {cryptoPrices[selectedCrypto.id]} {selectedCrypto.id}
                </div>
              </div>

              <h3 className="text-white font-semibold mb-4">Connect Your Wallet</h3>
              <div className="space-y-3">
                <button
                  onClick={() => connectWallet('metamask')}
                  className="w-full p-4 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/40 rounded-xl text-white font-semibold hover:bg-orange-500/30 transition-all flex items-center justify-between"
                >
                  <span>🦊 MetaMask</span>
                  <span className="text-sm text-white/60">Most Popular</span>
                </button>
                <button
                  onClick={() => connectWallet('walletconnect')}
                  className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/10 transition-all"
                >
                  🔗 WalletConnect
                </button>
                <button
                  onClick={() => connectWallet('coinbase')}
                  className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/10 transition-all"
                >
                  🔵 Coinbase Wallet
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirm Transaction */}
          {step === 'confirm' && selectedCrypto && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-green-400 font-semibold">Wallet Connected</div>
                  <div className="text-white/60 text-xs">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</div>
                </div>
              </div>

              <h3 className="text-white font-semibold mb-4">Confirm Payment</h3>
              <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/60">You pay</span>
                  <span className="text-white font-bold">{cryptoPrices[selectedCrypto.id]} {selectedCrypto.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Network fee</span>
                  <span className="text-white">~0.001 {selectedCrypto.id}</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between">
                  <span className="text-white/60">Total</span>
                  <span className="text-white font-bold text-lg">
                    {(cryptoPrices[selectedCrypto.id] + 0.001).toFixed(4)} {selectedCrypto.id}
                  </span>
                </div>
              </div>

              <button
                onClick={processPayment}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:opacity-90 transition-all"
              >
                Confirm & Pay
              </button>
            </motion.div>
          )}

          {/* Step 4: Processing */}
          {step === 'processing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <Loader className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-white font-bold text-xl mb-2">Processing Payment</h3>
              <p className="text-white/60">Please wait while we confirm your transaction on the blockchain...</p>
            </motion.div>
          )}

          {/* Step 5: Success */}
          {step === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-white font-bold text-2xl mb-2">Payment Successful!</h3>
              <p className="text-white/60 mb-4">Your purchase has been confirmed</p>
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <div className="text-green-400 text-sm">Transaction Hash</div>
                <div className="text-white/60 text-xs font-mono mt-1">0x7a8b...4f2e</div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}