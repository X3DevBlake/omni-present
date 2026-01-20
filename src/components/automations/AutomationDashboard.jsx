import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, TrendingUp, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import AutomationNetwork3D from './AutomationNetwork3D';

export default function AutomationDashboard() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: metrics = [] } = useQuery({
    queryKey: ['automation-metrics'],
    queryFn: () => base44.entities.AutomationMetrics.list('-execution_count', 100),
    initialData: []
  });

  const handleNodeClick = (automation) => {
    toast.info(`${automation.automation_name}: ${automation.execution_count} executions`, {
      description: `Success rate: ${((automation.success_count / (automation.execution_count || 1)) * 100).toFixed(0)}%`
    });
  };

  const filteredMetrics = selectedCategory === 'all' 
    ? metrics 
    : metrics.filter(m => m.category === selectedCategory);

  const stats = {
    total: metrics.length,
    active: metrics.filter(m => m.is_active).length,
    totalExecutions: metrics.reduce((sum, m) => sum + (m.execution_count || 0), 0),
    successRate: metrics.length > 0
      ? (metrics.reduce((sum, m) => sum + (m.success_count || 0), 0) / 
         metrics.reduce((sum, m) => sum + (m.execution_count || 1), 0)) * 100
      : 0
  };

  const categoryStats = {
    mlops: metrics.filter(m => m.category === 'mlops').length,
    agent_orchestration: metrics.filter(m => m.category === 'agent_orchestration').length,
    financial: metrics.filter(m => m.category === 'financial').length,
    communication: metrics.filter(m => m.category === 'communication').length,
    system: metrics.filter(m => m.category === 'system').length
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Total Automations</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <Zap className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Active</p>
                <p className="text-3xl font-bold text-white">{stats.active}</p>
              </div>
              <Activity className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Total Executions</p>
                <p className="text-3xl font-bold text-white">{stats.totalExecutions}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Success Rate</p>
                <p className="text-3xl font-bold text-white">{stats.successRate.toFixed(0)}%</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/10 border-white/20 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white">Automation Network Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <AutomationNetwork3D automations={filteredMetrics} onNodeClick={handleNodeClick} />
        </CardContent>
      </Card>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="bg-white/10">
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="mlops">MLOps ({categoryStats.mlops})</TabsTrigger>
          <TabsTrigger value="agent_orchestration">Agents ({categoryStats.agent_orchestration})</TabsTrigger>
          <TabsTrigger value="financial">Financial ({categoryStats.financial})</TabsTrigger>
          <TabsTrigger value="communication">Comm ({categoryStats.communication})</TabsTrigger>
          <TabsTrigger value="system">System ({categoryStats.system})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {filteredMetrics.map((metric) => (
              <Card key={metric.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-white text-sm">{metric.automation_name}</CardTitle>
                    <Badge variant={metric.is_active ? 'default' : 'secondary'}>
                      {metric.is_active ? 'Active' : 'Paused'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Executions</span>
                    <span className="text-white font-medium">{metric.execution_count || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Success</span>
                    <span className="text-green-400">{metric.success_count || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Failed</span>
                    <span className="text-red-400">{metric.failure_count || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Avg Duration</span>
                    <span className="text-white">{metric.avg_duration_ms || 0}ms</span>
                  </div>
                  {metric.last_status === 'failed' && metric.last_error && (
                    <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
                      {metric.last_error}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}