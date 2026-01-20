import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MultiUserSimulationCanvas from '../components/simulation/MultiUserSimulationCanvas';
import PhysicsEngineControls from '../components/simulation/PhysicsEngineControls';
import SimulationExporter from '../components/simulation/SimulationExporter';
import PredictiveTrajectory3D from '../components/simulation/PredictiveTrajectory3D';
import { Play, Users, Settings, Download, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function EnhancedSimulationHub() {
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const queryClient = useQueryClient();

  const { data: simulations } = useQuery({
    queryKey: ['simulations'],
    queryFn: () => base44.entities.Simulation.list('-created_date', 20)
  });

  const { data: physicsConfig } = useQuery({
    queryKey: ['physics-config', selectedSimulation?.id],
    queryFn: async () => {
      const configs = await base44.entities.SimulationPhysicsConfig.filter({ 
        simulation_id: selectedSimulation.id 
      });
      return configs[0] || null;
    },
    enabled: !!selectedSimulation
  });

  const { data: prediction } = useQuery({
    queryKey: ['simulation-prediction', selectedSimulation?.id],
    queryFn: async () => {
      const preds = await base44.entities.PredictiveSimulation.filter({ 
        simulation_id: selectedSimulation.id 
      });
      return preds[0] || null;
    },
    enabled: !!selectedSimulation
  });

  const generatePrediction = async () => {
    if (!selectedSimulation) return;
    
    try {
      const response = await base44.functions.invoke('predictSimulationOutcome', {
        simulation_id: selectedSimulation.id
      });
      toast.success('Prediction generated');
      queryClient.invalidateQueries({ queryKey: ['simulation-prediction'] });
    } catch (error) {
      toast.error('Failed to generate prediction');
    }
  };

  const createNewSimulation = async () => {
    try {
      const sim = await base44.entities.Simulation.create({
        scenario_name: `Simulation-${Date.now()}`,
        simulation_type: 'multi_agent',
        status: 'running',
        metrics: {},
        agents: []
      });
      setSelectedSimulation(sim);
      toast.success('New simulation created');
    } catch (error) {
      toast.error('Failed to create simulation');
    }
  };

  return (
    <AuroraBackground className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-white">Enhanced Simulation Hub</h1>
          <p className="text-white/70 text-xl">
            Multi-User Real-Time Simulations with Advanced Physics
          </p>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-white/80">
            {simulations?.length || 0} Simulations Available
          </div>
          <Button
            onClick={createNewSimulation}
            className="bg-gradient-to-r from-cyan-600 to-purple-600"
          >
            <Play className="w-4 h-4 mr-2" />
            Create New Simulation
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {simulations?.slice(0, 6).map((sim, i) => (
            <Card
              key={i}
              className={`bg-white/10 border-white/20 backdrop-blur-md cursor-pointer hover:bg-white/15 transition-all ${
                selectedSimulation?.id === sim.id ? 'ring-2 ring-cyan-400' : ''
              }`}
              onClick={() => setSelectedSimulation(sim)}
            >
              <CardContent className="p-4">
                <h3 className="text-white font-semibold">{sim.scenario_name}</h3>
                <p className="text-white/60 text-sm mt-1">{sim.simulation_type}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={sim.status === 'running' ? 'bg-green-600' : 'bg-gray-600'}>
                    {sim.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedSimulation && (
          <Tabs defaultValue="canvas" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-black/30">
              <TabsTrigger value="canvas">
                <Users className="w-4 h-4 mr-2" />
                Multi-User Canvas
              </TabsTrigger>
              <TabsTrigger value="physics">
                <Settings className="w-4 h-4 mr-2" />
                Physics Engine
              </TabsTrigger>
              <TabsTrigger value="prediction">
                <Activity className="w-4 h-4 mr-2" />
                AI Prediction
              </TabsTrigger>
              <TabsTrigger value="export">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </TabsTrigger>
              <TabsTrigger value="analytics">
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="canvas" className="mt-6">
              <MultiUserSimulationCanvas simulationId={selectedSimulation.id} />
            </TabsContent>

            <TabsContent value="physics" className="mt-6">
              <PhysicsEngineControls
                simulationId={selectedSimulation.id}
                currentConfig={physicsConfig}
                onUpdate={(config) => toast.success('Physics updated')}
              />
            </TabsContent>

            <TabsContent value="prediction" className="mt-6 space-y-6">
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <Button
                    onClick={generatePrediction}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Generate AI Prediction
                  </Button>
                </CardContent>
              </Card>

              {prediction && <PredictiveTrajectory3D prediction={prediction} />}

              {!prediction && (
                <div className="text-center text-white/60 py-12">
                  Click above to generate AI-powered outcome predictions
                </div>
              )}
            </TabsContent>

            <TabsContent value="export" className="mt-6">
              <SimulationExporter simulationId={selectedSimulation.id} />
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white">Simulation Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-white/70">
                    Analytics for {selectedSimulation.scenario_name}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AuroraBackground>
  );
}