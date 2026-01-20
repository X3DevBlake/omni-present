import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function InteractiveHeroSection({ user }) {
  return (
    <div className="relative py-20 mb-12">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[100px]"
          style={{
            background: 'radial-gradient(circle, #00f5ff 0%, transparent 70%)',
            left: '20%',
            top: '-10%'
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full opacity-15 blur-[80px]"
          style={{
            background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)',
            right: '10%',
            bottom: '-10%'
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -50, 0],
            y: [0, 30, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-4">
            Welcome back, <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">{user?.full_name?.split(' ')[0] || 'Explorer'}</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto">
            Your intelligent platform for AI agents, advanced analytics, and collaborative innovation
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Link to={createPageUrl('AIAgentMarketplace')}>
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-lg px-8 py-6"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Explore AI Agents
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          
          <Link to={createPageUrl('AnalyticsIntelligenceHub')}>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6"
            >
              <Zap className="w-5 h-5 mr-2" />
              View Analytics
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="flex gap-8 justify-center text-white/60 text-sm"
        >
          <div>
            <div className="text-2xl font-bold text-white">50+</div>
            <div>AI Models</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">1000+</div>
            <div>Active Agents</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">24/7</div>
            <div>Monitoring</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}