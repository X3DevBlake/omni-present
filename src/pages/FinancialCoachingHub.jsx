import React from 'react';
import { motion } from 'framer-motion';
import FinancialCoachingModule from '../components/coaching/FinancialCoachingModule';

export default function FinancialCoachingHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Financial Coaching
        </h1>
        <p className="text-white/60 mb-8">
          Personalized financial advice with interactive coaching, goal tracking, and motivational support
        </p>

        <FinancialCoachingModule />
      </motion.div>
    </div>
  );
}