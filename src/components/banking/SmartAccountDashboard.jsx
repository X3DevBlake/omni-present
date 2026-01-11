import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Zap, Target, PiggyBank } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SmartAccountDashboard({ userEmail }) {
  const { data: accounts = [] } = useQuery({
    queryKey: ['smartAccounts', userEmail],
    queryFn: () => base44.entities.SmartBankAccount.filter({ user_email: userEmail }, '-created_date', 10),
    enabled: !!userEmail
  });

  const { data: healthScore } = useQuery({
    queryKey: ['healthScore', userEmail],
    queryFn: () => base44.entities.FinancialHealthScore.filter({ user_email: userEmail }, '-created_date', 1).then(res => res[0]),
    enabled: !!userEmail
  });

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">Smart Banking Hub</h1>
        <p className="text-white/60">AI-powered financial management</p>
      </motion.div>

      {/* Total Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl p-8 text-center"
      >
        <p className="text-white/60 mb-2">Total Balance</p>
        <h2 className="text-5xl font-bold text-cyan-400 mb-4">${totalBalance.toFixed(2)}</h2>
        {healthScore && (
          <div className="flex justify-center items-center gap-4">
            <div className="text-center">
              <p className="text-white/60 text-sm">Financial Health</p>
              <p className="text-2xl font-bold text-green-400">{healthScore.overall_score}</p>
            </div>
            <div className="text-center">
              <p className="text-white/60 text-sm">Credit Score</p>
              <p className="text-2xl font-bold text-blue-400">{healthScore.credit_score}</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Accounts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account, idx) => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-bold text-lg">{account.account_name}</h3>
                  <p className="text-white/60 text-sm capitalize">{account.account_type}</p>
                </div>
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>

              <div className="mb-4">
                <p className="text-white/60 text-sm mb-1">Balance</p>
                <p className="text-2xl font-bold text-white">${account.balance.toFixed(2)}</p>
              </div>

              {account.predicted_spending && (
                <div className="mb-4 p-3 bg-black/20 rounded-lg">
                  <p className="text-white/60 text-xs mb-1">Predicted Spending</p>
                  <p className="text-white font-semibold">${account.predicted_spending.toFixed(2)}</p>
                </div>
              )}

              {account.auto_save_enabled && (
                <div className="flex items-center gap-2 mb-4 p-2 bg-green-500/10 rounded border border-green-500/30">
                  <PiggyBank className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-xs">Auto-save: ${account.auto_save_amount}/tx</span>
                </div>
              )}

              <Button className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400">
                Manage
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Health Score Recommendations */}
      {healthScore?.recommendations && healthScore.recommendations.length > 0 && (
        <Card className="bg-blue-500/10 border-blue-500/30 p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            AI Recommendations
          </h3>
          <div className="space-y-3">
            {healthScore.recommendations.slice(0, 3).map((rec, idx) => (
              <div key={idx} className="p-3 bg-black/20 rounded-lg">
                <p className="text-white font-medium text-sm">{rec.title}</p>
                <p className="text-white/60 text-xs mt-1">{rec.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}