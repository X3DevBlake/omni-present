import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import SimulationAnalyticsDashboard from '../components/simulation/SimulationAnalyticsDashboard';
import AdvancedSimulation3D from '../components/simulation/AdvancedSimulation3D';
import SimulationControlPanel from '../components/simulation/SimulationControlPanel';
import SentientAgentVisualizer3D from '../components/simulation/SentientAgentVisualizer3D';
import AgentNegotiationPanel from '../components/simulation/AgentNegotiationPanel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket } from 'lucide-react';

export default function SimulationHub() {
    const [simParams, setSimParams] = React.useState({});

    const { data: analytics } = useQuery({
        queryKey: ['sim-analytics', simParams],
        queryFn: async () => {
            const res = await base44.functions.invoke('analytics/simulationForecastEngine', { params: simParams });
            return res.data;
        },
        refetchInterval: 5000
    });

    return (
        <AuroraBackground className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-6 space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                        <Rocket className="w-8 h-8 text-orange-400" /> Simulation Hub
                    </h1>
                    <p className="text-white/60">Advanced environmental modeling and emergent behavior forecasting.</p>
                </div>

                {/* Main 3D View */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 relative">
                        <Card className="bg-black/60 border-white/10 overflow-hidden h-[500px]">
                            <AdvancedSimulation3D params={simParams} />
                        </Card>
                        <SimulationControlPanel onUpdate={setSimParams} />
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <SentientAgentVisualizer3D />
                        <div className="h-[250px]">
                            <AgentNegotiationPanel />
                        </div>
                    </div>
                </div>

                {/* Analytics Dashboard */}
                <div className="relative">
                    <Badge className="absolute -top-3 left-4 z-10 bg-blue-600">AI Analytics Core</Badge>
                    <SimulationAnalyticsDashboard data={analytics} />
                </div>
            </div>
        </AuroraBackground>
    );
}