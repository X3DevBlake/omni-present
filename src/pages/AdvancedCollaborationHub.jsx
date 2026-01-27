import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import AdHocCollaborationNetwork3D from '../components/collaboration/AdHocCollaborationNetwork3D';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function AdvancedCollaborationHub() {
    const [session, setSession] = useState(null);

    const createSession = useMutation({
        mutationFn: async () => {
            const res = await base44.functions.invoke('collaboration/orchestrateCollaboration', {});
            return res.data.session;
        },
        onSuccess: (data) => {
            setSession(data);
            toast.success("Ad-Hoc Collaborative Unit Formed");
        }
    });

    return (
        <AuroraBackground className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-6 space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">AI Collaborative Matrix</h1>
                        <p className="text-green-200/60">Autonomous Agent Teaming & Insight Sharing</p>
                    </div>
                    <Button onClick={() => createSession.mutate()} className="bg-green-600 hover:bg-green-500">
                        <Users className="w-4 h-4 mr-2" /> Form Unit
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <AdHocCollaborationNetwork3D />
                    </div>

                    <div className="space-y-6">
                        <Card className="bg-black/60 border-green-500/30 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-green-400 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5" /> Active Session
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {session ? (
                                    <>
                                        <div className="text-white font-bold">{session.objective}</div>
                                        <div className="space-y-2">
                                            {session.shared_insights.map((insight, i) => (
                                                <div key={i} className="bg-white/5 p-2 rounded text-sm text-white/80 border-l-2 border-green-500">
                                                    {insight}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-white/40 text-center py-8">No active session. Initialize matrix.</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuroraBackground>
    );
}