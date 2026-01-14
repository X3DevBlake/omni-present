import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, CreditCard, Target } from 'lucide-react';

const monthlyData = [
  { month: 'Jan', income: 8500, expenses: 6200, savings: 2300, investments: 1500 },
  { month: 'Feb', income: 8700, expenses: 6400, savings: 2300, investments: 1600 },
  { month: 'Mar', income: 9100, expenses: 6100, savings: 3000, investments: 1800 },
  { month: 'Apr', income: 8900, expenses: 6500, savings: 2400, investments: 1700 },
  { month: 'May', income: 9500, expenses: 6300, savings: 3200, investments: 2000 },
  { month: 'Jun', income: 9800, expenses: 6800, savings: 3000, investments: 2200 }
];

const categoryData = [
  { name: 'Housing', value: 2800, color: '#3b82f6' },
  { name: 'Food', value: 1200, color: '#22c55e' },
  { name: 'Transport', value: 800, color: '#f59e0b' },
  { name: 'Entertainment', value: 600, color: '#a855f7' },
  { name: 'Shopping', value: 800, color: '#ec4899' },
  { name: 'Other', value: 400, color: '#8b5cf6' }
];

export default function AdvancedFinancialAnalytics() {
  const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
  const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
  const totalSavings = monthlyData.reduce((sum, m) => sum + m.savings, 0);
  const avgMonthlyIncome = totalIncome / monthlyData.length;
  const savingsRate = ((totalSavings / totalIncome) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-700/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <Badge variant="outline" className="text-green-600">+12%</Badge>
            </div>
            <p className="text-2xl font-bold">${avgMonthlyIncome.toFixed(0)}</p>
            <p className="text-sm text-gray-600">Avg Monthly Income</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-700/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <CreditCard className="w-6 h-6 text-red-500" />
              <Badge variant="outline" className="text-red-600">+3%</Badge>
            </div>
            <p className="text-2xl font-bold">${(totalExpenses / monthlyData.length).toFixed(0)}</p>
            <p className="text-sm text-gray-600">Avg Monthly Expenses</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-700/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <PiggyBank className="w-6 h-6 text-blue-500" />
              <Badge variant="outline" className="text-blue-600">{savingsRate}%</Badge>
            </div>
            <p className="text-2xl font-bold">${totalSavings.toFixed(0)}</p>
            <p className="text-sm text-gray-600">Total Savings</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-700/10 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <Target className="w-6 h-6 text-purple-500" />
              <Badge variant="outline" className="text-purple-600">On Track</Badge>
            </div>
            <p className="text-2xl font-bold">85%</p>
            <p className="text-sm text-gray-600">Goal Progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Income vs Expenses Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Income vs Expenses Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="income" stroke="#22c55e" fillOpacity={1} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpenses)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Spending by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Savings Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Savings & Investments Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={3} />
                <Line type="monotone" dataKey="investments" stroke="#a855f7" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-purple-500" />
            AI Financial Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 rounded-lg bg-white border">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-green-500 mt-1" />
              <div>
                <p className="font-semibold">Excellent Savings Trend</p>
                <p className="text-sm text-gray-600">Your savings rate of {savingsRate}% is above average. Consider increasing investments.</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-white border">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-blue-500 mt-1" />
              <div>
                <p className="font-semibold">Budget Optimization</p>
                <p className="text-sm text-gray-600">You could save an additional $350/month by reducing entertainment expenses by 20%.</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-white border">
            <div className="flex items-start gap-3">
              <PiggyBank className="w-5 h-5 text-purple-500 mt-1" />
              <div>
                <p className="font-semibold">Investment Opportunity</p>
                <p className="text-sm text-gray-600">With your current savings, you qualify for high-yield investment products with 7.5% APY.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}