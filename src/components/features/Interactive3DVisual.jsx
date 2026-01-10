import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Interactive3DVisual() {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const features = [
    { 
      position: { x: 20, y: 30 }, 
      color: '#00f5ff', 
      label: 'Real-Time Intelligence',
      description: 'Process and analyze data instantly with sub-millisecond latency.',
      stats: ['<1ms Response', '99.99% Uptime', '10M+ Requests/sec']
    },
    { 
      position: { x: 50, y: 15 }, 
      color: '#a855f7', 
      label: 'Neural Mesh',
      description: 'Distributed AI network that learns and adapts across all nodes.',
      stats: ['Self-Healing', 'Auto-Scaling', 'Edge Computing']
    },
    { 
      position: { x: 80, y: 30 }, 
      color: '#ec4899', 
      label: 'Context Awareness',
      description: 'Understand user intent and environment for personalized responses.',
      stats: ['Multi-Modal', 'Semantic Search', 'Predictive']
    },
    { 
      position: { x: 35, y: 60 }, 
      color: '#3b82f6', 
      label: 'Security',
      description: 'Enterprise-grade security with end-to-end encryption and compliance.',
      stats: ['Zero Trust', 'SOC 2 Certified', 'GDPR Compliant']
    },
    { 
      position: { x: 65, y: 60 }, 
      color: '#10b981', 
      label: 'Generative AI',
      description: 'Create content, code, and solutions with advanced AI models.',
      stats: ['GPT-4 Powered', 'Fine-Tunable', 'Multi-Language']
    }
  ];

  return (
    <div className="relative w-full h-[600px] rounded-2xl overflow-hidden bg-black/20 border border-cyan-500/20">
      {/* Background grid */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,245,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        {features.map((feature, i) => {
          if (i >= features.length - 1) return null;
          const next = features[i + 1];
          return (
            <motion.line
              key={i}
              x1={`${feature.position.x}%`}
              y1={`${feature.position.y}%`}
              x2={`${next.position.x}%`}
              y2={`${next.position.y}%`}
              stroke="url(#lineGrad)"
              strokeWidth="2"
              animate={{
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          );
        })}
      </svg>

      {/* Feature nodes */}
      {features.map((feature, i) => (
        <motion.div
          key={i}
          className="absolute cursor-pointer"
          style={{
            left: `${feature.position.x}%`,
            top: `${feature.position.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => setSelectedFeature(feature)}
          whileHover={{ scale: 1.2 }}
        >
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full blur-xl"
            style={{
              background: `radial-gradient(circle, ${feature.color}, transparent)`,
              width: hoveredIndex === i ? '100px' : '60px',
              height: hoveredIndex === i ? '100px' : '60px',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              opacity: hoveredIndex === i ? 0.6 : 0.3,
            }}
          />

          {/* Node */}
          <motion.div
            className="relative w-16 h-16 rounded-full flex items-center justify-center border-2"
            style={{
              backgroundColor: `${feature.color}20`,
              borderColor: feature.color,
            }}
            animate={{
              scale: hoveredIndex === i ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <div
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: feature.color }}
            />
          </motion.div>

          {/* Label */}
          {hoveredIndex === i && (
            <motion.div
              className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 backdrop-blur-sm px-3 py-1 rounded-lg border"
              style={{ borderColor: `${feature.color}40` }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="text-white text-sm font-medium">{feature.label}</span>
            </motion.div>
          )}
        </motion.div>
      ))}

      {/* Floating particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-cyan-400"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Selected feature detail panel */}
      <AnimatePresence>
        {selectedFeature && (
          <motion.div
            className="absolute bottom-6 left-6 right-6 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${selectedFeature.color}20`, border: `2px solid ${selectedFeature.color}40` }}>
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: selectedFeature.color }} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl mb-1">{selectedFeature.label}</h3>
                  <p className="text-white/70 text-sm">{selectedFeature.description}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFeature(null)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {selectedFeature.stats.map((stat, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                  <div className="text-xs text-white/60 mb-1">Feature {i + 1}</div>
                  <div className="text-white font-semibold text-sm">{stat}</div>
                </div>
              ))}
            </div>

            <button 
              className="w-full mt-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              style={{ background: `linear-gradient(to right, ${selectedFeature.color}, ${selectedFeature.color}cc)` }}
            >
              Learn More →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}