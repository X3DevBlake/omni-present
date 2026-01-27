import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '@/components/omni/AuroraBackground';
import RealTimeSimulationController from '@/components/simulation/RealTimeSimulationController';
import AutonomousDirectorPanel from '@/components/simulation/AutonomousDirectorPanel';
import AdvancedSimulation3D from '@/components/simulation/AdvancedSimulation3D';
import SentientOracle3D from '@/components/simulation/SentientOracle3D';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play } from 'lucide-react';

export default function AdvancedSimulation() {
  const [activeSimulationId, setActiveSimulationId] = useState(null);

  const { data: simulations, isLoading } = useQuery({
    queryKey: ['active-simulations'],
    queryFn: async () => {
      // In a real app, we'd filter for running status
      return await base44.entities.SimulationScenario.list();
    }
  });

  return (
    <AuroraBackground className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-6 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Advanced Simulation Environment</h1>
            <p className="text-white/60">Real-time threat injection and environmental control</p>
          </div>
          {activeSimulationId && (
            <Badge variant="outline" className="border-green-500 text-green-400 px-4 py-1 animate-pulse">
              Simulation Active
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Simulation View */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-black/40 border-white/10 backdrop-blur-md overflow-hidden">
              <CardContent className="p-0 h-[600px] relative">
                {activeSimulationId ? (
                  <AdvancedSimulation3D simulationId={activeSimulationId} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                    <div className="text-white/40 text-lg">Select a scenario to launch simulation</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Controls & Sidebar */}
          <div className="space-y-6">
            {activeSimulationId && (
              <>
                 <div className="h-64">
                   <SentientOracle3D isActive={true} metrics={true} currentThought="Analyzing agent resilience patterns..." />
                 </div>
                <AutonomousDirectorPanel simulationId={activeSimulationId} />
                <RealTimeSimulationController simulationId={activeSimulationId} />
              </>
            )}
            
            {!activeSimulationId && (
              <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white">Available Scenarios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLoading ? (
                    <div className="flex justify-center p-4"><Loader2 className="animate-spin text-white" /></div>
                  ) : (
                    simulations?.map(sim => (
                      <div 
                        key={sim.id}
                        onClick={() => setActiveSimulationId(sim.id)}
                        className="p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer border border-white/5 transition-all group"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-white font-medium group-hover:text-purple-400 transition-colors">
                            {sim.name}
                          </span>
                          <Play className="w-4 h-4 text-white/40 group-hover:text-purple-400" />
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary" className="text-[10px] bg-white/10">
                            {sim.threat_type}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] bg-white/10">
                            {sim.threat_level}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}