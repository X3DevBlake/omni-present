import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, AlertTriangle, TrendingDown } from 'lucide-react';

export default function AnomalyReplayVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);

  const anomalies = [
    {
      id: 1,
      timestamp: '14:32:45',
      type: 'Market Spike',
      severity: 'critical',
      agent: 'Trader Agent 1',
      description: 'Unexpected 15% price jump detected',
      impact: 'Triggered emergency stop-loss',
    },
    {
      id: 2,
      timestamp: '14:35:12',
      type: 'Communication Breakdown',
      severity: 'high',
      agent: 'Multi-Agent Team',
      description: 'Loss of sync between agents for 2.3s',
      impact: 'Agents resumed after timeout',
    },
    {
      id: 3,
      timestamp: '14:38:20',
      type: 'Resource Exhaustion',
      severity: 'medium',
      agent: 'Computing Cluster',
      description: 'Memory usage spiked to 92%',
      impact: 'Garbage collection triggered',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Timeline Controls */}
      <Card className="bg-black/40 border-white/10 p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              className={isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
            <span className="text-white font-mono">
              {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
            </span>
          </div>

          {/* Timeline slider */}
          <div className="bg-white/5 rounded-lg p-4">
            <input
              type="range"
              min="0"
              max="300"
              value={currentTime}
              onChange={(e) => setCurrentTime(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-white/40 text-xs mt-2">
              <span>Start</span>
              <span>Middle</span>
              <span>End</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Anomalies Timeline */}
      <div className="space-y-3">
        {anomalies.map((anomaly, idx) => {
          const isSelected = selectedAnomaly?.id === anomaly.id;
          return (
            <motion.div
              key={anomaly.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card
                onClick={() => setSelectedAnomaly(isSelected ? null : anomaly)}
                className={`p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-red-500/20 border-red-500/50'
                    : 'bg-black/40 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <AlertTriangle
                    className={`w-5 h-5 mt-1 flex-shrink-0 ${
                      anomaly.severity === 'critical'
                        ? 'text-red-400'
                        : anomaly.severity === 'high'
                        ? 'text-orange-400'
                        : 'text-yellow-400'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold">{anomaly.type}</h4>
                      <Badge
                        className={`${
                          anomaly.severity === 'critical'
                            ? 'bg-red-500/30 text-red-300'
                            : anomaly.severity === 'high'
                            ? 'bg-orange-500/30 text-orange-300'
                            : 'bg-yellow-500/30 text-yellow-300'
                        }`}
                      >
                        {anomaly.severity}
                      </Badge>
                    </div>
                    <p className="text-white/60 text-sm mb-1">{anomaly.agent}</p>
                    <p className="text-white/50 text-xs">{anomaly.timestamp}</p>

                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 pt-3 border-t border-white/10 space-y-1"
                      >
                        <p className="text-white/80 text-sm">
                          <strong>Event:</strong> {anomaly.description}
                        </p>
                        <p className="text-white/80 text-sm">
                          <strong>Impact:</strong> {anomaly.impact}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}