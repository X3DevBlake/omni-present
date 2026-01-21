import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Brain, Globe, Scale, BookOpen } from 'lucide-react';

import SentientCompanionInterface3D from '../components/interaction/SentientCompanionInterface3D';
import CompanionPersonalityEvolution3D from '../components/interaction/CompanionPersonalityEvolution3D';
import CompanionEmotionalTraining3D from '../components/interaction/CompanionEmotionalTraining3D';
import EthicalReasoningVisualizer3D from '../components/companions/EthicalReasoningVisualizer3D';
import SharedMemoryTimeline3D from '../components/companions/SharedMemoryTimeline3D';
import MoralDilemmaSimulator3D from '../components/companions/MoralDilemmaSimulator3D';
import ProactiveEmotionalSupport3D from '../components/companions/ProactiveEmotionalSupport3D';

export default function CompanionEvolutionHub() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-pink-950 to-purple-950 p-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto"
            >
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 mb-3">
                        💖 Companion Evolution Hub
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Advanced AI companion development, emotional intelligence, and ethical reasoning
                    </p>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="interface" className="w-full">
                    <TabsList className="grid grid-cols-7 mb-6 bg-slate-900/50 border border-slate-700">
                        <TabsTrigger value="interface" className="flex items-center gap-2">
                            <Heart className="w-4 h-4" />
                            Interface
                        </TabsTrigger>
                        <TabsTrigger value="personality" className="flex items-center gap-2">
                            <Brain className="w-4 h-4" />
                            Personality
                        </TabsTrigger>
                        <TabsTrigger value="emotional" className="flex items-center gap-2">
                            <Heart className="w-4 h-4" />
                            Emotional
                        </TabsTrigger>
                        <TabsTrigger value="ethics" className="flex items-center gap-2">
                            <Scale className="w-4 h-4" />
                            Ethics
                        </TabsTrigger>
                        <TabsTrigger value="culture" className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Culture
                        </TabsTrigger>
                        <TabsTrigger value="memory" className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Memory
                        </TabsTrigger>
                        <TabsTrigger value="support" className="flex items-center gap-2">
                            <Heart className="w-4 h-4" />
                            Support
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="interface">
                        <SentientCompanionInterface3D />
                    </TabsContent>

                    <TabsContent value="personality">
                        <CompanionPersonalityEvolution3D />
                    </TabsContent>

                    <TabsContent value="emotional">
                        <CompanionEmotionalTraining3D />
                    </TabsContent>

                    <TabsContent value="ethics">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <EthicalReasoningVisualizer3D />
                            <MoralDilemmaSimulator3D />
                        </div>
                    </TabsContent>

                    <TabsContent value="culture">
                        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg p-6">
                            <h3 className="text-white text-xl font-bold mb-3 flex items-center gap-2">
                                <Globe className="w-6 h-6 text-purple-400" />
                                Cross-Cultural Ethics Adaptation
                            </h3>
                            <p className="text-slate-300 mb-4">
                                Your AI companion learns and adapts ethical reasoning to different cultural contexts through the crossCulturalEthics function.
                                Cultural adaptations are logged and can be reviewed in the Cultural Adaptation Log entity.
                            </p>
                        </div>
                    </TabsContent>

                    <TabsContent value="memory">
                        <SharedMemoryTimeline3D />
                    </TabsContent>

                    <TabsContent value="support">
                        <ProactiveEmotionalSupport3D />
                    </TabsContent>
                </Tabs>
            </motion.div>
        </div>
    );
}