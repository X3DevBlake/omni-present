import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, AlertCircle, Loader } from 'lucide-react';
import { toast } from 'sonner';

export default function BridgeInterface({ userBalance }) {
  const [fromNetwork, setFromNetwork] = useState('omni-main');
  const [toNetwork, setToNetwork] = useState('ethereum');
  const [amount, setAmount] = useState('');
  const [isBridging, setIsBridging] = useState(false);

  const networks = [
    { id: 'omni-main', name: 'Omni Mainnet', icon: '⚡', fee: 0.1 },
    { id: 'ethereum', name: 'Ethereum', icon: '◆', fee: 5 },
    { id: 'bsc', name: 'Binance Smart Chain', icon: '🔶', fee: 0.5 },
    { id: 'polygon', name: 'Polygon', icon: '💜', fee: 0.2 },
    { id: 'arbitrum', name: 'Arbitrum', icon: '🔵', fee: 1 },
    { id: 'optimism', name: 'Optimism', icon: '🔴', fee: 1 },
  ];

  const getNetworkFee = (networkId) => {
    return networks.find(n => n.id === networkId)?.fee || 0;
  };

  const estimatedFee = getNetworkFee(fromNetwork) + getNetworkFee(toNetwork);
  const estimatedTime = fromNetwork === 'omni-main' || toNetwork === 'omni-main' ? '5-10 min' : '15-30 min';

  const handleBridge = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > userBalance) {
      toast.error('Insufficient balance');
      return;
    }

    setIsBridging(true);
    
    // Simulate bridging process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsBridging(false);
    toast.success(`Successfully bridged ${amount} OMNI to ${networks.find(n => n.id === toNetwork)?.name}!`);
    setAmount('');
  };

  const swapNetworks = () => {
    const temp = fromNetwork;
    setFromNetwork(toNetwork);
    setToNetwork(temp);
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-bold text-xl mb-6">Bridge Omni Tokens</h3>

      <div className="space-y-4">
        {/* From Network */}
        <div>
          <label className="text-white/60 text-sm mb-2 block">From Network</label>
          <select
            value={fromNetwork}
            onChange={(e) => setFromNetwork(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none"
          >
            {networks.map(network => (
              <option key={network.id} value={network.id}>
                {network.icon} {network.name}
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={swapNetworks}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
          >
            <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
          </button>
        </div>

        {/* To Network */}
        <div>
          <label className="text-white/60 text-sm mb-2 block">To Network</label>
          <select
            value={toNetwork}
            onChange={(e) => setToNetwork(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none"
          >
            {networks.filter(n => n.id !== fromNetwork).map(network => (
              <option key={network.id} value={network.id}>
                {network.icon} {network.name}
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div>
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
              onClick={() => setAmount(userBalance.toString())}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors"
            >
              MAX
            </button>
          </div>
          <div className="text-white/40 text-xs mt-1">
            Available: {userBalance} OMNI
          </div>
        </div>

        {/* Bridge Details */}
        <div className="bg-white/5 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Bridge Fee</span>
            <span className="text-white">{estimatedFee} OMNI</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Estimated Time</span>
            <span className="text-white">{estimatedTime}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/60">You will receive</span>
            <span className="text-cyan-400 font-bold">
              {amount ? (parseFloat(amount) - estimatedFee).toFixed(2) : '0.00'} OMNI
            </span>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-yellow-300 text-sm">
              <p className="font-medium mb-1">Important</p>
              <p className="text-yellow-300/80">
                Bridge transactions are irreversible. Please verify the destination network and address carefully.
              </p>
            </div>
          </div>
        </div>

        {/* Bridge Button */}
        <button
          onClick={handleBridge}
          disabled={isBridging || !amount}
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {isBridging ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Bridging...
            </>
          ) : (
            'Bridge Tokens'
          )}
        </button>
      </div>
    </div>
  );
}