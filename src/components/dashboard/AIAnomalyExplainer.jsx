import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, TrendingDown, Zap, HelpCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AIAnomalyExplainer() {
  const [anomalies, setAnomalies] = useState([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
    
    loadAnomalies();
  }, []);

  const loadAnomalies = async () => {
    if (!userEmail) return;

    try {
      const alerts = await base44.entities.FraudAlert.filter(
        { user_email: userEmail, status: 'pending' },
        '-detected_at',
        5
      );

      setAnomalies(alerts || []);
      if (alerts?.length > 0) {
        explainAnomaly(alerts[0]);
      }
    } catch (error) {
      console.error('Error loading anomalies:', error);
    }
  };

  const explainAnomaly = async (anomaly) => {
    try {
      setSelectedAnomaly(anomaly);

      const explanation = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide detailed root cause analysis and impact assessment:

Anomaly: ${anomaly.alert_type}
Severity: ${anomaly.severity}
Description: ${anomaly.description}
Detected: ${anomaly.detected_at}

Explain:
1. ROOT CAUSE: Why this happened
2. INTERCONNECTIONS: Related factors
3. IMPACT ASSESSMENT: Personal financial impact
4. RISK FACTORS: Underlying risks
5. RECOMMENDATIONS: Specific actions to take
6. TIMELINE: When action needed`,
        response_json_schema: {
          type: 'object',
          properties: {
            rootCause: { type: 'string' },
            interconnections: { type: 'array', items: { type: 'string' } },
            personalImpact: { type: 'string' },
            riskFactors: { type: 'array', items: { type: 'string' } },
            recommendations: { type: 'array', items: { type: 'string' } },
            timeline: { type: 'string' },
          },
        },
      });

      setAnalysis(explanation);
    } catch (error) {
      console.error('Error explaining anomaly:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Anomaly List */}
      <div className="space-y-2">
        <p className="text-white/80 font-bold text-sm">Active Anomalies</p>
        {anomalies.map((anomaly, idx) => (
          <motion.button
            key={anomaly.id}
            onClick={() => explainAnomaly(anomaly)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              selectedAnomaly?.id === anomaly.id
                ? 'bg-red-500/20 border-red-400'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <div className="flex-1">
                <p className="text-white text-sm font-semibold">{anomaly.alert_type}</p>
                <p className="text-white/60 text-xs">{anomaly.description}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                anomaly.severity === 'critical' ? 'bg-red-500/30 text-red-300' :
                anomaly.severity === 'high' ? 'bg-orange-500/30 text-orange-300' :
                'bg-yellow-500/30 text-yellow-300'
              }`}>
                {anomaly.severity}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Analysis Details */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4"
        >
          <div className="flex items-start gap-2">
            <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-bold text-sm mb-1">Root Cause</p>
              <p className="text-white/80 text-sm">{analysis.rootCause}</p>
            </div>
          </div>

          <div>
            <p className="text-white font-bold text-sm mb-2">Interconnected Factors</p>
            <ul className="space-y-1">
              {analysis.interconnections?.map((factor, idx) => (
                <li key={idx} className="text-white/70 text-sm flex gap-2">
                  <span className="text-cyan-400">•</span> {factor}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-red-500/10 border border-red-400/30 rounded p-3">
            <p className="text-red-300 font-bold text-sm mb-1">Personal Impact</p>
            <p className="text-red-200/80 text-sm">{analysis.personalImpact}</p>
          </div>

          <div>
            <p className="text-white font-bold text-sm mb-2">Risk Factors</p>
            <div className="grid grid-cols-1 gap-2">
              {analysis.riskFactors?.map((risk, idx) => (
                <div key={idx} className="p-2 bg-white/5 rounded text-white/70 text-xs">
                  ⚠️ {risk}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-400/30 rounded p-3">
            <p className="text-green-300 font-bold text-sm mb-2">Recommended Actions</p>
            <ol className="space-y-1">
              {analysis.recommendations?.map((rec, idx) => (
                <li key={idx} className="text-green-200/80 text-sm">
                  {idx + 1}. {rec}
                </li>
              ))}
            </ol>
          </div>

          <div className="text-white/60 text-xs border-t border-white/10 pt-3">
            <p className="font-semibold mb-1">Timeline: {analysis.timeline}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}