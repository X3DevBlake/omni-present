import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Shield, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StressTestVisualizer3D from '../components/defi/StressTestVisualizer3D';

export default function AdvancedDeFiRiskHub() {
  const queryClient = useQueryClient();
  const [testName, setTestName] = useState('Market Crash Scenario');
  const [scenarioType, setScenarioType] = useState('market_crash');

  const { data: stressTests } = useQuery({
    queryKey: ['stress-tests'],
    queryFn: () => base44.entities.PortfolioStressTest.list('-created_date', 20),
  });

  const { data: opportunities } = useQuery({
    queryKey: ['arbitrage-opportunities'],
    queryFn: () => base44.entities.ArbitrageOpportunity.filter({ status: 'detected' }, '-price_difference_percentage', 20),
  });

  const { data: hedges } = useQuery({
    queryKey: ['hedging-strategies'],
    queryFn: () => base44.entities.HedgingStrategy.list('', 20),
  });

  const runStressTest = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('runPortfolioStressTest', {
        test_name: testName,
        scenario_type: scenarioType,
        market_drop_percentage: 30,
        liquidity_reduction: 50
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stress-tests'] });
    }
  });

  const detectArbitrage = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('detectArbitrageOpportunities', {
        token_pairs: ['ETH/USDT', 'BTC/USDT'],
        min_profit_threshold: 50
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arbitrage-opportunities'] });
    }
  });

  const optimizeHedge = useMutation({
    mutationFn: async (strategyId) => {
      const response = await base44.functions.invoke('optimizeHedgingStrategy', {
        strategy_id: strategyId,
        market_conditions: { volatility: 'high', trend: 'bearish' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hedging-strategies'] });
    }
  });

  const highRiskTests = stressTests?.filter(t => t.risk_score > 70).length || 0;
  const profitableOpps = opportunities?.filter(o => o.estimated_profit > 100).length || 0;

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              Advanced DeFi Risk Hub
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Predictive stress testing, arbitrage detection, and AI-optimized hedging
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/30 p-4">
            <Shield className="w-6 h-6 text-red-400 mb-2" />
            <p className="text-white text-2xl font-bold">{stressTests?.length || 0}</p>
            <p className="text-white/60 text-sm">Stress Tests Run</p>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30 p-4">
            <AlertTriangle className="w-6 h-6 text-yellow-400 mb-2" />
            <p className="text-white text-2xl font-bold">{highRiskTests}</p>
            <p className="text-white/60 text-sm">High Risk Scenarios</p>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-4">
            <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-white text-2xl font-bold">{profitableOpps}</p>
            <p className="text-white/60 text-sm">Arbitrage Opportunities</p>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-4">
            <Activity className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-white text-2xl font-bold">{hedges?.length || 0}</p>
            <p className="text-white/60 text-sm">Active Hedges</p>
          </Card>
        </div>

        <Tabs defaultValue="stress" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/30 p-1">
            <TabsTrigger value="stress">Stress Testing</TabsTrigger>
            <TabsTrigger value="arbitrage">Arbitrage</TabsTrigger>
            <TabsTrigger value="hedging">Hedging</TabsTrigger>
            <TabsTrigger value="visualize">3D Visualizer</TabsTrigger>
          </TabsList>

          <TabsContent value="stress">
            <Card className="bg-black/40 border-white/10 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Run Portfolio Stress Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-white text-sm mb-2 block">Test Name</label>
                  <Input
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-white text-sm mb-2 block">Scenario Type</label>
                  <Select value={scenarioType} onValueChange={setScenarioType}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="market_crash">Market Crash</SelectItem>
                      <SelectItem value="liquidity_crisis">Liquidity Crisis</SelectItem>
                      <SelectItem value="protocol_failure">Protocol Failure</SelectItem>
                      <SelectItem value="cascading_liquidation">Cascading Liquidation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => runStressTest.mutate()}
                  disabled={runStressTest.isPending}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600"
                >
                  Run Stress Test
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              {stressTests?.map((test) => (
                <Card key={test.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-bold text-lg mb-2">{test.test_name}</h3>
                        <Badge className="bg-orange-500">{test.scenario_type}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-white/60 text-sm">Risk Score</div>
                        <div className={`text-2xl font-bold ${
                          test.risk_score > 70 ? 'text-red-400' :
                          test.risk_score > 40 ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {test.risk_score?.toFixed(0)}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-black/30 rounded p-3">
                        <div className="text-white/60 text-sm">Total Loss</div>
                        <div className="text-red-400 font-bold">
                          ${test.predicted_outcomes?.total_loss?.toFixed(0)}
                        </div>
                      </div>
                      <div className="bg-black/30 rounded p-3">
                        <div className="text-white/60 text-sm">Liquidation Risk</div>
                        <div className="text-orange-400 font-bold">
                          {test.predicted_outcomes?.liquidation_risk?.toFixed(0)}%
                        </div>
                      </div>
                      <div className="bg-black/30 rounded p-3">
                        <div className="text-white/60 text-sm">Recovery Time</div>
                        <div className="text-cyan-400 font-bold">
                          {test.predicted_outcomes?.recovery_time_days} days
                        </div>
                      </div>
                    </div>
                    {test.recommended_hedges?.length > 0 && (
                      <div className="bg-green-500/20 border border-green-500/30 rounded p-3">
                        <div className="text-green-300 text-sm mb-2">Recommended Hedges:</div>
                        <div className="flex flex-wrap gap-2">
                          {test.recommended_hedges.map((hedge, i) => (
                            <Badge key={i} className="bg-green-500">{hedge}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="arbitrage">
            <Card className="bg-black/40 border-white/10 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Detect Cross-Chain Arbitrage</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => detectArbitrage.mutate()}
                  disabled={detectArbitrage.isPending}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  Scan for Opportunities
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {opportunities?.map((opp) => (
                <Card key={opp.id} className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-green-500">{opp.token_pair}</Badge>
                      <div className="text-green-400 font-bold text-lg">
                        +${opp.estimated_profit?.toFixed(0)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Source</div>
                        <div className="text-white font-bold">{opp.source_chain}</div>
                        <div className="text-cyan-400 text-sm">${opp.source_price}</div>
                      </div>
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Target</div>
                        <div className="text-white font-bold">{opp.target_chain}</div>
                        <div className="text-cyan-400 text-sm">${opp.target_price}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-purple-500/20">
                        {opp.price_difference_percentage?.toFixed(2)}% spread
                      </Badge>
                      <Badge className={
                        opp.time_sensitivity > 70 ? 'bg-red-500' :
                        opp.time_sensitivity > 40 ? 'bg-yellow-500' : 'bg-green-500'
                      }>
                        Urgency: {opp.time_sensitivity?.toFixed(0)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hedging">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hedges?.map((hedge) => (
                <Card key={hedge.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-bold">{hedge.strategy_name}</h3>
                      <Badge className={hedge.is_active ? 'bg-green-500' : 'bg-gray-500'}>
                        {hedge.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Risk Reduction:</span>
                        <span className="text-green-400">{hedge.risk_reduction?.toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Cost:</span>
                        <span className="text-orange-400">${hedge.cost?.toFixed(0)}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => optimizeHedge.mutate(hedge.id)}
                      disabled={optimizeHedge.isPending}
                      size="sm"
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      AI Optimize
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="visualize">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">3D Stress Test Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <StressTestVisualizer3D stressTest={stressTests?.[0]} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}