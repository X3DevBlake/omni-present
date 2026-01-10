import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Users, CreditCard, Download, Calendar, AlertCircle, Brain, Target, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function BillingDashboard() {
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

  // AI-powered churn prediction
  const [churnPrediction, setChurnPrediction] = useState({
    riskScore: 23,
    atRiskCustomers: 12,
    topReasons: ['Payment failures', 'Low engagement', 'Feature complaints']
  });

  // Customer Lifetime Value
  const [clvData, setClvData] = useState([
    { cohort: 'Jan 2025', clv: 8200, projected: 12450 },
    { cohort: 'Feb 2025', clv: 7800, projected: 11900 },
    { cohort: 'Mar 2025', clv: 8500, projected: 12800 },
    { cohort: 'Apr 2025', clv: 9100, projected: 13200 }
  ]);

  // Cohort retention analysis
  const [cohortData, setCohortData] = useState([
    { month: 'M0', 'Jan-25': 100, 'Feb-25': 100, 'Mar-25': 100, 'Apr-25': 100 },
    { month: 'M1', 'Jan-25': 92, 'Feb-25': 94, 'Mar-25': 96, 'Apr-25': 95 },
    { month: 'M2', 'Jan-25': 85, 'Feb-25': 88, 'Mar-25': 91, 'Apr-25': null },
    { month: 'M3', 'Jan-25': 78, 'Feb-25': 82, 'Mar-25': null, 'Apr-25': null },
    { month: 'M4', 'Jan-25': 73, 'Feb-25': null, 'Mar-25': null, 'Apr-25': null }
  ]);

  // Revenue attribution
  const [revenueAttribution, setRevenueAttribution] = useState([
    { feature: 'AI Portfolio Manager', revenue: 18400, growth: 15 },
    { feature: '3D Visualizations', revenue: 12800, growth: 22 },
    { feature: 'DeFi Optimizer', revenue: 9600, growth: 31 },
    { feature: 'Multi-Agent System', revenue: 7200, growth: 18 }
  ]);

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const generateAIInsights = async () => {
    toast.info('Generating AI insights...');
    try {
      const insights = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the following billing metrics and provide actionable insights:
        - MRR: $${metrics.mrr}
        - Churn Rate: ${metrics.churnRate}%
        - Active Subscriptions: ${metrics.activeSubscriptions}
        
        Provide 3 key recommendations to improve revenue and reduce churn.`,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      });
      
      toast.success('AI insights generated');
      return insights.recommendations;
    } catch (err) {
      toast.error('Failed to generate insights');
    }
  };

  const exportReport = async (format) => {
    setIsGeneratingReport(true);
    toast.info(`Generating ${format.toUpperCase()} report...`);
    
    setTimeout(() => {
      setIsGeneratingReport(false);
      toast.success(`Report exported as ${format.toUpperCase()}`);
    }, 2000);
  };

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

      {/* AI Insights */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-400" />
              <div>
                <h3 className="text-white font-semibold">AI-Powered Analytics</h3>
                <p className="text-gray-400 text-sm">Get intelligent insights on your revenue</p>
              </div>
            </div>
            <Button onClick={generateAIInsights} className="bg-gradient-to-r from-purple-500 to-pink-500">
              <Brain className="w-4 h-4 mr-2" />
              Generate Insights
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="bg-black/40 border border-white/10">
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="breakdown">Subscription Breakdown</TabsTrigger>
          <TabsTrigger value="churn">Churn Prediction</TabsTrigger>
          <TabsTrigger value="clv">Lifetime Value</TabsTrigger>
          <TabsTrigger value="cohorts">Cohort Analysis</TabsTrigger>
          <TabsTrigger value="attribution">Revenue Attribution</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
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

        <TabsContent value="churn" className="mt-6">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-400" />
                AI Churn Prediction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-black/20 border-orange-500/30">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-400 mb-1">Churn Risk Score</p>
                    <p className="text-3xl font-bold text-orange-400">{churnPrediction.riskScore}%</p>
                  </CardContent>
                </Card>
                <Card className="bg-black/20 border-red-500/30">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-400 mb-1">At-Risk Customers</p>
                    <p className="text-3xl font-bold text-red-400">{churnPrediction.atRiskCustomers}</p>
                  </CardContent>
                </Card>
                <Card className="bg-black/20 border-green-500/30">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-400 mb-1">Retention Rate</p>
                    <p className="text-3xl font-bold text-green-400">{100 - churnPrediction.riskScore}%</p>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-3">Top Churn Reasons</h4>
                <div className="space-y-2">
                  {churnPrediction.topReasons.map((reason, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                      <span className="text-white">{reason}</span>
                      <Badge className="bg-orange-500/20 text-orange-400">High Impact</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clv" className="mt-6">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                Customer Lifetime Value Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={clvData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="cohort" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="clv" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} name="Current CLV" />
                  <Area type="monotone" dataKey="projected" stackId="2" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} name="Projected CLV" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cohorts" className="mt-6">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" />
                Cohort Retention Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={cohortData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="Jan-25" stroke="#06b6d4" strokeWidth={2} name="Jan 2025 Cohort" />
                  <Line type="monotone" dataKey="Feb-25" stroke="#a855f7" strokeWidth={2} name="Feb 2025 Cohort" />
                  <Line type="monotone" dataKey="Mar-25" stroke="#f59e0b" strokeWidth={2} name="Mar 2025 Cohort" />
                  <Line type="monotone" dataKey="Apr-25" stroke="#10b981" strokeWidth={2} name="Apr 2025 Cohort" />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-black/20 rounded-lg">
                <p className="text-gray-400 text-sm">
                  💡 <strong className="text-white">Insight:</strong> Jan 2025 cohort shows 73% retention after 4 months. 
                  Recent cohorts are performing better, indicating improving product-market fit.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attribution" className="mt-6">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                Revenue Attribution by Feature
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {revenueAttribution.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{item.feature}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-cyan-400 font-semibold">${item.revenue.toLocaleString()}</span>
                      <Badge className={item.growth > 20 ? 'bg-green-500/20 text-green-400' : 'bg-cyan-500/20 text-cyan-400'}>
                        +{item.growth}%
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all" 
                      style={{ width: `${(item.revenue / 48000) * 100}%` }} 
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <Card className="bg-black/40 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Recent Transactions</CardTitle>
              <div className="flex gap-2">
                <Select defaultValue="csv" onValueChange={exportReport}>
                  <SelectTrigger className="w-32 bg-white/5 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">Export CSV</SelectItem>
                    <SelectItem value="pdf">Export PDF</SelectItem>
                    <SelectItem value="excel">Export Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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