import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CollaborationHealthDashboard({ networks, transfers, coordinations, onAnalyze, isAnalyzing }) {
  const avgNetworkHealth = networks.reduce((acc, n) => acc + (n.network_health || 0), 0) / Math.max(networks.length, 1);
  const successfulTransfers = transfers.filter(t => t.transfer_status === 'completed').length;
  const transferSuccessRate = transfers.length > 0 ? (successfulTransfers / transfers.length * 100) : 0;

  const healthyNetworks = networks.filter(n => n.network_health >= 80);
  const warningNetworks = networks.filter(n => n.network_health >= 50 && n.network_health < 80);
  const criticalNetworks = networks.filter(n => n.network_health < 50);

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Collaboration Health Overview</CardTitle>
            <Button
              onClick={onAnalyze}
              disabled={isAnalyzing}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
              Analyze
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-32 h-32">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#1e293b"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#22d3ee"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - avgNetworkHealth / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {Math.round(avgNetworkHealth)}
                </span>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-2">Network Health Score</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-slate-400 text-sm">{healthyNetworks.length} Healthy Networks</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span className="text-slate-400 text-sm">{warningNetworks.length} Warning Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-slate-400 text-sm">{criticalNetworks.length} Critical Status</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/60 border-slate-700">
          <CardContent className="p-4">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-slate-400 text-xs mb-1">Transfer Success Rate</p>
              <p className="text-white text-2xl font-bold">{Math.round(transferSuccessRate)}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-700">
          <CardContent className="p-4">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <p className="text-slate-400 text-xs mb-1">Active Coordinations</p>
              <p className="text-white text-2xl font-bold">
                {coordinations.filter(c => c.status === 'active').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-700">
          <CardContent className="p-4">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-slate-400 text-xs mb-1">Avg Efficiency</p>
              <p className="text-white text-2xl font-bold">
                {Math.round(coordinations.reduce((acc, c) => acc + (c.progress_metrics?.efficiency_rating || 0), 0) / Math.max(coordinations.length, 1))}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Networks */}
      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Top Performing Networks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {networks
              .sort((a, b) => (b.network_health || 0) - (a.network_health || 0))
              .slice(0, 5)
              .map((network, idx) => (
                <motion.div
                  key={network.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium text-sm">{network.network_name}</p>
                    <p className="text-slate-400 text-xs">
                      {network.participants?.length || 0} participants • {network.network_type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={
                      network.network_health >= 80 ? 'bg-green-500/20 text-green-400' :
                      network.network_health >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }>
                      {Math.round(network.network_health || 0)}%
                    </Badge>
                  </div>
                </motion.div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}