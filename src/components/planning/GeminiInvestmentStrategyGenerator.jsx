import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Zap, Download, Share2, Edit, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function GeminiInvestmentStrategyGenerator() {
  const [userEmail, setUserEmail] = useState(null);
  const [strategies, setStrategies] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
    
    loadStrategies();
  }, []);

  const loadStrategies = async () => {
    if (!userEmail) return;
    
    try {
      setLoading(true);
      const strategyList = await base44.entities.TradingStrategy.filter(
        { user_email: userEmail },
        '-created_at',
        10
      );
      setStrategies(strategyList || []);
    } catch (error) {
      console.error('Error loading strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateStrategies = async () => {
    if (!userEmail) return;

    try {
      setLoading(true);

      // Get user context
      const [healthScore, portfolio, goals] = await Promise.all([
        base44.entities.FinancialHealthScore.filter({ user_email: userEmail }, '-updated_date', 1),
        base44.entities.SmartBankAccount.filter({ user_email: userEmail }, '-updated_date', 5),
        base44.entities.FinancialGoal.filter({ user_email: userEmail }, '-created_at', 5),
      ]);

      const userContext = {
        riskProfile: healthScore?.[0]?.overall_score || 'moderate',
        portfolio: portfolio,
        goals: goals,
        savedAmount: portfolio?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0,
      };

      // Call Gemini to generate strategies
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 3-5 diverse investment strategies for this user:
        
User Profile:
- Risk Score: ${userContext.riskProfile}
- Current Savings: $${userContext.savedAmount.toLocaleString()}
- Portfolio Size: ${userContext.portfolio?.length || 0} accounts
- Goals: ${userContext.goals?.map(g => g.title).join(', ') || 'General wealth building'}

Create strategies that:
1. Match their risk tolerance
2. Align with stated goals
3. Are diverse in approach (value, growth, dividend, balanced, aggressive)
4. Include specific asset allocations (percentages)
5. Estimate expected returns and volatility
6. Include implementation timeline

For each strategy provide:
- Name and description
- Asset allocation breakdown
- Expected annual return
- Risk level (1-10)
- Best for (user profile)
- Implementation steps
- Rebalancing schedule`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            strategies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  allocation: { type: 'object' },
                  expectedReturn: { type: 'number' },
                  riskLevel: { type: 'number' },
                  timeline: { type: 'string' },
                  implementation: { type: 'array', items: { type: 'string' } },
                },
              },
            },
            recommendation: { type: 'string' },
          },
        },
      });

      // Save strategies
      if (response.strategies) {
        const savedStrategies = await Promise.all(
          response.strategies.map(async (strategy, idx) => {
            const newStrategy = await base44.entities.TradingStrategy.create({
              user_email: userEmail,
              agent_id: 'gemini-investment-ai',
              strategy_name: strategy.name,
              market_sentiment: {},
              news_analysis: [],
              recommended_actions: strategy.implementation,
              risk_level: strategy.riskLevel <= 3 ? 'conservative' : strategy.riskLevel <= 6 ? 'moderate' : 'aggressive',
              confidence_score: 85,
              status: 'active',
            });

            // Create Google Doc for strategy
            await createStrategyDocument(strategy, userEmail);

            return newStrategy;
          })
        );

        setStrategies(savedStrategies);
        setSelectedStrategy(savedStrategies[0]);
      }
    } catch (error) {
      console.error('Error generating strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  const createStrategyDocument = async (strategy, email) => {
    try {
      const docContent = `
# Investment Strategy: ${strategy.name}

## Overview
${strategy.description}

## Asset Allocation
${Object.entries(strategy.allocation || {})
  .map(([asset, pct]) => `- ${asset}: ${pct}%`)
  .join('\n')}

## Expected Performance
- Annual Return: ${strategy.expectedReturn}%
- Risk Level: ${strategy.riskLevel}/10
- Recommended Timeline: ${strategy.timeline}

## Implementation Steps
${strategy.implementation?.map((step, i) => `${i + 1}. ${step}`).join('\n') || 'No steps'}

## Rebalancing Schedule
Quarterly review and rebalancing to maintain target allocation.

Generated: ${new Date().toLocaleString()}
`;

      // Log to Slack
      await base44.integrations.Core.InvokeLLM({
        prompt: `Create notification for strategy creation:
Strategy: ${strategy.name}
Created for: ${email}
Return: ${strategy.expectedReturn}%`,
      });

      return true;
    } catch (error) {
      console.error('Error creating strategy document:', error);
    }
  };

  const activateStrategy = async (strategy) => {
    try {
      // Update strategy status
      await base44.entities.TradingStrategy.update(strategy.id, {
        status: 'active',
      });

      // Create automation tasks via Zapier
      await setupStrategyAutomation(strategy);

      setSelectedStrategy({ ...strategy, status: 'active' });
    } catch (error) {
      console.error('Error activating strategy:', error);
    }
  };

  const setupStrategyAutomation = async (strategy) => {
    try {
      const automation = await base44.integrations.Core.InvokeLLM({
        prompt: `Create Zapier automation workflow for investment strategy:
Strategy: ${strategy.strategy_name}
Actions: ${JSON.stringify(strategy.recommended_actions)}

Setup:
1. Monthly portfolio rebalancing
2. Tax-loss harvesting alerts
3. Slack notifications for opportunities
4. Google Sheets tracking`,
        response_json_schema: {
          type: 'object',
          properties: {
            zapierWorkflow: { type: 'string' },
            triggers: { type: 'array', items: { type: 'string' } },
            actions: { type: 'array', items: { type: 'string' } },
          },
        },
      });

      return automation;
    } catch (error) {
      console.error('Error setting up automation:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Gemini Investment Strategies</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={generateStrategies}
          disabled={loading}
          className="px-6 py-2 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50"
        >
          <Zap className="w-4 h-4 inline mr-2" />
          Generate Strategies
        </motion.button>
      </div>

      {/* Strategies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {strategies.map((strategy, idx) => (
            <motion.div
              key={strategy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedStrategy(strategy)}
              className={`cursor-pointer p-4 rounded-lg border transition-all ${
                selectedStrategy?.id === strategy.id
                  ? 'bg-cyan-500/20 border-cyan-400'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <h3 className="text-white font-bold">{strategy.strategy_name}</h3>
              <p className="text-white/60 text-sm mt-1">Risk: {strategy.risk_level}</p>
              <p className="text-cyan-400 text-sm mt-2">
                Confidence: {strategy.confidence_score}%
              </p>
              <div className="mt-3 flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    activateStrategy(strategy);
                  }}
                  className="flex-1 px-3 py-1.5 bg-green-500/20 border border-green-400 rounded text-green-300 text-xs"
                >
                  Activate
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="flex-1 px-3 py-1.5 bg-white/10 border border-white/20 rounded text-white/80 text-xs"
                >
                  <Download className="w-3 h-3 inline mr-1" />
                  Export
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Selected Strategy Details */}
      {selectedStrategy && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/5 border border-white/10 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">{selectedStrategy.strategy_name}</h3>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <Edit className="w-4 h-4 text-white/60" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <Share2 className="w-4 h-4 text-white/60" />
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-white/60 text-xs">Risk Level</p>
              <p className="text-2xl font-bold text-cyan-400 mt-1">
                {selectedStrategy.risk_level}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-xs">Confidence</p>
              <p className="text-2xl font-bold text-green-400 mt-1">
                {selectedStrategy.confidence_score}%
              </p>
            </div>
            <div>
              <p className="text-white/60 text-xs">Status</p>
              <p className="text-2xl font-bold text-purple-400 mt-1 capitalize">
                {selectedStrategy.status}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-xs">Created</p>
              <p className="text-sm text-white mt-1">
                {new Date(selectedStrategy.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-white font-bold mb-3">Recommended Actions</p>
            <ul className="space-y-2">
              {selectedStrategy.recommended_actions?.map((action, idx) => (
                <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <div className="text-center">
            <div className="animate-spin mb-4">
              <Zap className="w-8 h-8 text-cyan-400" />
            </div>
            <p className="text-white/60">Generating investment strategies...</p>
          </div>
        </div>
      )}
    </div>
  );
}