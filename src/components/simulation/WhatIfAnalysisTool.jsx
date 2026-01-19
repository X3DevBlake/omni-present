import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function WhatIfAnalysisTool() {
  const [selectedSimulation, setSelectedSimulation] = useState('');
  const [marketVolatility, setMarketVolatility] = useState([50]);
  const [resourceAvailability, setResourceAvailability] = useState([50]);
  const [agentCount, setAgentCount] = useState([5]);
  const [comparisonData, setComparisonData] = useState(null);

  const { data: completedSims } = useQuery({
    queryKey: ['completed-sims-analysis'],
    queryFn: async () => {
      const sims = await base44.entities.Simulation.filter({ status: 'completed' });
      return sims;
    },
  });

  const runWhatIfAnalysis = () => {
    const original = Array.from({ length: 50 }, (_, i) => ({
      step: i,
      original: 70 + Math.sin(i * 0.2) * 15,
      modified: 70 + Math.sin(i * 0.2) * 15 * (marketVolatility[0] / 50) + (resourceAvailability[0] - 50) * 0.3,
    }));

    setComparisonData(original);
  };

  const impact = React.useMemo(() => {
    if (!comparisonData) return null;
    const originalAvg = comparisonData.reduce((sum, d) => sum + d.original, 0) / comparisonData.length;
    const modifiedAvg = comparisonData.reduce((sum, d) => sum + d.modified, 0) / comparisonData.length;
    const diff = modifiedAvg - originalAvg;
    return {
      value: diff.toFixed(1),
      percentage: ((diff / originalAvg) * 100).toFixed(1),
      positive: diff > 0,
    };
  }, [comparisonData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">What-If Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-white text-sm mb-2 block">Base Simulation</label>
            <Select value={selectedSimulation} onValueChange={setSelectedSimulation}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select completed simulation" />
              </SelectTrigger>
              <SelectContent>
                {completedSims?.map((sim) => (
                  <SelectItem key={sim.id} value={sim.id}>
                    Simulation #{sim.id.slice(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-white text-sm mb-2 block">
              Market Volatility: {marketVolatility[0]}%
            </label>
            <Slider
              value={marketVolatility}
              onValueChange={setMarketVolatility}
              min={0}
              max={100}
              step={5}
            />
          </div>

          <div>
            <label className="text-white text-sm mb-2 block">
              Resource Availability: {resourceAvailability[0]}%
            </label>
            <Slider
              value={resourceAvailability}
              onValueChange={setResourceAvailability}
              min={0}
              max={100}
              step={5}
            />
          </div>

          <div>
            <label className="text-white text-sm mb-2 block">
              Agent Count: {agentCount[0]}
            </label>
            <Slider
              value={agentCount}
              onValueChange={setAgentCount}
              min={1}
              max={20}
              step={1}
            />
          </div>

          <Button
            onClick={runWhatIfAnalysis}
            className="w-full bg-cyan-600 hover:bg-cyan-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Run Analysis
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Comparative Results</CardTitle>
        </CardHeader>
        <CardContent>
          {comparisonData ? (
            <>
              {impact && (
                <div className={`rounded-lg p-4 mb-6 ${
                  impact.positive ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {impact.positive ? (
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                    <h4 className={`font-bold ${impact.positive ? 'text-green-400' : 'text-red-400'}`}>
                      {impact.positive ? '+' : ''}{impact.percentage}% Performance Change
                    </h4>
                  </div>
                  <p className="text-white/70 text-sm">
                    Modified parameters would result in {Math.abs(impact.value)} point {impact.positive ? 'improvement' : 'decrease'} in average efficiency.
                  </p>
                </div>
              )}

              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="step" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #ffffff20',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="original"
                    stroke="#666"
                    strokeWidth={2}
                    name="Original"
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="modified"
                    stroke="#00f5ff"
                    strokeWidth={3}
                    name="Modified Scenario"
                  />
                </LineChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div className="text-center py-12">
              <RefreshCw className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">Configure parameters and run analysis to see comparison</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}