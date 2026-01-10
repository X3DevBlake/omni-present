import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Activity } from 'lucide-react';

export default function RealtimeDemo({ color }) {
  const [latency, setLatency] = useState(0);
  const [requests, setRequests] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setLatency(Math.random() * 10 + 2); // 2-12ms
        setRequests(prev => prev + Math.floor(Math.random() * 50 + 20));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <button
          onClick={() => setIsActive(!isActive)}
          className="px-8 py-3 rounded-lg font-medium text-white transition-all"
          style={{ background: color }}
        >
          {isActive ? 'Stop Simulation' : 'Start Real-Time Simulation'}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
          <Zap className="w-8 h-8 mx-auto mb-3" style={{ color }} />
          <div className="text-4xl font-bold text-white mb-2">
            {latency.toFixed(1)}ms
          </div>
          <div className="text-white/60">Response Latency</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
          <Activity className="w-8 h-8 mx-auto mb-3" style={{ color }} />
          <div className="text-4xl font-bold text-white mb-2">
            {requests.toLocaleString()}
          </div>
          <div className="text-white/60">Requests Processed</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
          <motion.div
            animate={{
              scale: isActive ? [1, 1.2, 1] : 1,
            }}
            transition={{
              duration: 1,
              repeat: isActive ? Infinity : 0,
            }}
          >
            <div
              className="w-4 h-4 rounded-full mx-auto mb-3"
              style={{ backgroundColor: isActive ? '#10b981' : '#ef4444' }}
            />
          </motion.div>
          <div className="text-2xl font-bold text-white mb-2">
            {isActive ? 'Active' : 'Idle'}
          </div>
          <div className="text-white/60">System Status</div>
        </div>
      </div>

      {isActive && (
        <div className="h-24 bg-white/5 border border-white/10 rounded-lg overflow-hidden">
          <svg className="w-full h-full">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.line
                key={i}
                x1={`${i * 2}%`}
                y1="50%"
                x2={`${i * 2}%`}
                y2={`${50 + Math.random() * 40}%`}
                stroke={color}
                strokeWidth="2"
                animate={{
                  y2: [`${50 + Math.random() * 40}%`, `${50 + Math.random() * 40}%`],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                }}
              />
            ))}
          </svg>
        </div>
      )}
    </div>
  );
}