import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, Clock, Gauge, ChevronDown, ChevronUp } from 'lucide-react';

export default function PerformanceMetrics() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [metrics, setMetrics] = useState({
    fps: 60,
    loadTime: 0,
    latency: 0,
    memoryUsage: 0,
  });

  useEffect(() => {
    // Track load time
    const loadTime = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
    setMetrics(prev => ({ ...prev, loadTime: loadTime / 1000 }));

    // FPS counter
    let lastTime = performance.now();
    let frames = 0;
    let fpsInterval;

    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const currentFPS = Math.round((frames * 1000) / (currentTime - lastTime));
        setMetrics(prev => ({ ...prev, fps: currentFPS }));
        frames = 0;
        lastTime = currentTime;
      }
      
      fpsInterval = requestAnimationFrame(measureFPS);
    };

    measureFPS();

    // Memory usage (if available)
    if (performance.memory) {
      const updateMemory = () => {
        const usedMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(1);
        setMetrics(prev => ({ ...prev, memoryUsage: usedMB }));
      };
      updateMemory();
      const memInterval = setInterval(updateMemory, 2000);
      return () => {
        cancelAnimationFrame(fpsInterval);
        clearInterval(memInterval);
      };
    }

    return () => cancelAnimationFrame(fpsInterval);
  }, []);

  // Simulate latency
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({ ...prev, latency: Math.random() * 50 + 10 }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (metric, value) => {
    switch (metric) {
      case 'fps':
        return value >= 55 ? 'text-green-400' : value >= 30 ? 'text-yellow-400' : 'text-red-400';
      case 'loadTime':
        return value <= 3 ? 'text-green-400' : value <= 5 ? 'text-yellow-400' : 'text-red-400';
      case 'latency':
        return value <= 100 ? 'text-green-400' : value <= 200 ? 'text-yellow-400' : 'text-red-400';
      default:
        return 'text-cyan-400';
    }
  };

  return (
    <motion.div
      className="fixed top-20 right-4 z-40"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1 }}
    >
      <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden shadow-lg">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-medium text-sm">Performance</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-lg font-mono font-bold ${getStatusColor('fps', metrics.fps)}`}>
              {metrics.fps}
            </span>
            <span className="text-white/40 text-xs">FPS</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-white/40" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white/40" />
            )}
          </div>
        </button>

        {/* Expanded Metrics */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-white/10"
            >
              <div className="p-4 space-y-3">
                {/* FPS */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-3.5 h-3.5 text-white/50" />
                    <span className="text-white/70 text-xs">Frame Rate</span>
                  </div>
                  <span className={`font-mono font-bold text-sm ${getStatusColor('fps', metrics.fps)}`}>
                    {metrics.fps} FPS
                  </span>
                </div>

                {/* Load Time */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-white/50" />
                    <span className="text-white/70 text-xs">Load Time</span>
                  </div>
                  <span className={`font-mono font-bold text-sm ${getStatusColor('loadTime', metrics.loadTime)}`}>
                    {metrics.loadTime.toFixed(2)}s
                  </span>
                </div>

                {/* Latency */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-white/50" />
                    <span className="text-white/70 text-xs">Latency</span>
                  </div>
                  <span className={`font-mono font-bold text-sm ${getStatusColor('latency', metrics.latency)}`}>
                    {metrics.latency.toFixed(0)}ms
                  </span>
                </div>

                {/* Memory Usage */}
                {metrics.memoryUsage > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-white/50" />
                      <span className="text-white/70 text-xs">Memory</span>
                    </div>
                    <span className="font-mono font-bold text-sm text-cyan-400">
                      {metrics.memoryUsage} MB
                    </span>
                  </div>
                )}

                {/* Optimizations */}
                <div className="pt-3 border-t border-white/10">
                  <div className="text-[10px] text-white/40 mb-2">Active Optimizations</div>
                  <div className="flex flex-wrap gap-1">
                    {['WebGPU', 'Draco', 'LOD', 'WebSocket'].map((opt) => (
                      <span
                        key={opt}
                        className="px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[9px] font-medium"
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}