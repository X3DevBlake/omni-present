import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, TrendingDown, Droplet, Wallet, ArrowUpDown, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const TOP_TOKENS = [
  { symbol: 'BTC', name: 'Bitcoin', price: 45230.50, change: 3.2, icon: '₿' },
  { symbol: 'ETH', name: 'Ethereum', price: 2890.75, change: 5.1, icon: 'Ξ' },
  { symbol: 'USDT', name: 'Tether', price: 1.00, change: 0.01, icon: '₮' },
  { symbol: 'BNB', name: 'BNB', price: 310.25, change: 2.8, icon: '💎' },
  { symbol: 'SOL', name: 'Solana', price: 98.40, change: 8.5, icon: '◎' },
  { symbol: 'XRP', name: 'Ripple', price: 0.52, change: -1.2, icon: '✕' },
  { symbol: 'USDC', name: 'USD Coin', price: 1.00, change: 0.0, icon: '💵' },
  { symbol: 'ADA', name: 'Cardano', price: 0.48, change: 4.3, icon: '₳' },
  { symbol: 'DOGE', name: 'Dogecoin', price: 0.082, change: 6.7, icon: 'Ð' },
  { symbol: 'AVAX', name: 'Avalanche', price: 36.20, change: 3.9, icon: '🔺' },
  { symbol: 'DOT', name: 'Polkadot', price: 7.15, change: 2.1, icon: '●' },
  { symbol: 'MATIC', name: 'Polygon', price: 0.89, change: 5.4, icon: '⬡' },
  { symbol: 'LINK', name: 'Chainlink', price: 14.80, change: 1.8, icon: '⛓' },
  { symbol: 'UNI', name: 'Uniswap', price: 6.25, change: 4.2, icon: '🦄' },
  { symbol: 'ATOM', name: 'Cosmos', price: 10.35, change: 3.5, icon: '⚛' },
  { symbol: 'LTC', name: 'Litecoin', price: 68.90, change: 2.3, icon: 'Ł' },
  { symbol: 'APT', name: 'Aptos', price: 8.75, change: 7.2, icon: '🅰' },
  { symbol: 'ARB', name: 'Arbitrum', price: 1.25, change: 6.1, icon: '🔷' },
  { symbol: 'OP', name: 'Optimism', price: 2.10, change: 4.8, icon: '🔴' },
  { symbol: 'NEAR', name: 'NEAR Protocol', price: 3.42, change: 5.6, icon: '◊' },
  { symbol: 'FTM', name: 'Fantom', price: 0.38, change: 3.1, icon: '👻' },
  { symbol: 'ALGO', name: 'Algorand', price: 0.22, change: 2.9, icon: '◎' },
  { symbol: 'VET', name: 'VeChain', price: 0.025, change: 1.7, icon: 'V' },
  { symbol: 'SAND', name: 'The Sandbox', price: 0.52, change: 8.3, icon: '🏖' },
  { symbol: 'MANA', name: 'Decentraland', price: 0.45, change: 7.1, icon: 'M' },
  { symbol: 'AXS', name: 'Axie Infinity', price: 7.85, change: 4.5, icon: '🎮' },
  { symbol: 'THETA', name: 'Theta Network', price: 1.05, change: 3.8, icon: 'θ' },
  { symbol: 'FIL', name: 'Filecoin', price: 5.32, change: 2.4, icon: '📁' },
  { symbol: 'ICP', name: 'Internet Computer', price: 4.85, change: 6.2, icon: '∞' },
  { symbol: 'CRV', name: 'Curve DAO', price: 0.95, change: 3.6, icon: '〰' }
];

