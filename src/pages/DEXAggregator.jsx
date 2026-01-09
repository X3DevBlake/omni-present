import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Repeat, TrendingUp, Shield, Zap } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function DEXAggregator() {
  const [fromToken, setFromToken] = useState('OMNI');
  const [toToken, setToToken] = useState('ETH');
  const [amount, setAmount] = useState('');
  const [routes, setRoutes] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const tokens = ['OMNI', 'ETH', 'USDT', 'USDC', 'BTC', 'BNB', 'SOL'];
  
  const findBestRoutes = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSearching(true);
    
    // Simulate DEX aggregation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockRoutes = [
      {
        dex: 'Uniswap V3',
        outputAmount: (parseFloat(amount) * 0.0015 * 1.002).toFixed(6),
        priceImpact: 0.12,
        fee: 0.3,
        route: [fromToken, 'USDT', toToken],
        gasEstimate: '$3.20'
      },
      {
        dex: 'SushiSwap',
        outputAmount: (parseFloat(amount) * 0.0015 * 0.998).toFixed(6),
        priceImpact: 0.18,
        fee: 0.3,
        route: [fromToken, toToken],
        gasEstimate: '$2.80'
      },
      {
        dex: 'Curve',
        outputAmount: (parseFloat(amount) * 0.0015 * 1.005).toFixed(6),
        priceImpact: 0.08,
        fee: 0.04,
        route: [fromToken, 'USDC', toToken],
        gasEstimate: '$2.50'
      },
      {
        dex: '1inch',
        outputAmount: (parseFloat(amount) * 0.0015 * 1.008).toFixed(6),
        priceImpact: 0.15,
        fee: 0.25,
        route: [fromToken, 'USDT', 'USDC', toToken],
        gasEstimate: '$4.10'
      }
    ].sort((a, b) => parseFloat(b.outputAmount) - parseFloat(a.outputAmount));

    setRoutes(mockRoutes);
    setSelectedRoute(mockRoutes[0]);
    setIsSearching(false);
    toast.success('Found best routes across DEXs');
  };

  const executeSwap = async () => {
    if (!selectedRoute) return;

    try {
      const user = await base44.auth.me();
      
      await base44.entities.OmniTransaction.create({
        user_id: user.id,
        type: 'swap',
        amount: parseFloat(amount),
        currency: fromToken.toLowerCase(),
        status: 'confirmed',
        metadata: {
          dex: selectedRoute.dex,
          from_token: fromToken,
          to_token: toToken,
          output_amount: selectedRoute.outputAmount,
          route: selectedRoute.route.join(' → ')
        }
      });

      toast.success(`Swap executed via ${selectedRoute.dex}`);
      setAmount('');
      setRoutes([]);
      setSelectedRoute(null);
    } catch (error) {
      toast.error('Failed to execute swap');
      console.error(error);
    }
  };

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            DEX <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Aggregator</span>
          </h1>
          <p className="text-white/60 text-lg">Find the best rates across decentralized exchanges</p>
        </motion.div>

        {/* Swap Interface */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <div className="space-y-4">
            {/* From Token */}
            <div className="bg-white/5 rounded-xl p-4">
              <label className="text-white/60 text-sm mb-2 block">From</label>
              <div className="flex gap-3">
                <select
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white flex-1"
                >
                  {tokens.map(token => (
                    <option key={token} value={token}>{token}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white flex-1"
                />
              </div>
            </div>

            {/* Swap Icon */}
            <div className="flex justify-center">
              <button className="p-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full hover:scale-110 transition-transform">
                <Repeat className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* To Token */}
            <div className="bg-white/5 rounded-xl p-4">
              <label className="text-white/60 text-sm mb-2 block">To (estimated)</label>
              <div className="flex gap-3">
                <select
                  value={toToken}
                  onChange={(e) => setToToken(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white flex-1"
                >
                  {tokens.filter(t => t !== fromToken).map(token => (
                    <option key={token} value={token}>{token}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={selectedRoute?.outputAmount || '0.0'}
                  readOnly
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white flex-1"
                />
              </div>
            </div>

            <button
              onClick={findBestRoutes}
              disabled={isSearching}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSearching ? 'Searching DEXs...' : 'Find Best Rate'}
            </button>
          </div>
        </div>

        {/* Routes */}
        {routes.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-white font-bold text-xl mb-4">Available Routes</h3>
            {routes.map((route, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedRoute(route)}
                className={`bg-gradient-to-r ${
                  selectedRoute === route
                    ? 'from-cyan-500/30 to-purple-500/30 border-cyan-500/50'
                    : 'from-white/5 to-white/5 border-white/10'
                } border rounded-xl p-4 cursor-pointer hover:scale-102 transition-all`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-white font-bold text-lg">{route.dex}</div>
                    <div className="text-white/60 text-sm">{route.route.join(' → ')}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold text-xl">{route.outputAmount} {toToken}</div>
                    {i === 0 && (
                      <div className="text-xs text-green-400 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Best Rate
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-black/30 rounded-lg p-2">
                    <div className="text-white/60 text-xs">Price Impact</div>
                    <div className="text-white font-semibold">{route.priceImpact}%</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-2">
                    <div className="text-white/60 text-xs">Fee</div>
                    <div className="text-white font-semibold">{route.fee}%</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-2">
                    <div className="text-white/60 text-xs">Gas</div>
                    <div className="text-white font-semibold">{route.gasEstimate}</div>
                  </div>
                </div>
              </motion.div>
            ))}

            {selectedRoute && (
              <button
                onClick={executeSwap}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-bold text-lg hover:opacity-90 transition-opacity"
              >
                <Zap className="w-5 h-5 inline mr-2" />
                Execute Swap via {selectedRoute.dex}
              </button>
            )}
          </div>
        )}
      </div>
    </AuroraBackground>
  );
}