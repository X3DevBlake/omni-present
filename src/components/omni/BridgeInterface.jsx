import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function BridgeInterface({ userBalance = 0 }) {
  const [amount, setAmount] = useState('');
  const [fromNetwork, setFromNetwork] = useState('omni-main');
  const [toNetwork, setToNetwork] = useState('ethereum');
  const [isProcessing, setIsProcessing] = useState(false);

  const networks = [
    { id: 'omni-main', name: 'Omni Mainnet', fee: 0.1 },
    { id: 'ethereum', name: 'Ethereum', fee: 5 },
    { id: 'bsc', name: 'Binance Smart Chain', fee: 0.5 },
    { id: 'polygon', name: 'Polygon', fee: 0.2 },
    { id: 'arbitrum', name: 'Arbitrum', fee: 1 },
    { id: 'optimism', name: 'Optimism', fee: 1 },
  ];

  const currentFee = networks.find(n => n.id === toNetwork)?.fee || 0;
  const totalAmount = amount ? parseFloat(amount) + currentFee : 0;

  const handleBridge = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (totalAmount > userBalance) {
      toast.error('Insufficient balance (including fees)');
      return;
    }

    setIsProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 3000));

    const user = await base44.auth.me();
    await base44.auth.updateMe({
      omni_balance: (user.omni_balance || 0) - totalAmount
    });

    await base44.entities.OmniTransaction.create({
      user_id: user.id,
      type: 'bridge',
      amount: parseFloat(amount),
      currency: 'omni',
      status: 'pending',
      network: toNetwork,
      metadata: { 
        from_network: fromNetwork,
        to_network: toNetwork,
        fee: currentFee 
      }
    });

    setIsProcessing(false);
    toast.success('Bridge transaction initiated!');
    setAmount('');
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-bold text-xl mb-6">Bridge Omni Tokens</h3>

      {/* From Network */}
      <div className="mb-4">
        <label className="text-white/60 text-sm mb-2 block">From Network</label>
        <select
          value={fromNetwork}
          onChange={(e) => setFromNetwork(e.target.value)}
          className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none"
        >
          {networks.map(network => (
            <option key={network.id} value={network.id}>{network.name}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-center my-4">
        <div className="p-2 bg-cyan-500/20 rounded-full">
          <ArrowRight className="w-6 h-6 text-cyan-400" />
        </div>
      </div>

      {/* To Network */}
      <div className="mb-4">
        <label className="text-white/60 text-sm mb-2 block">To Network</label>
        <select
          value={toNetwork}
          onChange={(e) => setToNetwork(e.target.value)}
          className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none"
        >
          {networks.filter(n => n.id !== fromNetwork).map(network => (
            <option key={network.id} value={network.id}>{network.name}</option>
          ))}
        </select>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <label className="text-white/60 text-sm mb-2 block">Amount</label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none"
          />
          <button
            onClick={() => setAmount(Math.max(0, userBalance - currentFee).toString())}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30"
          >
            MAX
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Amount</span>
          <span className="text-white">{amount || '0.00'} OMNI</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Bridge Fee</span>
          <span className="text-white">{currentFee} OMNI</span>
        </div>
        <div className="border-t border-white/10 pt-2">
          <div className="flex justify-between">
            <span className="text-white/60">Total</span>
            <span className="text-cyan-400 font-bold">{totalAmount.toFixed(2)} OMNI</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleBridge}
        disabled={isProcessing}
        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Bridging...
          </>
        ) : (
          'Bridge Tokens'
        )}
      </button>
    </div>
  );
}