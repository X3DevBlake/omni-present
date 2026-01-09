import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Repeat, TrendingUp, ArrowRight } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import HubNav from '../components/navigation/HubNav';
import { toast } from 'sonner';

export default function DEXAggregator() {
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('OMNI');
  const [amount, setAmount] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [bestRoute, setBestRoute] = useState(null);

  const tokens = ['ETH', 'OMNI', 'USDT', 'USDC', 'DAI', 'WBTC'];
  const dexs = [
    { name: 'Uniswap', fee: 0.3, liquidity: 'High' },
    { name: 'SushiSwap', fee: 0.25, liquidity: 'Medium' },
    { name: 'Curve', fee: 0.04, liquidity: 'High' },
    { name: 'Balancer', fee: 0.15, liquidity: 'Medium' },
    { name: '1inch', fee: 0.2, liquidity: 'High' }
  ];

  const findBestRoute = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate DEX aggregation
    setTimeout(() => {
      const bestDEX = dexs[Math.floor(Math.random() * dexs.length)];
      const estimatedOutput = parseFloat(amount) * (Math.random() * 0.2 + 0.9);
      const priceImpact = (Math.random() * 2).toFixed(2);
      
      setBestRoute({
        dex: bestDEX,
        inputAmount: parseFloat(amount),
        outputAmount: estimatedOutput.toFixed(4),
        priceImpact,
        gasEstimate: (Math.random() * 50 + 10).toFixed(2),
        route: `${fromToken} → ${bestDEX.name} → ${toToken}`
      });
      
      setIsAnalyzing(false);
      toast.success('Best route found!');
    }, 2000);
  };

  const executeSwap = () => {
    toast.success('Swap executed successfully!');
    setBestRoute(null);
    setAmount('');
  };

  return (
    <>
      <HubNav currentHub="DeFiHub" />
      <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">DEX Aggregator</span>
          </h1>
          <p className="text-white/60 text-lg">Get the best rates across all decentralized exchanges</p>
        </motion.div>

        {/* Swap Interface */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <div className="space-y-4">
            {/* From Token */}
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-white/60 text-sm mb-2">From</div>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="flex-1 bg-transparent text-white text-3xl outline-none"
                />
                <select
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                  className="bg-white/10 text-white px-4 py-2 rounded-lg"
                >
                  {tokens.map(token => <option key={token} value={token}>{token}</option>)}
                </select>
              </div>
            </div>

            {/* Swap Arrow */}
            <div className="flex justify-center">
              <button
                onClick={() => { setFromToken(toToken); setToToken(fromToken); }}
                className="p-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-full transition-all"
              >
                <Repeat className="w-6 h-6 text-cyan-400" />
              </button>
            </div>

            {/* To Token */}
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-white/60 text-sm mb-2">To (estimated)</div>
              <div className="flex items-center gap-4">
                <div className="flex-1 text-white text-3xl">
                  {bestRoute ? bestRoute.outputAmount : '0.0'}
                </div>
                <select
                  value={toToken}
                  onChange={(e) => setToToken(e.target.value)}
                  className="bg-white/10 text-white px-4 py-2 rounded-lg"
                >
                  {tokens.map(token => <option key={token} value={token}>{token}</option>)}
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={findBestRoute}
            disabled={isAnalyzing}
            className="w-full mt-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {isAnalyzing ? 'Finding Best Route...' : 'Find Best Route'}
          </button>
        </div>

        {/* Best Route Display */}
        {bestRoute && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-black/40 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <h3 className="text-white font-bold">Best Route Found</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">DEX:</span>
                <span className="text-white font-semibold">{bestRoute.dex.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Route:</span>
                <span className="text-cyan-400 text-sm">{bestRoute.route}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Price Impact:</span>
                <span className="text-yellow-400">{bestRoute.priceImpact}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Est. Gas:</span>
                <span className="text-white">${bestRoute.gasEstimate}</span>
              </div>
            </div>

            <button
              onClick={executeSwap}
              className="w-full mt-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all"
            >
              Execute Swap
            </button>
          </motion.div>
        )}

        {/* Available DEXs */}
        <div className="mt-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4">Available DEXs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dexs.map((dex, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">{dex.name}</span>
                  <span className="text-green-400 text-sm">{dex.fee}% fee</span>
                </div>
                <div className="text-white/60 text-xs mt-1">Liquidity: {dex.liquidity}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuroraBackground>
    </>
  );
}