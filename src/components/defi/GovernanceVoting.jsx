import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Vote, CheckCircle2, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function GovernanceVoting() {
    const { data } = useQuery({
        queryKey: ['governance-proposals'],
        queryFn: async () => {
            const res = await base44.functions.invoke('defi/governance', {});
            return res.data;
        }
    });

    return (
        <Card className="bg-black/60 border-blue-500/30 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                    <Vote className="w-5 h-5" /> Omni Governance
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {data?.proposals?.map((prop) => (
                    <div key={prop.id} className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="text-white font-bold text-sm">{prop.title}</h4>
                            <Badge variant={prop.status === 'Active' ? 'default' : 'secondary'} className={prop.status === 'Active' ? 'bg-green-600' : 'bg-gray-600'}>
                                {prop.status}
                            </Badge>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>For</span>
                                <span>Against</span>
                            </div>
                            <Progress value={(prop.votes_for / (prop.votes_for + prop.votes_against)) * 100} className="h-2 bg-red-900/50" indicatorClassName="bg-green-500" />
                        </div>

                        {prop.status === 'Active' && (
                            <div className="flex gap-2 mt-2">
                                <Button size="sm" className="flex-1 bg-green-600/20 text-green-400 hover:bg-green-600/40 border border-green-500/30">
                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Vote For
                                </Button>
                                <Button size="sm" className="flex-1 bg-red-600/20 text-red-400 hover:bg-red-600/40 border border-red-500/30">
                                    <XCircle className="w-3 h-3 mr-1" /> Vote Against
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}