import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { TrendingUp, Activity, AlertTriangle, Target, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AuroraBackground from '../components/omni/AuroraBackground';
import { toast } from 'sonner';

export default function PredictiveAnalyticsHub() {
  const [userEmail, setUserEmail] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('agent_performance');

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const runPrediction = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/functions/predictive-analytics-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataPoints: mockHistoricalData,
          predictionTarget: selectedMetric,
          timeHorizon: 30,
          userEmail
        })
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast.success('Prediction generated');
    }
  });

  const runPrescriptive = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/functions/prescriptive-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentState: { performance: 75, efficiency: 82 },
          goals: [{ metric: 'performance', target: 90 }],
          constraints: { budget: 10000, time: 60 },
          userEmail
        })
      });
      return response.json();
    }
  });

  const mockHistoricalData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    value: 70 + Math.random() * 20 + i * 0.5
  }));

  const mockForecast = Array.from({ length: 10 }, (_, i) => ({
    day: 31 + i,
    predicted: 85 + Math.random() * 10,
    lower: 80 + Math.random() * 5,
    upper: 90 + Math.random() * 5
  }));

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Predictive Analytics
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            AI-powered forecasting and prescriptive recommendations
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Forecast Accuracy</p>
                <p className="text-white text-2xl font-bold">94.3%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-cyan-400" />
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Active Predictions</p>
                <p className="text-white text-2xl font-bold">28</p>
              </div>
              <Activity className="w-8 h-8 text-purple-400" />
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Risk Alerts</p>
                <p className="text-white text-2xl font-bold">3</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-400" />
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Goals on Track</p>
                <p className="text-white text-2xl font-bold">12/15</p>
              </div>
              <Target className="w-8 h-8 text-green-400" />
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-black/40 border-white/10 p-6">
            <h3 className="text-white font-bold mb-4">Performance Forecast</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[...mockHistoricalData, ...mockForecast]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="day" stroke="#ffffff60" />
                <YAxis stroke="#ffffff60" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#00f5ff" name="Historical" />
                <Line type="monotone" dataKey="predicted" stroke="#a855f7" name="Predicted" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="lower" stroke="#ffffff40" name="Lower Bound" strokeDasharray="2 2" />
                <Line type="monotone" dataKey="upper" stroke="#ffffff40" name="Upper Bound" strokeDasharray="2 2" />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => runPrediction.mutate()}
                disabled={runPrediction.isPending}
                className="bg-gradient-to-r from-cyan-500 to-blue-500"
              >
                <Zap className="w-4 h-4 mr-2" />
                Generate Forecast
              </Button>
            </div>
          </Card>

          <Card className="bg-black/40 border-white/10 p-6">
            <h3 className="text-white font-bold mb-4">Prescriptive Actions</h3>
            <div className="space-y-3">
              {runPrescriptive.data?.prescriptions?.action_plan?.slice(0, 5).map((action, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold text-sm">{action.action}</h4>
                    <span className="text-cyan-400 text-xs">Priority {action.priority}</span>
                  </div>
                  <p className="text-white/60 text-xs mb-2">{action.expected_outcome}</p>
                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <span>Impact: {(action.impact_score * 100).toFixed(0)}%</span>
                    <span>Timeline: {action.timeline}</span>
                  </div>
                </motion.div>
              )) || (
                <div className="text-center py-8">
                  <p className="text-white/60 mb-4">Generate AI recommendations for optimal actions</p>
                  <Button
                    onClick={() => runPrescriptive.mutate()}
                    disabled={runPrescriptive.isPending}
                    className="bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    Generate Recommendations
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AuroraBackground>
  );
}