import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scale, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EthicalDilemmaSimulator() {
  const [dilemmas] = useState([
    {
      scenario: 'Resource Scarcity',
      description: 'Agent must choose between helping one group or maximizing total utility',
      options: ['Help Group A (5 agents)', 'Help Group B (3 agents)', 'Split resources'],
      ethicalFrameworks: ['Utilitarianism', 'Deontology', 'Virtue Ethics']
    },
    {
      scenario: 'Privacy vs Security',
      description: 'Access private data to prevent potential harm',
      options: ['Respect privacy', 'Access data', 'Seek consent first'],
      ethicalFrameworks: ['Rights-based', 'Consequentialism', 'Care Ethics']
    },
  ]);
  const [results, setResults] = useState([]);

  const simulateDilemma = (dilemma, option) => {
    const framework = dilemma.ethicalFrameworks[Math.floor(Math.random() * dilemma.ethicalFrameworks.length)];
    setResults([...results, {
      scenario: dilemma.scenario,
      choice: option,
      framework,
      outcome: Math.random() > 0.5 ? 'positive' : 'complex',
      timestamp: new Date()
    }]);
  };

  return (
    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Scale className="w-6 h-6 text-orange-400" />
        Ethical Dilemma Simulator
      </h3>

      <div className="space-y-4 mb-6">
        {dilemmas.map((dilemma, i) => (
          <div key={i} className="bg-black/20 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">{dilemma.scenario}</h4>
            <p className="text-white/70 text-sm mb-3">{dilemma.description}</p>
            <div className="flex gap-2 flex-wrap">
              {dilemma.options.map((option, j) => (
                <Button
                  key={j}
                  onClick={() => simulateDilemma(dilemma, option)}
                  size="sm"
                  className="bg-orange-500/20 hover:bg-orange-500/30 text-xs"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {results.length > 0 && (
        <div className="bg-black/20 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">Decision Log</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {results.slice(-5).reverse().map((result, i) => (
              <div key={i} className="text-sm">
                <div className="text-white">{result.scenario}: <span className="text-orange-400">{result.choice}</span></div>
                <div className="text-white/60 text-xs">Framework: {result.framework} - {result.outcome}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}