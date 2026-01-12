import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, TrendingUp, Shield, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AIFinancialAdvisor from '../components/banking/AIFinancialAdvisor';
import SmartAccountManager from '../components/banking/SmartAccountManager';

export default function SmartBankingHub() {
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-cyan-400" />
            Smart Banking Hub
          </h1>
          <p className="text-white/60 text-lg">AI-powered financial management & forecasting</p>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="advisor" className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20 p-1 rounded-lg w-full justify-start">
            <TabsTrigger value="advisor" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Advisor
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Accounts
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          {/* AI Advisor Tab */}
          <TabsContent value="advisor">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {userEmail ? (
                <AIFinancialAdvisor userEmail={userEmail} />
              ) : (
                <p className="text-white/60 text-center py-12">Loading...</p>
              )}
            </motion.div>
          </TabsContent>

          {/* Accounts Tab */}
          <TabsContent value="accounts">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {userEmail ? (
                <SmartAccountManager userEmail={userEmail} />
              ) : (
                <p className="text-white/60 text-center py-12">Loading...</p>
              )}
            </motion.div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-white font-bold mb-4">Spending Insights</h3>
                <p className="text-white/60">AI-powered spending analysis coming soon...</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-white font-bold mb-4">Investment Recommendations</h3>
                <p className="text-white/60">Personalized investment advice based on your profile...</p>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}