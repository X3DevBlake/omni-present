import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

export default function TelemetryTimeline({ onScrub }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [historicalData, setHistoricalData] = useState([]);

  useEffect(() => {
    // Generate simulated historical data
    const data = Array.from({ length: 100 }, (_, i) => ({
      time: i,
      cpuLoad: 30 + Math.sin(i * 0.1) * 20 + Math.random() * 10,
      gpuLoad: 60 + Math.cos(i * 0.15) * 25 + Math.random() * 10,
      networkTraffic: 200 + Math.sin(i * 0.2) * 150,
      anomaly: i === 45 || i === 78, // Simulate anomalies
    }));
    setHistoricalData(data);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = (prev + 1) % historicalData.length;
        if (historicalData[next]) {
          onScrub?.(historicalData[next]);
        }
        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isPlaying, historicalData, onScrub]);

  const handleSeek = (value) => {
    setCurrentTime(value);
    if (historicalData[value]) {
      onScrub?.(historicalData[value]);
    }
  };

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-black/90 backdrop-blur-xl border border-white/20"
      >
        {/* Timeline */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/60 text-xs">Historical Telemetry</span>
            <span className="text-cyan-400 text-xs font-mono">
              T-{historicalData.length - currentTime}s
            </span>
          </div>

          {/* Scrubber */}
          <div className="relative h-12 mb-2">
            <input
              type="range"
              min="0"
              max={historicalData.length - 1}
              value={currentTime}
              onChange={(e) => handleSeek(parseInt(e.target.value))}
              className="absolute top-0 w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-cyan-500"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            />

            {/* Data visualization */}
            <svg className="w-full h-full pointer-events-none">
              {/* CPU Load line */}
              <polyline
                points={historicalData
                  .map((d, i) => `${(i / historicalData.length) * 100}%,${100 - d.cpuLoad}%`)
                  .join(' ')}
                fill="none"
                stroke="#00f5ff"
                strokeWidth="1"
                opacity="0.6"
              />

              {/* GPU Load line */}
              <polyline
                points={historicalData
                  .map((d, i) => `${(i / historicalData.length) * 100}%,${100 - d.gpuLoad}%`)
                  .join(' ')}
                fill="none"
                stroke="#a855f7"
                strokeWidth="1"
                opacity="0.6"
              />

              {/* Anomaly markers */}
              {historicalData.map(
                (d, i) =>
                  d.anomaly && (
                    <circle
                      key={i}
                      cx={`${(i / historicalData.length) * 100}%`}
                      cy="50%"
                      r="3"
                      fill="#ef4444"
                      opacity="0.8"
                    />
                  )
              )}

              {/* Current time marker */}
              <line
                x1={`${(currentTime / historicalData.length) * 100}%`}
                y1="0%"
                x2={`${(currentTime / historicalData.length) * 100}%`}
                y2="100%"
                stroke="#ffffff"
                strokeWidth="2"
                opacity="0.8"
              />
            </svg>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => handleSeek(Math.max(0, currentTime - 10))}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <SkipBack className="w-4 h-4 text-white" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-3 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-cyan-400" />
            ) : (
              <Play className="w-5 h-5 text-cyan-400" />
            )}
          </button>

          <button
            onClick={() => handleSeek(Math.min(historicalData.length - 1, currentTime + 10))}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <SkipForward className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Current metrics */}
        {historicalData[currentTime] && (
          <div className="mt-3 flex gap-3 text-xs">
            <div className="flex-1 p-2 rounded bg-cyan-500/10 border border-cyan-500/30">
              <div className="text-cyan-400 font-medium">CPU</div>
              <div className="text-white">{Math.round(historicalData[currentTime].cpuLoad)}%</div>
            </div>
            <div className="flex-1 p-2 rounded bg-purple-500/10 border border-purple-500/30">
              <div className="text-purple-400 font-medium">GPU</div>
              <div className="text-white">{Math.round(historicalData[currentTime].gpuLoad)}%</div>
            </div>
            <div className="flex-1 p-2 rounded bg-blue-500/10 border border-blue-500/30">
              <div className="text-blue-400 font-medium">Network</div>
              <div className="text-white">{Math.round(historicalData[currentTime].networkTraffic)} Gbps</div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}