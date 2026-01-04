import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import { 
  Layers, 
  Zap, 
  Globe, 
  Shield, 
  Sparkles, 
  Network,
  Eye,
  Fingerprint
} from 'lucide-react';

const features = [
  {
    icon: Layers,
    title: "Cross-Platform Unity",
    description: "Seamlessly traverse digital workspaces, integrating into workflows across every enterprise application.",
    size: "large",
    color: "cyan",
  },
  {
    icon: Zap,
    title: "Real-Time Intelligence",
    description: "Proactive responses with sub-10ms latency via WebSocket streams.",
    size: "small",
    color: "purple",
  },
  {
    icon: Eye,
    title: "Context Awareness",
    description: "AI that understands intent before you articulate it.",
    size: "small",
    color: "pink",
  },
  {
    icon: Globe,
    title: "Ubiquitous Access",
    description: "Present on every device, in every application, available whenever inspiration strikes—from desktop to wearable.",
    size: "medium",
    color: "blue",
  },
  {
    icon: Network,
    title: "Neural Mesh",
    description: "Distributed processing across edge and cloud for optimal performance.",
    size: "medium",
    color: "cyan",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Zero-trust architecture with end-to-end encryption protecting your most sensitive workflows.",
    size: "small",
    color: "purple",
  },
  {
    icon: Sparkles,
    title: "Generative Power",
    description: "Create, iterate, and refine with cutting-edge AI models.",
    size: "small",
    color: "pink",
  },
  {
    icon: Fingerprint,
    title: "Personalized Experience",
    description: "Adapts to your unique working patterns, learning and evolving with every interaction to become your perfect digital companion.",
    size: "large",
    color: "blue",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export default function FeatureGrid() {
  const colorMap = {
    cyan: { icon: 'text-cyan-400', bg: 'from-cyan-500/20 to-cyan-500/5' },
    purple: { icon: 'text-purple-400', bg: 'from-purple-500/20 to-purple-500/5' },
    pink: { icon: 'text-pink-400', bg: 'from-pink-500/20 to-pink-500/5' },
    blue: { icon: 'text-blue-400', bg: 'from-blue-500/20 to-blue-500/5' },
  };

  return (
    <section id="features" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Boundless
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Capabilities</span>
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto text-lg">
            A modular ecosystem of intelligent features designed to dissolve friction from your digital life.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[180px]"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colors = colorMap[feature.color];
            const sizeClasses = {
              small: '',
              medium: 'lg:col-span-2',
              large: 'md:col-span-2',
            };

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className={sizeClasses[feature.size]}
              >
                <GlassCard className="h-full p-6 flex flex-col" glowColor={feature.color}>
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors.bg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${colors.icon}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed flex-grow">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}