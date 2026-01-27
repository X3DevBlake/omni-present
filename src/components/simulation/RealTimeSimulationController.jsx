import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, AlertTriangle, CloudRain, ShieldAlert } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function RealTimeSimulationController({ simulationId }) {
  const [threatLevel, setThreatLevel] = useState(50);
  const [envComplexity, setEnvComplexity] = useState(30);
  const [adversaryAggression, setAdversaryAggression] = useState(20);

  const applyIntervention = async (type, param, value) => {
    try {
      await base44.functions.invoke('real-time-intervention', {
        simulation_id: simulationId,
        intervention_type: type,
        parameter: param,
        value: value
      });
      toast.success(`${type} updated successfully`);
    } catch (error) {
      toast.error('Failed to update simulation');
    }
  };

  return (
    <Card className="bg-black/60 border-red-500/30 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Zap className="w-5 h-5 text-red-400" />
          Live Simulation Intervention
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Threat Level Control */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-white text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-orange-400" />
              Threat Severity
            </label>
            <Badge variant="outline" className="text-orange-400 border-orange-400/30">
              {threatLevel}%
            </Badge>
          </div>
          <Slider
            value={[threatLevel]}
            onValueChange={(val) => setThreatLevel(val[0])}
            onValueCommit={(val) => applyIntervention('threat', 'severity', val[0])}
            max={100}
            step={1}
            className="py-2"
          />
        </div>

        {/* Environmental Factors */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-white text-sm flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-blue-400" />
              Environmental Instability
            </label>
            <Badge variant="outline" className="text-blue-400 border-blue-400/30">
              {envComplexity}%
            </Badge>
          </div>
          <Slider
            value={[envComplexity]}
            onValueChange={(val) => setEnvComplexity(val[0])}
            onValueCommit={(val) => applyIntervention('environment', 'instability', val[0])}
            max={100}
            step={1}
            className="py-2"
          />
        </div>

        {/* Adversarial Behavior */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Adversary Aggression
            </label>
            <Badge variant="outline" className="text-red-500 border-red-500/30">
              {adversaryAggression}%
            </Badge>
          </div>
          <Slider
            value={[adversaryAggression]}
            onValueChange={(val) => setAdversaryAggression(val[0])}
            onValueCommit={(val) => applyIntervention('adversary', 'aggression', val[0])}
            max={100}
            step={1}
            className="py-2"
          />
        </div>

        <div className="pt-4 flex gap-2">
          <Button 
            className="w-full bg-red-600 hover:bg-red-700"
            onClick={() => {
              setThreatLevel(90);
              setEnvComplexity(90);
              setAdversaryAggression(90);
              applyIntervention('threat', 'severity', 90);
            }}
          >
            Trigger Chaos Event
          </Button>
          <Button 
            variant="outline" 
            className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10"
            onClick={() => {
              setThreatLevel(10);
              setEnvComplexity(10);
              setAdversaryAggression(10);
              applyIntervention('threat', 'severity', 10);
            }}
          >
            Stabilize
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}