import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertOctagon, TrendingDown, Activity, Lock, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';

export default function DeFiRiskMitigation() {
  const [autoHedging, setAutoHedging] = useState(true);
  const [riskMonitoring, setRiskMonitoring] = useState(true);
  const [risks, setRisks] = useState([]);
  const [mitigations, setMitigations] = useState([]);

  useEffect(() => {
    // Simulate AI risk analysis
    const analysisInterval = setInterval(() => {
      setRisks([
        {
          id: 1,
          type: 'impermanent_loss',
          pool: 'ETH/USDT',
          severity: 'high',
          currentLoss: 4.2,
          projectedLoss: 8.5,
          recommendation: 'Reduce exposure by 30%',
          status: autoHedging ? 'mitigated' : 'active'
        },
        {
          id: 2,
          type: 'smart_contract',
          protocol: 'YieldFarm X',
          severity: 'medium',
          vulnerability: 'Reentrancy risk detected',
          confidence: 78,
          recommendation: 'Withdraw 50% of funds',
          status: riskMonitoring ? 'monitoring' : 'unmonitored'
        },
        {
          id: 3,
          type: 'volatility',
          asset: 'MATIC',
          severity: 'high',
          priceChange: -12.3,
          projectedChange: -18,
          recommendation: 'Hedge with stablecoin pair',
          status: autoHedging ? 'hedged' : 'exposed'
        }
      ]);

      if (autoHedging) {
        setMitigations([
          {
            id: 1,
            action: 'Auto-hedged ETH/USDT position',
            result: 'Saved $342 from IL',
            timestamp: new Date().toLocaleTimeString()
          },
          {
            id: 2,
            action: 'Rebalanced MATIC exposure',
            result: 'Reduced volatility risk by 45%',
            timestamp: new Date(Date.now() - 300000).toLocaleTimeString()
          }
        ]);
      }
    }, 5000);

    return () => clearInterval(analysisInterval);
  }, [autoHedging, riskMonitoring]);

  const severityColors = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30'
  };

  const statusColors = {
    mitigated: 'bg-green-500/20 text-green-400',
    hedged: 'bg-blue-500/20 text-blue-400',
    monitoring: 'bg-yellow-500/20 text-yellow-400',
    active: 'bg-red-500/20 text-red-400',
    exposed: 'bg-red-500/20 text-red-400',
    unmonitored: 'bg-gray-500/20 text-gray-400'
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="w-6 h-6 text-orange-400" />
            AI-Powered Risk Mitigation
          </CardTitle>
          <p className="text-sm text-gray-400">Automated protection against DeFi risks</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/40 rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <span className="text-white font-semibold">Auto-Hedging</span>
                </div>
                <Switch checked={autoHedging} onCheckedChange={setAutoHedging} />
              </div>
              <p className="text-xs text-gray-400">
                Automatically hedge against impermanent loss and volatility
              </p>
            </div>

            <div className="bg-black/40 rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-400" />
                  <span className="text-white font-semibold">Risk Monitoring</span>
                </div>
                <Switch checked={riskMonitoring} onCheckedChange={setRiskMonitoring} />
              </div>
              <p className="text-xs text-gray-400">
                24/7 smart contract vulnerability scanning
              </p>
            </div>
          </div>

          {/* Active Risks */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-red-400" />
              Detected Risks
            </h3>
            <div className="space-y-4">
              {risks.map((risk) => (
                <motion.div
                  key={risk.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-black/40 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-white">
                          {risk.type === 'impermanent_loss' && 'Impermanent Loss'}
                          {risk.type === 'smart_contract' && 'Smart Contract Risk'}
                          {risk.type === 'volatility' && 'High Volatility'}
                        </h4>
                        <Badge className={severityColors[risk.severity]}>
                          {risk.severity}
                        </Badge>
                        <Badge className={statusColors[risk.status]}>
                          {risk.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">
                        {risk.pool && `Pool: ${risk.pool}`}
                        {risk.protocol && `Protocol: ${risk.protocol}`}
                        {risk.asset && `Asset: ${risk.asset}`}
                      </p>
                      <div className="text-xs text-gray-500 space-y-1">
                        {risk.currentLoss && (
                          <div className="flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-red-400" />
                            <span>Current IL: {risk.currentLoss}% → Projected: {risk.projectedLoss}%</span>
                          </div>
                        )}
                        {risk.vulnerability && (
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-yellow-400" />
                            <span>{risk.vulnerability} (Confidence: {risk.confidence}%)</span>
                          </div>
                        )}
                        {risk.priceChange && (
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-orange-400" />
                            <span>24h: {risk.priceChange}% → Projected: {risk.projectedChange}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded p-3 border border-cyan-500/20">
                    <p className="text-sm text-cyan-400">
                      💡 AI Recommendation: {risk.recommendation}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Mitigations */}
          {autoHedging && mitigations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                Recent Mitigations
              </h3>
              <div className="space-y-3">
                {mitigations.map((mit) => (
                  <motion.div
                    key={mit.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-500/10 rounded-lg p-3 border border-green-500/20"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white font-semibold">{mit.action}</p>
                        <p className="text-xs text-green-400">{mit.result}</p>
                      </div>
                      <span className="text-xs text-gray-500">{mit.timestamp}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Score */}
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-4 border border-orange-500/20">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-white">Overall Risk Score</h4>
              <Badge className={autoHedging ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                {autoHedging ? 'Protected' : 'Exposed'}
              </Badge>
            </div>
            <Progress value={autoHedging ? 25 : 75} className="h-2 mb-2" />
            <p className="text-xs text-gray-400">
              {autoHedging 
                ? 'AI actively monitoring and mitigating risks' 
                : 'Enable auto-hedging for automatic protection'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}