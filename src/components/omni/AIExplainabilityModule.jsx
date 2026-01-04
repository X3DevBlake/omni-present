import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertCircle, Info, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AIExplainabilityModule({ blueprint, anomalies, recommendations, onClose }) {
  const [explanations, setExplanations] = useState(null);

  useEffect(() => {
    if (blueprint) generateExplanations();
  }, [blueprint, anomalies, recommendations]);

  const generateExplanations = async () => {
    try {
      const prompt = `
        Provide clear explanations for AI decisions in this infrastructure:
        
        Blueprint: ${JSON.stringify(blueprint)}
        Anomalies Detected: ${JSON.stringify(anomalies)}
        AI Recommendations: ${JSON.stringify(recommendations)}
        
        Explain:
        1. FEATURE IMPORTANCE: Why each component contributes to overall performance
        2. ANOMALY TRIGGERS: What patterns triggered anomaly detection
        3. RECOMMENDATION RATIONALE: Why specific configurations were recommended
        
        Use accessible language for non-technical users.
      `;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            featureImportance: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  feature: { type: 'string' },
                  importance: { type: 'number' },
                  explanation: { type: 'string' }
                }
              }
            },
            anomalyExplanations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  anomaly: { type: 'string' },
                  trigger: { type: 'string' },
                  context: { type: 'string' }
                }
              }
            },
            recommendationRationale: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  recommendation: { type: 'string' },
                  reasoning: { type: 'string' },
                  factors: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        }
      });

      setExplanations(result);
    } catch (error) {
      console.error('Explainability generation failed:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed top-24 right-24 z-40 w-96 max-h-[75vh] overflow-y-auto bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold">AI Explainability</h3>
        </div>
        <button onClick={onClose} className="text-white/60 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {explanations && (
        <div className="space-y-4">
          <div>
            <h4 className="text-white/80 font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Feature Importance
            </h4>
            {explanations.featureImportance?.map((item, idx) => (
              <div key={idx} className="mb-2 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium">{item.feature}</span>
                  <span className="text-purple-400 text-sm">{(item.importance * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-purple-500" style={{ width: `${item.importance * 100}%` }} />
                </div>
                <p className="text-white/60 text-xs">{item.explanation}</p>
              </div>
            ))}
          </div>

          {explanations.anomalyExplanations?.length > 0 && (
            <div>
              <h4 className="text-orange-400 font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Anomaly Triggers
              </h4>
              {explanations.anomalyExplanations.map((item, idx) => (
                <div key={idx} className="mb-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                  <div className="text-orange-400 text-sm font-medium mb-1">{item.anomaly}</div>
                  <div className="text-white/70 text-xs mb-1">Trigger: {item.trigger}</div>
                  <div className="text-white/60 text-xs">{item.context}</div>
                </div>
              ))}
            </div>
          )}

          {explanations.recommendationRationale?.length > 0 && (
            <div>
              <h4 className="text-cyan-400 font-semibold mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Why AI Recommended This
              </h4>
              {explanations.recommendationRationale.map((item, idx) => (
                <div key={idx} className="mb-2 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                  <div className="text-cyan-400 text-sm font-medium mb-2">{item.recommendation}</div>
                  <p className="text-white/70 text-xs mb-2">{item.reasoning}</p>
                  <div className="space-y-1">
                    {item.factors?.map((factor, i) => (
                      <div key={i} className="text-white/60 text-xs flex items-start gap-1">
                        <span className="text-cyan-400">•</span>
                        {factor}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}