import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function FinancialPlanningModule() {
  const [activeGoal, setActiveGoal] = useState(0);

  const financialPlan = {
    goals: [
      {
        id: 1,
        name: 'Retirement',
        targetAge: 65,
        targetAmount: 1000000,
        currentAmount: 250000,
        yearsToGoal: 22,
        requiredMonthlySavings: 2145,
        projectedAmount: 980000,
        successProbability: 0.92,
        status: 'on-track',
        milestones: [
          { age: 45, amount: 350000, status: 'completed' },
          { age: 50, amount: 500000, status: 'completed' },
          { age: 55, amount: 650000, status: 'on-track' },
          { age: 60, amount: 800000, status: 'projected' },
        ],
      },
      {
        id: 2,
        name: 'Home Purchase',
        targetYear: 2028,
        targetAmount: 500000,
        currentAmount: 150000,
        yearsToGoal: 2,
        requiredMonthlySavings: 14583,
        projectedAmount: 478000,
        successProbability: 0.78,
        status: 'at-risk',
        milestones: [
          { year: 2025, amount: 100000, status: 'completed' },
          { year: 2026, amount: 250000, status: 'completed' },
          { year: 2027, amount: 400000, status: 'at-risk' },
        ],
      },
      {
        id: 3,
        name: 'College Fund',
        targetYear: 2030,
        targetAmount: 300000,
        currentAmount: 75000,
        yearsToGoal: 4,
        requiredMonthlySavings: 4688,
        projectedAmount: 290000,
        successProbability: 0.88,
        status: 'on-track',
        milestones: [
          { year: 2027, amount: 150000, status: 'projected' },
          { year: 2028, amount: 200000, status: 'projected' },
          { year: 2030, amount: 300000, status: 'projected' },
        ],
      },
    ],
    risks: [
      {
        id: 1,
        name: 'Home Purchase Savings Gap',
        severity: 'high',
        impact: '$22,000 shortfall likely',
        mitigation: 'Increase savings by $2,000/month or adjust timeline',
      },
      {
        id: 2,
        name: 'Market Volatility Risk',
        severity: 'medium',
        impact: 'Could reduce projected retirement by 10%',
        mitigation: 'Gradually shift to bonds as retirement approaches',
      },
      {
        id: 3,
        name: 'Inflation Impact',
        severity: 'medium',
        impact: 'Purchasing power reduces by ~2.5% annually',
        mitigation: 'Invest in inflation-protected securities',
      },
    ],
  };

  const currentGoal = financialPlan.goals[activeGoal];

  return (
    <div className="space-y-6">
      {/* Goal Selector */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {financialPlan.goals.map((goal, idx) => (
          <motion.button
            key={goal.id}
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveGoal(idx)}
            className={`px-4 py-2 rounded-lg border whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-2 ${
              activeGoal === idx
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-white/5 border-white/10 text-white/80 hover:border-white/30'
            }`}
          >
            <Target className="w-4 h-4" />
            {goal.name}
          </motion.button>
        ))}
      </div>

      {/* Goal Details */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        key={currentGoal.id}
        className="space-y-4"
      >
        {/* Header */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">{currentGoal.name}</h3>
              <p className="text-white/60">
                Target: ${currentGoal.targetAmount.toLocaleString()} in {currentGoal.yearsToGoal} years
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
              currentGoal.status === 'on-track'
                ? 'bg-green-500/20 text-green-400 border border-green-400/50'
                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/50'
            }`}>
              {currentGoal.status}
            </span>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-white/80">Progress</p>
              <p className="text-cyan-400 font-bold">
                ${currentGoal.currentAmount.toLocaleString()} / ${currentGoal.targetAmount.toLocaleString()}
              </p>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(currentGoal.currentAmount / currentGoal.targetAmount) * 100}%` }}
                transition={{ duration: 1.5 }}
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
              />
            </div>
            <p className="text-white/60 text-sm">
              {((currentGoal.currentAmount / currentGoal.targetAmount) * 100).toFixed(1)}% complete
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: 'Required Monthly',
              value: `$${currentGoal.requiredMonthlySavings.toLocaleString()}`,
            },
            {
              label: 'Projected Amount',
              value: `$${currentGoal.projectedAmount.toLocaleString()}`,
            },
            {
              label: 'Success Probability',
              value: `${(currentGoal.successProbability * 100).toFixed(0)}%`,
            },
            {
              label: 'Years Remaining',
              value: currentGoal.yearsToGoal,
            },
          ].map((metric, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -2 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-lg p-3 hover:border-white/30 transition-all"
            >
              <p className="text-white/60 text-xs mb-1">{metric.label}</p>
              <p className="text-white font-bold text-sm">{metric.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Milestones */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h4 className="text-white font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Timeline & Milestones
          </h4>
          <div className="space-y-2">
            {currentGoal.milestones.map((milestone, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
              >
                <div className="flex-shrink-0">
                  {milestone.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : milestone.status === 'on-track' ? (
                    <div className="w-5 h-5 rounded-full bg-cyan-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-white/30" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">
                    {milestone.age || milestone.year}: ${milestone.amount.toLocaleString()}
                  </p>
                  <p className="text-white/60 text-xs capitalize">{milestone.status}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Risks & Gaps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 border border-white/10 rounded-lg p-6"
      >
        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          Plan Risks & Gaps
        </h4>
        <div className="space-y-3">
          {financialPlan.risks.map((risk) => (
            <motion.div
              key={risk.id}
              whileHover={{ x: 5 }}
              className="p-4 bg-white/5 border border-white/10 rounded-lg hover:border-white/30 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-white font-semibold">{risk.name}</p>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  risk.severity === 'high'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {risk.severity}
                </span>
              </div>
              <p className="text-white/80 text-sm mb-2">{risk.impact}</p>
              <p className="text-cyan-400 text-xs">💡 {risk.mitigation}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="flex-1 px-4 py-3 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300 hover:bg-cyan-500/30 font-semibold transition-all"
        >
          Update Plan
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white/80 hover:bg-white/20 font-semibold transition-all"
        >
          View Projections
        </motion.button>
      </motion.div>
    </div>
  );
}