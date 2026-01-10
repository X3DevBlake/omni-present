import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Network, X, Zap, Database, Shield, Cloud, Globe, Cpu } from 'lucide-react';
import GlassCard from '../components/omni/GlassCard';

export default function Architecture() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const nodes = [
    {
      id: 'core',
      label: 'AI Core',
      icon: Cpu,
      position: { x: 50, y: 50 },
      color: '#00f5ff',
      description: 'Central processing unit coordinating all AI operations',
      details: [
        'Multi-model orchestration',
        'Request routing and load balancing',
        'Real-time decision making',
        'Context management'
      ],
      connections: ['neural', 'context', 'security', 'edge']
    },
    {
      id: 'neural',
      label: 'Neural Mesh',
      icon: Network,
      position: { x: 20, y: 25 },
      color: '#a855f7',
      description: 'Distributed AI network that learns and adapts',
      details: [
        'Self-healing node network',
        'Auto-scaling capabilities',
        'Cross-node learning',
        'Fault tolerance'
      ],
      connections: ['core', 'edge']
    },
    {
      id: 'context',
      label: 'Context Engine',
      icon: Zap,
      position: { x: 80, y: 25 },
      color: '#ec4899',
      description: 'Real-time context awareness and prediction',
      details: [
        'Intent recognition',
        'Semantic analysis',
        'Predictive modeling',
        'Multi-modal understanding'
      ],
      connections: ['core', 'data']
    },
    {
      id: 'security',
      label: 'Security Layer',
      icon: Shield,
      position: { x: 20, y: 75 },
      color: '#10b981',
      description: 'Enterprise-grade security and encryption',
      details: [
        'Zero-trust architecture',
        'End-to-end encryption',
        'Compliance monitoring',
        'Threat detection'
      ],
      connections: ['core', 'data']
    },
    {
      id: 'edge',
      label: 'Edge Computing',
      icon: Globe,
      position: { x: 80, y: 75 },
      color: '#f59e0b',
      description: 'Distributed processing at the edge',
      details: [
        'Local processing',
        'Reduced latency',
        'Bandwidth optimization',
        'Offline capabilities'
      ],
      connections: ['core', 'neural']
    },
    {
      id: 'data',
      label: 'Data Hub',
      icon: Database,
      position: { x: 50, y: 90 },
      color: '#3b82f6',
      description: 'Centralized data management and storage',
      details: [
        'Real-time data streaming',
        'Data lake integration',
        'Vector databases',
        'Knowledge graphs'
      ],
      connections: ['context', 'security', 'cloud']
    },
    {
      id: 'cloud',
      label: 'Cloud Infrastructure',
      icon: Cloud,
      position: { x: 50, y: 10 },
      color: '#8b5cf6',
      description: 'Scalable cloud resources and deployment',
      details: [
        'Auto-scaling infrastructure',
        'Multi-region deployment',
        'CDN integration',
        'Resource optimization'
      ],
      connections: ['data']
    }
  ];

  const getNodeById = (id) => nodes.find(n => n.id === id);

  const performanceMetrics = [
    { label: 'Throughput', value: '2.5 PetaFLOPS', color: '#00f5ff' },
    { label: 'Latency', value: '< 1ms', color: '#a855f7' },
    { label: 'Uptime', value: '99.99%', color: '#10b981' },
    { label: 'Efficiency', value: '94%', color: '#f59e0b' },
  ];

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl border border-cyan-500/30">
              <Network className="w-12 h-12 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            System <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Architecture</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Explore the interconnected components powering Omni-Present AI's intelligent ecosystem.
          </p>
        </motion.div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <Button onClick={() => setScale(Math.min(scale + 0.2, 2))}>Zoom In</Button>
          <Button onClick={() => setScale(Math.max(scale - 0.2, 0.5))}>Zoom Out</Button>
          <Button onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }}>Reset</Button>
        </div>

        {/* Interactive Diagram */}
        <GlassCard className="p-8 mb-8">
          <div className="relative w-full h-[600px] overflow-hidden rounded-lg bg-black/20">
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                {nodes.map(node => (
                  <linearGradient key={`grad-${node.id}`} id={`gradient-${node.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={node.color} stopOpacity="0.6" />
                    <stop offset="100%" stopColor={node.color} stopOpacity="0.2" />
                  </linearGradient>
                ))}
              </defs>

              {/* Connections */}
              {nodes.map(node => 
                node.connections.map(targetId => {
                  const target = getNodeById(targetId);
                  if (!target) return null;
                  
                  return (
                    <motion.line
                      key={`${node.id}-${targetId}`}
                      x1={`${node.position.x}%`}
                      y1={`${node.position.y}%`}
                      x2={`${target.position.x}%`}
                      y2={`${target.position.y}%`}
                      stroke={`url(#gradient-${node.id})`}
                      strokeWidth="2"
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                    />
                  );
                })
              )}

              {/* Data flow particles */}
              {nodes.map(node =>
                node.connections.map((targetId, i) => {
                  const target = getNodeById(targetId);
                  if (!target) return null;

                  return (
                    <motion.circle
                      key={`particle-${node.id}-${targetId}-${i}`}
                      r="4"
                      fill={node.color}
                      animate={{
                        cx: [`${node.position.x}%`, `${target.position.x}%`],
                        cy: [`${node.position.y}%`, `${target.position.y}%`],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.5 + Math.random(),
                      }}
                    />
                  );
                })
              )}
            </svg>

            {/* Nodes */}
            {nodes.map((node) => {
              const Icon = node.icon;
              return (
                <motion.div
                  key={node.id}
                  className="absolute cursor-pointer"
                  style={{
                    left: `${node.position.x}%`,
                    top: `${node.position.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => setSelectedNode(node)}
                >
                  {/* Glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full blur-xl"
                    style={{
                      background: `radial-gradient(circle, ${node.color}, transparent)`,
                      width: '80px',
                      height: '80px',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />

                  {/* Node */}
                  <div
                    className="relative w-16 h-16 rounded-full flex items-center justify-center border-2 backdrop-blur-sm"
                    style={{
                      backgroundColor: `${node.color}20`,
                      borderColor: node.color,
                    }}
                  >
                    <Icon className="w-8 h-8" style={{ color: node.color }} />
                  </div>

                  {/* Label */}
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="text-white text-sm font-medium">{node.label}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {performanceMetrics.map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4"
            >
              <div className="text-white/60 text-sm mb-1">{metric.label}</div>
              <div className="text-2xl font-bold" style={{ color: metric.color }}>
                {metric.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Selected Node Details */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <GlassCard className="p-8" glowColor={selectedNode.color}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center border-2"
                      style={{
                        backgroundColor: `${selectedNode.color}20`,
                        borderColor: selectedNode.color,
                      }}
                    >
                      {React.createElement(selectedNode.icon, {
                        className: 'w-8 h-8',
                        style: { color: selectedNode.color }
                      })}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">{selectedNode.label}</h2>
                      <p className="text-white/70">{selectedNode.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Key Capabilities</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedNode.details.map((detail, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div
                          className="w-2 h-2 rounded-full mt-2"
                          style={{ backgroundColor: selectedNode.color }}
                        />
                        <span className="text-white/90">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-xl font-bold text-white mb-4">Connected Components</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedNode.connections.map(connId => {
                      const conn = getNodeById(connId);
                      return (
                        <button
                          key={connId}
                          onClick={() => setSelectedNode(conn)}
                          className="px-4 py-2 rounded-lg border transition-all hover:scale-105"
                          style={{
                            backgroundColor: `${conn.color}20`,
                            borderColor: `${conn.color}40`,
                            color: '#fff'
                          }}
                        >
                          {conn.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuroraBackground>
  );
}

function Button({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-all"
    >
      {children}
    </button>
  );
}