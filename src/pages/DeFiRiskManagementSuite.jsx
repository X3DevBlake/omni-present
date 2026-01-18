import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Shield, TrendingDown, TrendingUp, Activity, Zap } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import RiskHeatmap3D from '../components/3d/RiskHeatmap3D';
import PortfolioStress3D from '../components/3d/PortfolioStress3D';

export default function DeFiRiskManagementSuite() {
  const [autoHedging, setAutoHedging] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: assets = [] } = useQuery({
    queryKey: ['cryptoAssets', user?.email],
    queryFn: () => base44.entities.CryptoAsset.filter({ user_email: user?.email }),
    enabled: !!user
  });

  const { data: pools = [] } = useQuery({
    queryKey: ['liquidityPools', user?.email],
    queryFn: () => base44.entities.LiquidityPool.filter({ user_email: user?.email }),
    enabled: !!user
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['riskAlerts'],
    queryFn: () => base44.entities.ProactiveAlert.filter({ 
      alert_type: { $in: ['security_threat', 'risk_exposure'] },
      status: 'active'
    })
  });

  const stressTestMutation = useMutation({
    mutationFn: () => base44.functions['defi/portfolio-stress-testing']({ 
      user_email: user?.email 
    }),
    onSuccess: (data) => {
      toast.success('Stress test completed');
      queryClient.invalidateQueries(['riskAlerts']);
    }
  });

  const riskIdentificationMutation = useMutation({
    mutationFn: () => base44.functions['defi/proactive-risk-identification']({ 
      user_email: user?.email 
    }),
    onSuccess: (data) => {
      toast.success(`${data.risks_identified.length} risks identified`);
      queryClient.invalidateQueries(['riskAlerts']);
    }
  });

  const hedgeMutation = useMutation({
    mutationFn: async (strategy) => {
      return base44.entities.TradeExecution.create({
        user_email: user?.email,
        from_token: strategy.from_token,
        to_token: strategy.to_token,
        input_amount: strategy.amount,
        status: 'pending',
        trade_type: 'hedge'
      });
    },
    onSuccess: () => {
      toast.success('Hedge position executed');
      queryClient.invalidateQueries(['cryptoAssets']);
    }
  });

  const totalValue = assets.reduce((sum, a) => sum + (a.balance * (a.current_price || 0)), 0);
  const poolValue = pools.reduce((sum, p) => sum + p.amount_deposited, 0);
  const totalExposure = totalValue + poolValue;

  const criticalAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'high');

  const riskDistribution = [
    { name: 'Smart Contract', value: 25, color: '#ef4444' },
    { name: 'Impermanent Loss', value: 35, color: '#f59e0b' },
    { name: 'Market Volatility', value: 20, color: '#eab308' },
    { name: 'Liquidity Risk', value: 15, color: '#10b981' },
    { name: 'Other', value: 5, color: '#6b7280' }
  ];

  const mockStressScenarios = [
    { scenario: 'Market Crash -50%', impact: -45, recovery: 180 },
    { scenario: 'Flash Crash', impact: -25, recovery: 7 },
    { scenario: 'Depegging Event', impact: -30, recovery: 45 },
    { scenario: 'Smart Contract Exploit', impact: -100, recovery: 0 },
    { scenario: 'Regulatory Action', impact: -35, recovery: 90 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-orange-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-white mb-2">DeFi Risk Management Suite</h1>
          <p className="text-slate-400">Comprehensive portfolio protection and risk mitigation</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Total Exposure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">${totalExposure.toFixed(0)}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Critical Risks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{criticalAlerts.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                LP Positions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">{pools.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Auto-Hedge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={autoHedging ? 'default' : 'secondary'}>
                {autoHedging ? 'Active' : 'Inactive'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">3D Risk Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <RiskHeatmap3D risks={criticalAlerts} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Portfolio Stress Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <PortfolioStress3D scenarios={mockStressScenarios} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={(entry) => entry.name}
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Stress Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockStressScenarios}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="scenario" stroke="#94a3b8" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                  <Bar dataKey="impact" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              Risk Management Actions
              <div className="flex gap-2">
                <Button
                  onClick={() => stressTestMutation.mutate()}
                  disabled={stressTestMutation.isPending}
                  variant="outline"
                >
                  Run Stress Test
                </Button>
                <Button
                  onClick={() => riskIdentificationMutation.mutate()}
                  disabled={riskIdentificationMutation.isPending}
                >
                  Scan Risks
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalAlerts.map(alert => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-red-900/20 border border-red-700/30 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <h3 className="text-white font-semibold">{alert.title}</h3>
                        <Badge variant="destructive">{alert.severity}</Badge>
                      </div>
                      <p className="text-slate-400 text-sm">{alert.description}</p>
                    </div>
                  </div>
                  {alert.suggested_actions && alert.suggested_actions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-red-700/30">
                      <p className="text-sm text-slate-400 mb-2">Suggested Actions:</p>
                      <div className="flex flex-wrap gap-2">
                        {alert.suggested_actions.map((action, i) => (
                          <Button
                            key={i}
                            size="sm"
                            variant="outline"
                            onClick={() => hedgeMutation.mutate({ 
                              from_token: 'ETH', 
                              to_token: 'USDC', 
                              amount: 100 
                            })}
                          >
                            {action}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}