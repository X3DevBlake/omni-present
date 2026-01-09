import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, TrendingUp, Bot, RefreshCw, Shield } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function AIPortfolioManager() {
  const [portfolio, setPortfolio] = useState([
    { name: 'OMNI', value: 5000, allocation: 40, target: 35, color: '#00f5ff' },
    { name: 'ETH', value: 3000, allocation: 24, target: 25, color: '#a855f7' },
    { name: 'BTC', value: 2500, allocation: 20, target: 20, color: '#ec4899' },
    { name: 'Stable', value: 2000, allocation: 16, target: 20, color: '#10b981' }
  ]);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [riskLevel, setRiskLevel] = useState('moderate');

  useEffect(() => {
    generateAIRecommendations();
  }, [portfolio, riskLevel]);

  const generateAIRecommendations = async () => {
    const recommendations = portfolio
      .filter(asset => Math.abs(asset.allocation - asset.target) > 2)
      .map(asset => ({
        asset: asset.name,
        action: asset.allocation > asset.target ? 'Sell' : 'Buy',
        amount: Math.abs(asset.value * (asset.allocation - asset.target) / 100),
        reason: asset.allocation > asset.target 
          ? `Overweight by ${(asset.allocation - asset.target).toFixed(1)}%`
          : `Underweight by ${(asset.target - asset.allocation).toFixed(1)}%`
      }));

    setAiRecommendations(recommendations);
  };

  const autoRebalance = async () => {
    setIsRebalancing(true);
    
    try {
      const user = await base44.auth.me();
      
      // Simulate rebalancing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const rebalanced = portfolio.map(asset => ({
        ...asset,
        allocation: asset.target,
        value: (portfolio.reduce((sum, a) => sum + a.value, 0) * asset.target) / 100
      }));

      setPortfolio(rebalanced);

      await base44.entities.OmniTransaction.create({
        user_id: user.id,
        type: 'swap',
        amount: 0,
        currency: 'omni',
        status: 'confirmed',
        metadata: {
          action: 'auto_rebalance',
          strategy: riskLevel,
          changes: aiRecommendations.length
        }
      });

      toast.success('Portfolio rebalanced successfully');
    } catch (error) {
      toast.error('Failed to rebalance portfolio');
      console.error(error);
    } finally {
      setIsRebalancing(false);
    }
  };

  const totalValue = portfolio.reduce((sum, asset) => sum + asset.value, 0);

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            AI Portfolio <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Manager</span>
          </h1>
          <p className="text-white/60 text-lg">Automated rebalancing powered by AI agents</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Portfolio Overview */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-cyan-400" />
              Current Portfolio
            </h3>
            
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-white mb-2">${totalValue.toLocaleString()}</div>
              <div className="text-white/60">Total Value</div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={portfolio}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, allocation }) => `${name}: ${allocation}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {portfolio.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </div>

          {/* AI Recommendations */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-400" />
              AI Recommendations
            </h3>

            <div className="mb-4">
              <label className="text-white/60 text-sm mb-2 block">Risk Level</label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
              >
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>

            <div className="space-y-3">
              {aiRecommendations.length === 0 ? (
                <div className="text-center text-white/60 py-8">
                  <Shield className="w-12 h-12 mx-auto mb-3 text-green-400" />
                  Portfolio is balanced
                </div>
              ) : (
                aiRecommendations.map((rec, i) => (
                  <div
                    key={i}
                    className={`bg-gradient-to-r ${
                      rec.action === 'Buy'
                        ? 'from-green-500/20 to-emerald-500/20 border-green-500/30'
                        : 'from-red-500/20 to-pink-500/20 border-red-500/30'
                    } border rounded-xl p-4`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white font-bold">{rec.action} {rec.asset}</div>
                      <div className={`font-bold ${rec.action === 'Buy' ? 'text-green-400' : 'text-red-400'}`}>
                        ${rec.amount.toFixed(0)}
                      </div>
                    </div>
                    <div className="text-white/60 text-sm">{rec.reason}</div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={autoRebalance}
              disabled={isRebalancing || aiRecommendations.length === 0}
              className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isRebalancing ? (
                <>
                  <RefreshCw className="w-5 h-5 inline mr-2 animate-spin" />
                  Rebalancing...
                </>
              ) : (
                <>
                  <Bot className="w-5 h-5 inline mr-2" />
                  Auto-Rebalance Portfolio
                </>
              )}
            </button>
          </div>
        </div>

        {/* Asset Details */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold text-xl mb-4">Asset Allocation</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {portfolio.map((asset, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-white font-bold">{asset.name}</div>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.color }} />
                </div>
                <div className="text-2xl font-bold text-white mb-1">${asset.value.toLocaleString()}</div>
                <div className="text-white/60 text-sm mb-3">{asset.allocation}% of portfolio</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Target:</span>
                  <span className="text-cyan-400 font-semibold">{asset.target}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}