import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, TrendingUp, BarChart3, Zap } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function ExchangeListings() {
  const exchanges = [
    {
      name: 'Binance',
      type: 'CEX',
      logo: '🔶',
      volume: '$2.5M',
      liquidity: 'High',
      pairs: ['OMNI/USDT', 'OMNI/BTC', 'OMNI/ETH'],
      url: 'https://binance.com',
      fee: '0.1%'
    },
    {
      name: 'Coinbase',
      type: 'CEX',
      logo: '🔵',
      volume: '$1.8M',
      liquidity: 'High',
      pairs: ['OMNI/USD', 'OMNI/USDT'],
      url: 'https://coinbase.com',
      fee: '0.5%'
    },
    {
      name: 'Uniswap',
      type: 'DEX',
      logo: '🦄',
      volume: '$800K',
      liquidity: 'Medium',
      pairs: ['OMNI/ETH', 'OMNI/USDC'],
      url: 'https://uniswap.org',
      fee: '0.3%'
    },
    {
      name: 'PancakeSwap',
      type: 'DEX',
      logo: '🥞',
      volume: '$600K',
      liquidity: 'Medium',
      pairs: ['OMNI/BNB', 'OMNI/BUSD'],
      url: 'https://pancakeswap.finance',
      fee: '0.25%'
    },
    {
      name: 'Kraken',
      type: 'CEX',
      logo: '🐙',
      volume: '$1.2M',
      liquidity: 'High',
      pairs: ['OMNI/USD', 'OMNI/EUR'],
      url: 'https://kraken.com',
      fee: '0.26%'
    },
    {
      name: 'SushiSwap',
      type: 'DEX',
      logo: '🍣',
      volume: '$400K',
      liquidity: 'Low',
      pairs: ['OMNI/ETH'],
      url: 'https://sushi.com',
      fee: '0.3%'
    },
  ];

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Omni</span> Exchange Listings
          </h1>
          <p className="text-white/60 text-lg">Trade Omni tokens on leading exchanges</p>
        </motion.div>

        {/* Market Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-white/60 text-sm">Price</span>
            </div>
            <div className="text-3xl font-bold text-white">$0.0245</div>
            <div className="text-green-400 text-sm mt-1">+12.5% (24h)</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <span className="text-white/60 text-sm">24h Volume</span>
            </div>
            <div className="text-3xl font-bold text-white">$8.3M</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="text-white/60 text-sm">Market Cap</span>
            </div>
            <div className="text-3xl font-bold text-white">$245M</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-white/60 text-sm">Circulating Supply</span>
            </div>
            <div className="text-3xl font-bold text-white">10B</div>
            <div className="text-white/60 text-sm mt-1">100% of total</div>
          </motion.div>
        </div>

        {/* Exchange Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exchanges.map((exchange, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{exchange.logo}</div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{exchange.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      exchange.type === 'CEX'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {exchange.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">24h Volume</span>
                  <span className="text-white font-medium">{exchange.volume}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Liquidity</span>
                  <span className={`font-medium ${
                    exchange.liquidity === 'High'
                      ? 'text-green-400'
                      : exchange.liquidity === 'Medium'
                      ? 'text-yellow-400'
                      : 'text-orange-400'
                  }`}>
                    {exchange.liquidity}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Trading Fee</span>
                  <span className="text-white font-medium">{exchange.fee}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-white/60 text-xs mb-2">Trading Pairs</div>
                <div className="flex flex-wrap gap-2">
                  {exchange.pairs.map((pair, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded text-xs"
                    >
                      {pair}
                    </span>
                  ))}
                </div>
              </div>

              <a
                href={exchange.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Trade Now
                <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}