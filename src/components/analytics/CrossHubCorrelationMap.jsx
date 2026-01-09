import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Network, ArrowRight } from 'lucide-react';

export default function CrossHubCorrelationMap() {
  const [correlations, setCorrelations] = useState([]);
  const [selectedFlow, setSelectedFlow] = useState(null);

  useEffect(() => {
    const flows = [
      {
        id: 'sim_to_device',
        from: 'Omni Simulations',
        to: 'Omni Devices',
        strength: 0.87,
        impact: 'Simulation patterns improve device predictive maintenance accuracy by 23%',
        color: 'from-amber-500 to-cyan-500'
      },
      {
        id: 'market_to_trading',
        from: 'Market Data',
        to: 'Omni Hub Trading',
        strength: 0.92,
        impact: 'Real-time market trends directly influence automated trading strategies',
        color: 'from-green-500 to-purple-500'
      },
      {
        id: 'research_to_strategy',
        from: 'Omni Labs Research',
        to: 'Omni Hub Strategy',
        strength: 0.76,
        impact: 'Research discoveries inform new trading opportunities and risk models',
        color: 'from-pink-500 to-purple-500'
      },
      {
        id: 'agent_to_optimization',
        from: 'Agent Performance',
        to: 'System Optimization',
        strength: 0.84,
        impact: 'Agent learning feeds back into system parameter tuning',
        color: 'from-blue-500 to-cyan-500'
      },
      {
        id: 'device_to_insights',
        from: 'Omni Devices Data',
        to: 'Unified Insights',
        strength: 0.79,
        impact: 'Device telemetry reveals optimization opportunities across hubs',
        color: 'from-cyan-500 to-emerald-500'
      }
    ];
    setCorrelations(flows);
  }, []);

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Network className="w-6 h-6 text-cyan-400" />
        <div>
          <h3 className="text-white font-bold">Cross-Hub Correlations</h3>
          <p className="text-white/60 text-sm">Data flow and impact analysis across ecosystem</p>
        </div>
      </div>

      <div className="space-y-3">
        {correlations.map((flow, idx) => (
          <motion.div
            key={flow.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => setSelectedFlow(selectedFlow?.id === flow.id ? null : flow)}
            className="cursor-pointer"
          >
            <div className={`bg-gradient-to-r ${flow.color} rounded-lg p-4 opacity-20 hover:opacity-40 transition-opacity`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-white text-sm font-semibold">{flow.from}</div>
                  <ArrowRight className="w-4 h-4 text-white/60" />
                  <div className="text-white text-sm font-semibold">{flow.to}</div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">{(flow.strength * 100).toFixed(0)}%</div>
                  <div className="text-white/60 text-xs">Correlation</div>
                </div>
              </div>
            </div>

            {selectedFlow?.id === flow.id && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 bg-white/5 border border-white/10 rounded-lg p-3"
              >
                <p className="text-white/70 text-xs">{flow.impact}</p>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}