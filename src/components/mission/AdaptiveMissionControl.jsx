import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, AlertTriangle, Target, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdaptiveMissionControl({ missionProfile }) {
    const [activeTab, setActiveTab] = useState('objectives');

    // Mock data for fallback
    const profile = missionProfile || {
        current_threat_level: 'high',
        dynamic_objectives: [
            { description: "Secure Primary Endpoint", priority: 1, status: 'active' },
            { description: "Reroute Traffic via Node B", priority: 0.8, status: 'pending' }
        ],
        predicted_threats: ["DDoS Imminent", "Agent Compromise Risk"],
        contingency_plans: [
            { trigger: "Node B Failure", action: "Activate Emergency Mesh" }
        ]
    };

    const getThreatColor = (level) => {
        switch(level) {
            case 'critical': return 'text-red-500 border-red-500/50 bg-red-500/10';
            case 'high': return 'text-orange-500 border-orange-500/50 bg-orange-500/10';
            case 'moderate': return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10';
            default: return 'text-green-500 border-green-500/50 bg-green-500/10';
        }
    };

    return (
        <Card className="bg-black/80 backdrop-blur-xl border-white/10 w-full h-full text-white">
            <CardHeader className="pb-2 border-b border-white/10">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-400" />
                        Adaptive Mission Control
                    </CardTitle>
                    <Badge className={getThreatColor(profile.current_threat_level)}>
                        THREAT: {profile.current_threat_level.toUpperCase()}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                {/* Dynamic Objectives */}
                <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase">Dynamic Objectives</h3>
                    <div className="space-y-2">
                        {profile.dynamic_objectives.map((obj, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/5 hover:border-purple-500/30 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${obj.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                                    <span className="text-sm">{obj.description}</span>
                                </div>
                                <span className="text-xs text-gray-500">P:{obj.priority}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Threat Prediction */}
                <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3" /> Predictive Threat Analysis
                    </h3>
                    <div className="bg-red-900/10 border border-red-500/20 rounded p-3">
                        {profile.predicted_threats.length > 0 ? (
                            <ul className="space-y-1">
                                {profile.predicted_threats.map((threat, i) => (
                                    <li key={i} className="text-xs text-red-300 flex items-center gap-2">
                                        <Shield className="w-3 h-3" /> {threat}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-xs text-green-400 flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3" /> No imminent threats detected
                            </div>
                        )}
                    </div>
                </div>

                {/* Contingencies */}
                <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">
                        <RefreshCw className="w-3 h-3" /> Automated Contingencies
                    </h3>
                    <ScrollArea className="h-32 rounded border border-white/10 bg-black/20 p-2">
                        {profile.contingency_plans?.map((plan, i) => (
                            <div key={i} className="mb-2 last:mb-0 p-2 bg-white/5 rounded text-xs">
                                <div className="text-yellow-400 font-mono mb-1">IF: {plan.trigger || plan.trigger_condition}</div>
                                <div className="text-green-400 font-mono pl-4">THEN: {plan.action || plan.alternative_objective}</div>
                            </div>
                        ))}
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    );
}