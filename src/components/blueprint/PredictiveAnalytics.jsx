import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Users, Target } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export class SocietyPredictor {
  constructor(society) {
    this.society = society;
    this.historicalData = [];
    this.predictions = null;
  }

  recordCurrentState() {
    if (!this.society) return;
    
    this.historicalData.push({
      timestamp: Date.now(),
      population: this.society.agents?.length || 0,
      resources: this.society.resources ? { ...this.society.resources } : { food: 0, water: 0 },
      conflicts: this.society.conflicts?.length || 0,
      alliances: this.society.alliances?.length || 0,
      avgReputation: this.getAvgReputation(),
      factionCount: this.society.factions?.length || 0
    });

    if (this.historicalData.length > 100) {
      this.historicalData = this.historicalData.slice(-100);
    }
  }

  getAvgReputation() {
    const agents = this.society.agents || [];
    if (agents.length === 0) return 50;
    return agents.reduce((sum, a) => sum + (a.reputation || 50), 0) / agents.length;
  }

  predictFuture(steps = 10) {
    if (this.historicalData.length < 5) {
      return { error: 'Insufficient historical data' };
    }

    const recent = this.historicalData.slice(-20);
    
    // Calculate trends
    const populationTrend = this.calculateTrend(recent, 'population');
    const resourceTrend = this.calculateTrend(recent, r => r.resources.food + r.resources.water);
    const conflictTrend = this.calculateTrend(recent, 'conflicts');
    const allianceTrend = this.calculateTrend(recent, 'alliances');

    const predictions = [];
    let current = recent[recent.length - 1];

    for (let i = 1; i <= steps; i++) {
      const predicted = {
        step: i,
        timestamp: Date.now() + (i * 5000),
        population: Math.max(0, current.population + populationTrend * i),
        resources: Math.max(0, (current.resources.food + current.resources.water) + resourceTrend * i),
        conflicts: Math.max(0, current.conflicts + conflictTrend * i),
        alliances: Math.max(0, current.alliances + allianceTrend * i),
        confidence: Math.max(0, 100 - (i * 8)) // Confidence decreases over time
      };

      predictions.push(predicted);
    }

    this.predictions = predictions;
    return this.analyzePredictions(predictions);
  }

  calculateTrend(data, accessor) {
    if (data.length < 2) return 0;
    
    const getValue = typeof accessor === 'function' ? accessor : (d) => d[accessor];
    const values = data.map(getValue);
    
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    const n = values.length;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  analyzePredictions(predictions) {
    const warnings = [];
    const opportunities = [];
    const trends = {};

    const finalState = predictions[predictions.length - 1];
    
    if (finalState.resources < 50) {
      warnings.push({ 
        type: 'resource_crisis', 
        severity: 'high',
        message: 'Resource scarcity predicted within ' + predictions.length + ' cycles',
        likelihood: 85
      });
    }

    if (finalState.conflicts > 10) {
      warnings.push({
        type: 'instability',
        severity: 'medium',
        message: 'Increasing conflict rate detected',
        likelihood: 70
      });
    }

    if (finalState.population > this.historicalData[this.historicalData.length - 1].population * 1.5) {
      opportunities.push({
        type: 'growth',
        message: 'Strong population growth trajectory',
        potential: 'expansion'
      });
    }

    if (finalState.alliances > finalState.conflicts * 2) {
      opportunities.push({
        type: 'stability',
        message: 'Alliance-driven peace predicted',
        potential: 'cooperation'
      });
    }

    trends.population = this.calculateTrend(predictions, 'population') > 0 ? 'growing' : 'declining';
    trends.resources = this.calculateTrend(predictions, 'resources') > 0 ? 'increasing' : 'depleting';
    trends.stability = finalState.conflicts < this.historicalData[this.historicalData.length - 1].conflicts ? 'improving' : 'degrading';

    return { predictions, warnings, opportunities, trends };
  }

  getEmergentBehaviorProbability() {
    const recent = this.historicalData.slice(-10);
    if (recent.length < 5) return {};

    const volatility = this.calculateVolatility(recent);
    const diversity = this.society.factions?.length || 1;
    const pressure = this.getEnvironmentalPressure();

    return {
      rebellion: Math.min(100, volatility * 0.5 + pressure * 0.3),
      innovation: Math.min(100, diversity * 10 + this.society.resources?.knowledge || 0),
      migration: Math.min(100, pressure * 0.6 + volatility * 0.2),
      cooperation: Math.min(100, (this.society.alliances?.length || 0) * 5 + (100 - pressure)),
      collapse: Math.min(100, pressure * 0.8 + volatility * 0.4)
    };
  }

  calculateVolatility(data) {
    if (data.length < 2) return 0;
    
    const changes = [];
    for (let i = 1; i < data.length; i++) {
      const change = Math.abs(data[i].conflicts - data[i-1].conflicts) + 
                     Math.abs(data[i].population - data[i-1].population);
      changes.push(change);
    }
    
    return changes.reduce((sum, c) => sum + c, 0) / changes.length;
  }

  getEnvironmentalPressure() {
    const current = this.historicalData[this.historicalData.length - 1];
    if (!current) return 0;

    const resourcePressure = Math.max(0, 100 - current.resources.food - current.resources.water);
    const conflictPressure = current.conflicts * 5;
    const populationPressure = current.population > 50 ? (current.population - 50) : 0;

    return Math.min(100, (resourcePressure + conflictPressure + populationPressure) / 3);
  }
}

export function PredictiveAnalyticsPanel({ society, agents }) {
  const [predictor] = useState(() => new SocietyPredictor(society || {}));
  const [analysis, setAnalysis] = useState(null);
  const [emergentProbs, setEmergentProbs] = useState(null);

  useEffect(() => {
    if (!society) return;
    
    const interval = setInterval(() => {
      predictor.society = society;
      predictor.recordCurrentState();
      
      const result = predictor.predictFuture(10);
      setAnalysis(result);
      
      const probs = predictor.getEmergentBehaviorProbability();
      setEmergentProbs(probs);
    }, 5000);

    return () => clearInterval(interval);
  }, [society, predictor]);

  if (!analysis || analysis.error) {
    return (
      <div className="text-white/60 text-sm">
        Collecting data for predictions... ({predictor.historicalData.length}/5 samples)
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trend Predictions */}
      <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <h4 className="text-blue-400 font-semibold">Future Trends</h4>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={analysis.predictions}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis dataKey="step" stroke="#ffffff60" />
            <YAxis stroke="#ffffff60" />
            <Tooltip contentStyle={{ backgroundColor: '#000000cc', border: '1px solid #ffffff30' }} />
            <Area type="monotone" dataKey="population" stroke="#00f5ff" fill="#00f5ff30" />
            <Area type="monotone" dataKey="resources" stroke="#10b981" fill="#10b98130" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-3 gap-2 mt-3">
          {Object.entries(analysis.trends).map(([key, value]) => (
            <div key={key} className="bg-white/5 rounded p-2">
              <div className="text-white/60 text-xs capitalize">{key}</div>
              <div className={`text-sm font-medium ${value.includes('ing') || value === 'improving' ? 'text-green-400' : 'text-red-400'}`}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warnings */}
      {analysis.warnings.length > 0 && (
        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h4 className="text-red-400 font-semibold">Predicted Warnings</h4>
          </div>
          <div className="space-y-2">
            {analysis.warnings.map((warning, i) => (
              <div key={i} className="bg-white/5 rounded p-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-white text-sm">{warning.message}</span>
                  <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-300 rounded">
                    {warning.likelihood}% likely
                  </span>
                </div>
                <div className="text-white/60 text-xs">Severity: {warning.severity}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergent Behavior Probabilities */}
      {emergentProbs && (
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-purple-400" />
            <h4 className="text-purple-400 font-semibold">Emergent Behavior Forecast</h4>
          </div>
          <div className="space-y-2">
            {Object.entries(emergentProbs).map(([behavior, probability]) => (
              <div key={behavior}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white capitalize">{behavior.replace('_', ' ')}</span>
                  <span className="text-purple-400">{probability.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${probability}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}