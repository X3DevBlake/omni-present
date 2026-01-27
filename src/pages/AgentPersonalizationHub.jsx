import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import AgentPersonalizationVisualizer3D from '../components/personalization/AgentPersonalizationVisualizer3D';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Brain, User, Zap } from 'lucide-react';

export default function AgentPersonalizationHub() {
    const [agentId, setAgentId] = useState('Agent-Alpha-001');

    const { data: profile, refetch } = useQuery({
        queryKey: ['agent-profile', agentId],
        queryFn: async () => {
            const res = await base44.functions.invoke('personalization/dynamicPersonalizationEngine', { agent_id: agentId });
            return res.data.profile;
        },
        enabled: !!agentId
    });

    return (
        <AuroraBackground className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-6 space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Agent Personalization Engine</h1>
                        <p className="text-white/60">AI-driven profiling and evolution tracking.</p>
                    </div>
                    <div className="flex gap-2">
                        <Input 
                            value={agentId} 
                            onChange={(e) => setAgentId(e.target.value)} 
                            className="bg-white/10 border-white/10 text-white w-48"
                            placeholder="Enter Agent ID"
                        />
                        <Button onClick={() => refetch()} className="bg-cyan-600 hover:bg-cyan-700">
                            Load Profile
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <AgentPersonalizationVisualizer3D profile={profile} />
                    </div>
                    
                    <div className="space-y-6">
                        <Card className="bg-black/50 border-white/10 backdrop-blur-md">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-purple-400" /> Cognitive Traits
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {profile?.traits && Object.entries(profile.traits).map(([key, value]) => (
                                    <div key={key}>
                                        <div className="flex justify-between text-sm text-white/70 mb-1">
                                            <span className="capitalize">{key.replace('_', ' ')}</span>
                                            <span>{Math.round(value)}%</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500" 
                                                style={{ width: `${value}%` }} 
                                            />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="bg-black/50 border-white/10 backdrop-blur-md">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-400" /> Skill Mastery
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {profile?.skill_mastery?.map((skill, i) => (
                                    <div key={i} className="flex justify-between items-center bg-white/5 p-2 rounded">
                                        <div>
                                            <div className="text-white font-medium">{skill.skill_name}</div>
                                            <div className="text-xs text-white/40">Level {skill.level}</div>
                                        </div>
                                        <Badge variant="outline" className="text-yellow-200 border-yellow-500/30">
                                            {skill.usage_count} uses
                                        </Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuroraBackground>
    );
}