import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Target, Zap, Activity, AlertTriangle, CheckCircle, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MissionControlPanel({ activeMission, onStartMission, onAbortMission }) {
    const [selectedAgents, setSelectedAgents] = useState([]);

    if (!activeMission) {
        return (
            <Card className="bg-black/80 backdrop-blur-xl border-white/20 w-[350px]">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-cyan-400">
                        <Target className="w-5 h-5" /> Mission Command
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-400 mb-4">No active missions. Initialize a new operation to assign agents.</p>
                    <Button 
                        onClick={onStartMission} 
                        className="w-full bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/50"
                    >
                        Initialize Operation
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-black/80 backdrop-blur-xl border-white/20 w-[400px]">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-amber-400" /> 
                        {activeMission.title}
                    </CardTitle>
                    <Badge variant={activeMission.status === 'active' ? 'default' : 'outline'} className="uppercase text-[10px]">
                        {activeMission.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>Mission Progress</span>
                        <span>{Math.round(activeMission.progress)}%</span>
                    </div>
                    <Progress value={activeMission.progress} className="h-2 bg-white/10" indicatorClassName="bg-gradient-to-r from-amber-500 to-red-500" />
                </div>

                {/* Agent Stats */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white/5 rounded p-2 text-center border border-white/5">
                        <div className="text-xs text-gray-500">Agents</div>
                        <div className="text-lg font-bold text-white">{activeMission.agents?.length || 0}</div>
                    </div>
                    <div className="bg-white/5 rounded p-2 text-center border border-white/5">
                        <div className="text-xs text-gray-500">Threats</div>
                        <div className="text-lg font-bold text-red-400">{activeMission.threats || 0}</div>
                    </div>
                    <div className="bg-white/5 rounded p-2 text-center border border-white/5">
                        <div className="text-xs text-gray-500">Efficiency</div>
                        <div className="text-lg font-bold text-green-400">94%</div>
                    </div>
                </div>

                {/* Dynamic Intel */}
                <div className="bg-black/40 rounded p-3 border border-white/10 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-cyan-300 font-bold border-b border-white/10 pb-1">
                        <Brain className="w-3 h-3" /> Live Intelligence
                    </div>
                    <div className="space-y-1 max-h-[100px] overflow-y-auto">
                        <div className="flex gap-2 items-start">
                            <CheckCircle className="w-3 h-3 text-green-500 mt-0.5" />
                            <span className="text-gray-300">Sector 7 Secure. Path optimized.</span>
                        </div>
                        <div className="flex gap-2 items-start">
                            <Activity className="w-3 h-3 text-amber-500 mt-0.5" />
                            <span className="text-gray-300">Rerouting Squad Alpha due to congestion.</span>
                        </div>
                        <div className="flex gap-2 items-start">
                            <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5" />
                            <span className="text-gray-300">Anomaly detected in Node X-Ray.</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 border-white/10 hover:bg-white/5">
                        Update Parameters
                    </Button>
                    <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={onAbortMission}
                        className="flex-1 bg-red-900/30 hover:bg-red-900/50 text-red-300 border border-red-900/50"
                    >
                        Abort Mission
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}