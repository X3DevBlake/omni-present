import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Info } from 'lucide-react';

export default function DeFiRiskAssessmentAI() {
  const risks = [
    { category: 'Smart Contract', level: 'low', score: 15, color: 'green' },
    { category: 'Liquidity', level: 'medium', score: 45, color: 'yellow' },
    { category: 'Market Volatility', level: 'high', score: 75, color: 'red' }
  ];

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Shield className="w-6 h-6 text-cyan-400" />
        AI Risk Assessment
      </h3>

      <div className="space-y-4">
        {risks.map((risk, i) => (
          <div key={i} className="bg-gradient-to-r from-white/5 to-white/10 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-5 h-5 text-${risk.color}-400`} />
                <div className="text-white font-bold">{risk.category}</div>
              </div>
              <div className={`px-3 py-1 rounded text-sm bg-${risk.color}-500/20 text-${risk.color}-400`}>
                {risk.level}
              </div>
            </div>
            <div className="h-2 bg-black/40 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-${risk.color}-500`}
                style={{ width: `${risk.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}