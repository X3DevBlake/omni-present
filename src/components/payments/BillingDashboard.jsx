import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Users, CreditCard, Download, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function BillingDashboard() {
  // Fetch real subscription data
  const { data: subscriptions = [], refetch } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => base44.entities.Subscription.list(),
    initialData: []
  });

  // Fetch real purchase data
  const { data: purchases = [] } = useQuery({
    queryKey: ['purchases'],
    queryFn: () => base44.entities.Purchase.list(),
    initialData: []
  });

  // Calculate real metrics
  const calculateMetrics = () => {
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    const mrr = activeSubscriptions
      .filter(s => s.billing_cycle === 'monthly')
      .reduce((sum, s) => sum + s.amount, 0);
    const arr = activeSubscriptions
      .filter(s => s.billing_cycle === 'yearly')
      .reduce((sum, s) => sum + s.amount, 0) + (mrr * 12);
    
    const totalPurchases = purchases
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.total_amount, 0);
    
    return {
      mrr: mrr.toFixed(2),
      arr: arr.toFixed(2),
      activeSubscribers: activeSubscriptions.length,
      totalRevenue: (mrr + totalPurchases).toFixed(2)
    };
  };

  const metrics = calculateMetrics();
  const [metrics, setMetrics] = useState({
    mrr: 45800,
    arr: 549600,
    activeSubscriptions: 127,
    churnRate: 2.3,
    ltv: 12450
  });

  const [revenueData, setRevenueData] = useState([
    { month: 'Jul', subscriptions: 38000, visualizers: 4200, enterprise: 12000 },
    { month: 'Aug', subscriptions: 40500, visualizers: 5100, enterprise: 14500 },
    { month: 'Sep', subscriptions: 42200, visualizers: 5800, enterprise: 15200 },
    { month: 'Oct', subscriptions: 44100, visualizers: 6300, enterprise: 16800 },
    { month: 'Nov', subscriptions: 45200, visualizers: 7100, enterprise: 18200 },
    { month: 'Dec', subscriptions: 45800, visualizers: 7800, enterprise: 19500 }
  ]);

  const [subscriptionBreakdown, setSubscriptionBreakdown] = useState([
    { name: 'Free', value: 450, color: '#6b7280' },
    { name: 'Pro', value: 127, color: '#06b6d4' },
    { name: 'Enterprise', value: 23, color: '#a855f7' }
  ]);

  const [recentTransactions, setRecentTransactions] = useState([
    { id: 1, customer: 'Acme Corp', type: 'Enterprise', amount: 1499, date: '2026-01-10', status: 'paid' },
    { id: 2, customer: 'John Doe', type: 'Visualizer Pack', amount: 29.99, date: '2026-01-10', status: 'paid' },
    { id: 3, customer: 'TechStart Inc', type: 'Pro', amount: 29, date: '2026-01-09', status: 'paid' },
    { id: 4, customer: 'Jane Smith', type: 'DeFi Advanced Pack', amount: 24.99, date: '2026-01-09', status: 'paid' },
    { id: 5, customer: 'Innovation Labs', type: 'Business Plan', amount: 1499, date: '2026-01-08', status: 'pending' }
  ]);

  const statusColors = {
    paid: 'bg-green-500/20 text-green-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
    failed: 'bg-red-500/20 text-red-400'
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-cyan-400" />
              <Badge className="bg-green-500/20 text-green-400">
                +12.3%
              </Badge>
            </div>
            <p className="text-sm text-gray-400">MRR</p>
            <p className="text-2xl font-bold text-white">${metrics.mrr.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <Badge className="bg-green-500/20 text-green-400">
                +18.5%
              </Badge>
            </div>
            <p className="text-sm text-gray-400">ARR</p>
            <p className="text-2xl font-bold text-white">${(metrics.arr / 1000).toFixed(0)}K</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400">
                +8
              </Badge>
            </div>
            <p className="text-sm text-gray-400">Active Subscriptions</p>
            <p className="text-2xl font-bold text-white">{metrics.activeSubscriptions}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-8 h-8 text-orange-400" />
              <Badge className="bg-green-500/20 text-green-400">
                -0.5%
              </Badge>
            </div>
            <p className="text-sm text-gray-400">Churn Rate</p>
            <p className="text-2xl font-bold text-white">{metrics.churnRate}%</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-900/20 to-blue-900/20 border-indigo-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="w-8 h-8 text-indigo-400" />
              <Badge className="bg-green-500/20 text-green-400">
                +23%
              </Badge>
            </div>
            <p className="text-sm text-gray-400">Avg LTV</p>
            <p className="text-2xl font-bold text-white">${(metrics.ltv / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="bg-black/40 border border-white/10">
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="breakdown">Subscription Breakdown</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-6">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Revenue by Source (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="subscriptions" stackId="a" fill="#06b6d4" name="Subscriptions" />
                  <Bar dataKey="visualizers" stackId="a" fill="#a855f7" name="Visualizer Packs" />
                  <Bar dataKey="enterprise" stackId="a" fill="#f59e0b" name="Enterprise Plans" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Subscription Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={subscriptionBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {subscriptionBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Subscription Revenue</span>
                      <span className="text-sm font-semibold text-cyan-400">$45,800 (63%)</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '63%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Visualizer Packs</span>
                      <span className="text-sm font-semibold text-purple-400">$7,800 (11%)</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '11%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Enterprise Plans</span>
                      <span className="text-sm font-semibold text-orange-400">$19,500 (26%)</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '26%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <Card className="bg-black/40 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Recent Transactions</CardTitle>
              <Button variant="outline" size="sm" className="border-white/20">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/5 hover:border-cyan-400/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{tx.customer}</p>
                        <p className="text-sm text-gray-400">{tx.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-white">${tx.amount}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {tx.date}
                        </p>
                      </div>
                      <Badge className={statusColors[tx.status]}>
                        {tx.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}