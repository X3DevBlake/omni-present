import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, Mic, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function GeminiCardAdvisor() {
  const [cards, setCards] = useState([]);
  const [advice, setAdvice] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const cardData = await base44.entities.OmniCardV2.filter({ user_email: userEmail }, '-updated_date', 5);
      setCards(cardData || []);
      if (cardData?.length > 0) {
        analyzeCards(cardData);
      }
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  };

  const analyzeCards = async (cardList) => {
    setIsAnalyzing(true);
    try {
      const cardSummary = cardList.map(c => ({
        type: c.card_type,
        spending: c.spending_this_month,
        rewards: c.rewards_balance,
        cashback: c.cashback_rate,
      }));

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze card usage and spending patterns:
        
Cards: ${JSON.stringify(cardSummary)}

Provide:
1. Optimization recommendations (which card for what)
2. Spending alerts and trends
3. Rewards maximization strategy
4. Risk warnings
5. Next best card tier or product`,
        response_json_schema: {
          type: 'object',
          properties: {
            optimization: { type: 'array', items: { type: 'string' } },
            alerts: { type: 'array', items: { type: 'string' } },
            rewards: { type: 'string' },
            risks: { type: 'array', items: { type: 'string' } },
            recommendation: { type: 'string' },
          },
        },
      });

      setAdvice(analysis);
    } catch (error) {
      console.error('Error analyzing:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      {cards.map((card, idx) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-white/10 rounded-lg p-4 hover:border-cyan-400/50 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-bold text-sm">{card.card_type} Card</h3>
            <div className="flex gap-2">
              <span className="text-yellow-400 text-xs font-bold">${card.rewards_balance} Rewards</span>
              <span className="text-cyan-300 text-xs">{card.cashback_rate}% CB</span>
            </div>
          </div>
          <div className="text-white/60 text-xs mb-2">Spent: ${card.spending_this_month}</div>
        </motion.div>
      ))}

      {advice && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-cyan-400/30 rounded-lg p-4 space-y-3"
        >
          <h3 className="text-cyan-300 font-bold flex items-center gap-2">
            <Zap className="w-4 h-4" /> AI Recommendations
          </h3>

          <div>
            <p className="text-white/80 text-xs font-semibold mb-1">Optimization</p>
            {advice.optimization?.map((opt, i) => (
              <p key={i} className="text-white/70 text-xs">→ {opt}</p>
            ))}
          </div>

          <div className="bg-yellow-500/10 border border-yellow-400/20 rounded p-2">
            <p className="text-yellow-300 text-xs font-semibold">⚠️ Alerts</p>
            {advice.alerts?.map((alert, i) => (
              <p key={i} className="text-yellow-200/80 text-xs">{alert}</p>
            ))}
          </div>

          <div className="bg-green-500/10 border border-green-400/20 rounded p-2">
            <p className="text-green-300 font-bold text-xs mb-1">💰 {advice.recommendation}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}