import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import AuroraBackground from '../components/omni/AuroraBackground';
import GlassCard from '../components/omni/GlassCard';
import { ArrowLeft, CheckCircle, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import GenerativePowerDemo from '../components/features/demos/GenerativePowerDemo';
import RealtimeDemo from '../components/features/demos/RealtimeDemo';
import ContextDemo from '../components/features/demos/ContextDemo';

export default function FeatureDetail() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const featureName = params.get('feature') || 'Cross-Platform Unity';

  const featureData = {
    'Cross-Platform Unity': {
      color: '#00f5ff',
      tagline: 'Seamless Integration Across All Your Tools',
      description: 'Omni-Present AI dissolves the boundaries between applications, creating a unified intelligent layer that works across your entire digital ecosystem.',
      benefits: [
        'One AI assistant across all platforms',
        'Contextual awareness between applications',
        'Unified data and insights',
        'Consistent user experience everywhere'
      ],
      caseStudy: {
        company: 'TechCorp Global',
        challenge: 'Teams struggled with context-switching between 15+ enterprise tools, losing 3 hours daily to redundant data entry.',
        solution: 'Implemented Omni-Present AI to create a unified intelligent layer across Slack, Salesforce, Google Workspace, and custom tools.',
        results: [
          '60% reduction in context-switching time',
          '85% improvement in data accuracy',
          '$2M annual savings in productivity gains'
        ]
      },
      demo: null
    },
    'Real-Time Intelligence': {
      color: '#a855f7',
      tagline: 'Instant Responses, Zero Latency',
      description: 'Experience AI that responds faster than you can think, with sub-10ms latency via WebSocket streams and edge computing.',
      benefits: [
        'Sub-10ms response time',
        '99.99% uptime guarantee',
        'Edge computing for local processing',
        'Real-time data streaming'
      ],
      caseStudy: {
        company: 'FinanceFlow Inc',
        challenge: 'High-frequency trading required instant market analysis with zero tolerance for delays.',
        solution: 'Deployed Omni-Present AI\'s real-time intelligence engine with edge computing nodes in key markets.',
        results: [
          '8ms average response time',
          '40% increase in successful trades',
          '99.998% system uptime'
        ]
      },
      demo: RealtimeDemo
    },
    'Context Awareness': {
      color: '#ec4899',
      tagline: 'AI That Understands Before You Ask',
      description: 'Leveraging advanced semantic analysis and predictive modeling, our AI anticipates your needs based on context, behavior, and intent.',
      benefits: [
        'Intent recognition from partial inputs',
        'Multi-modal context understanding',
        'Predictive task suggestions',
        'Personalized responses'
      ],
      caseStudy: {
        company: 'HealthCare Plus',
        challenge: 'Doctors needed instant patient context during consultations without manual searches.',
        solution: 'Context-aware AI that automatically surfaces relevant patient history and treatment options.',
        results: [
          '70% faster patient consultations',
          '95% accuracy in context prediction',
          '50% reduction in documentation time'
        ]
      },
      demo: ContextDemo
    },
    'Generative Power': {
      color: '#ec4899',
      tagline: 'Create Anything with AI',
      description: 'Harness cutting-edge generative AI models to create content, code, designs, and solutions at the speed of thought.',
      benefits: [
        'GPT-4 powered text generation',
        'Advanced image synthesis',
        'Code completion and generation',
        'Multi-modal content creation'
      ],
      caseStudy: {
        company: 'CreativeHub Agency',
        challenge: 'Content creation bottleneck limiting client campaigns to 5 per month.',
        solution: 'Integrated Omni-Present AI\'s generative capabilities into their creative workflow.',
        results: [
          '300% increase in content output',
          '80% reduction in creation time',
          '15 campaigns per month'
        ]
      },
      demo: GenerativePowerDemo
    }
  };

  const feature = featureData[featureName] || featureData['Cross-Platform Unity'];
  const DemoComponent = feature.demo;

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link to={createPageUrl('Home')}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="mb-8 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </motion.button>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-block px-6 py-2 rounded-full border mb-6"
            style={{
              backgroundColor: `${feature.color}20`,
              borderColor: `${feature.color}40`
            }}
          >
            <span className="text-white/80 text-sm font-medium">{featureName}</span>
          </motion.div>
          <h1 className="text-5xl font-bold text-white mb-4">{feature.tagline}</h1>
          <p className="text-white/70 text-xl max-w-3xl mx-auto">{feature.description}</p>
        </motion.div>

        {/* Benefits */}
        <GlassCard className="p-8 mb-8" glowColor={feature.color}>
          <h2 className="text-2xl font-bold text-white mb-6">Key Benefits</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {feature.benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 p-4 bg-white/5 rounded-lg"
              >
                <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: feature.color }} />
                <span className="text-white/90">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Interactive Demo */}
        {DemoComponent && (
          <GlassCard className="p-8 mb-8" glowColor={feature.color}>
            <div className="flex items-center gap-3 mb-6">
              <Play className="w-6 h-6" style={{ color: feature.color }} />
              <h2 className="text-2xl font-bold text-white">Interactive Demo</h2>
            </div>
            <DemoComponent color={feature.color} />
          </GlassCard>
        )}

        {/* Case Study */}
        <GlassCard className="p-8" glowColor={feature.color}>
          <h2 className="text-2xl font-bold text-white mb-6">Success Story: {feature.caseStudy.company}</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-2" style={{ color: feature.color }}>The Challenge</h3>
              <p className="text-white/80">{feature.caseStudy.challenge}</p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-2" style={{ color: feature.color }}>The Solution</h3>
              <p className="text-white/80">{feature.caseStudy.solution}</p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-2" style={{ color: feature.color }}>The Results</h3>
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                {feature.caseStudy.results.map((result, i) => (
                  <div
                    key={i}
                    className="p-6 rounded-lg text-center border-2"
                    style={{
                      backgroundColor: `${feature.color}10`,
                      borderColor: `${feature.color}30`
                    }}
                  >
                    <div className="text-3xl font-bold text-white mb-2">
                      {result.split(' ')[0]}
                    </div>
                    <div className="text-white/70 text-sm">
                      {result.split(' ').slice(1).join(' ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </AuroraBackground>
  );
}