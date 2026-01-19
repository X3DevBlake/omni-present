import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import ForecastVisualizer3D from './ForecastVisualizer3D';

export default function PredictiveForecastPanel() {
  const [metric, setMetric] = useState('efficiency');
  const [forecastDays, setForecastDays] = useState(7);
  const [forecastData, setForecastData] = useState(null);

  const generateForecast = useMutation({
    mutationFn: async ({ metric, days }) => {
      const response = await base44.functions.invoke('generatePredictiveForecasts', {
        metric_type: metric,
        forecast_days: days,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setForecastData(data);
    },
  });

  const getTrendIcon = (direction) => {
    if (direction === 'increasing') return <TrendingUp className="w-5 h-5 text-green-400" />;
    if (direction === 'decreasing') return <TrendingDown className="w-5 h-5 text-red-400" />;
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Predictive KPI Forecasting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white text-sm mb-2 block">Metric to Forecast</label>
              <Select value={metric} onValueChange={setMetric}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efficiency">Efficiency</SelectItem>
                  <SelectItem value="success_rate">Success Rate</SelectItem>
                  <SelectItem value="average_response_time">Response Time</SelectItem>
                  <SelectItem value="resource_utilization">Resource Utilization</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white text-sm mb-2 block">Forecast Period</label>
              <Select value={forecastDays.toString()} onValueChange={(val) => setForecastDays(parseInt(val))}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={() => generateForecast.mutate({ metric, days: forecastDays })}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Generate Forecast
          </Button>

          {forecastData && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-white/60 text-xs mb-1">Current Value</div>
                  <div className="text-white text-2xl font-bold">
                    {forecastData.current_value?.toFixed(1)}
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-white/60 text-xs mb-1">Trend</div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(forecastData.trend?.direction)}
                    <span className="text-white font-bold capitalize">
                      {forecastData.trend?.strength}
                    </span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-white/60 text-xs mb-1">Predicted (Day {forecastDays})</div>
                  <div className="text-white text-2xl font-bold">
                    {forecastData.forecast?.[forecastDays - 1]?.predicted_value?.toFixed(1)}
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={forecastData.forecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="day" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #ffffff20',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="predicted_value"
                    stroke="#a855f7"
                    fill="#a855f7"
                    fillOpacity={0.3}
                    name="Predicted Value"
                  />
                  <Line
                    type="monotone"
                    dataKey="confidence"
                    stroke="#00f5ff"
                    strokeWidth={2}
                    name="Confidence"
                    yAxisId="right"
                  />
                </AreaChart>
              </ResponsiveContainer>

              {forecastData.recommendations?.length > 0 && (
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                  <h4 className="text-cyan-200 font-medium mb-2">Recommendations</h4>
                  <div className="space-y-2">
                    {forecastData.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5" />
                        <div>
                          <p className="text-white text-sm">{rec.action}</p>
                          <p className="text-cyan-200 text-xs">{rec.expected_impact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">3D Forecast Projection</CardTitle>
        </CardHeader>
        <CardContent>
          <ForecastVisualizer3D data={forecastData} />
        </CardContent>
      </Card>
    </div>
  );
}