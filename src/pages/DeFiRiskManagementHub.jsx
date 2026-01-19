import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Shield, AlertTriangle, TrendingDown, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RiskHeatmap3D from '../components/defi/RiskHeatmap3D';

export default function DeFiRiskManagementHub() {
  const queryClient = useQueryClient();
  const [protocolName, setProtocolName] = useState('Uniswap');

  const { data: assessments } = useQuery({
    queryKey: ['risk-assessments'],
    queryFn: () => base44.entities.DeFiRiskAssessment.list('-created_date', 20),
  });

  const { data: hedgingStrategies } = useQuery({
    queryKey: ['hedging-strategies'],
    queryFn: () => base44.entities.HedgingStrategy.list(),
  });

  const assessRisk = useMutation({
    mutationFn: async (params) => {
      const response = await base44.functions.invoke('assessProtocolRisk', params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk-assessments', 'hedging-strategies'] });
    },
  });

  const avgRiskScore = React.useMemo(() => {
    if (!assessments || assessments.length === 0) return 0;
    return assessments.reduce((sum, a) => sum + (a.risk_score || 0), 0) / assessments.length;
  }, [assessments]);

  const criticalAnomalies = React.useMemo(() => {
    if (!assessments) return 0;
    return assessments.reduce((sum, a) => 
      sum + (a.anomalies_detected?.filter(an => an.severity === 'critical').length || 0), 0
    );
  }, [assessments]);

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              DeFi Risk Management
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            AI-driven risk assessment, anomaly detection, and automated hedging
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/30 p-4">
            <AlertTriangle className="w-6 h-6 text-red-400 mb-2" />
            <p className="text-white text-2xl font-bold">{avgRiskScore.toFixed(0)}</p>
            <p className="text-white/60 text-sm">Avg Risk Score</p>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border-orange-500/30 p-4">
            <Activity className="w-6 h-6 text-orange-400 mb-2" />
            <p className="text-white text-2xl font-bold">{criticalAnomalies}</p>
            <p className="text-white/60 text-sm">Critical Anomalies</p>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 p-4">
            <Shield className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-white text-2xl font-bold">{hedgingStrategies?.length || 0}</p>
            <p className="text-white/60 text-sm">Active Hedges</p>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-4">
            <TrendingDown className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-white text-2xl font-bold">
              {hedgingStrategies?.reduce((sum, h) => sum + (h.risk_reduction || 0), 0).toFixed(0)}%
            </p>
            <p className="text-white/60 text-sm">Risk Reduction</p>
          </Card>
        </div>

        <Tabs defaultValue="assess" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/30 p-1">
            <TabsTrigger value="assess">Risk Assessment</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
            <TabsTrigger value="hedging">Hedging</TabsTrigger>
            <TabsTrigger value="heatmap">Risk Heatmap 3D</TabsTrigger>
          </TabsList>

          <TabsContent value="assess">
            <Card className="bg-black/40 border-white/10 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Assess Protocol Risk</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-white text-sm mb-2 block">Protocol Name</label>
                  <Input
                    value={protocolName}
                    onChange={(e) => setProtocolName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Enter protocol name"
                  />
                </div>

                <Button
                  onClick={() => assessRisk.mutate({ protocol_name: protocolName })}
                  disabled={assessRisk.isPending}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {assessRisk.isPending ? 'Analyzing...' : 'Assess Risk'}
                </Button>

                {assessRisk.data && (
                  <div className={`${
                    assessRisk.data.risk_score > 70 ? 'bg-red-500/20 border-red-500/30' :
                    assessRisk.data.risk_score > 40 ? 'bg-orange-500/20 border-orange-500/30' :
                    'bg-green-500/20 border-green-500/30'
                  } border rounded-lg p-6`}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-black/30 rounded p-3">
                        <div className="text-white/60 text-sm mb-1">Risk Score</div>
                        <div className={`text-3xl font-bold ${
                          assessRisk.data.risk_score > 70 ? 'text-red-400' :
                          assessRisk.data.risk_score > 40 ? 'text-orange-400' : 'text-green-400'
                        }`}>
                          {assessRisk.data.risk_score.toFixed(0)}
                        </div>
                      </div>
                      <div className="bg-black/30 rounded p-3">
                        <div className="text-white/60 text-sm mb-1">Confidence</div>
                        <div className="text-cyan-400 text-3xl font-bold">
                          {assessRisk.data.confidence.toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    {assessRisk.data.anomalies > 0 && (
                      <Badge className="bg-red-500 mb-2">
                        {assessRisk.data.anomalies} Anomalies Detected
                      </Badge>
                    )}

                    {assessRisk.data.hedging_strategy && (
                      <div className="mt-4 bg-blue-500/20 border border-blue-500/30 rounded p-4">
                        <p className="text-blue-300 font-bold mb-2">Hedging Strategy Generated</p>
                        <p className="text-white/80 text-sm">
                          Risk Reduction: {assessRisk.data.hedging_strategy.risk_reduction?.toFixed(0)}%
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessments?.slice(0, 6).map((assessment, i) => (
                <Card key={assessment.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-bold">{assessment.protocol_name}</h3>
                      <Badge className={`${
                        assessment.risk_score > 70 ? 'bg-red-500' :
                        assessment.risk_score > 40 ? 'bg-orange-500' : 'bg-green-500'
                      } text-white`}>
                        Risk: {assessment.risk_score.toFixed(0)}
                      </Badge>
                    </div>

                    <div className="bg-black/30 rounded p-3">
                      <div className="text-white/60 text-xs mb-2">Anomalies</div>
                      {assessment.anomalies_detected?.slice(0, 2).map((anomaly, j) => (
                        <div key={j} className="text-white text-xs mb-1">
                          • {anomaly.anomaly_type} ({anomaly.severity})
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="anomalies">
            <div className="space-y-4">
              {assessments?.map((assessment, i) => 
                assessment.anomalies_detected?.map((anomaly, j) => (
                  <Card key={`${i}-${j}`} className="bg-white/5 border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-bold">{assessment.protocol_name}</h3>
                        <Badge className={`${
                          anomaly.severity === 'critical' ? 'bg-red-500' :
                          anomaly.severity === 'high' ? 'bg-orange-500' :
                          anomaly.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                        } text-white`}>
                          {anomaly.severity}
                        </Badge>
                      </div>
                      <p className="text-white/80 text-sm mb-2">{anomaly.description}</p>
                      <p className="text-white/60 text-xs">
                        Type: {anomaly.anomaly_type}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="hedging">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hedgingStrategies?.map((strategy, i) => (
                <Card key={strategy.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold">{strategy.strategy_name}</h3>
                      <Badge className={strategy.is_active ? 'bg-green-500' : 'bg-gray-500'}>
                        {strategy.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Risk Reduction</div>
                        <div className="text-green-400 font-bold">{strategy.risk_reduction?.toFixed(0)}%</div>
                      </div>
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Cost</div>
                        <div className="text-orange-400 font-bold">{strategy.cost?.toFixed(2)}</div>
                      </div>
                    </div>

                    <div className="bg-blue-500/20 border border-blue-500/30 rounded p-2">
                      <div className="text-blue-300 text-xs">Protected Assets:</div>
                      <div className="text-white text-sm">{strategy.protected_assets?.join(', ')}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="heatmap">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Risk Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                <RiskHeatmap3D assessments={assessments} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}