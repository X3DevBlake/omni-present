import React from 'react';
import OmniWalletHub from '../components/wallet/OmniWalletHub';
import { Wallet, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function OmniWallet() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Wallet className="w-10 h-10 text-indigo-500" />
            Omni Wallet
          </h1>
          <p className="text-gray-600">
            Multi-chain wallet with cross-chain transactions, token swaps, and NFT management
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-500/10 to-green-700/10 border-green-500/30">
            <CardContent className="p-4">
              <Shield className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-sm text-gray-600">Secure & Encrypted</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-700/10 border-blue-500/30">
            <CardContent className="p-4">
              <Wallet className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-sm text-gray-600">Multi-Chain Support</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-700/10 border-purple-500/30">
            <CardContent className="p-4">
              <Shield className="w-8 h-8 text-purple-500 mb-2" />
              <p className="text-sm text-gray-600">Hardware Integration</p>
            </CardContent>
          </Card>
        </div>

        <OmniWalletHub />
      </div>
    </div>
  );
}