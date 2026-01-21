import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, Zap, Heart, Users } from 'lucide-react';

export default function LiveCriticalEventsTimeline() {
    const { data: ecosystem } = useQuery({
        queryKey: ['critical-events'],
        queryFn: async () => {
            const response = await base44.functions.invoke('getUnifiedEcosystemSnapshot', {});
            return response.data.ecosystem;
        },
        refetchInterval: 5000
    });

    const events = ecosystem?.critical_events || [];

    const severityConfig = {
        low: { color: 'bg-blue-500', icon: Clock, textColor: 'text-blue-400' },
        medium: { color: 'bg-yellow-500', icon: AlertCircle, textColor: 'text-yellow-400' },
        high: { color: 'bg-red-500', icon: Zap, textColor: 'text-red-400' }
    };

    const eventTypeIcons = {
        'Health Intervention': Heart,
        'Agent Collaboration': Users,
        'Device Optimization': Zap,
        'Financial Alert': AlertCircle
    };

    return (
        <Card className="w-full bg-slate-900/60 backdrop-blur-xl border-slate-700">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <AlertCircle className="w-5 h-5 text-orange-400" />
                    Predicted Critical Events
                    <Badge variant="outline" className="ml-auto">{events.length} Upcoming</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {events.length === 0 ? (
                        <div className="text-center text-slate-400 py-8">
                            No critical events predicted
                        </div>
                    ) : (
                        events.map((event, index) => {
                            const config = severityConfig[event.severity] || severityConfig.low;
                            const EventIcon = eventTypeIcons[event.event_type] || AlertCircle;
                            const predictedTime = new Date(event.predicted_time);
                            const timeUntil = Math.floor((predictedTime - new Date()) / 1000 / 60);

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative"
                                >
                                    <div className="flex items-start gap-4 bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-all">
                                        <div className={`${config.color} rounded-full p-2`}>
                                            <EventIcon className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-1">
                                                <h4 className="text-white font-semibold text-sm">
                                                    {event.event_type}
                                                </h4>
                                                <Badge className={config.color}>
                                                    {event.severity}
                                                </Badge>
                                            </div>
                                            <p className="text-slate-400 text-xs mb-2">
                                                {event.description}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <Clock className="w-3 h-3" />
                                                {timeUntil > 0 ? `In ${timeUntil} minutes` : 'Imminent'}
                                            </div>
                                        </div>
                                    </div>
                                    {index < events.length - 1 && (
                                        <div className="absolute left-6 top-full h-3 w-0.5 bg-slate-700" />
                                    )}
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}