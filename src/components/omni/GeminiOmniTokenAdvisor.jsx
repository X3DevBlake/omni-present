import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, DollarSign } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function GeminiOmniTokenAdvisor() {
  const [tokenData, setTokenData] = useState(null);
  const [advice, setAdvice] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
    analyzeToken();
  }, []);

  const analyzeToken = async () => {
    setAnalyzing(true);
    try {
      // Get user's Omni holdings if any
      const userDeposits = await base44.entities.UserDeposit.filter(
        { user_email: userEmail },
        '-updated_date',
        1
      );

      const tokenAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide comprehensive Omni token investment analysis:

User Holdings: ${JSON.stringify(userDeposits?.[0] || { omni: 0 })}

Cover:
1. Token fundamentals and utility
2. Price momentum and sentiment
3. Buying strategy (DCA vs lump sum)
4. Portfolio allocation recommendation
5. Staking/yield opportunities
6. Risk factors and market conditions
7. Exit strategy and profit targets
8. Community/ecosystem strength`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            fundamentals: { type: 'string' },
            momentum: { type: 'string' },
            strategy: { type: 'string' },
            allocation: { type: 'string' },
            yields: { type: 'array', items: { type: 'string' } },
            risks: { type: 'array', items: { type: 'string' } },
            targets: { type: 'object' },
            recommendation: { type: 'string' },
          },
        },
      });

      setAdvice(tokenAnalysis);
    } catch (error) {
      console.error('Error analyzing token:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      {analyzing ? (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center py-4"
        >
          <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2 animate-spin" />
          <p className="text-white/60 text-sm">Analyzing Omni token...</p>
        </motion.div>
      ) : advice ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded-lg p-4 space-y-3">
            <h3 className="text-yellow-300 font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Token Analysis
            </h3>

            <div>
              <p className="text-white/80 text-xs font-semibold mb-1">Fundamentals</p>
              <p className="text-white/70 text-xs">{advice.fundamentals}</p>
            </div>

            <div>
              <p className="text-white/80 text-xs font-semibold mb-1">Market Momentum</p>
              <p className="text-white/70 text-xs">{advice.momentum}</p>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-400/20 rounded p-2">
              <p className="text-cyan-300 font-bold text-xs mb-1">💰 Investment Strategy</p>
              <p className="text-cyan-200/80 text-xs">{advice.strategy}</p>
            </div>

            <div>
              <p className="text-white/80 text-xs font-semibold mb-1">Portfolio Allocation</p>
              <p className="text-white/70 text-xs">{advice.allocation}</p>
            </div>

            {advice.yields?.length > 0 && (
              <div>
                <p className="text-green-300 text-xs font-semibold mb-1">💹 Yield Opportunities</p>
                {advice.yields.map((y, i) => (
                  <p key={i} className="text-green-200/80 text-xs">→ {y}</p>
                ))}
              </div>
            )}

            <div>
              <p className="text-red-300 text-xs font-semibold mb-1">⚠️ Risk Factors</p>
              {advice.risks?.map((r, i) => (
                <p key={i} className="text-red-200/80 text-xs">• {r}</p>
              ))}
            </div>

            <div className="bg-white/10 border border-white/20 rounded p-2">
              <p className="text-white font-bold text-xs mb-1">📊 {advice.recommendation}</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={analyzeToken}
            className="w-full px-4 py-2 bg-yellow-500/20 border border-yellow-400 rounded-lg text-yellow-300 hover:bg-yellow-500/30 text-sm"
          >
            <DollarSign className="w-3 h-3 inline mr-1" /> Buy Omni
          </motion.button>
        </motion.div>
      ) : null}
    </div>
  );
}