import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Network, Lightbulb, Target, Shield, Database, BookOpen } from 'lucide-react';

import ContextualInfoDisplay from '../components/ai/ContextualInfoDisplay';
import LearningProgressVisualizer3D from '../components/ai/LearningProgressVisualizer3D';
import ProactiveInsightCard3D from '../components/ai/ProactiveInsightCard3D';
import KnowledgeGraphVisualizer3D from '../components/knowledge/KnowledgeGraphVisualizer3D';
import GoalProgressVisualizer3D from '../components/orchestration/GoalProgressVisualizer3D';
import ThreatDetectionMonitor3D from '../components/security/ThreatDetectionMonitor3D';
import StorageOptimizationDashboard3D from '../components/data/StorageOptimizationDashboard3D';

export default function OmegaIntelligenceHub() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-cyan-950 p-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto"
            >
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-3">
                        🧠 Omega Intelligence Hub
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Unified platform intelligence orchestration & autonomous systems management
                    </p>
                </div>

                {/* Contextual Info Display - Floating */}
                <ContextualInfoDisplay />

                {/* Proactive Insights - Floating Cards */}
                <ProactiveInsightCard3D />

                {/* Main Content Tabs */}
                <Tabs defaultValue="learning" className="w-full">
                    <TabsList className="grid grid-cols-6 mb-6 bg-slate-900/50 border border-slate-700">
                        <TabsTrigger value="learning" className="flex items-center gap-2">
                            <Brain className="w-4 h-4" />
                            Learning
                        </TabsTrigger>
                        <TabsTrigger value="knowledge" className="flex items-center gap-2">
                            <Network className="w-4 h-4" />
                            Knowledge
                        </TabsTrigger>
                        <TabsTrigger value="goals" className="flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Goals
                        </TabsTrigger>
                        <TabsTrigger value="security" className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Security
                        </TabsTrigger>
                        <TabsTrigger value="storage" className="flex items-center gap-2">
                            <Database className="w-4 h-4" />
                            Storage
                        </TabsTrigger>
                        <TabsTrigger value="insights" className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />
                            Insights
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="learning">
                        <LearningProgressVisualizer3D />
                    </TabsContent>

                    <TabsContent value="knowledge">
                        <KnowledgeGraphVisualizer3D />
                    </TabsContent>

                    <TabsContent value="goals">
                        <GoalProgressVisualizer3D />
                    </TabsContent>

                    <TabsContent value="security">
                        <ThreatDetectionMonitor3D />
                    </TabsContent>

                    <TabsContent value="storage">
                        <StorageOptimizationDashboard3D />
                    </TabsContent>

                    <TabsContent value="insights">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-500/30 rounded-lg p-6">
                                <h3 className="text-white text-xl font-bold mb-3 flex items-center gap-2">
                                    <Lightbulb className="w-6 h-6 text-cyan-400" />
                                    AI-Generated Insights
                                </h3>
                                <p className="text-slate-300">
                                    Proactive insights appear as floating cards in the bottom-right corner of your screen.
                                    The AI continuously analyzes your context and provides real-time recommendations.
                                </p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </motion.div>
        </div>
    );
}