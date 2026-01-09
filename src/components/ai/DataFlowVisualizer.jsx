import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Cloud, Zap, ArrowRight } from 'lucide-react';

export default function DataFlowVisualizer() {
  const [flows, setFlows] = useState([]);
  const svgRef = useRef(null);

  useEffect(() => {
    const dataFlows = [
      { id: 1, source: 'Database', target: 'Processing', duration: 2 },
      { id: 2, source: 'API', target: 'Processing', duration: 2.5 },
      { id: 3, source: 'Processing', target: 'Analytics', duration: 2 },
      { id: 4, source: 'Analytics', target: 'Visualization', duration: 1.8 },
      { id: 5, source: 'Cache', target: 'Visualization', duration: 1.5 }
    ];
    setFlows(dataFlows);
  }, []);

  const nodes = [
    { id: 'Database', x: 50, y: 150, icon: Database, label: 'Data Sources' },
    { id: 'API', x: 50, y: 300, icon: Cloud, label: 'APIs' },
    { id: 'Processing', x: 250, y: 200, icon: Zap, label: 'Processing' },
    { id: 'Analytics', x: 450, y: 200, icon: Zap, label: 'Analytics' },
    { id: 'Visualization', x: 650, y: 150, icon: Cloud, label: 'Output' },
    { id: 'Cache', x: 450, y: 350, icon: Database, label: 'Cache' }
  ];

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
      <h3 className="text-white font-bold mb-6 flex items-center gap-2">
        <Zap className="w-5 h-5 text-cyan-400" />
        Data Flow Pipeline
      </h3>

      <div className="relative h-96 bg-gradient-to-b from-black/20 to-black/5 rounded-lg overflow-hidden">
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f5ff" stopOpacity="0" />
              <stop offset="50%" stopColor="#00f5ff" stopOpacity="1" />
              <stop offset="100%" stopColor="#00f5ff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Connection lines */}
          {flows.map(flow => {
            const source = nodes.find(n => n.id === flow.source);
            const target = nodes.find(n => n.id === flow.target);
            if (!source || !target) return null;

            return (
              <g key={`line-${flow.id}`}>
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="url(#flowGradient)"
                  strokeWidth="2"
                  opacity="0.3"
                />
                
                {/* Animated data packet */}
                <motion.circle
                  cx={source.x}
                  cy={source.y}
                  r="4"
                  fill="#00f5ff"
                  initial={{ x: source.x, y: source.y }}
                  animate={{
                    x: target.x - source.x,
                    y: target.y - source.y
                  }}
                  transition={{
                    duration: flow.duration,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{ filter: 'drop-shadow(0 0 8px #00f5ff)' }}
                />
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map(node => {
          const IconComponent = node.icon;
          return (
            <motion.div
              key={node.id}
              className="absolute flex flex-col items-center gap-2 cursor-pointer group"
              style={{ left: `${node.x}px`, top: `${node.y}px`, transform: 'translate(-50%, -50%)' }}
              whileHover={{ scale: 1.1 }}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-cyan-500/50 flex items-center justify-center hover:border-cyan-500/80 transition-all hover:shadow-lg hover:shadow-cyan-500/50">
                <IconComponent className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="text-xs text-white/70 font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black/70 px-2 py-1 rounded">
                {node.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
          <div className="text-xs text-white/60 mb-1">Active Flows</div>
          <div className="text-lg font-bold text-cyan-400">{flows.length}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
          <div className="text-xs text-white/60 mb-1">Throughput</div>
          <div className="text-lg font-bold text-cyan-400">2.4GB/s</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
          <div className="text-xs text-white/60 mb-1">Latency</div>
          <div className="text-lg font-bold text-cyan-400">47ms</div>
        </div>
      </div>
    </div>
  );
}