export default function EnhancedDeFiHub() {
  const [selectedToken, setSelectedToken] = useState(null);
  const [amount, setAmount] = useState('');
  const queryClient = useQueryClient();

  const { data: wallet } = useQuery({
    queryKey: ['omni-wallet'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return {
        omni_balance: 10000,
        somni_balance: 5000,
        total_staked: 3000
      };
    }
  });

  const { data: stakes } = useQuery({
    queryKey: ['omni-stakes'],
    queryFn: () => base44.entities.OmniStake.list()
  });

  const stakeOmni = useMutation({
    mutationFn: async (data) => {
      const somniAmount = data.amount * 1.0; // 1:1 ratio
      return await base44.entities.OmniStake.create({
        amount_omni: data.amount,
        amount_somni: somniAmount,
        apy: data.lockPeriod === 0 ? 5 : data.lockPeriod === 30 ? 8 : 12,
        lock_period_days: data.lockPeriod,
        unlock_date: data.lockPeriod > 0 
          ? new Date(Date.now() + data.lockPeriod * 24 * 60 * 60 * 1000).toISOString()
          : null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omni-stakes'] });
      toast.success('OMNI staked successfully! sOMNI received.');
      setAmount('');
    }
  });

  return (
    <div className="space-y-6">
      {/* Wallet Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-700/10 border-purple-500/30">
          <CardContent className="p-4">
            <Wallet className="w-8 h-8 text-purple-500 mb-2" />
            <p className="text-2xl font-bold">{wallet?.omni_balance?.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-600">OMNI Balance</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-700/10 border-blue-500/30">
          <CardContent className="p-4">
            <Coins className="w-8 h-8 text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{wallet?.somni_balance?.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-600">sOMNI Staked</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-700/10 border-green-500/30">
          <CardContent className="p-4">
            <TrendingUp className="w-8 h-8 text-green-500 mb-2" />
            <p className="text-2xl font-bold">{wallet?.total_staked?.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-600">Total Staked</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-700/10 border-orange-500/30">
          <CardContent className="p-4">
            <Droplet className="w-8 h-8 text-orange-500 mb-2" />
            <p className="text-2xl font-bold">8</p>
            <p className="text-sm text-gray-600">Active Pools</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tokens">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="stake">Stake OMNI</TabsTrigger>
          <TabsTrigger value="pools">Liquidity Pools</TabsTrigger>
          <TabsTrigger value="farms">Yield Farms</TabsTrigger>
        </TabsList>

        <TabsContent value="tokens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 30 Crypto Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {TOP_TOKENS.map((token) => (
                  <motion.div
                    key={token.symbol}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-lg border bg-gradient-to-br from-gray-50 to-white hover:shadow-md cursor-pointer"
                    onClick={() => setSelectedToken(token)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{token.icon}</span>
                        <div>
                          <p className="font-semibold">{token.symbol}</p>
                          <p className="text-xs text-gray-500">{token.name}</p>
                        </div>
                      </div>
                      <Badge variant={token.change >= 0 ? 'default' : 'destructive'} className="flex items-center gap-1">
                        {token.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(token.change)}%
                      </Badge>
                    </div>
                    <p className="text-xl font-bold">${token.price.toLocaleString()}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stake">
          <Card>
            <CardHeader>
              <CardTitle>Stake OMNI for sOMNI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm mb-2">Stake OMNI to receive sOMNI and earn rewards</p>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-gray-600">Flexible</p>
                    <p className="font-bold text-lg text-blue-600">5% APY</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">30-Day Lock</p>
                    <p className="font-bold text-lg text-green-600">8% APY</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">90-Day Lock</p>
                    <p className="font-bold text-lg text-purple-600">12% APY</p>
                  </div>
                </div>
              </div>

              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount to stake"
              />

              <div className="grid grid-cols-3 gap-2">
                <Button onClick={() => stakeOmni.mutate({ amount: parseFloat(amount), lockPeriod: 0 })}>
                  Flexible (5%)
                </Button>
                <Button onClick={() => stakeOmni.mutate({ amount: parseFloat(amount), lockPeriod: 30 })}>
                  30 Days (8%)
                </Button>
                <Button onClick={() => stakeOmni.mutate({ amount: parseFloat(amount), lockPeriod: 90 })}>
                  90 Days (12%)
                </Button>
              </div>

              {/* Active Stakes */}
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Your Stakes</h3>
                <div className="space-y-2">
                  {stakes?.map((stake) => (
                    <div key={stake.id} className="p-3 rounded border bg-gradient-to-r from-purple-50 to-blue-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{stake.amount_omni} OMNI → {stake.amount_somni} sOMNI</p>
                          <p className="text-sm text-gray-600">{stake.apy}% APY • Earned: {stake.rewards_earned}</p>
                        </div>
                        <Badge>{stake.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pools">
          <LiquidityPools />
        </TabsContent>

        <TabsContent value="farms">
          <YieldFarms />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LiquidityPools() {
  const pools = [
    { pair: 'OMNI/USDT', tvl: '$2.5M', apy: 45, volume24h: '$850K' },
    { pair: 'ETH/USDT', tvl: '$5.2M', apy: 32, volume24h: '$1.2M' },
    { pair: 'BTC/USDT', tvl: '$8.1M', apy: 28, volume24h: '$2.5M' },
    { pair: 'SOL/USDT', tvl: '$1.8M', apy: 55, volume24h: '$600K' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplet className="w-6 h-6" />
          Liquidity Pools
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pools.map((pool) => (
            <div key={pool.pair} className="p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-green-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{pool.pair}</h3>
                  <p className="text-sm text-gray-600">TVL: {pool.tvl} • Volume: {pool.volume24h}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{pool.apy}%</p>
                  <p className="text-xs text-gray-600">APY</p>
                </div>
              </div>
              <Button className="w-full mt-3">Add Liquidity</Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function YieldFarms() {
  const farms = [
    { name: 'OMNI Farm', apy: 85, tvl: '$1.2M', rewards: 'OMNI' },
    { name: 'ETH Farm', apy: 62, tvl: '$3.5M', rewards: 'OMNI + ETH' },
    { name: 'BTC Farm', apy: 48, tvl: '$6.1M', rewards: 'OMNI + BTC' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Yield Farms
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {farms.map((farm) => (
            <div key={farm.name} className="p-4 rounded-lg border bg-gradient-to-r from-yellow-50 to-orange-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{farm.name}</h3>
                  <p className="text-sm text-gray-600">TVL: {farm.tvl}</p>
                  <Badge variant="secondary" className="mt-1">{farm.rewards}</Badge>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">{farm.apy}%</p>
                  <p className="text-xs text-gray-600">APY</p>
                </div>
              </div>
              <Button className="w-full mt-3">Start Farming</Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}