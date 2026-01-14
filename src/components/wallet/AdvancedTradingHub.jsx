import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, ShoppingCart, ArrowLeftRight, Zap, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const POPULAR_TOKENS = [
  { symbol: 'OMNI', price: 2.5, change: 5.2 },
  { symbol: 'ETH', price: 2890, change: 3.1 },
  { symbol: 'BTC', price: 45230, change: 2.8 },
  { symbol: 'SOL', price: 98.4, change: 8.5 }
];

export default function AdvancedTradingHub() {
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');

  const handleBuy = (token) => {
    toast.success(`Bought ${buyAmount} ${token}`);
    setBuyAmount('');
  };

  const handleSwap = (from, to) => {
    toast.success(`Swapped ${from} to ${to}`);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="buy">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="buy">Buy Crypto</TabsTrigger>
          <TabsTrigger value="trade">Trade</TabsTrigger>
          <TabsTrigger value="swap">Instant Swap</TabsTrigger>
        </TabsList>

        <TabsContent value="buy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-green-500" />
                Buy Cryptocurrency
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <p className="text-sm mb-3">Buy crypto with credit card, debit card, or bank transfer</p>
                <Input
                  type="number"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  placeholder="Amount in USD"
                  className="mb-3"
                />
                <div className="grid grid-cols-2 gap-2">
                  {POPULAR_TOKENS.map((token) => (
                    <Button key={token.symbol} onClick={() => handleBuy(token.symbol)}>
                      Buy {token.symbol}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Payment Methods</h4>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm">💳 Card</Button>
                  <Button variant="outline" size="sm">🏦 Bank</Button>
                  <Button variant="outline" size="sm">📱 Apple Pay</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trade">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-500" />
                Advanced Trading
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Limit Order</h4>
                  <Input placeholder="Price" />
                  <Input placeholder="Amount" />
                  <Button className="w-full bg-green-600">Buy Limit</Button>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Stop Loss</h4>
                  <Input placeholder="Stop Price" />
                  <Input placeholder="Amount" />
                  <Button className="w-full bg-red-600">Sell Stop</Button>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
                <h4 className="font-semibold mb-2">Market Depth</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-green-600">Buy: $2.45</span><span>1,250</span></div>
                  <div className="flex justify-between"><span className="text-green-600">Buy: $2.44</span><span>2,100</span></div>
                  <div className="flex justify-between"><span className="text-red-600">Sell: $2.52</span><span>980</span></div>
                  <div className="flex justify-between"><span className="text-red-600">Sell: $2.53</span><span>1,540</span></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="swap">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-purple-500" />
                Instant Swap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <p className="text-sm text-gray-600 mb-2">From</p>
                  <div className="flex gap-2">
                    <Input placeholder="0.0" className="flex-1" />
                    <Badge className="px-4 py-2">OMNI</Badge>
                  </div>
                </div>

                <div className="flex justify-center">
                  <ArrowLeftRight className="w-6 h-6 text-gray-400" />
                </div>

                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <p className="text-sm text-gray-600 mb-2">To</p>
                  <div className="flex gap-2">
                    <Input placeholder="0.0" className="flex-1" />
                    <Badge className="px-4 py-2">ETH</Badge>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <div className="flex justify-between mb-1">
                    <span>Exchange Rate:</span>
                    <span className="font-semibold">1 OMNI = 0.00086 ETH</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Fee:</span>
                    <span className="font-semibold">0.3%</span>
                  </div>
                </div>

                <Button onClick={() => handleSwap('OMNI', 'ETH')} className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  Swap Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}