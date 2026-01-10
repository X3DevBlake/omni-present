import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import GlassCard from './GlassCard';
import Feature3DBlueprint from '../features/Feature3DBlueprint';
import { 
  Layers, 
  Zap, 
  Globe, 
  Shield, 
  Sparkles, 
  Network,
  Eye,
  Fingerprint,
  ArrowRight
} from 'lucide-react';

const features = [
  {
    icon: Layers,
    title: "Cross-Platform Unity",
    description: "Seamlessly traverse digital workspaces, integrating into workflows across every enterprise application.",
    size: "large",
    color: "cyan",
    blueprintType: "layers"
  },
  {
    icon: Zap,
    title: "Real-Time Intelligence",
    description: "Proactive responses with sub-10ms latency via WebSocket streams.",
    size: "small",
    color: "purple",
    blueprintType: "zap"
  },
  {
    icon: Eye,
    title: "Context Awareness",
    description: "AI that understands intent before you articulate it.",
    size: "small",
    color: "pink",
    blueprintType: "sparkles"
  },
  {
    icon: Globe,
    title: "Ubiquitous Access",
    description: "Present on every device, in every application, available whenever inspiration strikes—from desktop to wearable.",
    size: "medium",
    color: "blue",
    blueprintType: "globe"
  },
  {
    icon: Network,
    title: "Neural Mesh",
    description: "Distributed processing across edge and cloud for optimal performance.",
    size: "medium",
    color: "cyan",
    blueprintType: "network"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Zero-trust architecture with end-to-end encryption protecting your most sensitive workflows.",
    size: "small",
    color: "purple",
    blueprintType: "shield"
  },
  {
    icon: Sparkles,
    title: "Generative Power",
    description: "Create, iterate, and refine with cutting-edge AI models.",
    size: "small",
    color: "pink",
    blueprintType: "sparkles"
  },
  {
    icon: Fingerprint,
    title: "Personalized Experience",
    description: "Adapts to your unique working patterns, learning and evolving with every interaction to become your perfect digital companion.",
    size: "large",
    color: "blue",
    blueprintType: "layers"
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
    <section className="py-32 px-6">
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
                <Link to={`${createPageUrl('FeatureDetail')}?feature=${encodeURIComponent(feature.title)}`}>
                  <GlassCard className="h-full p-6 flex flex-col overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform" glowColor={feature.color}>
                  {/* 3D Blueprint Visualization */}
                  {feature.size === 'large' && (
                    <div className="mb-4 -mx-6 -mt-6">
                      <Feature3DBlueprint 
                        type={feature.blueprintType} 
                        color={colors.icon.replace('text-', '#').replace('cyan-400', '00f5ff').replace('purple-400', 'a855f7').replace('pink-400', 'ec4899').replace('blue-400', '3b82f6')} 
                        height={180} 
                      />
                    </div>
                  )}
                  
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
                  
                  {/* Learn More Link */}
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium" style={{ color: colors.icon.replace('text-', '') }}>
                    Learn More <ArrowRight className="w-4 h-4" />
                  </div>
                  
                  {/* Small 3D preview for medium/small cards */}
                  {feature.size !== 'large' && (
                    <div className="mt-3 -mx-3 -mb-3">
                      <Feature3DBlueprint 
                        type={feature.blueprintType} 
                        color={colors.icon.replace('text-', '#').replace('cyan-400', '00f5ff').replace('purple-400', 'a855f7').replace('pink-400', 'ec4899').replace('blue-400', '3b82f6')} 
                        height={100} 
                      />
                    </div>
                  )}
                  </GlassCard>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}