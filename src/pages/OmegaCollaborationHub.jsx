import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Handshake, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CognitiveHandshakeVisualizer3D from '../components/omega/CognitiveHandshakeVisualizer3D';
import AetherDisplayController3D from '../components/omega/AetherDisplayController3D';
import SentientFinanceEngine3D from '../components/omega/SentientFinanceEngine3D';
import NeuralManifoldAlignmentVisualizer3D from '../components/omega/NeuralManifoldAlignmentVisualizer3D';
import ProactiveAnomalyDetector3D from '../components/omega/ProactiveAnomalyDetector3D';
import GeopoliticalPredictor3D from '../components/omega/GeopoliticalPredictor3D';
import UnifiedNotificationCenter from '../components/omega/UnifiedNotificationCenter';
import CustomDashboardBuilder from '../components/omega/CustomDashboardBuilder';
import InteractiveOnboarding from '../components/omega/InteractiveOnboarding';
import OMLTransactionInterface from '../components/omega/OMLTransactionInterface';

export default function OmegaCollaborationHub() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-blue-950">
      {showOnboarding && (
        <InteractiveOnboarding onComplete={() => setShowOnboarding(false)} />
      )}

      {/* Notification Center - Fixed Position */}
      <div className="fixed top-20 right-6 z-40 w-80">
        <UnifiedNotificationCenter />
      </div>
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Human-AI Collaboration Interface
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Seamless cognitive handshake between human intent and AI execution
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-purple-500/30"
          >
            <Handshake className="w-8 h-8 text-purple-400 mb-2" />
            <div className="text-2xl font-bold text-white">98.5%</div>
            <div className="text-sm text-gray-400">Alignment Score</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-pink-500/30"
          >
            <Users className="w-8 h-8 text-pink-400 mb-2" />
            <div className="text-2xl font-bold text-white">1,247</div>
            <div className="text-sm text-gray-400">Active Collaborations</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-blue-500/30"
          >
            <Zap className="w-8 h-8 text-blue-400 mb-2" />
            <div className="text-2xl font-bold text-white">12ms</div>
            <div className="text-sm text-gray-400">Intent Latency</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-green-500/30"
          >
            <TrendingUp className="w-8 h-8 text-green-400 mb-2" />
            <div className="text-2xl font-bold text-white">$2.4M</div>
            <div className="text-sm text-gray-400">Co-Created Value</div>
          </motion.div>
        </div>
      </section>

      {/* Collaboration Interfaces */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <Tabs defaultValue="handshake" className="w-full">
          <TabsList className="grid w-full grid-cols-7 bg-black/60 backdrop-blur-xl mb-8 text-xs">
            <TabsTrigger value="handshake">Handshake</TabsTrigger>
            <TabsTrigger value="neural">Neural</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
            <TabsTrigger value="aether">Aether</TabsTrigger>
            <TabsTrigger value="anomaly">Anomaly</TabsTrigger>
            <TabsTrigger value="geo">Geopolitical</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="handshake">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CognitiveHandshakeVisualizer3D />
            </motion.div>
          </TabsContent>

          <TabsContent value="neural">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <NeuralManifoldAlignmentVisualizer3D />
              
              <div className="mt-6 bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-indigo-500/30">
                <h3 className="text-white text-lg font-bold mb-3">Collaborative Alignment Design</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Guide the AI in defining optimal neural-semantic alignment objectives. Your preferences shape how thoughts map to actions.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/60 rounded-lg p-3">
                    <div className="text-purple-400 text-xs mb-1">Human Input</div>
                    <div className="text-white text-sm">Intent precision priority</div>
                  </div>
                  <div className="bg-black/60 rounded-lg p-3">
                    <div className="text-blue-400 text-xs mb-1">AI Response</div>
                    <div className="text-white text-sm">Optimizing InfoNCE temperature</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="finance">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <SentientFinanceEngine3D />
              
              <div className="mt-6 bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-emerald-500/30">
                <h3 className="text-white text-lg font-bold mb-3">Joint Market Strategy Exploration</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Collaborate with AI to explore market opportunities. Set your risk tolerance and sector preferences while AI discovers optimal strategies.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-black/60 rounded-lg p-3">
                    <div className="text-emerald-400 text-xs mb-1">Your Preferences</div>
                    <div className="text-white text-sm">Moderate risk, Tech sector</div>
                  </div>
                  <div className="bg-black/60 rounded-lg p-3">
                    <div className="text-blue-400 text-xs mb-1">AI Discovery</div>
                    <div className="text-white text-sm">3 aligned opportunities</div>
                  </div>
                  <div className="bg-black/60 rounded-lg p-3">
                    <div className="text-purple-400 text-xs mb-1">Synergy</div>
                    <div className="text-white text-sm">87% alignment</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="aether">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AetherDisplayController3D />
              
              <div className="mt-6 bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-cyan-500/30">
                <h3 className="text-white text-lg font-bold mb-3">Shared Volumetric Control</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Jointly control the Aether display. You guide the intent, AI optimizes the physics and stabilization parameters.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/60 rounded-lg p-3">
                    <div className="text-cyan-400 text-xs mb-1">Human Control</div>
                    <div className="text-white text-sm">Object placement & intent</div>
                  </div>
                  <div className="bg-black/60 rounded-lg p-3">
                    <div className="text-green-400 text-xs mb-1">AI Optimization</div>
                    <div className="text-white text-sm">POT physics & stabilization</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="anomaly">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ProactiveAnomalyDetector3D />
            </motion.div>
          </TabsContent>

          <TabsContent value="geo">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-6"
            >
              <GeopoliticalPredictor3D />
              <OMLTransactionInterface agentId="demo_agent_001" />
            </motion.div>
          </TabsContent>

          <TabsContent value="dashboard">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CustomDashboardBuilder />
              
              <div className="mt-6">
                <Button
                  onClick={() => setShowOnboarding(true)}
                  variant="outline"
                  className="w-full border-purple-500/50 text-purple-300"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Restart Interactive Tutorial
                </Button>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}