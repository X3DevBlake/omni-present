import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CreditCard, TrendingUp, AlertTriangle, PieChart, Settings, LinkIcon } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import OmniCard3DCustomizer from '../components/banking/OmniCard3DCustomizer';
import FinancialFlow3DVisualizer from '../components/banking/FinancialFlow3DVisualizer';
import BudgetingLandscape3D from '../components/banking/BudgetingLandscape3D';

export default function EnhancedBankingHub() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <AuroraBackground className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Banking Hub
            </span>
          </h1>
          <p className="text-white/60 text-lg">Comprehensive financial management with AI-powered insights</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Balance', value: '$170,450', icon: CreditCard, color: 'from-cyan-500 to-blue-500' },
            { label: 'Monthly Spending', value: '$3,240', icon: PieChart, color: 'from-purple-500 to-pink-500' },
            { label: 'Savings Rate', value: '42%', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
            { label: 'Security Status', value: 'Excellent', icon: AlertTriangle, color: 'from-yellow-500 to-orange-500' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                <Card className={`bg-gradient-to-br ${stat.color} bg-opacity-20 border-white/10 p-4`}>
                  <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-white/80" />
                    <div>
                      <p className="text-white/60 text-xs">{stat.label}</p>
                      <p className="text-white font-bold text-lg">{stat.value}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-black/40 border border-white/10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="card">Card Customizer</TabsTrigger>
            <TabsTrigger value="flow">Money Flow</TabsTrigger>
            <TabsTrigger value="budget">Budgeting</TabsTrigger>
            <TabsTrigger value="accounts">Linked Accounts</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-black/40 border-white/10 p-6">
                <CardTitle className="text-white mb-4">Account Balances</CardTitle>
                <div className="space-y-3">
                  {[
                    { name: 'Checking', balance: '$8,450', trend: '+2.5%' },
                    { name: 'Savings', balance: '$45,000', trend: '+5.1%' },
                    { name: 'Investments', balance: '$80,000', trend: '+12.3%' },
                    { name: 'Crypto Wallet', balance: '$37,000', trend: '-3.2%' },
                  ].map((acc, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-white">{acc.name}</span>
                      <div className="text-right">
                        <div className="text-white font-bold">{acc.balance}</div>
                        <div className={acc.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'} style={{fontSize: '12px'}}>
                          {acc.trend}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-black/40 border-white/10 p-6">
                <CardTitle className="text-white mb-4">Recent Transactions</CardTitle>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {[
                    { merchant: 'Whole Foods', amount: '-$125.43', date: 'Today' },
                    { merchant: 'Netflix', amount: '-$15.99', date: 'Yesterday' },
                    { merchant: 'Salary Deposit', amount: '+$4,500', date: '2 days ago' },
                    { merchant: 'Gas Station', amount: '-$55.00', date: '3 days ago' },
                  ].map((tx, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-semibold">{tx.merchant}</p>
                        <p className="text-white/40 text-xs">{tx.date}</p>
                      </div>
                      <span className={tx.amount.startsWith('-') ? 'text-red-400' : 'text-green-400'} style={{fontSize: '14px'}}>
                        {tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Card Customizer Tab */}
          <TabsContent value="card">
            <OmniCard3DCustomizer />
          </TabsContent>

          {/* Money Flow Tab */}
          <TabsContent value="flow">
            <Card className="bg-black/40 border-white/10">
              <CardContent className="p-0">
                <div className="h-[500px]">
                  <FinancialFlow3DVisualizer />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budgeting Tab */}
          <TabsContent value="budget">
            <Card className="bg-black/40 border-white/10 mb-6">
              <CardContent className="p-0">
                <div className="h-[500px]">
                  <BudgetingLandscape3D />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-black/40 border-white/10 p-6">
              <CardTitle className="text-white mb-4">Budget Insights</CardTitle>
              <div className="space-y-3">
                <p className="text-white/60 text-sm">📌 Your food spending is 10% above budget. Consider meal prep to save.</p>
                <p className="text-white/60 text-sm">✓ Great job on utilities! 15% below budget this month.</p>
                <p className="text-white/60 text-sm">⚠️ Entertainment spending trending upward. Set weekly limits?</p>
              </div>
            </Card>
          </TabsContent>

          {/* Linked Accounts Tab */}
          <TabsContent value="accounts">
            <Card className="bg-black/40 border-white/10 p-6">
              <CardTitle className="text-white mb-4 flex items-center gap-2">
                <LinkIcon className="w-5 h-5" /> Link Bank Accounts
              </CardTitle>
              <p className="text-white/60 mb-6">Connect your bank accounts to sync transactions and get AI-powered insights.</p>
              <Button className="bg-green-600 hover:bg-green-700 w-full" size="lg">
                Connect with Plaid
              </Button>
              <div className="mt-6 p-4 bg-white/5 rounded-lg">
                <p className="text-white/60 text-sm">
                  🔒 Your financial data is encrypted and secure. Plaid uses bank-level security.
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}