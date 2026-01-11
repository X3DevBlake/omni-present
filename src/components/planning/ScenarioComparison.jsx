import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap, Eye } from 'lucide-react';

export default function ScenarioComparison() {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [comparisonMetric, setComparisonMetric] = useState('portfolio_value');

  const scenarios = [
    {
      id: 1,
      name: 'Base Case',
      description: 'Current savings rate, 7% returns',
      icon: '📊',
      color: 'from-blue-500 to-cyan-500',
      probability: 50,
      projections: {
        year_5: { portfolio: 168000, savings: 25000 },
        year_10: { portfolio: 215000, savings: 50000 },
        retirement_age: 62,
        goal_achievement: 85,
      },
    },
    {
      id: 2,
      name: 'Optimistic',
      description: 'Higher savings, 9% returns',
      icon: '📈',
      color: 'from-green-500 to-emerald-500',
      probability: 25,
      projections: {
        year_5: { portfolio: 185000, savings: 30000 },
        year_10: { portfolio: 245000, savings: 60000 },
        retirement_age: 58,
        goal_achievement: 100,
      },
    },
    {
      id: 3,
      name: 'Pessimistic',
      description: 'Lower returns, 5% annual',
      icon: '📉',
      color: 'from-orange-500 to-red-500',
      probability: 20,
      projections: {
        year_5: { portfolio: 148000, savings: 20000 },
        year_10: { portfolio: 185000, savings: 40000 },
        retirement_age: 65,
        goal_achievement: 60,
      },
    },
    {
      id: 4,
      name: 'Job Change',
      description: 'Income +30%, 1-year gap',
      icon: '💼',
      color: 'from-purple-500 to-pink-500',
      probability: 30,
      projections: {
        year_5: { portfolio: 195000, savings: 40000 },
        year_10: { portfolio: 265000, savings: 75000 },
        retirement_age: 57,
        goal_achievement: 95,
      },
    },
  ];

  const metricsData = {
    portfolio_value: [
      { scenario: 'Base', year_5: 168, year_10: 215 },
      { scenario: 'Optimistic', year_5: 185, year_10: 245 },
      { scenario: 'Pessimistic', year_5: 148, year_10: 185 },
      { scenario: 'Job Change', year_5: 195, year_10: 265 },
    ],
    retirement_age: [
      { scenario: 'Base', value: 62 },
      { scenario: 'Optimistic', value: 58 },
      { scenario: 'Pessimistic', value: 65 },
      { scenario: 'Job Change', value: 57 },
    ],
    goal_achievement: [
      { scenario: 'Base', value: 85 },
      { scenario: 'Optimistic', value: 100 },
      { scenario: 'Pessimistic', value: 60 },
      { scenario: 'Job Change', value: 95 },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-400/20 rounded-lg p-6"
      >
        <h3 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
          <Zap className="w-6 h-6 text-indigo-400" />
          What-If Scenario Analysis
        </h3>
        <p className="text-white/60 text-sm">Compare multiple financial futures and find your optimal path</p>
      </motion.div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map((scenario) => (
          <motion.div
            key={scenario.id}
            whileHover={{ y: -2 }}
            onClick={() => setSelectedScenario(scenario)}
            className={`p-5 rounded-lg border cursor-pointer transition-all ${
              selectedScenario?.id === scenario.id
                ? `bg-gradient-to-br ${scenario.color} bg-opacity-20 border-white/40`
                : 'bg-white/5 border-white/10 hover:border-white/30'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-3xl">{scenario.icon}</p>
                <h3 className="text-white font-bold mt-2">{scenario.name}</h3>
                <p className="text-white/60 text-sm">{scenario.description}</p>
              </div>
              <span className="px-2 py-1 bg-white/10 rounded text-white/70 text-xs font-bold">
                {scenario.probability}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10">
              <div>
                <p className="text-white/60 text-xs">Retire at</p>
                <p className="text-white font-bold">{scenario.projections.retirement_age}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs">Goal Achievement</p>
                <p className="text-white font-bold">{scenario.projections.goal_achievement}%</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Metrics Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-white font-bold">Comparative Metrics</h4>
          <select
            value={comparisonMetric}
            onChange={(e) => setComparisonMetric(e.target.value)}
            className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white/80 text-sm focus:outline-none"
          >
            <option value="portfolio_value">Portfolio Value</option>
            <option value="retirement_age">Retirement Age</option>
            <option value="goal_achievement">Goal Achievement</option>
          </select>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          {comparisonMetric === 'portfolio_value' && (
            <div className="space-y-4">
              {metricsData.portfolio_value.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white font-semibold">{item.scenario}</p>
                    <p className="text-white/60 text-xs">10 years: ${item.year_10}k</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="h-1.5 bg-white/10 rounded overflow-hidden mb-1">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.year_5 / 200) * 100}%` }}
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        />
                      </div>
                      <p className="text-white/60 text-xs">Year 5: ${item.year_5}k</p>
                    </div>
                    <div>
                      <div className="h-1.5 bg-white/10 rounded overflow-hidden mb-1">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.year_10 / 300) * 100}%` }}
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        />
                      </div>
                      <p className="text-white/60 text-xs">Year 10: ${item.year_10}k</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {comparisonMetric === 'retirement_age' && (
            <div className="space-y-3">
              {metricsData.retirement_age.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-3 bg-white/5 rounded"
                >
                  <p className="text-white font-semibold">{item.scenario}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-white">{item.value}</p>
                    <p className="text-white/60 text-sm">years old</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {comparisonMetric === 'goal_achievement' && (
            <div className="space-y-3">
              {metricsData.goal_achievement.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white font-semibold">{item.scenario}</p>
                    <p className="text-white font-bold">{item.value}%</p>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Detailed Scenario View */}
      {selectedScenario && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-br ${selectedScenario.color} bg-opacity-10 border border-white/20 rounded-lg p-6`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-white font-bold text-lg">{selectedScenario.name} - Detailed View</h3>
              <p className="text-white/60 text-sm mt-1">{selectedScenario.description}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setSelectedScenario(null)}
              className="text-white/60 hover:text-white"
            >
              ✕
            </motion.button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <p className="text-white/60 text-xs mb-1">Probability</p>
              <p className="text-2xl font-bold text-white">{selectedScenario.probability}%</p>
            </div>
            <div>
              <p className="text-white/60 text-xs mb-1">Retirement Age</p>
              <p className="text-2xl font-bold text-white">{selectedScenario.projections.retirement_age}</p>
            </div>
            <div>
              <p className="text-white/60 text-xs mb-1">Goal Achievement</p>
              <p className="text-2xl font-bold text-white">{selectedScenario.projections.goal_achievement}%</p>
            </div>
            <div>
              <p className="text-white/60 text-xs mb-1">Year 10 Portfolio</p>
              <p className="text-2xl font-bold text-white">${selectedScenario.projections.year_10.portfolio / 1000}k</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            className="w-full mt-4 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white/80 hover:bg-white/20 transition-all"
          >
            View Full Analysis & Recommendations
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}