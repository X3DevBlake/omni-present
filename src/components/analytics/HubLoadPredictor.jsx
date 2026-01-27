import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

export default function HubLoadPredictor() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await base44.functions.invoke('analytics/predictHubLoad', {});
            setData(result.data);
        } catch (error) {
            console.error("Failed to fetch predictive analytics", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && !data) {
            fetchData();
        }
    }, [isOpen]);

    return (
        <div className="fixed bottom-4 left-4 z-40">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-80"
                    >
                        <Card className="bg-black/90 backdrop-blur-xl border-purple-500/30 text-white shadow-2xl">
                            <CardHeader className="pb-2 border-b border-white/10 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-purple-400" />
                                    Predictive Load
                                </CardTitle>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={fetchData} disabled={loading}>
                                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                                </Button>
                            </CardHeader>
                            <CardContent className="p-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                                {loading && !data ? (
                                    <div className="text-center py-4 text-xs text-gray-500">Analyzing system telemetry...</div>
                                ) : data ? (
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-xs mb-2">
                                            <span className="text-gray-400">System Status:</span>
                                            <Badge variant="outline" className={data.system_status === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-green-500/20 text-green-400 border-green-500/50'}>
                                                {data.system_status}
                                            </Badge>
                                        </div>
                                        
                                        {data.predictions.map((hub, idx) => (
                                            <div key={idx} className="bg-white/5 p-2 rounded border border-white/5 hover:border-purple-500/30 transition-colors">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-xs truncate max-w-[120px]">{hub.hub_name}</span>
                                                    <span className={`text-[10px] font-mono ${hub.predicted_load > 80 ? 'text-red-400' : 'text-green-400'}`}>
                                                        {hub.predicted_load}% Load
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden mb-1">
                                                    <motion.div 
                                                        className={`h-full ${hub.predicted_load > 80 ? 'bg-red-500' : hub.predicted_load > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${hub.predicted_load}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        {hub.trend === 'increasing' ? <TrendingUp className="w-3 h-3 text-red-400" /> : <TrendingDown className="w-3 h-3 text-green-400" />}
                                                        {hub.trend}
                                                    </span>
                                                    {hub.bottleneck_probability === 'High' && (
                                                        <span className="flex items-center gap-1 text-red-400">
                                                            <AlertTriangle className="w-3 h-3" /> Bottleneck
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-xs text-red-400">Failed to load data</div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <Button 
                onClick={() => setIsOpen(!isOpen)}
                className={`rounded-full shadow-lg shadow-purple-500/20 border border-purple-500/50 ${isOpen ? 'bg-purple-600 text-white' : 'bg-black/80 text-purple-400 hover:bg-purple-900/20'}`}
            >
                <Activity className="w-5 h-5 mr-2" />
                {isOpen ? 'Close Analytics' : 'Predictive Load'}
            </Button>
        </div>
    );
}