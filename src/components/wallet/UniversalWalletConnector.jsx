import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Shield, CheckCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function UniversalWalletConnector({ onConnect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [connecting, setConnecting] = useState(false);

  const wallets = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      type: 'browser',
      description: 'Popular browser extension wallet',
      supported: ['Ethereum', 'BSC', 'Polygon'],
      features: ['Hardware wallet support', 'Mobile app', 'NFT support']
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗',
      type: 'mobile',
      description: 'Connect mobile wallets via QR code',
      supported: ['Ethereum', 'BSC', 'Polygon', 'Arbitrum'],
      features: ['100+ wallet support', 'Multi-chain', 'Secure bridge']
    },
    {
      id: 'ledger',
      name: 'Ledger',
      icon: '🔒',
      type: 'hardware',
      description: 'Hardware wallet for maximum security',
      supported: ['Ethereum', 'Bitcoin', 'BSC', 'Polygon'],
      features: ['Cold storage', 'PIN protection', 'Backup phrase']
    },
    {
      id: 'trezor',
      name: 'Trezor',
      icon: '🛡️',
      type: 'hardware',
      description: 'Open-source hardware wallet',
      supported: ['Ethereum', 'Bitcoin', 'BSC'],
      features: ['Open source', 'Touchscreen', 'Shamir backup']
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '💼',
      type: 'browser',
      description: 'Self-custody wallet by Coinbase',
      supported: ['Ethereum', 'BSC', 'Polygon', 'Optimism'],
      features: ['DApp browser', 'NFT gallery', 'Fiat on-ramp']
    },
    {
      id: 'trust',
      name: 'Trust Wallet',
      icon: '🔐',
      type: 'mobile',
      description: 'Mobile wallet with DApp browser',
      supported: ['Ethereum', 'BSC', 'Polygon', '70+ chains'],
      features: ['Staking', 'NFTs', 'DApp browser']
    },
    {
      id: 'phantom',
      name: 'Phantom',
      icon: '👻',
      type: 'browser',
      description: 'Popular Solana wallet',
      supported: ['Solana', 'Ethereum', 'Polygon'],
      features: ['NFT support', 'Swap', 'Multi-chain']
    },
    {
      id: 'rabby',
      name: 'Rabby',
      icon: '🐰',
      type: 'browser',
      description: 'Multi-chain DeFi wallet',
      supported: ['Ethereum', 'BSC', 'Polygon', '40+ chains'],
      features: ['Pre-sign detection', 'Gas optimization', 'DeFi focused']
    }
  ];

  const handleConnect = async (wallet) => {
    setSelectedWallet(wallet);
    setConnecting(true);

    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 2000));

    setConnecting(false);
    setIsOpen(false);
    onConnect?.(wallet);
  };

  const typeColors = {
    browser: 'bg-blue-500/20 text-blue-400',
    mobile: 'bg-purple-500/20 text-purple-400',
    hardware: 'bg-green-500/20 text-green-400'
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
      >
        <Wallet className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl bg-gradient-to-br from-gray-900 to-black border-white/10 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white flex items-center gap-2">
              <Wallet className="w-6 h-6 text-cyan-400" />
              Connect Your Wallet
            </DialogTitle>
            <p className="text-gray-400">
              Choose from a wide selection of hardware and software wallets
            </p>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {wallets.map((wallet) => (
              <motion.div
                key={wallet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="bg-black/40 rounded-lg p-4 border border-white/10 hover:border-cyan-400/50 transition-colors cursor-pointer"
                onClick={() => handleConnect(wallet)}
              >
                <div className="flex items-start gap-3">
                  <div className="text-4xl">{wallet.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white">{wallet.name}</h3>
                      <Badge className={typeColors[wallet.type]}>
                        {wallet.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{wallet.description}</p>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex flex-wrap gap-1">
                        {wallet.supported.slice(0, 3).map((chain) => (
                          <Badge key={chain} variant="outline" className="text-xs border-white/20 text-gray-400">
                            {chain}
                          </Badge>
                        ))}
                        {wallet.supported.length > 3 && (
                          <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                            +{wallet.supported.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      {wallet.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Security Notice */}
          <div className="mt-6 bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-lg p-4 border border-green-500/20">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white mb-1">Secure Connection</h4>
                <p className="text-sm text-gray-400">
                  Your private keys never leave your wallet. Omni uses industry-standard protocols 
                  for secure authentication and transaction signing. We never have access to your funds.
                </p>
                <Button variant="link" className="text-cyan-400 p-0 h-auto mt-2">
                  Learn more about our security
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>

          {/* Connecting Animation */}
          {connecting && selectedWallet && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center rounded-lg"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">{selectedWallet.icon}</div>
                <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <h3 className="text-xl text-white font-semibold mb-2">
                  Connecting to {selectedWallet.name}
                </h3>
                <p className="text-gray-400">
                  Please approve the connection in your wallet
                </p>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}