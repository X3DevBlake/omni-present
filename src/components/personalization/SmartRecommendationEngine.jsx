import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Star, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SmartRecommendationEngine() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateRecommendations();
  }, []);

  const generateRecommendations = async () => {
    try {
      const recs = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 3 personalized financial product recommendations based on typical user patterns.
        Consider: age 30-40, moderate risk appetite, $50k portfolio, interest in DeFi.
        Return JSON with recommendations array containing {product, reason, expectedReturn, riskLevel}`,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: { type: 'string' },
                  reason: { type: 'string' },
                  expectedReturn: { type: 'string' },
                  riskLevel: { type: 'string' }
                }
              }
            }
          }
        }
      });
      setRecommendations(recs.recommendations || []);
    } catch (err) {
      console.error('Failed to generate recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black/40 border border-orange-500/30 rounded-2xl p-6 space-y-4">
      <h3 className="text-white font-bold flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-orange-400" />
        Personalized Recommendations
      </h3>

      {loading ? (
        <div className="text-white/40 text-sm">Analyzing your profile...</div>
      ) : recommendations.length === 0 ? (
        <div className="text-white/40 text-sm">No recommendations available</div>
      ) : (
        <div className="space-y-2">
          {recommendations.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-orange-500/20 rounded-lg p-3"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-white font-bold text-sm flex items-center gap-2">
                    <Star className="w-4 h-4 text-orange-400" />
                    {rec.product}
                  </p>
                  <p className="text-white/60 text-xs mt-1">{rec.reason}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={`px-2 py-1 rounded ${
                  rec.riskLevel === 'Low' ? 'bg-green-500/20 text-green-300' :
                  rec.riskLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {rec.riskLevel} Risk
                </span>
                <span className="text-orange-300 font-bold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {rec.expectedReturn}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="w-full mt-2 py-1 text-xs bg-orange-500/20 border border-orange-500/40 text-orange-300 rounded"
              >
                Learn More
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}