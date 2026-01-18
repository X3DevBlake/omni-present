import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';

const OMNI_TOKEN_CONFIG = {
  name: 'Omni Token',
  symbol: 'OMNI',
  contractAddress: '0x7f39C582F8A0a84FADaC9514722Dn48f7a456789',
  network: 'Ethereum Mainnet',
  chainId: 1,
  decimals: 18,
  totalSupply: '1,000,000,000',
  circulatingSupply: '450,000,000',
  tokenStandard: 'ERC-20',
  launchDate: '2026-01-15',
  status: 'Active',
};

const TOKENOMICS = [
  { category: 'Initial Allocation', percentage: 25, amount: '250,000,000' },
  { category: 'Development Fund', percentage: 20, amount: '200,000,000' },
  { category: 'Marketing & Community', percentage: 15, amount: '150,000,000' },
  { category: 'Liquidity Pool', percentage: 20, amount: '200,000,000' },
  { category: 'Staking Rewards', percentage: 15, amount: '150,000,000' },
  { category: 'Reserve', percentage: 5, amount: '50,000,000' },
];

const BLOCKCHAIN_EXPLORERS = [
  { name: 'Etherscan', url: 'https://etherscan.io/token/' },
  { name: 'Blockchain.com', url: 'https://www.blockchain.com/eth/token/' },
];

export default function OmniTokenContractInfo() {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(OMNI_TOKEN_CONFIG.contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Contract Header */}
      <Card className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-cyan-500/30 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-white font-bold text-3xl">{OMNI_TOKEN_CONFIG.name}</h2>
            <p className="text-white/60 text-lg mt-1">{OMNI_TOKEN_CONFIG.symbol}</p>
          </div>
          <Badge className="bg-green-500/30 text-green-300 text-lg px-4 py-2">{OMNI_TOKEN_CONFIG.status}</Badge>
        </div>

        {/* Contract Address */}
        <div className="bg-black/40 rounded-lg p-4 border border-white/10">
          <p className="text-white/60 text-xs mb-2">Contract Address</p>
          <div className="flex items-center gap-2">
            <code className="text-cyan-400 font-mono text-sm flex-1 break-all">{OMNI_TOKEN_CONFIG.contractAddress}</code>
            <Button onClick={handleCopyAddress} size="sm" variant="outline" className="text-xs flex-shrink-0">
              <Copy className="w-3 h-3" /> {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Key Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[
            { label: 'Network', value: OMNI_TOKEN_CONFIG.network },
            { label: 'Standard', value: OMNI_TOKEN_CONFIG.tokenStandard },
            { label: 'Decimals', value: OMNI_TOKEN_CONFIG.decimals },
            { label: 'Launched', value: OMNI_TOKEN_CONFIG.launchDate },
          ].map((item, idx) => (
            <div key={idx} className="bg-black/40 rounded p-2">
              <p className="text-white/60 text-xs">{item.label}</p>
              <p className="text-white font-semibold text-sm">{item.value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Supply Information */}
      <Card className="bg-black/40 border-white/10 p-6">
        <h3 className="text-white font-bold mb-4">Token Supply</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-white text-sm">Total Supply</p>
              <p className="text-white font-bold">{OMNI_TOKEN_CONFIG.totalSupply}</p>
            </div>
            <div className="bg-white/10 rounded-full h-2">
              <div className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-white text-sm">Circulating Supply</p>
              <p className="text-white font-bold">{OMNI_TOKEN_CONFIG.circulatingSupply}</p>
            </div>
            <div className="bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                style={{ width: `${(450 / 1000) * 100}%` }}
              />
            </div>
            <p className="text-white/60 text-xs mt-1">45% circulation rate</p>
          </div>
        </div>
      </Card>

      {/* Tokenomics */}
      <Card className="bg-black/40 border-white/10 p-6">
        <h3 className="text-white font-bold mb-4">Tokenomics Breakdown</h3>
        <div className="space-y-2">
          {TOKENOMICS.map((token, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-3 bg-white/5 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-semibold text-sm">{token.category}</p>
                <p className="text-white font-bold">{token.percentage}%</p>
              </div>
              <div className="bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
                  style={{ width: `${token.percentage}%` }}
                />
              </div>
              <p className="text-white/60 text-xs mt-1">{token.amount} OMNI</p>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Blockchain Explorers */}
      <Card className="bg-black/40 border-white/10 p-6">
        <h3 className="text-white font-bold mb-4">View on Blockchain Explorers</h3>
        <div className="space-y-2">
          {BLOCKCHAIN_EXPLORERS.map((explorer) => (
            <a
              key={explorer.name}
              href={`${explorer.url}${OMNI_TOKEN_CONFIG.contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white/5 rounded-lg flex items-center justify-between hover:bg-white/10 transition-all"
            >
              <span className="text-white font-semibold text-sm">{explorer.name}</span>
              <ExternalLink className="w-4 h-4 text-cyan-400" />
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}