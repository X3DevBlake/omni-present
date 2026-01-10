import React from 'react';
import { motion } from 'framer-motion';
import { Image, TrendingUp } from 'lucide-react';

export default function NFTPortfolioTracker() {
  const nfts = [
    { name: 'Bored Ape #1234', collection: 'BAYC', value: 45.2, change: 12.5 },
    { name: 'CryptoPunk #5678', collection: 'Punks', value: 78.9, change: -3.2 },
    { name: 'Azuki #9012', collection: 'Azuki', value: 12.3, change: 8.7 }
  ];

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Image className="w-6 h-6 text-pink-400" />
        NFT Portfolio Tracker
      </h3>

      <div className="grid md:grid-cols-3 gap-4">
        {nfts.map((nft, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-xl p-4"
          >
            <div className="w-full h-32 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-lg mb-3 flex items-center justify-center">
              <Image className="w-12 h-12 text-white/40" />
            </div>
            <div className="text-white font-bold text-sm mb-1">{nft.name}</div>
            <div className="text-white/60 text-xs mb-2">{nft.collection}</div>
            <div className="flex items-center justify-between">
              <div className="text-white font-bold">{nft.value} ETH</div>
              <div className={`text-sm ${nft.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {nft.change > 0 ? '+' : ''}{nft.change}%
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}