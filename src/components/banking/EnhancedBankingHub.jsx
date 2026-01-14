import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CreditCard, TrendingUp, Shield, Zap, Eye, EyeOff, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function EnhancedBankingHub() {
  const [showBalance, setShowBalance] = useState(true);
  const [amount, setAmount] = useState('');
  const queryClient = useQueryClient();

  const { data: accounts } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return [
        { 
          id: '1', 
          type: 'checking', 
          balance: 25430.50, 
          accountNumber: '****1234',
          cashback: 2.5,
          transactions: 142
        },
        { 
          id: '2', 
          type: 'savings', 
          balance: 58920.00, 
          accountNumber: '****5678',
          apy: 4.5,
          transactions: 28
        },
        { 
          id: '3', 
          type: 'investment', 
          balance: 124500.75, 
          accountNumber: '****9012',
          return: 12.8,
          transactions: 85
        }
      ];
    }
  });

  const { data: transactions } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: async () => {
      return [
        { id: '1', type: 'credit', amount: 2500, merchant: 'Salary Deposit', date: '2026-01-14', category: 'Income' },
        { id: '2', type: 'debit', amount: 85.50, merchant: 'Amazon', date: '2026-01-13', category: 'Shopping' },
        { id: '3', type: 'debit', amount: 45.00, merchant: 'Starbucks', date: '2026-01-13', category: 'Food' },
        { id: '4', type: 'credit', amount: 125.00, merchant: 'Cashback Reward', date: '2026-01-12', category: 'Rewards' },
        { id: '5', type: 'debit', amount: 1200.00, merchant: 'Rent Payment', date: '2026-01-10', category: 'Bills' }
      ];
    }
  });

  const { data: cards } = useQuery({
    queryKey: ['bank-cards'],
    queryFn: () => base44.entities.OmniCardExtended.list()
  });

  const totalBalance = accounts?.reduce((sum, acc) => sum + acc.balance, 0) || 0;
  const monthlyIncome = transactions?.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0) || 0;
  const monthlyExpenses = transactions?.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="w-8 h-8" />
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => setShowBalance(!showBalance)}
              >
                {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-sm opacity-80 mb-1">Total Balance</p>
            <p className="text-3xl font-bold">
              {showBalance ? `$${totalBalance.toLocaleString()}` : '••••••'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-700/10 border-green-500/30">
          <CardContent className="p-6">
            <ArrowDownLeft className="w-8 h-8 text-green-500 mb-2" />
            <p className="text-sm text-gray-600 mb-1">Monthly Income</p>
            <p className="text-2xl font-bold text-green-600">+${monthlyIncome.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-700/10 border-red-500/30">
          <CardContent className="p-6">
            <ArrowUpRight className="w-8 h-8 text-red-500 mb-2" />
            <p className="text-sm text-gray-600 mb-1">Monthly Expenses</p>
            <p className="text-2xl font-bold text-red-600">-${monthlyExpenses.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-700/10 border-purple-500/30">
          <CardContent className="p-6">
            <Zap className="w-8 h-8 text-purple-500 mb-2" />
            <p className="text-sm text-gray-600 mb-1">Cashback Earned</p>
            <p className="text-2xl font-bold text-purple-600">$125.50</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="accounts">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          {accounts?.map((account) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg capitalize">{account.type} Account</h3>
                        <Badge variant="secondary">{account.accountNumber}</Badge>
                      </div>
                      <p className="text-3xl font-bold mb-2">${account.balance.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{account.transactions} transactions this month</p>
                    </div>
                    <div className="text-right">
                      {account.cashback && (
                        <Badge className="bg-green-500">{account.cashback}% Cashback</Badge>
                      )}
                      {account.apy && (
                        <Badge className="bg-blue-500">{account.apy}% APY</Badge>
                      )}
                      {account.return && (
                        <Badge className="bg-purple-500">+{account.return}% Return</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm">Transfer</Button>
                    <Button size="sm" variant="outline">Details</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions?.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        txn.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {txn.type === 'credit' ? 
                          <ArrowDownLeft className="w-5 h-5 text-green-600" /> : 
                          <ArrowUpRight className="w-5 h-5 text-red-600" />
                        }
                      </div>
                      <div>
                        <p className="font-semibold">{txn.merchant}</p>
                        <p className="text-xs text-gray-500">{txn.date} • {txn.category}</p>
                      </div>
                    </div>
                    <p className={`font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {txn.type === 'credit' ? '+' : '-'}${txn.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards">
          <Card>
            <CardHeader>
              <CardTitle>Your Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cards?.slice(0, 4).map((card) => (
                  <div key={card.id} className="p-6 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                    <div className="flex justify-between items-start mb-8">
                      <CreditCard className="w-8 h-8" />
                      <Badge className="bg-white/20 text-white">{card.type}</Badge>
                    </div>
                    <p className="text-sm opacity-80 mb-1">Balance</p>
                    <p className="text-2xl font-bold mb-4">$5,000</p>
                    <p className="text-sm">**** **** **** 1234</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-500" />
                AI Financial Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <h4 className="font-semibold mb-2">💡 Savings Opportunity</h4>
                <p className="text-sm text-gray-600">Based on your spending, you could save $450/month by optimizing subscriptions and dining expenses.</p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <h4 className="font-semibold mb-2">📈 Investment Suggestion</h4>
                <p className="text-sm text-gray-600">Your savings account has grown. Consider moving $10K to a high-yield investment for 8-12% returns.</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                <h4 className="font-semibold mb-2">🎯 Goal Progress</h4>
                <p className="text-sm text-gray-600">You're 78% towards your $50K emergency fund goal. Keep up the great work!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}