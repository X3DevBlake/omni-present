import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Brain, Zap, BarChart3, Upload, Play } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import NeuralNetwork3DExplorer from '../components/ailab/NeuralNetwork3DExplorer';
import TrainingProgress3DVisualizer from '../components/ailab/TrainingProgress3DVisualizer';
import AgentDecisionTree3D from '../components/ailab/AgentDecisionTree3D';
import DatasetExplorer from '../components/ailab/DatasetExplorer';
import ExperimentTracker from '../components/ailab/ExperimentTracker';

export default function AILabs() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <AuroraBackground className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              AI Labs
            </span>
          </h1>
          <p className="text-white/60 text-lg">Advanced model training, experimentation, and neural network visualization</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Experiments', value: '3', icon: Play, color: 'from-blue-500 to-cyan-500' },
            { label: 'Total Datasets', value: '12', icon: Upload, color: 'from-purple-500 to-pink-500' },
            { label: 'Best Accuracy', value: '94.2%', icon: BarChart3, color: 'from-green-500 to-emerald-500' },
            { label: 'Models Deployed', value: '7', icon: Brain, color: 'from-yellow-500 to-orange-500' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                <Card className={`bg-gradient-to-br ${stat.color} bg-opacity-20 border-white/10 p-4`}>
                  <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-white/80" />
                    <div>
                      <p className="text-white/60 text-xs">{stat.label}</p>
                      <p className="text-white font-bold text-lg">{stat.value}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-black/40 border border-white/10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="neural">Neural Network</TabsTrigger>
            <TabsTrigger value="training">Training Progress</TabsTrigger>
            <TabsTrigger value="decision">Decision Tree</TabsTrigger>
            <TabsTrigger value="datasets">Datasets</TabsTrigger>
            <TabsTrigger value="experiments">Experiments</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-black/40 border-white/10 p-6">
                <CardTitle className="text-white mb-4">Quick Actions</CardTitle>
                <div className="space-y-3">
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 justify-start">
                    <Play className="w-4 h-4 mr-2" /> Start New Training
                  </Button>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 justify-start">
                    <Upload className="w-4 h-4 mr-2" /> Upload Dataset
                  </Button>
                  <Button className="w-full bg-green-600 hover:bg-green-700 justify-start">
                    <Zap className="w-4 h-4 mr-2" /> Deploy Model
                  </Button>
                </div>
              </Card>

              <Card className="bg-black/40 border-white/10 p-6">
                <CardTitle className="text-white mb-4">Recent Activity</CardTitle>
                <div className="space-y-2 text-sm">
                  <p className="text-white/60">✓ Agent v3.2 training completed with 94.2% accuracy</p>
                  <p className="text-white/60">→ Market Predictor v2 training in progress (32/100 epochs)</p>
                  <p className="text-white/60">📤 New dataset uploaded: Market Behavior (50K samples)</p>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Neural Network Tab */}
          <TabsContent value="neural">
            <Card className="bg-black/40 border-white/10">
              <CardContent className="p-0">
                <div className="h-[600px]">
                  <NeuralNetwork3DExplorer />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-black/40 border-white/10 p-6 mt-6">
              <CardTitle className="text-white mb-4">Network Architecture</CardTitle>
              <div className="space-y-2 text-white/60 text-sm">
                <p>📊 Input Layer: 8 neurons</p>
                <p>🔗 Hidden Layer 1: 16 neurons (ReLU activation)</p>
                <p>🔗 Hidden Layer 2: 12 neurons (ReLU activation)</p>
                <p>📤 Output Layer: 4 neurons (Softmax activation)</p>
                <p className="mt-4">Total Parameters: 456 • Trainable: 456 • Non-trainable: 0</p>
              </div>
            </Card>
          </TabsContent>

          {/* Training Progress Tab */}
          <TabsContent value="training">
            <Card className="bg-black/40 border-white/10">
              <CardContent className="p-0">
                <div className="h-[600px]">
                  <TrainingProgress3DVisualizer />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-black/40 border-white/10 p-6 mt-6">
              <CardTitle className="text-white mb-4">Training Metrics</CardTitle>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm">Best Accuracy</p>
                  <p className="text-white font-bold text-2xl">94.2%</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm">Lowest Loss</p>
                  <p className="text-white font-bold text-2xl">0.18</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Decision Tree Tab */}
          <TabsContent value="decision">
            <Card className="bg-black/40 border-white/10">
              <CardContent className="p-0">
                <div className="h-[600px]">
                  <AgentDecisionTree3D />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-black/40 border-white/10 p-6 mt-6">
              <CardTitle className="text-white mb-4">Decision Logic</CardTitle>
              <div className="space-y-2 text-white/60 text-sm">
                <p>🎯 Root: Check market conditions and risk level</p>
                <p>→ Left: Analyze market momentum (if positive: execute buy)</p>
                <p>→ Right: Evaluate risk tolerance (if high: increase exposure)</p>
                <p className="mt-4 text-white">This tree allows the agent to make autonomous trading decisions based on learned patterns.</p>
              </div>
            </Card>
          </TabsContent>

          {/* Datasets Tab */}
          <TabsContent value="datasets">
            <DatasetExplorer />
          </TabsContent>

          {/* Experiments Tab */}
          <TabsContent value="experiments">
            <ExperimentTracker />
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}