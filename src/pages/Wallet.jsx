import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, Bitcoin, TrendingUp, Send, Download } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { toast } from 'sonner';

export default function Wallet() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [balance, setBalance] = useState({ USD: 1234.56, ETH: 0.5, BTC: 0.012, USDC: 500 });

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletConnected(true);
        toast.success('Wallet connected!');
      } else {
        toast.error('Please install MetaMask');
      }
    } catch (error) {
      toast.error('Failed to connect wallet');
    }
  };

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Crypto Wallet</h1>
          <p className="text-white/60">Manage your cryptocurrency and earnings</p>
        </motion.div>

        {!walletConnected ? (
          <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border border-orange-500/30 rounded-2xl p-12 text-center">
            <WalletIcon className="w-20 h-20 text-orange-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-white/60 mb-6">Connect to buy, sell, and manage your crypto assets</p>
            <button
              onClick={connectWallet}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-xl hover:opacity-90"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'USD Value', value: `$${balance.USD}`, icon: TrendingUp, color: 'green' },
                { label: 'Ethereum', value: `${balance.ETH} ETH`, icon: Bitcoin, color: 'purple' },
                { label: 'Bitcoin', value: `${balance.BTC} BTC`, icon: Bitcoin, color: 'orange' },
                { label: 'USDC', value: `${balance.USDC} USDC`, icon: Bitcoin, color: 'blue' }
              ].map((stat, i) => (
                <motion.div key={i} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-400 mb-2`} />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-white/60 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <h3 className="text-white font-bold text-xl mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                  {[
                    { type: 'received', amount: '+0.05 ETH', desc: 'Asset sale earnings', time: '2h ago' },
                    { type: 'sent', amount: '-$49.99', desc: 'Purchased Agent', time: '1d ago' }
                  ].map((tx, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <div className={`font-semibold ${tx.type === 'received' ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.amount}
                        </div>
                        <div className="text-white/60 text-sm">{tx.desc}</div>
                      </div>
                      <div className="text-white/40 text-xs">{tx.time}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <h3 className="text-white font-bold text-xl mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full py-3 bg-green-500/20 border border-green-500/40 text-green-400 rounded-lg hover:bg-green-500/30 flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" />
                    Deposit
                  </button>
                  <button className="w-full py-3 bg-blue-500/20 border border-blue-500/40 text-blue-400 rounded-lg hover:bg-blue-500/30 flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AuroraBackground>
  );
}