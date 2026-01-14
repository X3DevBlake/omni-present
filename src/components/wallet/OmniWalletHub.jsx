import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Wallet, Send, ArrowLeftRight, Image, Shield, History, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function OmniWalletHub() {
  const [sendAmount, setSendAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const queryClient = useQueryClient();

  const { data: balance } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: async () => ({
      omni: 10000,
      somni: 5000,
      eth: 2.5,
      btc: 0.15,
      usdt: 15000
    })
  });

  const { data: transactions } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: () => base44.entities.WalletTransaction.list('-timestamp', 50)
  });

  const { data: nfts } = useQuery({
    queryKey: ['wallet-nfts'],
    queryFn: () => base44.entities.NFTAsset.list()
  });

  const sendTransaction = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.WalletTransaction.create({
        from_address: '0x1234...5678',
        to_address: data.to,
        amount: data.amount,
        token: data.token,
        network: data.network || 'ethereum',
        type: 'send',
        gas_fee: 0.002,
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      toast.success('Transaction sent successfully');
      setSendAmount('');
      setRecipientAddress('');
    }
  });

  const swapTokens = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.WalletTransaction.create({
        from_address: '0x1234...5678',
        to_address: '0xSwapContract',
        amount: data.amount,
        token: `${data.fromToken}/${data.toToken}`,
        network: 'ethereum',
        type: 'swap',
        gas_fee: 0.001,
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      toast.success('Swap completed');
    }
  });

  const totalValue = (balance?.omni || 0) * 2 + 
                    (balance?.somni || 0) * 2 + 
                    (balance?.eth || 0) * 2890 + 
                    (balance?.btc || 0) * 45230 +
                    (balance?.usdt || 0);

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <Card className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Wallet className="w-10 h-10" />
            <Badge className="bg-white/20 text-white">Multi-Chain</Badge>
          </div>
          <p className="text-sm opacity-80 mb-1">Total Portfolio Value</p>
          <p className="text-4xl font-bold mb-4">${totalValue.toLocaleString()}</p>
          <div className="grid grid-cols-5 gap-2 text-sm">
            <div>
              <p className="opacity-70">OMNI</p>
              <p className="font-semibold">{balance?.omni}</p>
            </div>
            <div>
              <p className="opacity-70">sOMNI</p>
              <p className="font-semibold">{balance?.somni}</p>
            </div>
            <div>
              <p className="opacity-70">ETH</p>
              <p className="font-semibold">{balance?.eth}</p>
            </div>
            <div>
              <p className="opacity-70">BTC</p>
              <p className="font-semibold">{balance?.btc}</p>
            </div>
            <div>
              <p className="opacity-70">USDT</p>
              <p className="font-semibold">{balance?.usdt}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="send">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="send">Send</TabsTrigger>
          <TabsTrigger value="swap">Swap</TabsTrigger>
          <TabsTrigger value="nfts">NFTs</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-6 h-6" />
                Send Tokens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="Recipient address (0x...)"
              />
              <Input
                type="number"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                placeholder="Amount"
              />
              <div className="grid grid-cols-3 gap-2">
                <Button onClick={() => sendTransaction.mutate({ 
                  to: recipientAddress, 
                  amount: parseFloat(sendAmount), 
                  token: 'OMNI' 
                })}>
                  Send OMNI
                </Button>
                <Button variant="outline" onClick={() => sendTransaction.mutate({ 
                  to: recipientAddress, 
                  amount: parseFloat(sendAmount), 
                  token: 'ETH' 
                })}>
                  Send ETH
                </Button>
                <Button variant="outline" onClick={() => sendTransaction.mutate({ 
                  to: recipientAddress, 
                  amount: parseFloat(sendAmount), 
                  token: 'USDT' 
                })}>
                  Send USDT
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="swap">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeftRight className="w-6 h-6" />
                Token Swap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SwapInterface onSwap={(data) => swapTokens.mutate(data)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nfts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-6 h-6" />
                Your NFTs ({nfts?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {nfts?.slice(0, 6).map((nft) => (
                  <div key={nft.id} className="rounded-lg border overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50">
                    <div className="aspect-square bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center">
                      <Image className="w-12 h-12 text-gray-400" />
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-sm">{nft.name}</p>
                      <p className="text-xs text-gray-500">{nft.collection}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-6 h-6" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {transactions?.map((txn) => (
                  <div key={txn.id} className="p-3 rounded-lg border bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="secondary" className="mb-1">{txn.type}</Badge>
                        <p className="text-sm font-mono text-gray-600">
                          {txn.transaction_hash?.slice(0, 16)}...
                        </p>
                        <p className="text-xs text-gray-500">{txn.network}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{txn.amount} {txn.token}</p>
                        <Badge variant={txn.status === 'confirmed' ? 'default' : 'secondary'}>
                          {txn.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-500" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <h4 className="font-semibold mb-2">Hardware Wallet Integration</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Connect Ledger or Trezor for enhanced security
                </p>
                <Button>Connect Hardware Wallet</Button>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <h4 className="font-semibold mb-2">2FA Authentication</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Require 2FA for all transactions
                </p>
                <Button variant="outline">Enable 2FA</Button>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                <h4 className="font-semibold mb-2">Recovery Phrase</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Backup your wallet recovery phrase securely
                </p>
                <Button variant="outline">View Recovery Phrase</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SwapInterface({ onSwap }) {
  const [fromToken, setFromToken] = useState('OMNI');
  const [toToken, setToToken] = useState('sOMNI');
  const [amount, setAmount] = useState('');

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border">
        <p className="text-sm text-gray-600 mb-2">From</p>
        <div className="flex gap-2">
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="flex-1"
          />
          <Badge className="px-4 py-2">{fromToken}</Badge>
        </div>
      </div>

      <div className="flex justify-center">
        <ArrowLeftRight className="w-6 h-6 text-gray-400" />
      </div>

      <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border">
        <p className="text-sm text-gray-600 mb-2">To</p>
        <div className="flex gap-2">
          <Input
            type="number"
            value={parseFloat(amount) * 0.98}
            readOnly
            placeholder="0.0"
            className="flex-1"
          />
          <Badge className="px-4 py-2">{toToken}</Badge>
        </div>
      </div>

      <Button 
        onClick={() => onSwap({ fromToken, toToken, amount: parseFloat(amount) })}
        className="w-full"
      >
        <Zap className="w-4 h-4 mr-2" />
        Swap Tokens
      </Button>
    </div>
  );
}