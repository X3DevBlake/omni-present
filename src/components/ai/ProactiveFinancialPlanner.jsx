import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Sparkles, DollarSign, Calendar, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function ProactiveFinancialPlanner() {
  const [predictions, setPredictions] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate AI analysis
    setTimeout(() => {
      setPredictions([
        {
          id: 1,
          type: 'expense_spike',
          title: 'Upcoming Expense Increase',
          description: 'Based on your spending patterns, your utilities will likely increase by 15% next month due to seasonal changes.',
          impact: 'high',
          date: 'Feb 2026',
          action: 'Set aside $150 extra',
          confidence: 87
        },
        {
          id: 2,
          type: 'income_opportunity',
          title: 'Freelance Income Potential',
          description: 'Your skills match 12 high-paying freelance opportunities. Estimated extra income: $2,500/month.',
          impact: 'high',
          date: 'Next 3 months',
          action: 'Explore opportunities',
          confidence: 92
        },
        {
          id: 3,
          type: 'savings_goal',
          title: 'Emergency Fund Goal at Risk',
          description: 'Current trajectory shows you\'ll miss your 6-month emergency fund goal by 3 months. Adjust savings by $200/month.',
          impact: 'medium',
          date: 'Jun 2026',
          action: 'Increase savings rate',
          confidence: 78
        }
      ]);

      setOpportunities([
        {
          id: 1,
          title: 'High-Yield Savings Account',
          description: 'Switch to a 5.2% APY account and earn $340 more per year',
          potential_gain: 340,
          effort: 'low',
          icon: TrendingUp
        },
        {
          id: 2,
          title: 'Subscription Audit',
          description: 'Cancel 3 underused subscriptions to save $468 annually',
          potential_gain: 468,
          effort: 'low',
          icon: DollarSign
        },
        {
          id: 3,
          title: 'Tax Optimization',
          description: 'Maximize 401(k) contributions for $1,200 tax savings',
          potential_gain: 1200,
          effort: 'medium',
          icon: Target
        }
      ]);

      setLoading(false);
    }, 1500);
  }, []);

  const impactColors = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30'
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-white/10">
        <CardContent className="p-8 flex items-center justify-center">
          <div className="text-center">
            <Sparkles className="w-12 h-12 text-cyan-400 animate-pulse mx-auto mb-4" />
            <p className="text-white">AI analyzing your financial data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            AI Financial Planning Assistant
          </CardTitle>
          <p className="text-sm text-gray-400">Predicting your future needs and opportunities</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Predictions */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              Future Predictions
            </h3>
            <div className="space-y-4">
              {predictions.map((prediction) => (
                <motion.div
                  key={prediction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-black/40 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white">{prediction.title}</h4>
                        <Badge className={impactColors[prediction.impact]}>
                          {prediction.impact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{prediction.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>📅 {prediction.date}</span>
                        <span>💡 {prediction.action}</span>
                      </div>
                    </div>
                    {prediction.impact === 'high' && (
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>AI Confidence</span>
                      <span>{prediction.confidence}%</span>
                    </div>
                    <Progress value={prediction.confidence} className="h-1" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Opportunities */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Identified Opportunities
            </h3>
            <div className="grid gap-4">
              {opportunities.map((opp) => (
                <motion.div
                  key={opp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/40 rounded-lg p-4 border border-white/10 hover:border-cyan-400/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400/20 to-blue-500/20 flex items-center justify-center">
                        <opp.icon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">{opp.title}</h4>
                        <p className="text-sm text-gray-400 mb-2">{opp.description}</p>
                        <div className="flex items-center gap-4">
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            +${opp.potential_gain}/year
                          </Badge>
                          <Badge variant="outline" className="border-white/20 text-gray-400">
                            {opp.effort} effort
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600">
                      Act Now
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg p-4 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-cyan-400" />
              <h4 className="font-semibold text-white">Total Potential Annual Savings</h4>
            </div>
            <p className="text-3xl font-bold text-cyan-400">
              ${opportunities.reduce((sum, opp) => sum + opp.potential_gain, 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              By implementing all AI recommendations
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}