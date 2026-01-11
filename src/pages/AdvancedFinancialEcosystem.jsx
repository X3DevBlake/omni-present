import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GeminiInvestmentStrategyGenerator from '../components/planning/GeminiInvestmentStrategyGenerator';
import AdvancedFinancialHealthDashboard from '../components/dashboard/AdvancedFinancialHealthDashboard';
import PersonalizedLearningPath from '../components/education/PersonalizedLearningPath';

export default function AdvancedFinancialEcosystem() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Advanced Financial Ecosystem</h1>
          <p className="text-white/60">
            Gemini-Powered Strategies • Real-Time Dashboard • Personalized Education
          </p>
        </motion.div>

        {/* Main Tabs */}
        <Tabs defaultValue="strategies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10">
            <TabsTrigger value="strategies">Investment Strategies</TabsTrigger>
            <TabsTrigger value="dashboard">Financial Health</TabsTrigger>
            <TabsTrigger value="learning">Learning Path</TabsTrigger>
          </TabsList>

          {/* Investment Strategies */}
          <TabsContent value="strategies">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-6"
            >
              <GeminiInvestmentStrategyGenerator />
            </motion.div>
          </TabsContent>

          {/* Financial Health Dashboard */}
          <TabsContent value="dashboard">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AdvancedFinancialHealthDashboard />
            </motion.div>
          </TabsContent>

          {/* Personalized Learning Path */}
          <TabsContent value="learning">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-6"
            >
              <PersonalizedLearningPath />
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-cyan-400 font-bold">Gemini Integration</p>
            <p className="text-white/60 text-sm mt-2">
              AI-powered strategy generation and real-time analysis
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-purple-400 font-bold">Google Suite</p>
            <p className="text-white/60 text-sm mt-2">
              Docs, Sheets, Drive integration for document creation
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-green-400 font-bold">Automation</p>
            <p className="text-white/60 text-sm mt-2">
              Zapier workflows for rebalancing and notifications
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}