import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Loader, Sparkles, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PortfolioRebalancer({ userEmail }) {
  const [riskTolerance, setRiskTolerance] = useState('moderate');
  const [rebalancing, setRebalancing] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const generateRebalanceSuggestions = async () => {
    setRebalancing(true);
    try {
      // Get current portfolio
      const accounts = await base44.entities.SmartBankAccount.list({ user_email: userEmail });
      const trades = await base44.entities.TradeExecution.list({ user_email: userEmail }, '-created_at', 50);
      
      // Get real-time market data from multiple sources
      const marketData = await base44.integrations.Core.InvokeLLM({
        prompt: `Fetch real-time cryptocurrency market data from Crypto.com, Coinbase, and CoinMarketCap APIs. 
Include: BTC, ETH, USDT, BNB, SOL prices, market cap, 24h volume, and volatility metrics.
Also get latest crypto news headlines affecting the market.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            assets: { type: 'array', items: { type: 'object' } },
            market_sentiment: { type: 'string' },
            volatility_index: { type: 'number' },
            news_headlines: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      // Generate rebalancing suggestions with Gemini
      const rebalance = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this portfolio and provide rebalancing suggestions:

Current Holdings:
${JSON.stringify(accounts, null, 2)}

Recent Trades:
${JSON.stringify(trades.slice(0, 10), null, 2)}

Market Data:
${JSON.stringify(marketData, null, 2)}

Risk Tolerance: ${riskTolerance}

Provide:
1. Current allocation percentages
2. Recommended allocation based on risk tolerance
3. Specific trades to execute (buy/sell/amount)
4. Risk assessment and volatility concerns
5. Explanation for each recommendation

Consider market volatility, diversification, and user's ${riskTolerance} risk profile.`,
        response_json_schema: {
          type: 'object',
          properties: {
            current_allocation: { type: 'object' },
            recommended_allocation: { type: 'object' },
            suggested_trades: { type: 'array', items: { type: 'object' } },
            risk_assessment: { type: 'string' },
            volatility_score: { type: 'number' },
            explanation: { type: 'string' }
          }
        }
      });

      setSuggestions({ ...rebalance, market_data: marketData });
    } catch (error) {
      console.error('Error generating rebalance suggestions:', error);
    } finally {
      setRebalancing(false);
    }
  };

  const executeRebalance = async () => {
    if (!suggestions?.suggested_trades) return;
    
    try {
      for (const trade of suggestions.suggested_trades) {
        await base44.entities.TradeExecution.create({
          user_email: userEmail,
          asset_symbol: trade.asset,
          order_type: 'market',
          side: trade.action,
          quantity: trade.amount,
          status: 'pending',
          executed_at: new Date().toISOString()
        });
      }
      alert('Rebalance trades submitted!');
      setSuggestions(null);
    } catch (error) {
      console.error('Error executing rebalance:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-white font-bold flex items-center gap-2">
        <RefreshCw className="w-5 h-5 text-cyan-400" />
        AI Portfolio Rebalancing
      </h3>

      {/* Risk Tolerance Selector */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
        <label className="text-white/60 text-sm">Risk Tolerance</label>
        <div className="grid grid-cols-3 gap-2">
          {['conservative', 'moderate', 'aggressive'].map((level) => (
            <button
              key={level}
              onClick={() => setRiskTolerance(level)}
              className={`px-3 py-2 rounded font-semibold text-sm ${
                riskTolerance === level
                  ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={generateRebalanceSuggestions}
          disabled={rebalancing}
          className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded font-semibold hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {rebalancing ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Analyzing Portfolio...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Rebalance Plan
            </>
          )}
        </button>
      </div>

      {/* Suggestions */}
      {suggestions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Market Overview */}
          <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-400/30 rounded-lg p-4">
            <h4 className="text-white font-bold mb-2">Market Overview</h4>
            <p className="text-white/80 text-sm mb-2">
              Sentiment: <span className="text-cyan-400">{suggestions.market_data?.market_sentiment}</span>
            </p>
            <p className="text-white/80 text-sm">
              Volatility Index: <span className="text-yellow-400">{suggestions.market_data?.volatility_index}/10</span>
            </p>
          </div>

          {/* Risk Assessment */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <h4 className="text-white font-bold text-sm">Risk Assessment</h4>
            </div>
            <p className="text-white/70 text-sm mb-2">{suggestions.risk_assessment}</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-2 rounded-full"
                  style={{ width: `${suggestions.volatility_score * 10}%` }}
                />
              </div>
              <span className="text-white/60 text-xs">{suggestions.volatility_score}/10</span>
            </div>
          </div>

          {/* Suggested Trades */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-white font-bold mb-3">Suggested Trades</h4>
            <div className="space-y-2">
              {suggestions.suggested_trades?.map((trade, idx) => (
                <div key={idx} className="bg-white/5 rounded p-2 flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {trade.action?.toUpperCase()} {trade.asset}
                    </p>
                    <p className="text-white/60 text-xs">Amount: {trade.amount}</p>
                  </div>
                  <p className="text-cyan-400 text-xs">{trade.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 rounded-lg p-4">
            <h4 className="text-white font-bold mb-2">AI Explanation</h4>
            <p className="text-white/80 text-sm">{suggestions.explanation}</p>
          </div>

          {/* Execute Button */}
          <button
            onClick={executeRebalance}
            className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded font-semibold hover:shadow-lg flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Execute Rebalance Plan
          </button>
        </motion.div>
      )}
    </div>
  );
}