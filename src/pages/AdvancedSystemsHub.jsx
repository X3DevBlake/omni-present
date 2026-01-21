import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Moon, Database, HardDrive, Activity, Shield } from 'lucide-react';

import AIDreamVisualizer3D from '../components/ai/AIDreamVisualizer3D';
import StorageOptimizationDashboard3D from '../components/data/StorageOptimizationDashboard3D';
import DecentralizedStorageVisualizer3D from '../components/world/DecentralizedStorageVisualizer3D';
import PredictiveHealthAlerts3D from '../components/health/PredictiveHealthAlerts3D';
import ThreatDetectionMonitor3D from '../components/security/ThreatDetectionMonitor3D';
import NeuralActivityVisualizer3D from '../components/body/NeuralActivityVisualizer3D';

export default function AdvancedSystemsHub() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 p-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto"
            >
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 mb-3">
                        ⚙️ Advanced Systems Hub
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Infrastructure optimization, security, storage & consciousness exploration
                    </p>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="dreams" className="w-full">
                    <TabsList className="grid grid-cols-6 mb-6 bg-slate-900/50 border border-slate-700">
                        <TabsTrigger value="dreams" className="flex items-center gap-2">
                            <Moon className="w-4 h-4" />
                            AI Dreams
                        </TabsTrigger>
                        <TabsTrigger value="storage" className="flex items-center gap-2">
                            <Database className="w-4 h-4" />
                            Storage
                        </TabsTrigger>
                        <TabsTrigger value="decentralized" className="flex items-center gap-2">
                            <HardDrive className="w-4 h-4" />
                            Decentralized
                        </TabsTrigger>
                        <TabsTrigger value="health" className="flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Health Alerts
                        </TabsTrigger>
                        <TabsTrigger value="security" className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Security
                        </TabsTrigger>
                        <TabsTrigger value="neural" className="flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Neural
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="dreams">
                        <AIDreamVisualizer3D />
                    </TabsContent>

                    <TabsContent value="storage">
                        <StorageOptimizationDashboard3D />
                    </TabsContent>

                    <TabsContent value="decentralized">
                        <DecentralizedStorageVisualizer3D />
                    </TabsContent>

                    <TabsContent value="health">
                        <PredictiveHealthAlerts3D />
                    </TabsContent>

                    <TabsContent value="security">
                        <ThreatDetectionMonitor3D />
                    </TabsContent>

                    <TabsContent value="neural">
                        <NeuralActivityVisualizer3D />
                    </TabsContent>
                </Tabs>
            </motion.div>
        </div>
    );
}