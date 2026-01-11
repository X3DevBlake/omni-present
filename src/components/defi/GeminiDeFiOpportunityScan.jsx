import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function GeminiDeFiOpportunityScan() {
  const [pools, setPools] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    loadPools();
  }, []);

  const loadPools = async () => {
    try {
      const poolData = await base44.entities.LiquidityPool.list('-current_apy', 10);
      setPools(poolData || []);
      if (poolData?.length > 0) {
        scanOpportunities(poolData);
      }
    } catch (error) {
      console.error('Error loading pools:', error);
    }
  };

  const scanOpportunities = async (poolList) => {
    setScanning(true);
    try {
      const poolSummary = poolList.map(p => ({
        name: p.pool_name,
        apy: p.current_apy,
        tvl: p.total_value_locked,
        risk: p.risk_level,
        lock: p.lock_period_days,
      }));

      const scan = await base44.integrations.Core.InvokeLLM({
        prompt: `Scan DeFi pools for best opportunities:
        
Pools: ${JSON.stringify(poolSummary)}

Identify:
1. Best yield opportunities (high APY, low risk)
2. Emerging pools with potential
3. Risk-adjusted returns ranking
4. Diversification strategy
5. Red flags and warnings`,
        response_json_schema: {
          type: 'object',
          properties: {
            topOpportunities: { type: 'array', items: { type: 'object' } },
            emergingPools: { type: 'array', items: { type: 'string' } },
            riskAdjusted: { type: 'array', items: { type: 'string' } },
            portfolio: { type: 'string' },
            warnings: { type: 'array', items: { type: 'string' } },
          },
        },
      });

      setOpportunities(scan.topOpportunities || []);
    } catch (error) {
      console.error('Error scanning:', error);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 mb-3"
      >
        {scanning && <Zap className="w-4 h-4 text-yellow-400 animate-spin" />}
        <p className="text-white font-bold text-sm">DeFi Opportunities</p>
      </motion.div>

      {opportunities.map((opp, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-green-500/10 border border-green-400/30 rounded p-3"
        >
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-300 font-semibold text-sm">{opp.pool}</p>
              <p className="text-green-200/80 text-xs">{opp.strategy}</p>
              <div className="flex gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 bg-green-500/20 rounded text-green-300">
                  {opp.apy}% APY
                </span>
                <span className="text-xs px-2 py-0.5 bg-yellow-500/20 rounded text-yellow-300">
                  {opp.riskLevel}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => scanOpportunities(pools)}
        className="w-full px-3 py-2 bg-cyan-500/20 border border-cyan-400 rounded text-cyan-300 text-sm hover:bg-cyan-500/30"
      >
        Rescan Opportunities
      </motion.button>
    </div>
  );
}