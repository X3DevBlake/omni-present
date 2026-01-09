import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { DollarSign, TrendingDown, AlertCircle, Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function RealWorldBudgetTracker() {
  const [budgets, setBudgets] = useState([
    { category: 'Food & Dining', budget: 500, spent: 340, color: '#10b981' },
    { category: 'Transportation', budget: 200, spent: 150, color: '#3b82f6' },
    { category: 'Shopping', budget: 300, spent: 280, color: '#a855f7' },
    { category: 'Entertainment', budget: 150, spent: 95, color: '#ec4899' },
    { category: 'Utilities', budget: 200, spent: 200, color: '#f59e0b' },
    { category: 'Healthcare', budget: 100, spent: 45, color: '#06b6d4' },
  ]);

  const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const remaining = totalBudget - totalSpent;

  const spendingData = budgets.map(b => ({
    name: b.category,
    value: b.spent
  }));

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-cyan-400" />
            <span className="text-white/60 text-sm">Total Budget</span>
          </div>
          <div className="text-white text-3xl font-bold">${totalBudget}</div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <span className="text-white/60 text-sm">Total Spent</span>
          </div>
          <div className="text-red-400 text-3xl font-bold">${totalSpent}</div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-white/60 text-sm">Remaining</span>
          </div>
          <div className="text-green-400 text-3xl font-bold">${remaining}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold text-lg mb-4">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={spendingData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label
              >
                {spendingData.map((entry, index) => (
                  <Cell key={index} fill={budgets[index].color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a0a0f', border: '1px solid #ffffff20', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold text-lg mb-4">Budget vs Actual</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={budgets}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="category" stroke="#ffffff60" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#ffffff60" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a0a0f', border: '1px solid #ffffff20', borderRadius: '8px' }}
              />
              <Bar dataKey="budget" fill="#10b981" />
              <Bar dataKey="spent" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-bold text-lg mb-4">Category Details</h3>
        <div className="space-y-4">
          {budgets.map((budget, index) => {
            const percentage = (budget.spent / budget.budget) * 100;
            const isOverBudget = budget.spent > budget.budget;

            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{budget.category}</span>
                  <div className="text-right">
                    <span className={`font-bold ${isOverBudget ? 'text-red-400' : 'text-white'}`}>
                      ${budget.spent} / ${budget.budget}
                    </span>
                    {isOverBudget && (
                      <AlertCircle className="inline-block w-4 h-4 text-red-400 ml-2" />
                    )}
                  </div>
                </div>
                <div className="bg-black/40 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: isOverBudget ? '#ef4444' : budget.color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}