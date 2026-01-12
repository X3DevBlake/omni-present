import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, Database, Globe } from 'lucide-react';

/**
 * Performance Monitor
 * Real-time client-side performance monitoring
 */
export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: 0,
    loadTime: 0,
    apiLatency: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Monitor FPS
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setMetrics(prev => ({ ...prev, fps: frameCount }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);

    // Monitor memory (if available)
    const updateMemory = () => {
      if (performance.memory) {
        const usedMB = Math.round(performance.memory.usedJSHeapSize / 1048576);
        setMetrics(prev => ({ ...prev, memory: usedMB }));
      }
    };
    
    const memoryInterval = setInterval(updateMemory, 2000);

    // Get initial load time
    if (performance.timing) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      setMetrics(prev => ({ ...prev, loadTime: Math.round(loadTime) }));
    }

    // Keyboard shortcut to toggle visibility
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      clearInterval(memoryInterval);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="bg-black/90 backdrop-blur-lg border-white/20 w-64">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <MetricRow 
            icon={<Zap className="w-4 h-4 text-yellow-400" />}
            label="FPS"
            value={metrics.fps}
            status={metrics.fps >= 55 ? 'good' : metrics.fps >= 30 ? 'warning' : 'bad'}
          />
          
          {metrics.memory > 0 && (
            <MetricRow 
              icon={<Database className="w-4 h-4 text-blue-400" />}
              label="Memory"
              value={`${metrics.memory}MB`}
              status={metrics.memory < 100 ? 'good' : metrics.memory < 200 ? 'warning' : 'bad'}
            />
          )}
          
          <MetricRow 
            icon={<Globe className="w-4 h-4 text-green-400" />}
            label="Load Time"
            value={`${metrics.loadTime}ms`}
            status={metrics.loadTime < 2000 ? 'good' : metrics.loadTime < 4000 ? 'warning' : 'bad'}
          />

          <p className="text-xs text-gray-400 mt-2">
            Press Ctrl+Shift+P to toggle
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricRow({ icon, label, value, status }) {
  const statusColors = {
    good: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    bad: 'bg-red-500/20 text-red-400'
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-gray-300">{label}</span>
      </div>
      <Badge className={statusColors[status]}>
        {value}
      </Badge>
    </div>
  );
}