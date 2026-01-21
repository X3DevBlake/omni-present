import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
    Brain,
    Heart,
    Users,
    Zap,
    Activity,
    TrendingUp,
    Shield,
    Cpu
} from 'lucide-react';

export default function OmegaEcosystemStats() {
    const { data: ecosystem } = useQuery({
        queryKey: ['ecosystem-stats'],
        queryFn: async () => {
            const response = await base44.functions.invoke('getUnifiedEcosystemSnapshot', {});
            return response.data.ecosystem;
        },
        refetchInterval: 10000
    });

    if (!ecosystem) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                    <Card key={i} className="bg-slate-800/50 animate-pulse">
                        <CardContent className="p-4 h-24" />
                    </Card>
                ))}
            </div>
        );
    }

    const stats = [
        {
            label: 'Active Agents',
            value: ecosystem.agent_summary?.total_agents || 0,
            icon: Users,
            color: 'purple',
            gradient: 'from-purple-500 to-pink-500',
            change: '+12%'
        },
        {
            label: 'Collaborative Teams',
            value: ecosystem.agent_summary?.collaborative_teams || 0,
            icon: Activity,
            color: 'blue',
            gradient: 'from-blue-500 to-cyan-500',
            change: '+8%'
        },
        {
            label: 'Health Score',
            value: ecosystem.health_summary?.unified_health_score?.toFixed(0) || 0,
            icon: Heart,
            color: 'green',
            gradient: 'from-green-500 to-emerald-500',
            change: '+5%'
        },
        {
            label: 'Active Interventions',
            value: ecosystem.health_summary?.active_interventions || 0,
            icon: Zap,
            color: 'yellow',
            gradient: 'from-yellow-500 to-orange-500',
            change: '0%'
        },
        {
            label: 'AI Companions',
            value: ecosystem.companion_summary?.total_companions || 0,
            icon: Brain,
            color: 'pink',
            gradient: 'from-pink-500 to-rose-500',
            change: '+3%'
        },
        {
            label: 'Emotional Bond',
            value: ((ecosystem.companion_summary?.emotional_bond_strength || 0) * 100).toFixed(0),
            icon: Heart,
            color: 'red',
            gradient: 'from-red-500 to-pink-500',
            change: '+15%'
        },
        {
            label: 'Online Devices',
            value: `${ecosystem.device_summary?.devices_online}/${ecosystem.device_summary?.total_devices}`,
            icon: Cpu,
            color: 'orange',
            gradient: 'from-orange-500 to-red-500',
            change: '100%'
        },
        {
            label: 'Portfolio Value',
            value: `$${((ecosystem.financial_summary?.portfolio_value || 0) / 1000).toFixed(0)}K`,
            icon: TrendingUp,
            color: 'cyan',
            gradient: 'from-cyan-500 to-blue-500',
            change: '+22%'
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <Card className={`bg-gradient-to-br ${stat.gradient}/10 border-${stat.color}-500/30 hover:border-${stat.color}-500/50 transition-all`}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                                <Badge className={`bg-${stat.color}-500/20 text-${stat.color}-400 text-xs`}>
                                    {stat.change}
                                </Badge>
                            </div>
                            <div className={`text-2xl font-bold text-${stat.color}-400 mb-1`}>
                                {stat.value}
                            </div>
                            <div className="text-xs text-slate-400">{stat.label}</div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}