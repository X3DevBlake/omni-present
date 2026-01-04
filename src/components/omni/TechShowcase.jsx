import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import { Monitor, Cpu, Brain, Box } from 'lucide-react';

const paradigms = [
  {
    icon: Monitor,
    title: "Traditional Computing",
    delivery: "Desktop Terminals / Fixed Apps",
    interaction: "Manual input, reactive, siloed",
    color: "cyan",
    opacity: 0.4,
  },
  {
    icon: Cpu,
    title: "Ubiquitous Computing",
    delivery: "IoT, Sensors, Wearable Tabs",
    interaction: "Ambient, proactive, distributed",
    color: "blue",
    opacity: 0.6,
  },
  {
    icon: Brain,
    title: "Omnipresent AI",
    delivery: "Cross-platform Unified GUI",
    interaction: "Context-aware, intent-driven, seamless",
    color: "purple",
    opacity: 0.9,
    highlight: true,
  },
  {
    icon: Box,
    title: "Spatial Computing",
    delivery: "WebGPU, AR/VR, 3D Interfaces",
    interaction: "Immersive, holographic, tactile",
    color: "pink",
    opacity: 0.7,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function TechShowcase() {
  return (
    <section id="technology" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            The Evolution of
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"> Computing</span>
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto text-lg">
            From isolated applications to an omnipresent intelligence that exists seamlessly across every touchpoint.
          </p>
        </motion.div>

        {/* Paradigms Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {paradigms.map((paradigm, index) => {
            const Icon = paradigm.icon;
            const colorMap = {
              cyan: { gradient: 'from-cyan-500/20 to-cyan-500/5', border: 'border-cyan-500/30', glow: 'shadow-cyan-500/20', text: 'text-cyan-400' },
              blue: { gradient: 'from-blue-500/20 to-blue-500/5', border: 'border-blue-500/30', glow: 'shadow-blue-500/20', text: 'text-blue-400' },
              purple: { gradient: 'from-purple-500/20 to-purple-500/5', border: 'border-purple-500/30', glow: 'shadow-purple-500/20', text: 'text-purple-400' },
              pink: { gradient: 'from-pink-500/20 to-pink-500/5', border: 'border-pink-500/30', glow: 'shadow-pink-500/20', text: 'text-pink-400' },
            };
            const colors = colorMap[paradigm.color];

            return (
              <motion.div key={index} variants={itemVariants}>
                <GlassCard 
                  className={`h-full p-6 ${paradigm.highlight ? `border-2 ${colors.border} shadow-lg ${colors.glow}` : ''}`}
                  glow={paradigm.highlight}
                  glowColor={paradigm.color}
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-white mb-4">
                    {paradigm.title}
                  </h3>

                  {/* Delivery */}
                  <div className="mb-3">
                    <span className="text-xs text-white/40 uppercase tracking-wider">Delivery</span>
                    <p className="text-white/70 text-sm mt-1">{paradigm.delivery}</p>
                  </div>

                  {/* Interaction */}
                  <div>
                    <span className="text-xs text-white/40 uppercase tracking-wider">Interaction</span>
                    <p className="text-white/70 text-sm mt-1">{paradigm.interaction}</p>
                  </div>

                  {/* Highlight Badge */}
                  {paradigm.highlight && (
                    <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
                      <span className="text-xs text-purple-300 font-medium">Current Focus</span>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Connection Lines (Visual) */}
        <div className="hidden lg:flex justify-center mt-8">
          <div className="flex items-center gap-4">
            {[0, 1, 2].map((i) => (
              <React.Fragment key={i}>
                <div className="w-16 h-[2px] bg-gradient-to-r from-white/10 to-white/20" />
                <div className="w-2 h-2 rounded-full bg-cyan-400/50" />
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}